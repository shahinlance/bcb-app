/* BCB Grounds · Users & access (Super Admin only).
   Every change goes through the admin_update_user database function, which re-checks
   that the caller is a Super Admin and records the change in the activity log. */
const userAccess = { list: null, loading: false, error: '' };
const ROLE_HELP = {
  visitor: 'Views everything, changes nothing.',
  venue_viewer: 'Sees only their own venue, changes nothing.',
  admin: 'Adds and updates records at assigned venues only.',
  super_admin: 'Full access, including users and venue assignments.'
};

async function loadUserAccess() {
  if (!sb) return;
  userAccess.loading = true; userAccess.error = '';
  try {
    const [ps, av] = await Promise.all([
      sb.from('profiles').select('id,email,full_name,role,is_active,created_at,staff_id').order('created_at'),
      sb.from('admin_venues').select('user_id,venue_id')
    ]);
    if (ps.error) throw ps.error; if (av.error) throw av.error;
    userAccess.list = ps.data.map(p => ({ ...p, venues: av.data.filter(a => a.user_id === p.id).map(a => a.venue_id) }));
  } catch (err) { userAccess.error = authMessage(err); }
  userAccess.loading = false;
  if (state.screen === 'users') render();
}

function venueSummary(ids) {
  if (!ids.length) return 'No venues assigned';
  const names = grounds.filter(g => ids.includes(g.id)).sort((a, b) => a.priority - b.priority).map(g => g.short);
  return names.length > 2 ? `${names.slice(0, 2).join(' · ')} +${names.length - 2} more` : names.join(' · ');
}

function userRow(u) {
  const me = u.id === BCB_USER?.id;
  const sub = !u.is_active ? 'Not active · open to approve' : ['admin', 'venue_viewer'].includes(u.role) ? venueSummary(u.venues) : ROLE_HELP[u.role];
  return `<button class="list-row user-row" data-user-edit="${u.id}"><div class="symbol ${u.is_active ? '' : 'amber'}">${icon(u.role === 'super_admin' ? 'shield' : 'user')}</div><div class="grow"><strong>${esc(u.full_name || u.email)}${me ? ' <span class="user-you">You</span>' : ''}</strong><small>${esc(u.full_name ? u.email : '')}</small><div class="chips" style="margin-top:7px">${chip(u.is_active ? ROLE_LABEL[u.role] : 'Not active', u.is_active ? '' : 'amber')}</div><small class="user-sub">${esc(sub)}</small></div>${icon('chevron', 'chev')}</button>`;
}

function usersAccessPage() {
  if (!isSuper()) return header('Users & access') + empty('Super Admins only', 'Ask a Super Admin to change user access.');
  if (!userAccess.list && !userAccess.loading && !userAccess.error) loadUserAccess();
  const top = header('Users & access', 'Who can sign in, and what they can do.') +
    `<div class="card soft user-invite"><h3>Add a person</h3><p>Enter their details and set a password (or email them a link). Their name and photo will be ready when they sign in.</p><div class="user-invite-actions"><button class="button small" data-user-invite>${icon('plus')}Invite a person</button><button class="button secondary small" data-users-refresh>${icon('refresh')}Refresh</button></div></div>`;
  if (userAccess.error) return top + `<div class="card"><h3>Couldn't load users</h3><p>${esc(userAccess.error)}</p><button class="button secondary" data-users-refresh>Try again</button></div>`;
  if (!userAccess.list) return top + '<p class="sub" style="padding:16px 4px">Loading users…</p>';
  const L = userAccess.list, groupsOf = [
    ['Not active', L.filter(u => !u.is_active)],
    ['Super Admins', L.filter(u => u.is_active && u.role === 'super_admin')],
    ['Admins', L.filter(u => u.is_active && u.role === 'admin')],
    ['Visitors', L.filter(u => u.is_active && u.role === 'visitor')],
    ['Venue viewers', L.filter(u => u.is_active && u.role === 'venue_viewer')]
  ];
  return top + groupsOf.filter(([, us]) => us.length).map(([t, us]) => section(`${t} · ${us.length}`) + us.map(userRow).join('')).join('');
}

