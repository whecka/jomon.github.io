/* Live lesson generation via the Anthropic API, called directly from the browser
   (personal single-user app; key stays in this device's localStorage). Returns a
   lesson object shaped exactly like the bundled units so the existing Today-tab
   player can run it unchanged. */
(function (global) {
  var ENDPOINT = 'https://api.anthropic.com/v1/messages';

  var SYSTEM =
    'You are a Japanese tutor building one dense daily lesson for an adult learner whose goals are ' +
    'conversational fluency and early business Japanese (his in-laws are Japanese, he may work in Japan). ' +
    'Return ONLY a JSON object, no prose, no code fences. Schema:\n' +
    '{"title": string (English), "jp": string (short Japanese title), "goal": string (one sentence),\n' +
    ' "teach": [ {"jp": string, "en": string, "note"?: string} ]  // 7-9 items; mix vocab, set phrases,\n' +
    '   one short grammar "note", and ONE 2-3 sentence reading passage item,\n' +
    ' "quiz": [ {"q": string, "choices": [string,string,string,string], "a": integer 0-3} ] }  // 8-10 items, varied:\n' +
    '   meaning, fill-in-the-blank, choose-the-translation, and word-order questions.\n' +
    'CRITICAL: in EVERY Japanese string, write furigana as kanji(reading) immediately after each kanji, ' +
    'e.g. 会議(かいぎ). Keep content accurate and natural. Vary the position of the correct answer.';

  function buildUser(opts) {
    var recent = (opts.recentTitles || []).join('; ') || 'none yet';
    return 'Learner level: ' + (opts.level || 'lower intermediate') +
      '. Recent lesson topics to avoid repeating: ' + recent +
      '. Last difficulty feedback: ' + (opts.difficulty || 'none') +
      ' (if "too hard", ease off; if "too easy", push harder). Make today\'s lesson cohesive around one practical theme.';
  }

  function extractJSON(text) {
    var t = (text || '').trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    var a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a === -1 || b === -1) throw new Error('No JSON in response');
    return JSON.parse(t.slice(a, b + 1));
  }

  // Returns a unit object, or throws ('no-key' | network/parse error).
  function lesson(opts) {
    opts = opts || {};
    var s = global.Settings.get();
    if (!s.apiKey) return Promise.reject(new Error('no-key'));
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': s.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: global.Settings.model(),
        max_tokens: 2200,
        system: SYSTEM,
        messages: [{ role: 'user', content: buildUser(opts) }]
      })
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('API ' + r.status + ': ' + t.slice(0, 160)); });
      return r.json();
    }).then(function (data) {
      var text = (data.content && data.content[0] && data.content[0].text) || '';
      var lsn = extractJSON(text);
      lsn.id = 'gen-' + Date.now();
      lsn.type = 'lesson';
      lsn.generated = true;
      if (!Array.isArray(lsn.teach) || !Array.isArray(lsn.quiz) || !lsn.quiz.length) throw new Error('Bad lesson shape');
      return lsn;
    });
  }

  global.Generate = { lesson: lesson };
})(window);
