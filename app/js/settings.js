/* Settings: stores the Anthropic API key + model locally (never in the repo).
   When a key is present, the Today tab can generate fresh lessons live. */
(function (global) {
  var KEY = 'jomon_settings';
  var MODELS = [
    { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — balanced (recommended)' },
    { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — cheapest, fastest' },
    { id: 'claude-opus-4-8', label: 'Opus 4.8 — richest, priciest' }
  ];
  var open = false;

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function set(s) { localStorage.setItem(KEY, JSON.stringify(s)); }
  function model() { return get().model || MODELS[0].id; }
  function hasKey() { return !!(get().apiKey && get().apiKey.trim()); }

  function masked(k) { return k ? k.slice(0, 7) + '…' + k.slice(-4) : ''; }

  function render() {
    var existing = document.getElementById('set-layer');
    if (existing) existing.remove();
    if (!open) return;
    var s = get();
    var opts = MODELS.map(function (m) {
      return '<option value="' + m.id + '"' + (model() === m.id ? ' selected' : '') + '>' + m.label + '</option>';
    }).join('');
    var layer = document.createElement('div');
    layer.id = 'set-layer';
    layer.innerHTML =
      '<div id="set-backdrop"></div>' +
      '<div id="set-sheet" role="dialog" aria-label="Settings">' +
        '<div class="set-head"><span class="mono">Settings</span>' +
          '<button id="set-close" class="link-btn" aria-label="close"><i class="ti ti-x"></i></button></div>' +
        '<label class="set-label mono">Anthropic API key</label>' +
        '<input id="set-key" type="password" placeholder="sk-ant-…" value="' + (s.apiKey || '') + '" autocomplete="off" />' +
        '<p class="set-hint">' + (hasKey() ? 'Saved: ' + masked(s.apiKey) + ' — enables live lessons.' : 'Stored only on this device. Without it, lessons use the built-in bank.') + '</p>' +
        '<label class="set-label mono">Lesson model</label>' +
        '<select id="set-model">' + opts + '</select>' +
        '<div class="set-actions">' +
          '<button id="set-clear" class="link-btn mono">Clear key</button>' +
          '<button id="set-save" class="cta mono">Save</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(layer);
    document.getElementById('set-close').onclick = close;
    document.getElementById('set-backdrop').onclick = close;
    document.getElementById('set-save').onclick = function () {
      var cur = get();
      cur.apiKey = document.getElementById('set-key').value.trim();
      cur.model = document.getElementById('set-model').value;
      set(cur);
      if (global.toast) global.toast(cur.apiKey ? 'Saved — live lessons on' : 'Saved');
      close();
      if (global.TodayTab && document.body.dataset.tab === 'today') global.TodayTab.mount(document.getElementById('view'));
    };
    document.getElementById('set-clear').onclick = function () {
      var cur = get(); delete cur.apiKey; set(cur);
      document.getElementById('set-key').value = '';
      if (global.toast) global.toast('Key cleared');
    };
  }
  function toggle() { open = !open; render(); }
  function close() { open = false; render(); }

  function init() {
    var btn = document.createElement('button');
    btn.id = 'settings-btn';
    btn.setAttribute('aria-label', 'Settings');
    btn.innerHTML = '<i class="ti ti-settings"></i>';
    btn.onclick = toggle;
    var bar = document.getElementById('appbar');
    bar.insertBefore(btn, document.getElementById('yen'));
  }

  global.Settings = { init: init, get: get, model: model, hasKey: hasKey };
})(window);
