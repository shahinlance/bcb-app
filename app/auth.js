/* BCB Grounds · sign-in, invite/reset links, and the signed-in user's role.
   Access is invite-only. Real permission checks live in the database (row-level security);
   the role here only decides what the app shows. */
const ROLE_LABEL = { visitor: 'Visitor', venue_viewer: 'Venue viewer', admin: 'Admin', super_admin: 'Super Admin' };
window.BCB_USER = null;

/* Read invite / reset link details before anything else touches the URL. */
const authLink = (() => {
  const h = new URLSearchParams(location.hash.slice(1)), q = new URLSearchParams(location.search);
  return {
    type: h.get('type') || q.get('type') || '',
    error: h.get('error_code') || h.get('error') || q.get('error_code') || q.get('error') || ''
  };
})();

const sb = (() => {
  try {
    if (!window.supabase || !window.BCB_CONFIG) return null;
    return window.supabase.createClient(BCB_CONFIG.supabaseUrl, BCB_CONFIG.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' }
    });
  } catch { return null; }
})();

let authStart = null;

function authEsc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function authMessage(err) {
  const m = String(err?.message || err || '');
  if (/invalid login credentials/i.test(m)) return 'Email or password is incorrect.';
  if (/email not confirmed/i.test(m)) return 'Please open the invite email and set your password first.';
  if (/rate limit|too many/i.test(m)) return 'Too many attempts. Please wait a minute and try again.';
  if (/same.*password|different from the old/i.test(m)) return 'Choose a password different from your current one.';
  if (/weak|at least/i.test(m)) return 'Choose a stronger password (at least 8 characters).';
  if (/fetch|network|failed to/i.test(m)) return 'Could not reach the server. Check your internet connection.';
  return m || 'Something went wrong. Please try again.';
}

function authScreen(kind, extra = {}) {
  document.body.classList.add('auth-active');
  let root = document.getElementById('auth');
  if (!root) { root = document.createElement('div'); root.id = 'auth'; document.body.prepend(root); }
  const logo = '<img class="auth-logo" src="assets/bcb-logo.png" alt="Bangladesh Cricket Board">';
  const views = {
    login: `<h1>Sign in</h1><p class="auth-sub">BCB Grounds · access by invitation only</p>
      <form data-auth-form="login" novalidate>
        <label class="field">Email<input name="email" type="email" autocomplete="username" required value="${authEsc(extra.email)}"></label>
        <label class="field">Password<input name="password" type="password" autocomplete="current-password" required></label>
        <p class="auth-error" role="alert"></p>
        <button class="button" type="submit">Sign in</button>
      </form>
      <button class="auth-link" data-auth-go="forgot">Forgot password?</button>`,
    forgot: `<h1>Reset password</h1><p class="auth-sub">We'll email you a link to choose a new password.</p>
      <form data-auth-form="forgot" novalidate>
        <label class="field">Email<input name="email" type="email" autocomplete="username" required value="${authEsc(extra.email)}"></label>
        <p class="auth-error" role="alert"></p>
        <button class="button" type="submit">Send reset link</button>
      </form>
      <button class="auth-link" data-auth-go="login">Back to sign in</button>`,
    sent: `<h1>Check your email</h1><p class="auth-sub">If an account exists for <strong>${authEsc(extra.email)}</strong>, a reset link is on its way. It works once and expires after a short time.</p>
      <button class="button secondary" data-auth-go="login">Back to sign in</button>`,
    'set-password': `<h1>${extra.invite ? 'Welcome — set your password' : 'Choose a new password'}</h1>
      <p class="auth-sub">${authEsc(extra.email)}</p>
      <form data-auth-form="set-password" novalidate>
        <label class="field">New password<input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
        <label class="field">Confirm password<input name="confirm" type="password" autocomplete="new-password" minlength="8" required></label>
        <p class="auth-hint">At least 8 characters.</p>
        <p class="auth-error" role="alert"></p>
        <button class="button" type="submit">Save password</button>
      </form>`,
    pending: `<h1>Waiting for access</h1><p class="auth-sub">You're signed in as <strong>${authEsc(extra.email)}</strong>, but a Super Admin hasn't switched your account on yet. Ask them to set your role, then check again.</p>
      <button class="button" data-auth-go="recheck">Check again</button>
      <button class="auth-link" data-auth-go="signout">Sign out</button>`,
    'link-error': `<h1>This link has expired</h1><p class="auth-sub">Invite and reset links work once and expire after a short time. Ask your Super Admin to send a new invite, or request a new reset link.</p>
      <button class="button" data-auth-go="forgot">Get a new reset link</button>
      <button class="auth-link" data-auth-go="login">Back to sign in</button>`,
    error: `<h1>Couldn't load your account</h1><p class="auth-sub">${authEsc(extra.message || 'Please try again.')}</p>
      <button class="button" data-auth-go="recheck">Try again</button>
      <button class="auth-link" data-auth-go="signout">Sign out</button>`,
    unavailable: `<h1>Can't connect</h1><p class="auth-sub">BCB Grounds couldn't reach its sign-in service. Check your internet connection and reload the page.</p>
      <button class="button" data-auth-go="reload">Reload</button>`
  };
  root.innerHTML = `<main class="auth-shell"><section class="auth-card" aria-live="polite">${logo}${views[kind] || views.login}</section></main>`;
  root.querySelector('input')?.focus();
}

