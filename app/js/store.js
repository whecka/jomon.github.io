/* Jomon persistent state + yen economy (localStorage).
   Yen rules (v1): a normal day should land ~100 yen, so non-boss earnings are
   soft-capped at 100/day (DAILY_CAP). Some sources also have their own daily
   sub-cap (TYPE_CAPS) so one activity can't dominate. Boss tests bypass both. */
(function (global) {
  var KEY = 'jomon_state_v1';
  var DAILY_CAP = 100;
  var TYPE_CAPS = { flashcard: 15, phrase: 10 };
  var INTERVALS = [0, 1, 2, 4, 7, 14];  // Leitner days by level 0..5

  function today() { return new Date().toISOString().slice(0, 10); }
  function addDays(dateStr, n) {
    var d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  function defaults() {
    return {
      yen: 0,
      daily: { date: today(), earned: 0, types: {} },
      scripture: { book: '1 Nephi', chapter: '1', verse: 1, chaptersRead: [] },
      flashcards: { cards: {} },
      phrasebook: [],
      feedback: [],
      lessons: {}   // reserved for session 4
    };
  }

  var state = load();
  var yenListeners = [];

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (!s) return defaults();
      var d = defaults();
      for (var k in d) if (!(k in s)) s[k] = d[k];
      if (!s.daily.types) s.daily.types = {};
      if (!s.flashcards.cards) s.flashcards = { cards: {} };
      return s;
    } catch (e) { return defaults(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function notify(amt) { yenListeners.forEach(function (fn) { fn(state.yen, amt); }); }

  function rollDaily() {
    if (state.daily.date !== today()) {
      state.daily = { date: today(), earned: 0, types: {} };
      save();
    }
  }

  // Award yen. opts.boss bypasses caps; opts.type enforces a per-type daily sub-cap.
  // Returns the amount actually credited.
  function awardYen(amount, opts) {
    opts = opts || {};
    rollDaily();
    var amt = amount;
    if (opts.type && TYPE_CAPS[opts.type] != null) {
      var used = state.daily.types[opts.type] || 0;
      amt = Math.min(amt, Math.max(0, TYPE_CAPS[opts.type] - used));
    }
    if (!opts.boss) amt = Math.min(amt, Math.max(0, DAILY_CAP - state.daily.earned));
    if (amt <= 0) return 0;
    state.yen += amt;
    state.daily.earned += amt;
    if (opts.type) state.daily.types[opts.type] = (state.daily.types[opts.type] || 0) + amt;
    save();
    notify(amt);
    return amt;
  }

  /* ---- scripture ---- */
  function markChapterRead(book, chapter) {
    var id = book + '|' + chapter;
    if (state.scripture.chaptersRead.indexOf(id) !== -1) return 0;
    state.scripture.chaptersRead.push(id);
    save();
    return awardYen(15);
  }
  function isChapterRead(book, chapter) {
    return state.scripture.chaptersRead.indexOf(book + '|' + chapter) !== -1;
  }
  function setScripturePos(book, chapter, verse) {
    state.scripture.book = book;
    state.scripture.chapter = String(chapter);
    state.scripture.verse = verse;
    save();
  }

  /* ---- flashcards (Leitner SRS) ---- */
  function cardKey(deck, idx) { return deck + ':' + idx; }
  function cardState(deck, idx) {
    return state.flashcards.cards[cardKey(deck, idx)] || { level: 0, due: null, seen: 0 };
  }
  function isDue(deck, idx) {
    var c = cardState(deck, idx);
    return !c.due || c.due <= today();
  }
  // Grade a card. correct=true levels it up (+1 yen, capped), false resets to level 1.
  function gradeCard(deck, idx, correct) {
    var c = cardState(deck, idx);
    c.level = correct ? Math.min(c.level + 1, 5) : 1;
    c.due = addDays(today(), INTERVALS[c.level]);
    c.seen += 1;
    state.flashcards.cards[cardKey(deck, idx)] = c;
    save();
    return correct ? awardYen(1, { type: 'flashcard' }) : 0;
  }

  /* ---- phrasebook ---- */
  function addPhrase(jp, en, note) {
    var p = { id: Date.now(), jp: jp, en: en, note: note || '', created: today() };
    state.phrasebook.unshift(p);
    save();
    return { phrase: p, yen: awardYen(2, { type: 'phrase' }) };
  }
  function deletePhrase(id) {
    state.phrasebook = state.phrasebook.filter(function (p) { return p.id !== id; });
    save();
  }

  /* ---- feedback ---- */
  function addFeedback(text, context) {
    var f = {
      id: Date.now(), text: text, context: context || '',
      created: new Date().toISOString(), status: 'pending'
    };
    state.feedback.unshift(f);
    save();
    return f;
  }

  global.Store = {
    state: state,
    save: save,
    today: today,
    awardYen: awardYen,
    markChapterRead: markChapterRead,
    isChapterRead: isChapterRead,
    setScripturePos: setScripturePos,
    cardState: cardState,
    isDue: isDue,
    gradeCard: gradeCard,
    addPhrase: addPhrase,
    deletePhrase: deletePhrase,
    addFeedback: addFeedback,
    onYenChange: function (fn) { yenListeners.push(fn); },
    dailyCap: DAILY_CAP,
    typeCaps: TYPE_CAPS
  };
})(window);
