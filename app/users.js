/* BCB Grounds · Users & access (Super Admin only).
   Every change goes through the admin_update_user database function, which re-checks
   that the caller is a Super Admin and records the change in the activity log. */
const userAccess = { list: null, loading: false, error: '' };
const ROLE_HELP = {
  visitor: 'Views everything, changes nothing.',
  admin: 'Adds and updates records at assigned venues only.',
  super_admin: 'Full access, including users and venue assignments.'
};

async function loadUserAccess() {
  if (!sb) return;
  userAccess.loading = true; userAccess.error = '';
  try {
    const [ps, av] = await Promise.all([
      sb.from('profiles').select('id,email,full_name,role,is_active,created_at').order('created_at'),
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
  const sub = !u.is_active ? 'Not active · open to approve' : u.role === 'admin' ? venueSummary(u.venues) : ROLE_HELP[u.role];
  return `<button class="list-row user-row" data-user-edit="${u.id}"><div class="symbol ${u.is_active ? '' : 'amber'}">${icon(u.role === 'super_admin' ? 'shield' : 'user')}</div><div class="grow"><strong>${esc(u.full_name || u.email)}${me ? ' <span class="user-you">You</span>' : ''}</strong><small>${esc(u.full_name ? u.email : '')}</small><div class="chips" style="margin-top:7px">${chip(u.is_active ? ROLE_LABEL[u.role] : 'Not active', u.is_active ? '' : 'amber')}</div><small class="user-sub">${esc(sub)}</small></div>${icon('chevron', 'chev')}</button>`;
}

function usersAccessPage() {
  if (!isSuper()) return header('Users & access') + empty('Super Admins only', 'Ask a Super Admin to change user access.');
  if (!userAccess.list && !userAccess.loading && !userAccess.error) loadUserAccess();
  const top = header('Users & access', 'Who can sign in, and what they can do.') +
    `<div class="card soft user-invite"><h3>Add a person</h3><p>In Supabase, open <strong>Authentication → Users → Invite user</strong> and enter their email. They'll appear below as <em>Not active</em> — open them to set their role and venues.</p><button class="button secondary small" data-users-refresh>${icon('refresh')}Refresh list</button></div>`;
  if (userAccess.error) return top + `<div class="card"><h3>Couldn't load users</h3><p>${esc(userAccess.error)}</p><button class="button secondary" data-users-refresh>Try again</button></div>`;
  if (!userAccess.list) return top + '<p class="sub" style="padding:16px 4px">Loading users…</p>';
  const L = userAccess.list, groupsOf = [
    ['Not active', L.filter(u => !u.is_active)],
    ['Super Admins', L.filter(u => u.is_active && u.role === 'super_admin')],
    ['Admins', L.filter(u => u.is_active && u.role === 'admin')],
    ['Visitors', L.filter(u => u.is_active && u.role === 'visitor')]
  ];
  return top + groupsOf.filter(([, us]) => us.length).map(([t, us]) => section(`${t} · ${us.length}`) + us.map(userRow).join('')).join('');
}

function venueChecklist(selected) {
  const sorted = [...grounds].sort((a, b) => a.priority - b.priority);
  const block = (title, list) => `<fieldset class="user-venues"><legend>${title}</legend>${list.map(g => `<label class="check-row"><input type="checkbox" name="venue" value="${g.id}" ${selected.includes(g.id) ? 'checked' : ''}>${esc(g.short)}</label>`).join('')}</fieldset>`;
  return block('BCB grounds', sorted.filter(g => g.venueType === 'BCB ground')) + block('Rented venues', sorted.filter(g => g.venueType !== 'BCB ground'));
}

function userEditor(id) {
  const u = userAccess.list?.find(x => x.id === id); if (!u) return;
  const me = u.id === BCB_USER?.id;
  accountSheet(`<h3>${esc(u.full_name || u.email)}</h3><p class="account-form-help">${esc(u.email)}</p>
    <form data-users-form="${u.id}" novalidate>
      <label class="field">Full name<input name="name" value="${esc(u.full_name || '')}" maxlength="80" autocomplete="off"></label>
      <label class="field">Role<select name="role" ${me ? 'disabled' : ''}>${Object.entries(ROLE_LABEL).map(([k, t]) => `<option value="${k}" ${u.role === k ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <p class="account-form-help" data-role-help>${ROLE_HELP[u.role]}</p>
      <div data-venue-picker ${u.role === 'admin' ? '' : 'hidden'}><p class="user-venue-title">Venues this Admin can update</p>${venueChecklist(u.venues)}</div>
      <label class="check-row user-active"><input type="checkbox" name="active" ${u.is_active ? 'checked' : ''} ${me ? 'disabled' : ''}>Account active — can sign in and use the app</label>
      ${me ? '<p class="account-form-help">You can\'t change your own role or switch yourself off. Ask another Super Admin.</p>' : ''}
      <div class="form-error" role="alert"></div>
      <button class="button" type="submit">Save access</button>
    </form>`);
}

document.addEventListener('change', e => {
  const form = e.target.closest('[data-users-form]'); if (!form || e.target.name !== 'role') return;
  form.querySelector('[data-venue-picker]').hidden = e.target.value !== 'admin';
  form.querySelector('[data-role-help]').textContent = ROLE_HELP[e.target.value];
});

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.userEdit) { userEditor(b.dataset.userEdit); return; }
  if (b.dataset.usersRefresh !== undefined) { userAccess.list = null; userAccess.error = ''; render(); return; }
  if (b.dataset.signOut !== undefined) { bcbSignOut(); return; }
});

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
  if (role === 'admin' && active && !venues.length) { out.textContent = 'Choose at least one venue for this Admin.'; return; }
  btn.disabled = true;
  const { error } = await sb.rpc('admin_update_user', { target: id, new_role: role, new_active: active, new_name: name || null, venue_ids: role === 'admin' ? venues : [] });
  if (error) { out.textContent = authMessage(error); btn.disabled = false; return; }
  closeModal(); toast('Access saved');
  if (me && name) BCB_USER.name = name;
  userAccess.list = null; render();
}, true);
