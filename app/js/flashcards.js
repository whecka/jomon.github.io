/* Flashcards tab: hiragana / katakana / jōyō kanji decks, studied via the Leitner
   SRS in store.js (Store.isDue / cardState / gradeCard). +1 yen per "got it",
   soft-capped at 15/day by the store's per-type cap. */
(function (global) {
  var DECKS = global.JOMON_DECKS;
  var view = null;
  var session = null; // { deck, queue:[idx], pos, flipped, right }

  function dueCount(deckId) {
    var n = 0, cards = DECKS[deckId].cards;
    for (var i = 0; i < cards.length; i++) if (global.Store.isDue(deckId, i)) n++;
    return n;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function buildQueue(deckId, allCards) {
    var cards = DECKS[deckId].cards, q = [];
    for (var i = 0; i < cards.length; i++) if (allCards || global.Store.isDue(deckId, i)) q.push(i);
    return shuffle(q);
  }

  var ICON = { kana: 'ti-abc', kanji: 'ti-language-hiragana' };

  function renderDeckList() {
    var html = '<p class="kick" style="margin-top:16px">Flashcards</p>' +
      '<h2 class="page-h">Pick a deck</h2><div class="deck-grid">';
    Object.keys(DECKS).forEach(function (id) {
      var d = DECKS[id], due = dueCount(id);
      html += '<button class="deck-card" data-deck="' + id + '">' +
        '<i class="ti ' + (ICON[d.kind] || 'ti-cards') + '"></i>' +
        '<span class="deck-name">' + d.name + '</span>' +
        '<span class="deck-meta mono">' + d.cards.length + ' cards</span>' +
        '<span class="deck-due mono' + (due ? ' has-due' : '') + '">' +
          (due ? due + ' due' : 'all caught up') + '</span>' +
      '</button>';
    });
    html += '</div>';
    view.innerHTML = html;
    Array.prototype.forEach.call(view.querySelectorAll('.deck-card'), function (b) {
      b.onclick = function () { start(b.dataset.deck); };
    });
  }

  function start(deckId, allCards) {
    var queue = buildQueue(deckId, allCards);
    if (!queue.length) queue = buildQueue(deckId, true); // nothing due -> practice the whole deck
    if (!queue.length) { renderDeckList(); return; }
    session = { deck: deckId, queue: queue, pos: 0, flipped: false, right: 0 };
    renderCard();
  }

  function renderCard() {
    var d = DECKS[session.deck];
    if (session.pos >= session.queue.length) return renderSummary();
    var card = d.cards[session.queue[session.pos]];
    var isKanji = d.kind === 'kanji';
    view.innerHTML =
      '<div class="study-bar">' +
        '<button id="fc-exit" class="link-btn mono"><i class="ti ti-x"></i> decks</button>' +
        '<span class="mono study-count">' + (session.pos + 1) + ' / ' + session.queue.length + '</span>' +
      '</div>' +
      '<div class="fcard" id="fcard">' +
        '<span class="fcard-front jp' + (isKanji ? ' kanji' : '') + '">' + card.f + '</span>' +
        '<span class="fcard-back' + (session.flipped ? ' show' : '') + '">' + card.b + '</span>' +
        (session.flipped ? '' : '<span class="fcard-hint mono">tap to flip</span>') +
      '</div>' +
      (session.flipped ?
        '<div class="grade-row">' +
          '<button class="grade again" id="fc-again">もう一度<span class="mono sub">again</span></button>' +
          '<button class="grade got" id="fc-got">覚えた<span class="mono sub">got it · +1 ¥</span></button>' +
        '</div>'
        : '');

    view.querySelector('#fc-exit').onclick = function () { session = null; renderDeckList(); };
    var fc = view.querySelector('#fcard');
    if (!session.flipped) {
      fc.onclick = flip;
    } else {
      view.querySelector('#fc-again').onclick = function () { grade(false); };
      view.querySelector('#fc-got').onclick = function () { grade(true); };
    }
  }

  function flip() { session.flipped = true; renderCard(); }

  function grade(correct) {
    var earned = global.Store.gradeCard(session.deck, session.queue[session.pos], correct);
    if (correct) session.right++;
    if (earned > 0 && global.toast) global.toast('+' + earned + ' ¥');
    session.pos++; session.flipped = false;
    renderCard();
  }

  function renderSummary() {
    var d = DECKS[session.deck], total = session.queue.length, right = session.right;
    view.innerHTML =
      '<div class="placeholder" style="margin-top:40px">' +
        '<i class="ti ti-circle-check"></i>' +
        '<h2>' + d.name + ' done</h2>' +
        '<p>' + right + ' / ' + total + ' correct. Cards you missed come back sooner.</p>' +
        '<div class="grade-row" style="margin-top:16px">' +
          '<button class="grade flip" id="fc-again-deck">Study again</button>' +
          '<button class="grade" style="background:var(--wood)" id="fc-back">Back to decks</button>' +
        '</div>' +
      '</div>';
    var deck = session.deck;
    view.querySelector('#fc-again-deck').onclick = function () { session = null; start(deck, true); };
    view.querySelector('#fc-back').onclick = function () { session = null; renderDeckList(); };
  }

  global.FlashcardsTab = { mount: function (el) { view = el; session = null; renderDeckList(); } };
})(window);
