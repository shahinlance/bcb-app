/* Grounds team: roster is kept in the shared database; Super Admins add and edit staff. */
const teamDesignations=[
{id:'head-turf',title:'Head of Turf Management',icon:'shield',single:true},
{id:'curator',title:'Curators',singular:'Curator',icon:'leaf',capacity:'1 Curator'},
{id:'deputy-curator',title:'Deputy Curator',icon:'team',capacity:'1–2 Deputy Curators'},
{id:'assistant-curator',title:'Assistant Curator',icon:'team',capacity:'1–2 Assistant Curators'},
{id:'head-groundsman',title:'Head Groundsman',icon:'team',capacity:'1–2 Head Groundsmen'},
{id:'groundsman',title:'Groundsman',icon:'team',capacity:'Multiple Groundsmen'}];
const teamMembers=[]; /* filled from the shared database after sign-in (sync.js) */
function directoryMembers(){return state.mode==='Empty'?[]:teamMembers;}
function memberDesignation(m){return teamDesignations.find(d=>d.id===m.designation);}
function memberGrounds(m){return grounds.filter(g=>(m.groundIds||[]).includes(g.id));}
function memberInitials(m){return String(m.name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');}
function memberPortrait(m){return m.photo?`<img class="team-portrait" src="${esc(m.photo)}" alt="Photo of ${esc(m.name)}" loading="lazy" width="160" height="160">`:`<span class="team-portrait team-initials" role="img" aria-label="${esc(m.name)}">${esc(memberInitials(m))}</span>`;}
function designationMembers(d,venue=null){return directoryMembers().filter(m=>m.designation===d.id&&(venue===null||memberGrounds(m).some(g=>g.id===venue)));}
function designationCoverage(ms){return [...new Set(ms.flatMap(m=>memberGrounds(m).map(g=>g.id)))];}
function teamMemberCard(m){return `<article class="team-person-card"><div class="team-person-identity">${memberPortrait(m)}<div><h2>${esc(m.name)}</h2><p>${esc(memberDesignation(m).singular||memberDesignation(m).title)}</p>${status(m.status)}</div></div><div class="team-person-grounds">${memberGrounds(m).map(g=>`<span>${icon('ground')}${esc(g.short)}</span>`).join('')}</div><button class="button secondary" data-team-member="${m.id}">View profile${icon('chevron')}</button></article>`;}
function teamDesignationCard(d,venue=null){const ms=designationMembers(d,venue);if((d.single||venue!==null)&&ms.length===1)return teamMemberCard(ms[0]);return `<button class="team-designation-card" data-team-group="${d.id}" data-team-venue="${venue??''}"><div class="team-designation-head"><span class="team-designation-symbol">${icon(d.icon)}</span><h2>${esc(d.title)}</h2><span class="team-member-count">${ms.length} members</span></div>${ms.length?`<div class="team-designation-people"><div class="team-avatar-stack">${ms.slice(0,3).map(memberPortrait).join('')}</div><strong>${ms.map(m=>esc(m.name)).join('<br>')}</strong></div>`:'<p class="sub">Staff details not added yet.</p>'}${venue!==null?`<p class="sub">${esc(d.capacity||'Single position')}</p>`:''}<span class="team-group-cta">View team${icon('arrow')}</span></button>`;}
function teamDirectoryPage(){const q=state.search.trim().toLowerCase(),people=directoryMembers(),shown=teamDesignations.filter(d=>[d.title,...designationMembers(d).map(m=>m.name)].join(' ').toLowerCase().includes(q));return header('Grounds Team','Explore the team by designation.')+(isSuper()&&!people.length?`<div class="card soft"><h3>Build the roster</h3><p>No staff added yet. Add each person once and choose the venues they work at.</p><button class="button" data-team-add>${icon('plus')}Add staff member</button></div>`:'')+`<div class="summary-metrics summary-metrics--team">${summaryMetric(people.length,'Members','team')}${summaryMetric(teamDesignations.length,'Designations','shield')}${summaryMetric(designationCoverage(people).length,'Grounds','ground')}</div>`+searchBox('Search designation or name')+(shown.length?shown.map(d=>teamDesignationCard(d)).join(''):empty('No matching team','Try a designation or name.'))+(isSuper()?`<button class="button" data-team-add>${icon('plus')}Add staff member</button>`:'');}
function venueGroundsTeam(id){return `<section class="venue-grounds-team" aria-label="Venue Grounds Team">${section('Grounds Team')}<p class="sub">Venue staff by designation. Unfilled positions await staff details.</p>${teamDesignations.filter(d=>!d.single).map(d=>teamDesignationCard(d,id)).join('')}</section>`;}
function currentDesignation(){return teamDesignations.find(d=>d.id===state.teamDesignation);}
function teamDesignationPage(){const d=currentDesignation();if(!d)return header('Grounds Team')+empty('No designation selected','Choose a team category.');const venue=state.teamVenue??null,ms=designationMembers(d,venue),q=state.search.trim().toLowerCase(),shown=ms.filter(m=>(state.teamGround==='All'||memberGrounds(m).some(g=>String(g.id)===String(state.teamGround)))&&[m.name,...memberGrounds(m).map(g=>g.short)].join(' ').toLowerCase().includes(q)),available=grounds.filter(g=>ms.some(m=>memberGrounds(m).some(x=>x.id===g.id)));return header(d.title,venue!==null?G(venue).short:`${ms.length} members`,'Grounds Team')+(venue===null?`<label class="team-ground-filter">Ground<select data-team-filter="teamGround"><option value="All">All grounds</option>${available.map(g=>`<option value="${g.id}" ${String(state.teamGround)===String(g.id)?'selected':''}>${esc(g.short)}</option>`).join('')}</select></label>`:'')+searchBox('Search name or ground')+(shown.length?shown.map(teamMemberCard).join(''):empty(ms.length?'No matching members':'Staff details not added yet',ms.length?'Try another ground or name.':'This category is ready for the BCB roster.'));}
function currentTeamMember(){return directoryMembers().find(m=>m.id===state.teamMember);}
function memberGroundCard(g){return `<button class="team-ground-card" data-ground="${g.id}"><span class="team-ground-photo">${mediaThumbnail('ground',g.id)}</span><span><strong>${esc(g.short)}</strong><small>${esc(g.city)}</small></span>${icon('chevron','chev')}</button>`;}
function teamMemberProfile(){const m=currentTeamMember();if(!m)return header('Employee profile')+empty('No employee selected','Choose a member from Grounds Team.');const fields=[['Full Name',m.name],['Home District',m.homeDistrict],['Division',m.division],['Country',m.country],['Joining Date',m.joiningDate],['Job Status',m.jobStatus],['Experience (years)',m.experienceYears],['Mobile Number',m.mobile],['Email Address',m.email]];return header('Employee profile',memberDesignation(m).singular||memberDesignation(m).title,'Team')+`<div class="team-profile-hero">${memberPortrait(m)}<h2>${esc(m.name)}</h2><div class="team-profile-role">${esc(memberDesignation(m).singular||memberDesignation(m).title)}</div></div>${section('Bio')}<dl class="bcb-bio">${fields.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value??'Not provided')}</dd></div>`).join('')}</dl>${section('Ground coverage')}<div class="team-profile-grounds">${memberGrounds(m).map(memberGroundCard).join('')||'<p class="sub">No venue recorded.</p>'}</div>${isSuper()?`<div class="team-admin-actions"><button class="button" data-team-edit="${esc(m.id)}">Edit profile</button><button class="button secondary danger-text" data-team-remove="${esc(m.id)}">Remove from roster</button></div>`:''}`;}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.teamGroup){go('team-group',{teamDesignation:b.dataset.teamGroup,teamVenue:b.dataset.teamVenue?Number(b.dataset.teamVenue):null,teamGround:'All',scope:false});return;}if(b.dataset.teamMember)go('employee-profile',{teamMember:b.dataset.teamMember,scope:false});});
document.addEventListener('change',e=>{if(e.target.dataset.teamFilter){state[e.target.dataset.teamFilter]=e.target.value;render();}});

/* ── Super Admin: add, edit and remove staff ─────────────────────────── */
const TEAM_DIVISIONS=['Dhaka','Chattogram','Rajshahi','Khulna','Barishal','Sylhet','Rangpur','Mymensingh'];
const TEAM_JOB_STATUS=['Permanent','Contractual','Casual'];
function teamOptions(list,current,blank='Not provided'){return `<option value="">${blank}</option>`+list.map(v=>`<option ${v===current?'selected':''}>${esc(v)}</option>`).join('');}
function teamEditor(id){
  if(!isSuper())return;
  const m=id?db.team.find(x=>x.id===id):{status:'Active',country:'Bangladesh',groundIds:[]};if(!m)return;
  const desig=m.designation||state.teamDesignation||'curator';
  showModal(`<h3>${id?'Edit staff member':'Add staff member'}</h3><form data-team-form="${esc(id||'')}" novalidate>
    <label class="field">Full name *<input name="name" value="${esc(m.name||'')}" maxlength="80" required></label>
    <label class="field">Designation *<select name="designation">${teamDesignations.map(d=>`<option value="${d.id}" ${d.id===desig?'selected':''}>${esc(d.singular||d.title)}</option>`).join('')}</select></label>
    <p class="user-venue-title">Venues *</p>${venueChecklist(m.groundIds||[])}
    <label class="field">Mobile number<input name="mobile" type="tel" inputmode="tel" value="${esc(m.mobile||'')}" maxlength="20"></label>
    <label class="field">Email address<input name="email" type="email" value="${esc(m.email||'')}" maxlength="120"></label>
    <label class="field">Job status<select name="jobStatus">${teamOptions(TEAM_JOB_STATUS,m.jobStatus)}</select></label>
    <label class="field">Joining date<input name="joiningDate" type="date" value="${esc(m.joiningDate||'')}"></label>
    <label class="field">Experience (years)<input name="experienceYears" type="number" min="0" max="60" value="${esc(m.experienceYears??'')}"></label>
    <label class="field">Home district<input name="homeDistrict" value="${esc(m.homeDistrict||'')}" maxlength="40"></label>
    <label class="field">Division<select name="division">${teamOptions(TEAM_DIVISIONS,m.division)}</select></label>
    <label class="field">Country<input name="country" value="${esc(m.country||'Bangladesh')}" maxlength="40"></label>
    <label class="field">Status<select name="status">${['Active','On leave','Inactive'].map(v=>`<option ${v===(m.status||'Active')?'selected':''}>${v}</option>`).join('')}</select></label>
    ${photoUpload('photo','Photo',m.photo?[{src:m.photo,demo:false}]:[],null,'One clear head-and-shoulders photo.')}
    <div class="form-error" role="alert"></div>
    <button class="button" type="submit">${id?'Save changes':'Add to roster'}</button></form>`);
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.teamAdd!==undefined){teamEditor(null);return;}
  if(b.dataset.teamEdit){teamEditor(b.dataset.teamEdit);return;}
  if(b.dataset.teamRemove){const m=db.team.find(x=>x.id===b.dataset.teamRemove);if(!m||!isSuper())return;
    showModal(`<h3>Remove ${esc(m.name)}?</h3><p>They will no longer appear in the Grounds Team. This can't be undone.</p><button class="button danger" data-team-remove-confirm="${esc(m.id)}">Remove from roster</button>`);return;}
  if(b.dataset.teamRemoveConfirm){const id=b.dataset.teamRemoveConfirm,m=db.team.find(x=>x.id===id);if(!m)return;
    db.team=db.team.filter(x=>x.id!==id);teamMembers.splice(0,teamMembers.length,...db.team);closeModal();log('Staff removed',m.name);toast('Removed from roster');go('team');return;}
});
document.addEventListener('submit',async e=>{const form=e.target;if(!('teamForm' in form.dataset))return;e.preventDefault();e.stopImmediatePropagation();
  const out=form.querySelector('[role=alert]'),btn=form.querySelector('[type=submit]'),v=Object.fromEntries(new FormData(form));out.textContent='';
  if(form._photoPending){out.textContent='Please wait for the photo to finish preparing.';return;}
  const name=String(v.name||'').trim().replace(/\s+/g,' '),groundIds=[...form.querySelectorAll('input[name=venue]:checked')].map(i=>+i.value);
  if(name.length<2){out.textContent='Enter the full name.';return;}
  if(!groundIds.length){out.textContent='Choose at least one venue.';return;}
  if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)){out.textContent='Check the email address.';return;}
  if(v.mobile&&!/^\+?[\d\s-]{7,20}$/.test(v.mobile)){out.textContent='Check the mobile number.';return;}
  btn.disabled=true;
  const photos=await collectPhotos(form,'photo'),id=form.dataset.teamForm||crypto.randomUUID();
  const rec={id,name,designation:v.designation,groundIds,mobile:v.mobile.trim(),email:v.email.trim(),jobStatus:v.jobStatus,joiningDate:v.joiningDate,experienceYears:v.experienceYears===''?null:+v.experienceYears,homeDistrict:v.homeDistrict.trim(),division:v.division,country:v.country.trim(),status:v.status,photo:photos[0]?.src||null};
  for(const k of Object.keys(rec))if(rec[k]==='')rec[k]=null;
  const i=db.team.findIndex(x=>x.id===id);if(i>=0)db.team[i]=rec;else db.team.push(rec);
  teamMembers.splice(0,teamMembers.length,...db.team);
  closeModal();log(i>=0?'Staff profile updated':'Staff added',name);toast(i>=0?'Profile saved':'Added to roster');
  go('employee-profile',{teamMember:id,scope:false});
},true);
