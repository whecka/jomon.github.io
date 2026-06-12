/* In-app feedback. Tap the button on any tab -> type a note -> it's logged to
   localStorage (offline mirror, via Store.addFeedback) AND POSTed to the local
   inbox file (Jomon/feedback/inbox.jsonl) when reachable. A nightly scheduled
   agent reads that inbox and works through each pending item. Export button
   gives a manual fallback if the server isn't running. */
(function (global) {
  var open = false;

  function currentContext() {
    var tab = document.body.dataset.tab || '';
    if (tab === 'scripture') {
      var s = global.Store.state.scripture;
      return 'scripture ' + s.book + ' ' + s.chapter + ':' + s.verse;
    }
    return 'tab:' + tab;
  }

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  function render() {
    var existing = document.getElementById('fb-layer');
    if (existing) existing.remove();
    var count = global.Store.state.feedback.length;
    var layer = el(
      '<div id="fb-layer">' +
        '<button id="fb-fab" aria-label="Leave feedback"><i class="ti ti-message-dots"></i></button>' +
        (open ?
          '<div id="fb-sheet" role="dialog" aria-label="Feedback">' +
            '<div class="fb-head"><span class="mono">Feedback</span>' +
              '<button id="fb-close" class="link-btn" aria-label="close"><i class="ti ti-x"></i></button></div>' +
            '<p class="fb-ctx mono">on ' + currentContext() + '</p>' +
            '<textarea id="fb-text" placeholder="What should I change or add? I\'ll work on it tonight."></textarea>' +
            '<div class="fb-actions">' +
              '<button id="fb-export" class="link-btn mono">Export (' + count + ')</button>' +
              '<button id="fb-send" class="cta mono">Send</button>' +
            '</div>' +
          '</div>' : '') +
      '</div>');
    document.body.appendChild(layer);

    document.getElementById('fb-fab').onclick = function () { open = !open; render(); if (open) { var t = document.getElementById('fb-text'); if (t) t.focus(); } };
    if (open) {
      document.getElementById('fb-close').onclick = function () { open = false; render(); };
      document.getElementById('fb-send').onclick = send;
      document.getElementById('fb-export').onclick = exportLog;
    }
  }

  function send() {
    var ta = document.getElementById('fb-text');
    var text = (ta.value || '').trim();
    if (!text) { open = false; return render(); }
    var ctx = currentContext();
    var entry = global.Store.addFeedback(text, ctx);
    fetch('/api/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entry.id, text: text, context: ctx })
    }).then(function (r) {
      if (r.ok) markSynced(entry.id);
    }).catch(function () { /* offline: stays in localStorage mirror */ });
    open = false; render();
    if (global.toast) global.toast('Logged — I\'ll work on it tonight');
  }

  function markSynced(id) {
    var f = global.Store.state.feedback.find(function (x) { return x.id === id; });
    if (f) { f.synced = true; global.Store.save(); }
  }

  function exportLog() {
    var data = JSON.stringify(global.Store.state.feedback, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'jomon-feedback.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  global.Feedback = { init: render };
})(window);
