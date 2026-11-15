/* BCB Grounds · shared data.
   The app keeps working on the in-memory `db` object. After sign-in it is filled from
   Supabase (table `records`), and every persist() sends only the records that changed.
   The database decides who may change what (see supabase/003_shared_records.sql);
   if it refuses, the change is undone by reloading from the server. */
const ARRAY_COLLECTIONS = ['issues', 'inventory', 'requests', 'transfers', 'matches', 'works', 'pitchCatalog', 'team', 'activity'];
const MAP_COLLECTIONS = ['groundPhotos', 'pitches']; // objects keyed by venue id
const sync = { snapshot: new Map(), queue: Promise.resolve(), busy: 0, lastLoad: 0, failed: false };

function emptyDb() {
  const d = { issueSchema: 1, inventoryGroupSchema: 1, retiredWorkRecords: [] };
  for (const c of ARRAY_COLLECTIONS) d[c] = [];
  for (const c of MAP_COLLECTIONS) d[c] = {};
  return Object.assign(d, loadLocalPrefs());
}

/* Per-person, per-browser settings stay local */
const prefsKey = () => 'bcb-grounds-prefs-' + (window.BCB_USER?.id || 'anon');
function loadLocalPrefs() {
  try { const p = JSON.parse(localStorage.getItem(prefsKey())) || {}; return { notificationsRead: !!p.notificationsRead, ...(p.accountProfile ? { accountProfile: p.accountProfile } : {}) }; }
  catch { return { notificationsRead: false }; }
}
function saveLocalPrefs() {
  try { localStorage.setItem(prefsKey(), JSON.stringify({ notificationsRead: db.notificationsRead, accountProfile: db.accountProfile })); }
  catch { throw Error('This browser is out of storage. Use a smaller profile photo.'); }
}

function venueOf(collection, rec, key) {
  if (collection === 'team' || collection === 'activity') return null;
  if (MAP_COLLECTIONS.includes(collection)) return Number(key) || null;
  if (collection === 'transfers') return Number(rec.from) || null;
  return rec.ground != null && rec.ground !== '' ? Number(rec.ground) : null;
}

function currentEntries() {
  const out = new Map();
  for (const c of ARRAY_COLLECTIONS) for (const rec of db[c] || []) {
    if (rec == null || rec.id == null) continue;
    out.set(c + '\u0000' + rec.id, { collection: c, id: String(rec.id), venue_id: venueOf(c, rec), data: rec });
  }
  for (const c of MAP_COLLECTIONS) for (const [key, rec] of Object.entries(db[c] || {})) {
    if (rec == null) continue;
    out.set(c + '\u0000' + key, { collection: c, id: String(key), venue_id: venueOf(c, rec, key), data: rec });
  }
  return out;
}

async function fetchAllRecords() {
  const rows = [], page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await sb.from('records').select('collection,id,data,created_at').order('created_at', { ascending: false }).order('id').range(from, from + page - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < page) return rows;
  }
}

/* Load (or reload) everything from the server into db */
async function loadSharedData() {
  const [rows, admins] = await Promise.all([fetchAllRecords(), sb.rpc('venue_admins')]);
  if (admins.error) throw admins.error;
  const fresh = emptyDb();
  for (const r of rows) {
    if (ARRAY_COLLECTIONS.includes(r.collection)) fresh[r.collection].push(r.data);
    else if (MAP_COLLECTIONS.includes(r.collection)) fresh[r.collection][r.id] = r.data;
  }
  fresh.activity.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
  db = fresh;
  sync.snapshot = new Map([...currentEntries()].map(([k, e]) => [k, JSON.stringify(e.data) + '|' + e.venue_id]));
  teamMembers.splice(0, teamMembers.length, ...db.team);
  for (const g of grounds) {
    const names = admins.data.filter(a => a.venue_id === g.id).map(a => a.full_name);
    g.admin = names.length ? names.join(', ') : 'Not assigned';
  }
  refreshGroundStatus();
  sync.lastLoad = Date.now();
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* old demo copy */ }
}