function authHide() { document.getElementById('auth')?.remove(); document.body.classList.remove('auth-active'); }

async function loadUserAndStart() {
  authScreen('loading');
  document.querySelector('#auth .auth-card').innerHTML = '<img class="auth-logo" src="assets/bcb-logo.png" alt=""><p class="auth-sub">Loading your account…</p>';
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return authScreen('login');
    const uid = session.user.id;
    const { data: p, error } = await sb.from('profiles').select('id,email,full_name,role,is_active,staff_id,phone,designation,photo').eq('id', uid).maybeSingle();
    if (error) throw error;
    if (!p || !p.is_active) return authScreen('pending', { email: session.user.email });
    let venues = [];
    if (p.role === 'admin' || p.role === 'venue_viewer') {
      const { data: v, error: e2 } = await sb.from('admin_venues').select('venue_id').eq('user_id', uid);
      if (e2) throw e2;
      venues = (v || []).map(x => x.venue_id);
    }
    window.BCB_USER = { id: uid, email: p.email, name: p.full_name || '', role: p.role, appRole: ROLE_LABEL[p.role], venues, staffId: p.staff_id || null, phone: p.phone || '', designation: p.designation || '', photo: p.photo || '' };
    state.role = BCB_USER.appRole;
    if (p.role === 'venue_viewer') grounds.splice(0, grounds.length, ...grounds.filter(g => venues.includes(g.id)));
    document.querySelector('#auth .auth-sub').textContent = 'Loading grounds data…';
    await authStart();
    authHide();
  } catch (err) { authScreen('error', { message: authMessage(err) }); }
}

/* Called by app.js instead of render(): shows sign-in first, then starts the app. */
async function BCB_BOOT(start) {
  authStart = start;
  if (!sb) return authScreen('unavailable');
  let session = null;
  try { ({ data: { session } } = await sb.auth.getSession()); } catch { return authScreen('unavailable'); }
  if (!session) return authScreen(authLink.error ? 'link-error' : 'login');
  if (authLink.type === 'invite' || authLink.type === 'recovery')
    return authScreen('set-password', { invite: authLink.type === 'invite', email: session.user.email });
  loadUserAndStart();
}

/* Helpers for the rest of the app */
function canEditVenue(id) {
  const u = window.BCB_USER;
  return !!u && (u.role === 'super_admin' || (u.role === 'admin' && u.venues.includes(Number(id))));
}
async function bcbSignOut() {
  try { await sb?.auth.signOut(); } finally { location.replace(location.pathname); }
}

if (sb) sb.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY' && session) authScreen('set-password', { email: session.user.email });
  if (event === 'SIGNED_OUT' && window.BCB_USER) location.replace(location.pathname);
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-auth-go]'); if (!b) return;
  const email = document.querySelector('#auth input[name=email]')?.value || '';
  switch (b.dataset.authGo) {
    case 'login': return authScreen('login', { email });
    case 'forgot': return authScreen('forgot', { email });
    case 'recheck': return loadUserAndStart();
    case 'signout': return bcbSignOut();
    case 'reload': return location.reload();
  }
});

document.addEventListener('submit', async e => {
  const form = e.target, kind = form.dataset.authForm; if (!kind) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const v = Object.fromEntries(new FormData(form)), out = form.querySelector('.auth-error'), btn = form.querySelector('[type=submit]');
  const fail = msg => { out.textContent = msg; btn.disabled = false; };
  out.textContent = ''; btn.disabled = true;
  try {
    if (kind === 'login') {
      const email = String(v.email || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !v.password) return fail('Enter your email and password.');
      const { error } = await sb.auth.signInWithPassword({ email, password: v.password });
      if (error) return fail(authMessage(error));
      return loadUserAndStart();
    }
    if (kind === 'forgot') {
      const email = String(v.email || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Enter a valid email address.');
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
      if (error && !/rate limit/i.test(error.message)) return fail(authMessage(error));
      return authScreen('sent', { email });
    }
    if (kind === 'set-password') {
      if (String(v.password).length < 8) return fail('Use at least 8 characters.');
      if (v.password !== v.confirm) return fail('The two passwords do not match.');
      const { error } = await sb.auth.updateUser({ password: v.password });
      if (error) return fail(authMessage(error));
      authLink.type = '';
      return loadUserAndStart();
    }
  } catch (err) { fail(authMessage(err)); }
}, true);
