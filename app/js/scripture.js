/* Scripture tab: one verse at a time, English on top, Japanese (with furigana) below.
   Book/chapter nav at the very top; prev/next stepping at the bottom. Dark theme is
   applied via body[data-tab="scripture"] in CSS. */
(function (global) {
  var DATA = global.JOMON_SCRIPTURE;
  var view = null;

  function books() { return DATA.books.map(function (b) { return b[0]; }); }
  function chaptersOf(book) {
    return Object.keys(DATA.data[book]).map(Number).sort(function (a, b) { return a - b; });
  }
  function versesOf(book, ch) { return DATA.data[book][String(ch)] || []; }

  function pos() { return global.Store.state.scripture; }

  // Clamp the stored position to something that actually exists in the data.
  function normalize() {
    var p = pos();
    if (!DATA.data[p.book]) p.book = books()[0];
    var chs = chaptersOf(p.book);
    if (chs.indexOf(Number(p.chapter)) === -1) p.chapter = String(chs[0]);
    var verses = versesOf(p.book, p.chapter);
    if (p.verse < 1) p.verse = 1;
    if (p.verse > verses.length) p.verse = verses.length;
  }

  function setPos(book, chapter, verse) {
    global.Store.setScripturePos(book, chapter, verse);
    render();
  }

  function step(delta) {
    var p = pos();
    var verses = versesOf(p.book, p.chapter);
    var v = p.verse + delta;
    if (v >= 1 && v <= verses.length) { setPos(p.book, p.chapter, v); return; }
    // cross a chapter / book boundary
    var chs = chaptersOf(p.book);
    var ci = chs.indexOf(Number(p.chapter));
    if (delta > 0) {
      if (ci < chs.length - 1) { setPos(p.book, chs[ci + 1], 1); return; }
      var bi = books().indexOf(p.book);
      if (bi < books().length - 1) { var nb = books()[bi + 1]; setPos(nb, chaptersOf(nb)[0], 1); }
    } else {
      if (ci > 0) { var pc = chs[ci - 1]; setPos(p.book, pc, versesOf(p.book, pc).length); return; }
      var bi2 = books().indexOf(p.book);
      if (bi2 > 0) { var pb = books()[bi2 - 1]; var lc = chaptersOf(pb).slice(-1)[0]; setPos(pb, lc, versesOf(pb, lc).length); }
    }
  }

  function atVeryStart() { var p = pos(); return p.book === books()[0] && Number(p.chapter) === chaptersOf(p.book)[0] && p.verse === 1; }
  function atVeryEnd() {
    var p = pos(), bs = books();
    var lastBook = bs[bs.length - 1];
    if (p.book !== lastBook) return false;
    var chs = chaptersOf(p.book);
    return Number(p.chapter) === chs[chs.length - 1] && p.verse === versesOf(p.book, p.chapter).length;
  }

  function opt(value, label, selected) {
    return '<option value="' + value + '"' + (selected ? ' selected' : '') + '>' + label + '</option>';
  }

  function render() {
    if (!view) return;
    normalize();
    var p = pos();
    var verses = versesOf(p.book, p.chapter);
    var row = verses[p.verse - 1];
    var en = row ? row[2] : '';
    var jp = row ? row[1] : '';

    var bookOpts = books().map(function (b) { return opt(b, b, b === p.book); }).join('');
    var chOpts = chaptersOf(p.book).map(function (c) { return opt(c, c, c === Number(p.chapter)); }).join('');

    view.innerHTML =
      '<div class="sc-nav">' +
        '<select id="sc-book" aria-label="Book">' + bookOpts + '</select>' +
        '<select id="sc-chapter" aria-label="Chapter">' + chOpts + '</select>' +
        '<span class="ref mono">' + p.verse + ' / ' + verses.length + '</span>' +
      '</div>' +
      '<div class="sc-pane">' +
        '<div class="sc-half sc-en"><p class="verse-en">' + en.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p></div>' +
        '<div class="sc-divider">' +
          '<button id="sc-prev"' + (atVeryStart() ? ' disabled' : '') + ' aria-label="previous verse"><i class="ti ti-chevron-left"></i></button>' +
          '<span class="sc-line"></span>' +
          '<button id="sc-next"' + (atVeryEnd() ? ' disabled' : '') + ' aria-label="next verse"><i class="ti ti-chevron-right"></i></button>' +
        '</div>' +
        '<div class="sc-half sc-jp"><p class="verse-jp">' + global.Furigana.toRuby(jp) + '</p></div>' +
      '</div>';

    view.querySelector('#sc-book').onchange = function (e) {
      var nb = e.target.value; setPos(nb, chaptersOf(nb)[0], 1);
    };
    view.querySelector('#sc-chapter').onchange = function (e) { setPos(p.book, e.target.value, 1); };
    view.querySelector('#sc-prev').onclick = function () { step(-1); };
    view.querySelector('#sc-next').onclick = function () { step(1); };

    // Award the chapter once the reader reaches its final verse.
    if (p.verse === verses.length && !global.Store.isChapterRead(p.book, p.chapter)) {
      var earned = global.Store.markChapterRead(p.book, p.chapter);
      if (earned > 0 && global.toast) global.toast('+' + earned + ' ¥ · chapter complete');
    }
  }

  // Horizontal swipe: left = next verse, right = previous. step() handles
  // crossing chapter/book boundaries. Bound once on the shared view element.
  var swipeBound = false;
  function bindSwipe(el) {
    var x0 = null, y0 = null;
    el.addEventListener('touchstart', function (e) {
      if (document.body.dataset.tab !== 'scripture') return;
      var t = e.changedTouches[0]; x0 = t.clientX; y0 = t.clientY;
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (document.body.dataset.tab !== 'scripture' || x0 === null) return;
      var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  global.ScriptureTab = {
    mount: function (el) {
      view = el;
      if (!swipeBound) { bindSwipe(el); swipeBound = true; }
      render();
    }
  };
})(window);
