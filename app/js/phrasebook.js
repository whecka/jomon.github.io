/* Phrasebook tab: your own saved phrases. Japanese rendered with furigana via
   Furigana.toRuby (so you can type kanji(reading) notation just like the CSV).
   +2 yen per phrase added, soft-capped at 10/day by the store. */
(function (global) {
  var view = null;
  var adding = false;

  var STARTERS = [
    { jp: 'はじめまして、よろしくお願(ねが)いします。', en: 'Nice to meet you.' },
    { jp: 'お義母(かあ)さん、ありがとうございます。', en: 'Thank you, mother-in-law.' },
    { jp: '会議(かいぎ)は何時(なんじ)からですか。', en: 'What time does the meeting start?' }
  ];

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render() {
    var phrases = global.Store.state.phrasebook;
    var html = '<p class="kick" style="margin-top:16px">Phrasebook</p>' +
      '<h2 class="page-h">My phrases</h2>';

    if (adding) html += addForm();
    else html += '<button class="add-phrase-btn" id="pb-add"><i class="ti ti-plus"></i> Add a phrase</button>';

    if (!phrases.length && !adding) {
      html += '<p class="pb-empty-hint">No phrases yet — tap a suggestion to start.</p>' +
        '<div class="starter-list">';
      STARTERS.forEach(function (s, i) {
        html += '<button class="starter mono" data-i="' + i + '">' +
          '<span class="jp">' + global.Furigana.toRuby(s.jp) + '</span>' +
          '<span class="starter-en">' + esc(s.en) + '</span></button>';
      });
      html += '</div>';
    }

    phrases.forEach(function (p) {
      html += '<div class="phrase" data-id="' + p.id + '">' +
        '<button class="phrase-del" data-id="' + p.id + '" aria-label="delete"><i class="ti ti-trash"></i></button>' +
        '<p class="jp phrase-jp">' + global.Furigana.toRuby(p.jp) + '</p>' +
        '<p class="phrase-en">' + esc(p.en) + '</p>' +
        (p.note ? '<p class="phrase-note">' + esc(p.note) + '</p>' : '') +
      '</div>';
    });

    view.innerHTML = html;
    wire();
  }

  function addForm() {
    return '<div class="pb-form">' +
      '<label class="mono">Japanese <span class="hint">— use kanji(reading) for furigana</span></label>' +
      '<input id="pb-jp" class="jp" placeholder="会議(かいぎ)は何時(なんじ)からですか。" />' +
      '<label class="mono">English</label>' +
      '<input id="pb-en" placeholder="What time does the meeting start?" />' +
      '<label class="mono">Note (optional)</label>' +
      '<input id="pb-note" placeholder="for work" />' +
      '<div class="pb-form-actions">' +
        '<button class="link-btn mono" id="pb-cancel">Cancel</button>' +
        '<button class="cta mono" id="pb-save">Save · +2 ¥</button>' +
      '</div></div>';
  }

  function wire() {
    var addBtn = view.querySelector('#pb-add');
    if (addBtn) addBtn.onclick = function () { adding = !adding; render(); };
    var cancel = view.querySelector('#pb-cancel');
    if (cancel) cancel.onclick = function () { adding = false; render(); };
    var save = view.querySelector('#pb-save');
    if (save) save.onclick = function () {
      var jp = view.querySelector('#pb-jp').value.trim();
      var en = view.querySelector('#pb-en').value.trim();
      var note = view.querySelector('#pb-note').value.trim();
      if (!jp && !en) { adding = false; return render(); }
      save_phrase(jp, en, note);
    };
    Array.prototype.forEach.call(view.querySelectorAll('.phrase-del'), function (b) {
      b.onclick = function () { global.Store.deletePhrase(Number(b.dataset.id)); render(); };
    });
    Array.prototype.forEach.call(view.querySelectorAll('.starter'), function (b) {
      b.onclick = function () { var s = STARTERS[Number(b.dataset.i)]; save_phrase(s.jp, s.en, ''); };
    });
  }

  function save_phrase(jp, en, note) {
    var res = global.Store.addPhrase(jp, en, note);
    if (res.yen > 0 && global.toast) global.toast('+' + res.yen + ' ¥');
    adding = false;
    render();
  }

  global.PhrasebookTab = { mount: function (el) { view = el; adding = false; render(); } };
})(window);