function refreshGroundStatus() {
  const open = new Set(openIssues().map(i => Number(i.ground)));
  const reported = new Set([...db.pitchCatalog.filter(p => p.reports?.length).map(p => Number(p.ground)), ...Object.keys(db.groundPhotos).map(Number)]);
  for (const g of grounds) g.status = open.has(g.id) ? 'Needs attention' : reported.has(g.id) ? 'On track' : 'No report';
}

/* Photos: any "data:image/…" text inside a record is uploaded and replaced by its web address */
async function uploadPhotos(value) {
  if (typeof value === 'string') {
    if (!value.startsWith('data:image/')) return value;
    const blob = await (await fetch(value)).blob();
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from('photos').upload(path, blob, { contentType: blob.type || 'image/jpeg', cacheControl: '31536000' });
    if (error) throw error;
    return sb.storage.from('photos').getPublicUrl(path).data.publicUrl;
  }
  if (Array.isArray(value)) { for (let i = 0; i < value.length; i++) value[i] = await uploadPhotos(value[i]); return value; }
  if (value && typeof value === 'object') { for (const k of Object.keys(value)) value[k] = await uploadPhotos(value[k]); return value; }
  return value;
}

function syncMessage(err) {
  const m = String(err?.message || err || '');
  if (/row-level security|permission|42501/i.test(m)) return 'You can only change records at your own venues.';
  return authMessage(err);
}

async function pushChanges() {
  const now = currentEntries(), changed = [], removed = [];
  for (const [k, e] of now) if (sync.snapshot.get(k) !== JSON.stringify(e.data) + '|' + e.venue_id) changed.push([k, e]);
  for (const k of sync.snapshot.keys()) if (!now.has(k)) removed.push(k);
  if (!changed.length && !removed.length) return;
  sync.busy++; document.body.classList.add('is-saving');
  try {
    for (const [, e] of changed) await uploadPhotos(e.data);
    if (changed.length) {
      const { error } = await sb.from('records').upsert(changed.map(([, e]) => ({ collection: e.collection, id: e.id, venue_id: e.venue_id, data: e.data })));
      if (error) throw error;
    }
    const byCollection = {};
    for (const k of removed) { const [c, id] = k.split('\u0000'); (byCollection[c] ||= []).push(id); }
    for (const [c, ids] of Object.entries(byCollection)) {
      const { error } = await sb.from('records').delete().eq('collection', c).in('id', ids);
      if (error) throw error;
    }
    for (const [k, e] of changed) sync.snapshot.set(k, JSON.stringify(e.data) + '|' + e.venue_id);
    for (const k of removed) sync.snapshot.delete(k);
    if (changed.some(([, e]) => JSON.stringify(e.data).includes('/storage/v1/object/public/photos/'))) render();
  } catch (err) {
    toast('Not saved — ' + syncMessage(err));
    try { await loadSharedData(); } catch { /* keep local view */ }
    render();
  } finally {
    sync.busy--; if (!sync.busy) document.body.classList.remove('is-saving');
  }
}

/* Replaces the old browser-only save */
function persist() {
  saveLocalPrefs();
  if (!window.BCB_USER || !sb) return true;
  refreshGroundStatus();
  sync.queue = sync.queue.then(pushChanges, pushChanges);
  return true;
}

/* Pick up other people's changes when the app comes back into view, and every minute */
function userIsEditing() {
  if (document.querySelector('.client-sheet.open, .client-sheet-backdrop.open, .modal-backdrop')) return true;
  const a = document.activeElement;
  if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return true;
  return [...document.querySelectorAll('#app form')].some(f => [...f.elements].some(el =>
    (el.type === 'checkbox' || el.type === 'radio') ? el.checked !== el.defaultChecked : 'value' in el && el.type !== 'submit' && el.type !== 'button' && el.value !== (el.defaultValue ?? el.value)));
}
async function refreshFromServer() {
  if (!window.BCB_USER || sync.busy || document.hidden || userIsEditing() || Date.now() - sync.lastLoad < 20000) return;
  const before = JSON.stringify([...sync.snapshot]);
  try { await loadSharedData(); } catch { return; }
  if (JSON.stringify([...sync.snapshot]) !== before) render();
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshFromServer(); });
setInterval(refreshFromServer, 60000);