function venueChecklist(selected) {
  const sorted = [...grounds].sort((a, b) => a.priority - b.priority);
  const block = (title, list) => `<fieldset class="user-venues"><legend>${title}</legend>${list.map(g => `<label class="check-row"><input type="checkbox" name="venue" value="${g.id}" ${selected.includes(g.id) ? 'checked' : ''}>${esc(g.short)}</label>`).join('')}</fieldset>`;
  return block('BCB grounds', sorted.filter(g => g.venueType === 'BCB ground')) + block('Rented venues', sorted.filter(g => g.venueType !== 'BCB ground'));
}

let invitePhoto = '';
function smallPhoto(file) {
  return resizePhoto(file).then(src => new Promise((resolve, reject) => {
    const im = new Image(); im.onerror = () => reject(Error('This image could not be opened.'));
    im.onload = () => { const side = Math.min(im.width, im.height), c = document.createElement('canvas'); c.width = c.height = Math.min(480, side);
      c.getContext('2d').drawImage(im, (im.width - side) / 2, (im.height - side) / 2, side, side, 0, 0, c.width, c.height); resolve(c.toDataURL('image/jpeg', .85)); };
    im.src = src;
  }));
}
function inviteForm() {
  invitePhoto = '';
  accountSheet(`<h3>Invite a person</h3><p class="account-form-help">They'll get an email from BCB Grounds to set their own password.</p>
    <form data-invite-form novalidate>
      <div class="invite-photo"><span class="invite-photo-preview" data-invite-preview>${icon('user')}</span><label class="button secondary small">${icon('photo')}Add photo<input type="file" accept="image/jpeg,image/png,image/webp" data-invite-photo hidden></label></div>
      <label class="field">Full name<input name="full_name" maxlength="80" autocomplete="off" required></label>
      <label class="field">Email<input name="email" type="email" maxlength="254" autocomplete="off" required></label>
      <label class="field">Phone<input name="phone" type="tel" maxlength="30" autocomplete="off"></label>
      <label class="field">Designation<input name="designation" maxlength="80" placeholder="e.g. Chairman" autocomplete="off"></label>
      <fieldset class="invite-mode"><legend>How they sign in</legend>
        <label class="check-row"><input type="radio" name="mode" value="password" checked>I'll set their password</label>
        <label class="check-row"><input type="radio" name="mode" value="link">Email them a link to choose their own</label>
      </fieldset>
      <div data-invite-pw><label class="field">Password<input name="password" type="text" minlength="8" maxlength="72" autocomplete="off" spellcheck="false"></label><button type="button" class="textbtn" data-suggest-pw>Suggest a password</button></div>
      <label class="field">Role<select name="role">${Object.entries(ROLE_LABEL).map(([k, t]) => `<option value="${k}" ${k === 'visitor' ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <p class="account-form-help" data-role-help>${ROLE_HELP.visitor}</p>
      <div data-venue-picker hidden><p class="user-venue-title" data-venue-title>Venues this Admin can update</p>${venueChecklist([])}</div>
      <div class="account-form-error" role="alert"></div>
      <button class="button" type="submit">Create account</button>
    </form>`);
}
function suggestPassword() {
  const abc = 'abcdefghjkmnpqrstuvwxyz', dig = '23456789', r = n => crypto.getRandomValues(new Uint32Array(1))[0] % n;
  const word = k => Array.from({ length: k }, () => abc[r(abc.length)]).join('');
  return `Bcb-${word(4)}-${Array.from({ length: 4 }, () => dig[r(dig.length)]).join('')}`;
}
function welcomeText(b) {
  return `Dear ${b.full_name},\n\nYour BCB Grounds account is ready.\n\nWebsite: https://bcbgrounds.com\nEmail: ${b.email}\nPassword: ${b.password}\n\nPlease keep this password private.\n\n${BCB_USER?.name || "BCB Grounds"}\nBCB Grounds`;
}
function accountReady(b) {
  const text = welcomeText(b), mail = `mailto:${encodeURIComponent(b.email)}?subject=${encodeURIComponent('Your BCB Grounds account')}&body=${encodeURIComponent(text)}`;
  accountSheet(`<h3>Account ready</h3><p class="account-form-help">${esc(b.full_name)} can sign in now. Send them these details:</p>
    <pre class="welcome-text">${esc(text)}</pre>
    <a class="button" href="${mail}">${icon('arrow')}Email it to ${esc(b.email)}</a>
    <button class="button secondary" data-copy-welcome>Copy message</button>`, 'Done');
  document.querySelector('[data-copy-welcome]').onclick = () => navigator.clipboard?.writeText(text).then(() => toast('Message copied'), () => toast('Copy not available'));
}

function userEditor(id) {
  const u = userAccess.list?.find(x => x.id === id); if (!u) return;
  const me = u.id === BCB_USER?.id;
  accountSheet(`<h3>${esc(u.full_name || u.email)}</h3><p class="account-form-help">${esc(u.email)}</p>
    <form data-users-form="${u.id}" novalidate>
      <label class="field">Full name<input name="name" value="${esc(u.full_name || '')}" maxlength="80" autocomplete="off"></label>
      <label class="field">Role<select name="role" ${me ? 'disabled' : ''}>${Object.entries(ROLE_LABEL).map(([k, t]) => `<option value="${k}" ${u.role === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <p class="account-form-help" data-role-help>${ROLE_HELP[u.role]}</p>
      <div data-venue-picker ${['admin', 'venue_viewer'].includes(u.role) ? '' : 'hidden'}><p class="user-venue-title" data-venue-title>${u.role === 'venue_viewer' ? 'Venue this person can see' : 'Venues this Admin can update'}</p>${venueChecklist(u.venues)}</div>
      <label class="field">Linked staff record<select name="staff"><option value="">Not linked</option>${[...(db.staff||[])].sort((a, b) => venueName(a.ground).localeCompare(venueName(b.ground)) || a.name.localeCompare(b.name)).map(p => `<option value="${esc(p.id)}" ${u.staff_id === p.id ? 'selected' : ''}>${esc(p.name)} — ${esc(p.designation || '')}, ${esc(venueName(p.ground))}</option>`).join('')}</select></label>
      <p class="account-form-help">Shows this person's own photo and details in their profile.</p>
      <label class="check-row user-active"><input type="checkbox" name="active" ${u.is_active ? 'checked' : ''} ${me ? 'disabled' : ''}>Account active — can sign in and use the app</label>
      ${me ? '<p class="account-form-help">You can\'t change your own role or switch yourself off. Ask another Super Admin.</p>' : ''}
      <div class="account-form-error" role="alert"></div>
      <button class="button" type="submit">Save access</button>
    </form>`);
}

document.addEventListener('change', e => {
  if (e.target.name === 'mode' && e.target.closest('[data-invite-form]')) {
    const f = e.target.closest('form'), pw = f.elements.mode.value === 'password';
    f.querySelector('[data-invite-pw]').hidden = !pw; f.querySelector('[type=submit]').textContent = pw ? 'Create account' : 'Send invite';
    return;
  }
  if (e.target.matches('[data-invite-photo]')) {
    const out = e.target.closest('form').querySelector('[role=alert]'), prev = document.querySelector('[data-invite-preview]');
    out.textContent = 'Preparing photo…';
    smallPhoto(e.target.files[0]).then(src => { invitePhoto = src || ''; out.textContent = ''; if (src) prev.innerHTML = `<img src="${src}" alt="">`; })
      .catch(err => { out.textContent = err.message; });
    return;
  }
  const form = e.target.closest('[data-users-form],[data-invite-form]'); if (!form || e.target.name !== 'role') return;
  form.querySelector('[data-venue-picker]').hidden = !['admin', 'venue_viewer'].includes(e.target.value);
  form.querySelector('[data-venue-title]').textContent = e.target.value === 'venue_viewer' ? 'Venue this person can see' : 'Venues this Admin can update';
  form.querySelector('[data-role-help]').textContent = ROLE_HELP[e.target.value];
});

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.userEdit) { userEditor(b.dataset.userEdit); return; }
  if (b.dataset.userInvite !== undefined) { inviteForm(); return; }
  if (b.dataset.suggestPw !== undefined) { const i = b.closest('form').elements.password; i.value = suggestPassword(); i.focus(); return; }
  if (b.dataset.usersRefresh !== undefined) { userAccess.list = null; userAccess.error = ''; render(); return; }
  if (b.dataset.signOut !== undefined) { bcbSignOut(); return; }
});

document.addEventListener('submit', async e => {
  const form = e.target; if (form.dataset.inviteForm === undefined) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const f = form.elements, out = form.querySelector('[role=alert]'), btn = form.querySelector('[type=submit]');
  const body = { full_name: f.full_name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(), designation: f.designation.value.trim(), role: f.role.value,
    venues: [...form.querySelectorAll('input[name=venue]:checked')].map(i => +i.value), photo: invitePhoto };
  const withPw = f.mode.value === 'password'; if (withPw) body.password = f.password.value.trim();
  out.textContent = '';
  if (body.full_name.length < 2) { out.textContent = "Enter the person's full name."; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) { out.textContent = 'Enter a valid email address.'; return; }
  if (withPw && (body.password.length < 8 || body.password.length > 72)) { out.textContent = 'Choose a password of at least 8 characters.'; return; }
  if (['admin', 'venue_viewer'].includes(body.role) && !body.venues.length) { out.textContent = 'Choose at least one venue.'; return; }
  const label = btn.textContent; btn.disabled = true; btn.textContent = withPw ? 'Creating…' : 'Sending…';
  try {
    const { data, error } = await sb.functions.invoke('invite-user', { body });
    let msg = data?.error;
    if (error) { try { msg = (await error.context.json()).error; } catch { msg = msg || authMessage(error); } }
    if (msg) throw Error(msg);
    userAccess.list = null;
    if (withPw) { await loadUserAccess(); render(); accountReady(body); } else { closeModal(); toast(`Invite sent to ${body.email}`); render(); }
  } catch (err) { out.textContent = err.message; btn.disabled = false; btn.textContent = label; }
}, true);

document.addEventListener('submit', async e => {
  const form = e.target, id = form.dataset.usersForm; if (!id) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const u = userAccess.list.find(x => x.id === id), me = id === BCB_USER?.id;
  const out = form.querySelector('[role=alert]'), btn = form.querySelector('[type=submit]');
  const role = me ? u.role : form.elements.role.value, active = me ? true : form.elements.active.checked;
  const venues = [...form.querySelectorAll('input[name=venue]:checked')].map(i => +i.value);
  const name = form.elements.name.value.trim().replace(/\s+/g, ' ');
  out.textContent = '';
  if (name && (name.length < 2 || name.length > 80)) { out.textContent = 'Enter a full name between 2 and 80 characters.'; return; }
  if (['admin', 'venue_viewer'].includes(role) && active && !venues.length) { out.textContent = role === 'admin' ? 'Choose at least one venue for this Admin.' : 'Choose the venue this person can see.'; return; }
  btn.disabled = true;
  const { error } = await sb.rpc('admin_update_user', { target: id, new_role: role, new_active: active, new_name: name || null, venue_ids: ['admin', 'venue_viewer'].includes(role) ? venues : [] });
  if (error) { out.textContent = authMessage(error); btn.disabled = false; return; }
  const staff = form.elements.staff?.value || '';
  if (staff !== (u.staff_id || '')) {
    const r = await sb.rpc('admin_link_staff', { target: id, staff });
    if (r.error) { out.textContent = authMessage(r.error); btn.disabled = false; return; }
    if (me) { BCB_USER.staffId = staff || null; if (staff) BCB_USER.name = db.staff.find(p => p.id === staff)?.name || BCB_USER.name; }
  }
  closeModal(); toast('Access saved');
  if (me && name) BCB_USER.name = name;
  userAccess.list = null; render();
}, true);
