/* Furigana parser: turns "kanji(reading)" notation into HTML <ruby> elements.
   Handles three cases discovered in the source data:
     1. single kanji          善(よ)        -> <ruby>善<rt>よ</rt></ruby>
     2. numeral-led run        十二人(にん)  -> 十二<ruby>人<rt>にん</rt></ruby>
     3. true compound reading  同胞(はらから)-> <ruby>同胞<rt>はらから</rt></ruby>
*/
(function (global) {
  var NUM = new Set(Array.from('〇一二三四五六七八九十百千万億兆零'));
  // CJK ideographs + iteration/repeat marks
  var GROUP = /([一-鿿々〆ヶ]+)\(([^)]+)\)/g;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function ruby(base, reading) {
    return '<ruby>' + esc(base) + '<rt>' + esc(reading) + '</rt></ruby>';
  }

  function toRuby(text) {
    if (!text) return '';
    GROUP.lastIndex = 0;
    var out = '', last = 0, m;
    while ((m = GROUP.exec(text)) !== null) {
      out += esc(text.slice(last, m.index));
      var run = m[1], reading = m[2];
      if (run.length === 1) {
        out += ruby(run, reading);
      } else {
        var i = 0;
        while (i < run.length && NUM.has(run[i])) i++;
        if (i > 0 && i < run.length) {
          out += esc(run.slice(0, i)) + ruby(run.slice(i), reading);
        } else {
          out += ruby(run, reading);
        }
      }
      last = GROUP.lastIndex;
    }
    out += esc(text.slice(last));
    return out;
  }

  // Strip furigana readings, leaving plain Japanese (kanji + kana). Used later for TTS.
  function toPlain(text) {
    if (!text) return '';
    GROUP.lastIndex = 0;
    return text.replace(GROUP, function (_, run) { return run; });
  }

  global.Furigana = { toRuby: toRuby, toPlain: toPlain };
})(window);
