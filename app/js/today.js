/* Today tab: placement test (first run), daily lesson, review, and the curriculum
   with weekly mob tests + boss tests. Bundled content for now; live Claude
   generation comes in Session 5. Lesson progress lives in Store.state.lessons. */
(function (global) {
  var CUR = global.JOMON_CURRICULUM;
  var PLACE = global.JOMON_PLACEMENT;
  var view = null;
  var quiz = null; // { qs, i, score, answered, picked, title, jp, kind, onDone }

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function ruby(s) { return global.Furigana.toRuby(s); }

  function L() {
    var s = global.Store.state.lessons;
    if (!s || !s.init) {
      s = { init: true, placement: { done: false, level: null, score: null }, completed: [], bossPassed: [], streak: 0, lastActive: null, reviewDate: null, difficulty: { last: null, log: [] } };
      global.Store.state.lessons = s; global.Store.save();
    }
    if (s && !s.difficulty) { s.difficulty = { last: null, log: [] }; global.Store.save(); }
    return s;
  }
  function rateDifficulty(unitId, rating) {
    var s = L();
    s.difficulty.last = rating;
    s.difficulty.log.push({ id: unitId, rating: rating, date: global.Store.today() });
    global.Store.save();
  }
  function yesterday() {
    var d = new Date(global.Store.today() + 'T00:00:00'); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  function bumpStreak() {
    var s = L(), t = global.Store.today();
    if (s.lastActive === t) return;
    s.streak = (s.lastActive === yesterday()) ? s.streak + 1 : 1;
    s.lastActive = t; global.Store.save();
  }
  function isDone(u) {
    var s = L();
    return u.type === 'boss' ? s.bossPassed.indexOf(u.id) !== -1 : s.completed.indexOf(u.id) !== -1;
  }
  function nextUnit() {
    for (var i = 0; i < CUR.units.length; i++) if (!isDone(CUR.units[i])) return CUR.units[i];
    return null;
  }

  /* ---------- routing ---------- */
  function mount(el) { view = el; quiz = null; route(); }
  function route() { if (!L().placement.done) renderPlacementIntro(); else renderHome(); }

  /* ---------- placement ---------- */
  function renderPlacementIntro() {
    view.innerHTML =
      '<p class="kick" style="margin-top:16px">Welcome to Jomon</p>' +
      '<div class="hero-card">' +
        '<h2 class="page-h" style="margin-bottom:6px">Quick placement</h2>' +
        '<p class="hero-sub">' + PLACE.questions.length + ' fast questions, easy → hard. They set your starting level — answer only what you know.</p>' +
        '<button class="cta mono" id="pl-start" style="margin-top:14px">Start <i class="ti ti-arrow-right"></i></button>' +
      '</div>';
    view.querySelector('#pl-start').onclick = function () {
      startQuiz({ qs: PLACE.questions, title: 'Placement', jp: 'レベルチェック', kind: 'placement', onDone: finishPlacement });
    };
  }
  function finishPlacement(score, total) {
    var lvl = PLACE.levelFor(score), s = L();
    s.placement = { done: true, level: lvl.key, label: lvl.label, score: score, date: global.Store.today() };
    global.Store.save();
    quiz = null;
    view.innerHTML =
      '<div class="result-card">' +
        '<i class="ti ti-compass result-ico"></i>' +
        '<h2 class="page-h">' + lvl.label + '</h2>' +
        '<p class="hero-sub">You scored ' + score + ' / ' + total + '. ' + esc(lvl.note) + '</p>' +
        '<button class="cta mono" id="pl-go" style="margin-top:16px">Go to today</button>' +
      '</div>';
    view.querySelector('#pl-go').onclick = renderHome;
  }

  /* ---------- home ---------- */
  function greeting() {
    var h = new Date().getHours();
    if (h < 11) return { jp: 'おはよう', en: 'Good morning' };
    if (h < 18) return { jp: 'こんにちは', en: 'Good afternoon' };
    return { jp: 'こんばんは', en: 'Good evening' };
  }
  function renderHome() {
    quiz = null;
    var s = L(), g = greeting(), unit = nextUnit();
    var reviewable = s.completed.length > 0 && s.reviewDate !== global.Store.today();

    var html =
      '<p class="kick" style="margin-top:16px">' + g.en + '</p>' +
      '<h2 class="home-greet jp">' + g.jp + '<span class="home-name">, Shane</span></h2>' +
      '<div class="stat-row">' +
        '<div class="stat"><span class="stat-n mono">' + (s.placement.label || 'L' + s.placement.level) + '</span><span class="stat-l mono">level</span></div>' +
        '<div class="stat"><span class="stat-n mono"><i class="ti ti-flame"></i> ' + s.streak + '</span><span class="stat-l mono">day streak</span></div>' +
      '</div>';

    if (unit) {
      var meta = unit.type === 'boss' ? 'BOSS TEST · ' + unit.yenMin + '–' + unit.yenMax + ' ¥'
        : unit.type === 'mob' ? 'MOB TEST · +' + unit.yen + ' ¥' : 'TODAY’S LESSON · +30 ¥';
      var cls = unit.type === 'boss' ? 'unit-card boss' : unit.type === 'mob' ? 'unit-card mob' : 'unit-card';
      html += '<button class="' + cls + '" id="start-unit">' +
        '<span class="mono unit-meta">' + meta + '</span>' +
        '<span class="unit-title">' + esc(unit.title) + '</span>' +
        '<span class="jp unit-jp">' + ruby(unit.jp) + '</span>' +
        '<span class="unit-go mono">' + (unit.type === 'lesson' ? 'Begin' : 'Take test') + ' <i class="ti ti-arrow-right"></i></span>' +
      '</button>';
    } else {
      html += '<div class="unit-card done"><span class="unit-title">All caught up!</span>' +
        '<span class="hero-sub">New lessons arrive when we wire live generation (Session 5).</span></div>';
    }

    if (reviewable) {
      html += '<button class="mini-card review" id="start-review"><i class="ti ti-rotate"></i>' +
        '<span>Daily review</span><span class="mono mini-yen">+10 ¥</span></button>';
    }
    if (global.Settings && global.Settings.hasKey()) {
      html += '<button class="mini-card gen" id="gen-lesson"><i class="ti ti-sparkles"></i>' +
        '<span>Fresh AI lesson</span><span class="mono mini-yen">live</span></button>';
    }

    html += '<p class="kick" style="margin-top:22px">This month</p><div class="mile-list">';
    CUR.mileposts.forEach(function (m) {
      var weekUnits = CUR.units.filter(function (u) { return u.week === m.week; });
      var doneCount = weekUnits.filter(isDone).length;
      var pct = weekUnits.length ? Math.round(100 * doneCount / weekUnits.length) : 0;
      html += '<div class="mile">' +
        '<div class="mile-top"><span class="mile-w mono">Week ' + m.week + '</span>' +
          '<span class="mile-t">' + esc(m.title) + '</span>' +
          '<span class="mile-pct mono">' + (weekUnits.length ? pct + '%' : 'soon') + '</span></div>' +
        '<div class="mile-bar"><span style="width:' + pct + '%"></span></div>' +
        '<p class="mile-d">' + esc(m.detail) + '</p>' +
      '</div>';
    });
    html += '</div>';

    view.innerHTML = html;
    var su = view.querySelector('#start-unit');
    if (su) su.onclick = function () { startUnit(unit); };
    var sr = view.querySelector('#start-review');
    if (sr) sr.onclick = startReview;
    var gl = view.querySelector('#gen-lesson');
    if (gl) gl.onclick = startGenerated;
  }

  function startGenerated() {
    var s = L();
    view.innerHTML =
      '<div class="result-card"><i class="ti ti-sparkles result-ico" style="color:var(--coral)"></i>' +
      '<h2 class="page-h">Writing your lesson…</h2>' +
      '<p class="hero-sub">Claude is composing a fresh lesson tuned to your level. A few seconds.</p></div>';
    global.Generate.lesson({
      level: s.placement.label || ('level ' + s.placement.level),
      recentTitles: CUR.units.filter(function (u) { return s.completed.indexOf(u.id) !== -1; }).map(function (u) { return u.title; }),
      difficulty: s.difficulty.last
    }).then(function (unit) {
      startUnit(unit);
    }).catch(function (err) {
      var msg = err && err.message === 'no-key' ? 'Add your API key in Settings first.' : 'Generation failed: ' + (err && err.message || 'unknown') + '. Your built-in lessons still work.';
      view.innerHTML =
        '<div class="result-card fail"><i class="ti ti-alert-triangle result-ico"></i>' +
        '<h2 class="page-h">Couldn’t generate</h2><p class="hero-sub">' + esc(msg) + '</p>' +
        '<button class="link-btn mono" id="g-home" style="margin-top:14px">Back to today</button></div>';
      view.querySelector('#g-home').onclick = renderHome;
    });
  }

  /* ---------- units ---------- */
  function startUnit(unit) {
    if (unit.teach && unit.teach.length) renderTeach(unit);
    else startQuiz(quizCfgFor(unit));
  }
  function renderTeach(unit) {
    var items = unit.teach.map(function (t) {
      return '<div class="teach-item"><span class="jp teach-jp">' + ruby(t.jp) + '</span>' +
        '<span class="teach-en">' + esc(t.en) + '</span>' +
        (t.note ? '<span class="teach-note mono">' + esc(t.note) + '</span>' : '') + '</div>';
    }).join('');
    view.innerHTML =
      '<div class="study-bar"><button class="link-btn mono" id="u-exit"><i class="ti ti-x"></i> today</button>' +
        '<span class="mono study-count">learn</span></div>' +
      '<h2 class="page-h">' + esc(unit.title) + '</h2>' +
      '<p class="hero-sub">' + esc(unit.goal) + '</p>' +
      '<div class="teach-list">' + items + '</div>' +
      '<button class="cta mono" id="u-go" style="margin-top:18px;width:100%;justify-content:center">Start exercises <i class="ti ti-arrow-right"></i></button>';
    view.querySelector('#u-exit').onclick = renderHome;
    view.querySelector('#u-go').onclick = function () { startQuiz(quizCfgFor(unit)); };
  }
  function quizCfgFor(unit) {
    return { qs: unit.quiz, title: unit.title, jp: unit.jp, kind: unit.type, onDone: function (sc, tot) { finishUnit(unit, sc, tot); } };
  }
  function finishUnit(unit, score, total) {
    var s = L(), pass = score / total >= (unit.pass || 0), earned = 0, claimed = false;
    if (unit.type === 'boss') {
      if (pass && s.bossPassed.indexOf(unit.id) === -1) {
        var amt = unit.yenMin + Math.floor(Math.random() * (unit.yenMax - unit.yenMin + 1));
        earned = global.Store.awardYen(amt, { boss: true });
        s.bossPassed.push(unit.id); claimed = true;
      }
    } else if (s.completed.indexOf(unit.id) === -1) {
      earned = global.Store.awardYen(unit.type === 'mob' ? unit.yen : 30);
      s.completed.push(unit.id); claimed = true;
    }
    if (claimed) bumpStreak();
    global.Store.save();
    renderResult(unit, score, total, pass, earned);
  }
  function renderResult(unit, score, total, pass, earned) {
    quiz = null;
    var boss = unit.type === 'boss';
    var ok = boss ? pass : true;
    var ico = ok ? 'ti-circle-check' : 'ti-mood-sad';
    var head = boss ? (pass ? 'Boss defeated!' : 'Boss stands') : (unit.type === 'mob' ? 'Mob test done' : 'Lesson complete');
    var msg;
    if (boss && !pass) msg = 'You scored ' + score + '/' + total + '. Need ' + Math.ceil(unit.pass * total) + ' to win — regroup and try again.';
    else if (earned > 0) msg = 'You scored ' + score + '/' + total + '. +' + earned + ' ¥ earned.';
    else msg = 'You scored ' + score + '/' + total + '. (Already claimed earlier.)';
    var showDial = ok; // ask how it felt after a completed session, not after a boss loss
    view.innerHTML =
      '<div class="result-card ' + (ok ? '' : 'fail') + '">' +
        '<i class="ti ' + ico + ' result-ico"></i>' +
        '<h2 class="page-h">' + head + '</h2>' +
        '<p class="hero-sub">' + msg + '</p>' +
        (showDial ?
          '<div class="dial-wrap"><p class="dial-q mono">How did that feel?</p>' +
          '<div class="dial"><button data-r="easier">Too easy</button>' +
          '<button data-r="just">Just right</button>' +
          '<button data-r="harder">Too hard</button></div></div>' : '') +
        (boss && !pass ? '<button class="cta mono" id="r-retry" style="margin-top:14px">Try again</button>' : '') +
        '<button class="link-btn mono" id="r-home" style="margin-top:14px">Back to today</button>' +
      '</div>';
    if (earned > 0 && global.toast) global.toast('+' + earned + ' ¥');
    if (showDial) {
      Array.prototype.forEach.call(view.querySelectorAll('.dial button'), function (b) {
        b.onclick = function () {
          rateDifficulty(unit.id || unit.type, b.dataset.r);
          Array.prototype.forEach.call(view.querySelectorAll('.dial button'), function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
        };
      });
    }
    var rt = view.querySelector('#r-retry'); if (rt) rt.onclick = function () { startQuiz(quizCfgFor(unit)); };
    view.querySelector('#r-home').onclick = renderHome;
  }

  /* ---------- daily review ---------- */
  function startReview() {
    var s = L(), pool = [];
    CUR.units.forEach(function (u) {
      if (u.quiz && s.completed.indexOf(u.id) !== -1) pool = pool.concat(u.quiz);
    });
    pool.sort(function () { return Math.random() - 0.5; });
    var qs = pool.slice(0, Math.min(4, pool.length));
    if (!qs.length) return renderHome();
    startQuiz({ qs: qs, title: 'Daily review', jp: '復習(ふくしゅう)', kind: 'review', onDone: function (sc, tot) {
      var earned = 0;
      if (s.reviewDate !== global.Store.today()) { earned = global.Store.awardYen(10); s.reviewDate = global.Store.today(); bumpStreak(); global.Store.save(); }
      renderResult({ type: 'review', title: 'Daily review', pass: 0 }, sc, tot, true, earned);
    } });
  }

  /* ---------- shared quiz engine ---------- */
  function startQuiz(cfg) {
    quiz = { qs: cfg.qs, i: 0, score: 0, answered: false, picked: -1, title: cfg.title, jp: cfg.jp, kind: cfg.kind, onDone: cfg.onDone };
    renderQuiz();
  }
  function renderQuiz() {
    var q = quiz.qs[quiz.i];
    var choices = q.choices.map(function (c, idx) {
      var cls = 'choice';
      if (quiz.answered) {
        if (idx === q.a) cls += ' correct';
        else if (idx === quiz.picked) cls += ' wrong';
      }
      return '<button class="' + cls + '" data-i="' + idx + '"' + (quiz.answered ? ' disabled' : '') + '>' + ruby(String(c)) + '</button>';
    }).join('');
    view.innerHTML =
      '<div class="study-bar"><button class="link-btn mono" id="q-exit"><i class="ti ti-x"></i> exit</button>' +
        '<span class="mono study-count">' + quiz.title + ' · ' + (quiz.i + 1) + '/' + quiz.qs.length + '</span></div>' +
      '<div class="qprog"><span style="width:' + Math.round(100 * quiz.i / quiz.qs.length) + '%"></span></div>' +
      '<p class="q-text jp">' + ruby(q.q) + '</p>' +
      '<div class="choices">' + choices + '</div>' +
      (quiz.answered ?
        '<div class="q-feedback ' + (quiz.picked === q.a ? 'good' : 'bad') + '">' +
          (quiz.picked === q.a ? '<i class="ti ti-check"></i> Correct' : '<i class="ti ti-x"></i> Answer: ' + ruby(String(q.choices[q.a]))) +
        '</div>' +
        '<button class="cta mono" id="q-next" style="margin-top:14px;width:100%;justify-content:center">' +
          (quiz.i + 1 < quiz.qs.length ? 'Next' : 'Finish') + ' <i class="ti ti-arrow-right"></i></button>'
        : '');
    view.querySelector('#q-exit').onclick = renderHome;
    Array.prototype.forEach.call(view.querySelectorAll('.choice'), function (b) {
      b.onclick = function () { pick(Number(b.dataset.i)); };
    });
    var nx = view.querySelector('#q-next'); if (nx) nx.onclick = next;
  }
  function pick(idx) {
    if (quiz.answered) return;
    quiz.answered = true; quiz.picked = idx;
    if (idx === quiz.qs[quiz.i].a) quiz.score++;
    renderQuiz();
  }
  function next() {
    if (quiz.i + 1 < quiz.qs.length) { quiz.i++; quiz.answered = false; quiz.picked = -1; renderQuiz(); }
    else { var done = quiz.onDone, sc = quiz.score, tot = quiz.qs.length; done(sc, tot); }
  }

  global.TodayTab = { mount: mount };
})(window);
