const CLIENT_MODE = true;
const STORAGE_KEY = CLIENT_MODE ? 'bcb-grounds-super-admin-v1' : 'bcb-grounds-v1';
const clientScroll = {};
let clientToolScroll = 0;
function clientViewKey() { return [state.screen, state.ground, state.work, state.asset, state.request, state.match, state.inventoryGroup, state.groupGround, state.groupCondition, state.teamDesignation, state.teamMember, state.teamGround,state.pitchId,state.pitchReportId].join(':'); }
function clientSnapshot() { const { history, ...view } = state; return view; }
function syncClientRoute(push = true) {
  if (!CLIENT_MODE) return;
  const url = new URL(location.href);
  url.hash = state.screen === 'home' ? '' : '/' + state.screen;
  window.history[push ? 'pushState' : 'replaceState']({ view: clientSnapshot() }, '', url);
}
function clientRoot() { return !state.scope && ['home', 'issues', 'work', 'requests', 'matches', 'team', 'inventory', 'transfers'].includes(state.screen); }
function prepareClientData() {
  if (!CLIENT_MODE) return;
  const demo = db.works.find(w => w.id === 104);
  if (demo && demo.status === 'Ready for review' && !demo.evidence) {
    demo.evidence = 'assets/machine-mower.jpg';
    demo.evidencePhotos = [{ src: demo.evidence, demo: true, label: 'Service completion · demo reference' }];
  }
}
function clientNavIcon(name, selected) {
  if (!selected) return `<span class="nav-icon-wrap">${icon(name, 'nav-glyph-outline')}</span>`;
  const filled = {
    home: '<path d="M12 2.75 2 11.25h2.5V21h5.75v-6h3.5v6h5.75v-9.75H22L12 2.75Z"/>',
    box: '<path d="m12 2 10 5.5v10L12 23 2 17.5v-10L12 2Z"/><path class="nav-icon-cut" d="m3.4 7.8 8.6 4.8 8.6-4.8M12 12.6V21.5M7.2 4.7l9.4 5.4"/>',
    team: '<circle cx="8.5" cy="7" r="4"/><path d="M.8 20v-2c0-3.3 3.4-5 7.7-5s7.7 1.7 7.7 5v2H.8ZM17 3.6a3.8 3.8 0 0 1 0 7.4 5.9 5.9 0 0 0 0-7.4ZM17 13c4 .2 6.2 1.9 6.2 4.8V20h-5v-2.1c0-2-.5-3.5-1.2-4.9Z"/>',
    alert: '<path fill-rule="evenodd" d="M12 2.8 1.4 21h21.2L12 2.8Zm-1 6.4h2V15h-2V9.2Zm0 7.5h2v2h-2v-2Z"/>',
    match: '<path fill-rule="evenodd" d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM4.7 9v1.6h14.6V9H4.7Zm2.1 4.3v2.4h2.4v-2.4H6.8Zm5.1 0v2.4h2.4v-2.4h-2.4Zm-5.1 4.1v2.4h2.4v-2.4H6.8Z"/><path d="M7 1.8h2v4.7H7zM15 1.8h2v4.7h-2z"/>'
  };
  return `<span class="nav-icon-wrap"><svg class="nav-glyph-filled" viewBox="0 0 24 24" aria-hidden="true">${filled[name] || filled.home}</svg></span>`;
}
function clientAttentionPhotos(issues) {
  const photos = [];
  for (const issue of issues) {
    const asset = db.inventory.find(a => a.id === issue.asset);
    const own = normalisePhotos(issue)[0] || normalisePhotos(asset)[0];
    const equipment = asset && inventoryType(asset).image?.startsWith('machine-') ? machineMedia(asset)[0] : null;
    const photo = own || equipment;
    if (photo && !photos.some(p => p.src === photo.src)) photos.push(photo);
    if (photos.length === 2) break;
  }
  if (!photos.length) return `<span class="attention-symbol">${icon('alert')}</span>`;
  return `<span class="attention-photo-stack" aria-hidden="true">${photos.map(p => `<img src="${esc(p.src)}" alt="" decoding="async">`).join('')}<i>${icon('alert')}</i>${photos.some(p => p.demo) ? '<span class="attention-photo-reference">Reference</span>' : ''}</span>`;
}
function summaryMetricIcon(name) {
  const glyphs = {
    work: '<path fill-rule="evenodd" d="M9 2h6l1 2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3l1-2Zm0 3v2h6V5H9Zm1.1 12.1 7.6-7.6-1.4-1.4-6.2 6.2-2.8-2.8-1.4 1.4 4.2 4.2Z"/>',
    request: '<path fill-rule="evenodd" d="M5 2h9l5 5v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 2v5h5l-5-5Zm-6 7v2h8v-2H7Zm0 4v2h8v-2H7Zm0 4v1h5v-1H7Z"/>',
    shield: '<path fill-rule="evenodd" d="m12 2 9 4v6c0 5.5-4.5 9-9 11-4.5-2-9-5.5-9-11V6l9-4Zm-1.8 14.8 7.5-7.5-1.4-1.4-6.1 6.1-2.5-2.5-1.4 1.4 3.9 3.9Z"/>',
    activity: '<path d="M9 2h2l4 14 2-6h6v3h-4l-3 9h-2L10 8l-2 7H1v-3h5L9 2Z"/>',
    alert: '<path fill-rule="evenodd" d="M12 2.8 1.4 21h21.2L12 2.8Zm-1 6.4h2V15h-2V9.2Zm0 7.5h2v2h-2v-2Z"/>',
    user: '<circle cx="12" cy="7" r="4.5"/><path d="M3 21v-2.5C3 15 6.8 13 12 13s9 2 9 5.5V21H3Z"/>',
    team: '<circle cx="8.5" cy="7" r="4"/><path d="M.8 20v-2c0-3.3 3.4-5 7.7-5s7.7 1.7 7.7 5v2H.8ZM17 3.6a3.8 3.8 0 0 1 0 7.4 5.9 5.9 0 0 0 0-7.4ZM17 13c4 .2 6.2 1.9 6.2 4.8V20h-5v-2.1c0-2-.5-3.5-1.2-4.9Z"/>',
    box: '<path d="m12 2 10 5.5v10L12 23 2 17.5v-10L12 2Z"/><path class="summary-icon-cut" d="m3 7.1 9 5 9-5 .9 1.6-9 5V22h-1.8v-8.3l-9-5L3 7.1ZM7.4 4.6l10 5.5-.9 1.6-10-5.5.9-1.6Z"/>',
    settings: '<path fill-rule="evenodd" d="M21.6 4.4a6 6 0 0 1-7.5 7.5l-8.6 8.6a2.8 2.8 0 0 1-4-4l8.6-8.6a6 6 0 0 1 7.5-7.5L14 4l1 4 4 1 2.6-4.6ZM3.8 17.2a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"/>',
    ground: '<path fill-rule="evenodd" d="M12 2C5.9 2 2 6.4 2 12s3.9 10 10 10 10-4.4 10-10S18.1 2 12 2Zm0 3C7.8 5 5 7.9 5 12s2.8 7 7 7 7-2.9 7-7-2.8-7-7-7Z"/><rect x="9.5" y="7" width="5" height="10" rx="1"/>',
    clock: '<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 4h2v5.5l4.5 2.7-1 1.7L11 12.5V6Z"/>'
  };
  return `<svg class="summary-metric-glyph" viewBox="0 0 24 24" aria-hidden="true">${glyphs[name] || glyphs.box}</svg>`;
}
function summaryMetric(value, label, symbol, options = {}) {
  const tone = options.tone || (/Urgent|Needs repair|Overdue/.test(label) ? 'coral' : /Low stock|To approve|New requests/.test(label) ? 'amber' : /To review|Designations/.test(label) ? 'violet' : /Grounds|Total venues|Unassigned/.test(label) ? 'blue' : 'green');
  const tag = options.tag === 'button' ? 'button' : 'div';
  const length = String(value).length, size = length > 6 ? '18px' : length > 4 ? '22px' : length > 3 ? '26px' : '34px';
  return `<${tag} class="summary-metric summary-metric--${tone}" style="--metric-number-size:${size}" ${tag === 'button' ? `type="button" aria-label="${esc(value)} ${esc(label)}"` : ''} ${options.attributes || ''}><span class="summary-metric-symbol">${summaryMetricIcon(symbol)}</span><span class="summary-metric-copy"><strong class="summary-metric-number">${esc(value)}</strong><span class="summary-metric-label">${esc(label)}</span></span></${tag}>`;
}
function clientHomeTools() {
  const assetPic = db.assets.find(a => a.photos?.length)?.photos[0], staffPic = db.staff.find(p => p.photo)?.photo;
  const repair = db.assets.filter(a => assetCondTone(a.condition) === 'coral').length;
  const card = (go, label, pic, fallback, ic, title, sub) => `<button class="client-tool-card" data-go="${go}" aria-label="${label}">
      <div class="client-tool-photo"><img src="${esc(pic || fallback)}" alt="" decoding="async">${pic ? '' : '<span class="client-tool-reference">Demo reference</span>'}</div>
      <div class="client-tool-info"><div class="client-tool-title">${icon(ic)}<strong>${title}</strong>${icon('arrow')}</div><small>${sub}</small></div>
    </button>`;
  return `<div class="client-tools" aria-label="Ground management shortcuts" aria-roledescription="carousel">
    ${card('assets', 'Assets and Pitch Clay', assetPic, 'assets/machine-roller.jpg', 'box', 'Assets', db.assets.length ? `${db.assets.length} items${repair ? ' · ' + repair + ' need repair' : ''}` : 'Pitch Clay · equipment')}
    ${card('staff', 'Staff Members', staffPic, 'assets/machine-mower.jpg', 'team', 'Staff Members', db.staff.length ? `${db.staff.length} people · office & grounds` : 'Office & grounds teams')}
  </div><div class="client-tool-pagination" aria-label="Choose a shortcut card"><button data-tool-slide="0" aria-label="Show Assets card" aria-pressed="true"><i></i></button><button data-tool-slide="1" aria-label="Show Staff card" aria-pressed="false"><i></i></button></div>`;
}
function clientHome() {
  const urgent = openIssues().filter(i => i.urgency === 'Urgent');
  const pending = db.requests.filter(r => r.status === 'Submitted');
  const reviews = db.works.filter(w => w.status === 'Ready for review');
  const attention = new Set(urgent.map(i => i.ground)).size;
  return `<div class="client-brand-row"><div class="app-brand"><img class="bcb-logo" src="assets/bcb-logo.png" alt="Bangladesh Cricket Board logo"><span>BCB Grounds</span></div><div class="client-top-buttons"><button class="icon-btn" data-go="alerts" aria-label="Notifications">${icon('bell')}${!db.notificationsRead && accountNotificationCount() ? '<i class="notice-dot"></i>' : ''}</button><button class="client-avatar account-home-avatar" data-go="settings" aria-label="Your profile">${accountAvatar()}</button></div></div>
  <h1 class="app-title">Good Morning<br>${esc(accountProfile().fullName||'Welcome')}</h1><p class="app-subtitle">Every ground. A clearer picture.</p>
  ${urgent.length ? `<button class="client-attention" data-go="issues" data-issue-filter-priority="Urgent" aria-label="${attention} grounds need attention · ${urgent.length} urgent issues">${clientAttentionPhotos(urgent)}<span><strong>${attention} grounds need attention</strong><small>${urgent.length} urgent issues to look into</small></span>${icon('chevron')}</button>` : `<div class="client-attention calm"><span class="attention-symbol">${icon('check')}</span><span><strong>Grounds are on track</strong><small>No urgent issue reported</small></span></div>`}
  <div class="summary-metrics summary-metrics--home">${summaryMetric(grounds.length, 'Venues', 'ground')}${summaryMetric(openIssues().length, 'Open issues', 'alert')}${summaryMetric(db.assets.filter(a => assetCondTone(a.condition) === 'coral').length, 'Needs repair', 'alert', {tag:'button',attributes:'data-go="assets" data-repair-open="1"'})}</div>
  ${clientHomeTools()}${section('Your grounds', 'See all', 'grounds')}<p class="ground-directory-caption">8 BCB grounds · 14 rented venues · Priority order</p><div class="filters">${['All grounds', 'Needs attention', 'On track'].map(x => `<button class="filter ${state.filter === x ? 'active' : ''}" data-home-filter="${x}">${x}</button>`).join('')}</div>
  ${grounds.filter(g => state.filter === 'All grounds' || state.filter === 'Needs attention' && openIssues().some(i => i.ground === g.id) || state.filter === 'On track' && !openIssues().some(i => i.ground === g.id) && g.id !== 6 && g.status !== 'No report').map(groundCard).join('')}`;
}
function clientIssues(){return issuesPage();}
function clientIssueProgress(){return ''; }
function clientInventoryNav(active) {
  const pending = db.requests.filter(r => r.status === 'Submitted' && (!state.scope || r.ground === state.ground)).length;
  return `<div class="segmented client-hub-tabs client-inventory-tabs" aria-label="Inventory sections">${[['inventory', 'Register'], ['requests', 'Requests'], ['transfers', 'Transfers']].map(([id, label]) => `<button class="${active === id ? 'active' : ''}" data-inventory-view="${id}" aria-pressed="${active === id}">${label}${id === 'requests' && pending ? `<span class="client-count">${pending}</span>` : ''}</button>`).join('')}</div>`;
}
function clientInventory() {
  const descriptions = { inventory: 'Equipment and supplies, grouped by type.', requests: 'Review requests and confirm deliveries.', transfers: 'Track supplies moving between grounds.' };
  return header('Inventory', state.scope ? G(state.ground).short : descriptions[state.screen]) + clientInventoryNav(state.screen) +
    (state.screen === 'inventory' ? inventory(false) : state.screen === 'requests' ? requests(false) : transfers(false));
}
function clientAccount() { return accountProfilePage(); }
function clientContent() {
  if (state.screen === 'home') return clientHome();
  if (state.screen === 'settings') return clientAccount();
  if (state.screen === 'users') return usersAccessPage();
  if (VENUE_DATA_SCREENS[state.screen]) return VENUE_DATA_SCREENS[state.screen]();
  if (state.screen === 'ground-assets') return header(G(state.ground).short, esc(G(state.ground).name), 'Grounds') + groundTabs('ground-assets') + assetsPage(true);
  if (state.screen === 'ground-staff') return header(G(state.ground).short, esc(G(state.ground).name), 'Grounds') + groundTabs('ground-staff') + staffPage(true);
  if (['issues', 'work'].includes(state.screen)) return clientIssues();
  if (['inventory', 'requests', 'transfers'].includes(state.screen)) return clientInventory();
  return content();
}
function clientActiveTab() {
  if (['ground-matches', 'ground-inventory', 'ground-assets', 'ground-staff'].includes(state.screen) || state.scope && ['matches', 'match', 'add-match', 'asset', 'stock'].includes(state.screen)) return 'home';
  if (['issues', 'issue-detail', 'report-issue', 'work', 'work-detail', 'assign', 'update-work', 'review'].includes(state.screen)) return 'issues';
  if (['inventory', 'inventory-group', 'asset', 'stock', 'requests', 'request-detail', 'new-request', 'transfers'].includes(state.screen)) return 'inventory';
  if (['team','team-group','employee-profile'].includes(state.screen)) return 'team';
  if (['assets', 'asset-group', 'asset-item', 'clay'].includes(state.screen)) return 'assets';
  if (['staff', 'staff-group', 'staff-profile'].includes(state.screen)) return 'staff';
  if (['matches', 'match', 'add-match'].includes(state.screen)) return 'matches';
  return 'home';
}
function bindClientTools() {
  const rail = $('.client-tools');
  if (!rail) return;
  rail.scrollLeft = clientToolScroll;
  const sync = () => {
    clientToolScroll = rail.scrollLeft;
    const second = rail.scrollLeft > (rail.scrollWidth - rail.clientWidth) / 2;
    document.querySelectorAll('[data-tool-slide]').forEach((b, n) => b.setAttribute('aria-pressed', String(n === (second ? 1 : 0))));
  };
  rail.addEventListener('scroll', sync, { passive: true });
  sync();
}
function renderClient() {
  document.body.classList.add('client-view'); state.role = window.BCB_USER?.appRole || 'Visitor'; state.mode = 'Live';
  const tab = clientActiveTab();
  const pending = db.requests.some(r => r.status === 'Submitted');
  const reviews = db.works.some(w => w.status === 'Ready for review');
  $('#app').innerHTML = `<main class="client-shell"><div class="phone client-phone" aria-label="BCB Grounds app"><div class="statusbar client-status"><span>9:41</span><i class="island"></i><div class="system-icons">${icon('signal')}${icon('wifi')}${icon('battery', 'battery')}</div></div><div class="appbody" id="client-scroll"><div class="phone-content client-content" data-screen="${state.screen}" data-root="${clientRoot()}">${clientContent()}</div></div><nav class="phone-footer" aria-label="Main navigation">${[['home', 'Home', 'home'], ['assets', 'Assets', 'box'], ['staff', 'Staff', 'team'], ['issues', 'Issues', 'alert'], ['matches', 'Matches', 'match']].map(([id, label, ic]) => `<button data-tab="${id}" class="${tab === id ? 'active' : ''}" aria-current="${tab === id ? 'page' : 'false'}">${clientNavIcon(ic, tab === id)}<span>${label}</span>${(id === 'issues' && reviews) ? '<i class="tab-dot"></i>' : ''}</button>`).join('')}<div class="home-indicator"></div></nav></div></main>`;
  bindAppSearch(); bindClientTools();
  $('.appbody').scrollTop = clientScroll[clientViewKey()] || 0;
  document.title = 'BCB Grounds · ' + (state.screen === 'work' || state.screen === 'issues' ? 'Issues' : state.screen === 'requests' || state.screen === 'transfers' ? 'Inventory' : screenInfo()?.[1] || 'Super Admin');
}
if (CLIENT_MODE) {
  window.addEventListener('popstate', e => {
    if (e.state?.view) { state = { ...state, ...e.state.view, history: state.history.slice(0, -1) }; render(); }
    else { state.screen = 'home'; render(); }
  });
  document.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.toolSlide !== undefined) {
      const rail = $('.client-tools');
      rail?.scrollTo({ left: +b.dataset.toolSlide ? rail.scrollWidth - rail.clientWidth : 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return;
    }
    if (b.dataset.issueView) { go(b.dataset.issueView, { workFilter: 'Active' }); return; }
    if (b.dataset.inventoryView) { go(b.dataset.inventoryView, { invFilter: 'All', reqFilter: 'All' }); return; }
    if (b.dataset.reviewWork) {
      const w = db.works.find(w => w.id === +b.dataset.reviewWork);
      if (w) go('review', { work: w.id, ground: w.ground });
      return;
    }
    if (b.dataset.clientAction === 'share') {
      const url = new URL(location.href); url.search = ''; url.hash = '';
      try {
        if (navigator.share) await navigator.share({ title: 'BCB Grounds', text: 'Explore the grounds management prototype.', url: String(url) });
        else { await navigator.clipboard.writeText(String(url)); toast('Prototype link copied'); }
      } catch (err) { if (err.name !== 'AbortError') toast('Copy the link from your address bar to share.'); }
    }
  });
}
