/* Jomon shell: tab bar, yen counter, routing. Scripture is fully built this session;
   the other tabs are placeholders until later sessions. */
(function () {
  var view = document.getElementById('view');
  var yenEl = document.getElementById('yen');
  var tabbar = document.getElementById('tabbar');
  var toastEl = document.getElementById('toast');
  var toastTimer;

  function renderYen() {
    yenEl.innerHTML = '<span class="yi"><i class="ti ti-coin"></i></span>' + Store.state.yen;
    if (yenTray) yenTray.innerHTML = trayHTML();
  }
  Store.onYenChange(renderYen);

  // Yen tray: tap the counter for playful conversions. Rates are deliberate gags.
  var yenTray = null;
  function trayHTML() {
    var y = Store.state.yen;
    return '<div class="yt-head"><span class="mono">¥ ' + y + '</span><span class="mono yt-sub">balance</span></div>' +
      '<div class="yt-item"><i class="ti ti-currency-dollar"></i><span class="yt-n">$' + (y / 150).toFixed(2) + '</span><span class="yt-l mono">US dollars</span></div>' +
      '<div class="yt-item"><i class="ti ti-train"></i><span class="yt-n">' + (y / 180).toFixed(1) + '</span><span class="yt-l mono">train rides</span></div>' +
      '<div class="yt-item"><i class="ti ti-cake"></i><span class="yt-n">' + (y / 150).toFixed(1) + '</span><span class="yt-l mono">Muji baumkuchen</span></div>';
  }
  function closeTray() { if (yenTray) { yenTray.remove(); yenTray = null; } }
  function toggleTray() {
    if (yenTray) return closeTray();
    yenTray = document.createElement('div');
    yenTray.id = 'yen-tray';
    yenTray.innerHTML = trayHTML();
    document.body.appendChild(yenTray);
  }
  yenEl.style.cursor = 'pointer';
  yenEl.setAttribute('role', 'button');
  yenEl.onclick = function (e) { e.stopPropagation(); toggleTray(); };
  document.addEventListener('click', function (e) {
    if (yenTray && e.target !== yenEl && !yenTray.contains(e.target) && !yenEl.contains(e.target)) closeTray();
  });

  window.toast = function (msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1600);
  };

  var TABS = [
    { id: 'today', label: 'Today', icon: 'ti-sun' },
    { id: 'scripture', label: 'Scripture', icon: 'ti-book' },
    { id: 'cards', label: 'Cards', icon: 'ti-cards' },
    { id: 'phrases', label: 'Phrases', icon: 'ti-message' }
  ];

  function placeholder(title, note, icon) {
    view.innerHTML =
      '<p class="kick" style="margin-top:16px">' + title + '</p>' +
      '<div class="placeholder"><i class="ti ' + icon + '"></i>' +
      '<h2>' + title + '</h2><p>' + note + '</p></div>';
  }

  function show(id) {
    closeTray();
    document.body.dataset.tab = id;
    Array.prototype.forEach.call(tabbar.children, function (b) {
      b.classList.toggle('active', b.dataset.tab === id);
    });
    if (id === 'scripture') {
      ScriptureTab.mount(view);
    } else if (id === 'cards') {
      FlashcardsTab.mount(view);
    } else if (id === 'phrases') {
      PhrasebookTab.mount(view);
    } else if (id === 'today') {
      TodayTab.mount(view);
    }
  }

  TABS.forEach(function (t) {
    var b = document.createElement('button');
    b.dataset.tab = t.id;
    b.innerHTML = '<i class="ti ' + t.icon + '"></i>' + t.label;
    b.onclick = function () { show(t.id); };
    tabbar.appendChild(b);
  });

  renderYen();
  if (window.Settings) Settings.init();
  show('scripture');
  if (window.Feedback) Feedback.init();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
