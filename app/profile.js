/* Profile contact fields stay empty until the account holder adds them. */
let accountPhotoDraft = null;
const accountFields = {
  fullName: {label:'Full name', type:'text', autocomplete:'name', maximum:80},
  email: {label:'Email address', type:'email', autocomplete:'email', maximum:254},
  phone: {label:'Phone number', type:'tel', autocomplete:'tel', maximum:30}
};
function accountProfile() {
  return {fullName:'Fahim Ahmed', email:'', phone:'', photo:'assets/profile-reference.jpg', photoIsReference:true, ...db.accountProfile};
}
function accountPreference(key) { return accountProfile().notifications?.[key] !== false; }
function accountNotificationCount(){return accountPreference('approvals')?db.requests.filter(r=>r.status==='Submitted').length:0;}
function accountAvatar() {
  const p=accountProfile();
  return `<img src="${esc(p.photo)}" alt="${p.photoIsReference ? 'Demo profile portrait' : 'Your profile photo'}" draggable="false">`;
}
function accountDetailRow(key) {
  const p=accountProfile(), field=accountFields[key], value=p[key];
  return `<button class="account-detail-row" data-account-edit="${key}" aria-label="${value?'Change':'Add'} ${field.label.toLowerCase()}"><span><small>${field.label}</small><strong class="${value?'':'account-value-empty'}">${esc(value||'Not added')}</strong></span><span class="account-row-action">${value?'Change':'Add'}${icon('chevron')}</span></button>`;
}
function accountMenuRow(symbol,title,subtitle,attr) {
  return `<button class="account-menu-row" ${attr}><span class="account-menu-symbol">${icon(symbol)}</span><span class="grow"><strong>${title}</strong><small>${subtitle}</small></span>${icon('chevron','chev')}</button>`;
}
function accountProfilePage() {
  const p=accountProfile(), enabled=['approvals'].filter(accountPreference).length;
  return header('My profile','Manage your personal information.') +
    `<div class="account-profile-hero"><div class="account-portrait">${accountAvatar()}<button class="account-photo-change" data-account-action="photo" aria-label="Change profile photo">${icon('photo')}</button></div><h2>${esc(p.fullName)}</h2><span class="account-role">${icon('shield')}Super Admin</span><p>Bangladesh Cricket Board</p>${p.photoIsReference?'<small class="account-reference-note">Demo portrait · Upload your own photo</small>':''}</div>
    <section class="account-section" aria-labelledby="account-details-title"><h2 id="account-details-title">Personal information</h2><div class="account-group">${Object.keys(accountFields).map(accountDetailRow).join('')}</div></section>
    <section class="account-section" aria-labelledby="account-options-title"><h2 id="account-options-title">Your account</h2><div class="account-group">${accountMenuRow('activity','Activity log','View changes and recent actions','data-go="activity"')}${accountMenuRow('bell','Notification preferences',enabled===1?'All in-app updates':enabled?enabled+' update types on':'In-app updates paused','data-account-action="notifications"')}${accountMenuRow('shield','Workspace details','Your role, organisation and timezone','data-account-action="workspace"')}</div></section>
    <button class="account-about" data-account-action="about">About BCB Grounds${icon('chevron')}</button>`;
}
function accountSheet(html, cancel='Cancel') {
  showModal(html);
  const close=$('.client-sheet .sheet-scroll > [data-action="close-modal"]');
  if(close)close.textContent=cancel;
}
function accountEdit(key) {
  const f=accountFields[key];if(!f)return;
  const value=accountProfile()[key], title=(value?'Change ':'Add ')+f.label.toLowerCase();
  accountSheet(`<h3>${title}</h3><div class="account-current-value"><small>Current ${f.label.toLowerCase()}</small><strong>${esc(value||'Not added')}</strong></div><form data-account-form="details" data-account-key="${key}" novalidate><label class="field">${value?'New '+f.label.toLowerCase():f.label}<input name="value" type="${f.type}" value="${esc(value)}" autocomplete="${f.autocomplete}" maxlength="${f.maximum}" ${f.type==='tel'?'inputmode="tel"':''} required aria-describedby="account-field-help account-field-error"></label><p id="account-field-help" class="account-form-help">${key==='phone'?'Use your mobile number, with or without +880.':key==='email'?'Use the email address where your team can reach you.':'Use the full name you want your team to see.'}</p><p id="account-field-error" class="account-form-error" role="alert"></p><button class="button" type="submit">Save changes${icon('check')}</button></form>`);
}
function accountValue(key, raw) {
  let value=String(raw||'').trim();
  if(key==='fullName') {
    value=value.replace(/\s+/g,' ');
    if(value.length<2||value.length>80)throw Error('Enter your full name, between 2 and 80 characters.');
  } else if(key==='email') {
    if(value.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw Error('Enter a valid email address, such as name@example.com.');
  } else if(key==='phone') {
    value=value.replace(/[০-৯]/g,c=>'০১২৩৪৫৬৭৮৯'.indexOf(c)).replace(/[\s().-]/g,'');
    if(/^01[3-9]\d{8}$/.test(value))value='+88'+value;
    else if(/^8801[3-9]\d{8}$/.test(value))value='+'+value;
    if(!/^(?:\+[1-9]\d{6,14}|0\d{8,14})$/.test(value))throw Error('Enter a valid phone number. For Bangladesh, use 01 followed by 9 digits.');
  } else throw Error('Choose a valid profile field.');
  return value;
}
function saveAccount(changes, title, detail) {
  const previous=structuredClone(db);
  try {
    db.accountProfile={...accountProfile(),...changes};
    const now=new Date();
    db.activity.unshift({title,detail:detail+' · '+now.toLocaleString('en-GB',{timeZone:'Asia/Dhaka',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}),actor:'account',at:now.toISOString()});
    persist();
  } catch(err) { db=previous;throw err; }
  render();toast('Changes saved');
}
function accountFormError(form,message) {
  const error=form.querySelector('[role="alert"]');if(error)error.textContent=message;
  const input=form.querySelector('input:not([type=checkbox])');
  if(input){input.setAttribute('aria-invalid','true');input.focus();}
}
function accountPhotoChooser() {
  accountPhotoDraft=null;
  accountSheet(`<h3>Profile photo</h3><div class="account-photo-current">${accountAvatar()}</div><p class="account-photo-help">Choose a clear photo of yourself.</p><label class="button account-file-button">${icon('photo')}Choose photo<input type="file" accept="image/jpeg,image/png,image/webp" data-account-photo-file></label><p class="account-form-help">JPG, PNG or WebP · Up to 8 MB</p><p class="account-photo-error account-form-error" role="alert"></p>`);
}
function accountPhotoEditor() {
  accountSheet(`<h3>Adjust your photo</h3><p class="account-photo-help">Drag to centre your face. Zoom if needed.</p><form data-account-form="photo"><div class="account-crop" tabindex="0" role="img" aria-label="Profile photo preview. Drag or use arrow keys to reposition."><img src="${esc(accountPhotoDraft.src)}" alt="New profile photo preview" draggable="false"></div><label class="account-zoom">Zoom<input type="range" min="1" max="3" step="0.01" value="1" aria-label="Photo zoom"></label><p class="account-form-error" role="alert"></p><button class="button" type="submit">Save photo${icon('check')}</button><label class="account-choose-another">Choose another photo<input type="file" accept="image/jpeg,image/png,image/webp" data-account-photo-file></label><p class="account-photo-error account-form-error" role="alert"></p></form>`);
  const crop=$('.account-crop'), slider=$('.account-zoom input');
  let drag=null;
  crop.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;drag={x:e.clientX,y:e.clientY,offsetX:accountPhotoDraft.x,offsetY:accountPhotoDraft.y};crop.setPointerCapture(e.pointerId);});
  crop.addEventListener('pointermove',e=>{if(!drag)return;accountPhotoDraft.x=drag.offsetX+e.clientX-drag.x;accountPhotoDraft.y=drag.offsetY+e.clientY-drag.y;accountCropPosition();});
  const end=()=>{drag=null;};crop.addEventListener('pointerup',end);crop.addEventListener('pointercancel',end);
  crop.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();accountPhotoDraft.x+=e.key==='ArrowLeft'?-6:e.key==='ArrowRight'?6:0;accountPhotoDraft.y+=e.key==='ArrowUp'?-6:e.key==='ArrowDown'?6:0;accountCropPosition();});
  slider.addEventListener('input',()=>{accountPhotoDraft.zoom=+slider.value;accountCropPosition();});
  accountCropPosition();
}
function accountCropPosition() {
  const crop=$('.account-crop'), draft=accountPhotoDraft;if(!crop||!draft)return;
  const size=crop.clientWidth,scale=Math.max(size/draft.image.naturalWidth,size/draft.image.naturalHeight)*draft.zoom;
  const width=draft.image.naturalWidth*scale,height=draft.image.naturalHeight*scale;
  draft.x=Math.max(-(width-size)/2,Math.min((width-size)/2,draft.x));
  draft.y=Math.max(-(height-size)/2,Math.min((height-size)/2,draft.y));
  const image=crop.querySelector('img');
  image.style.width=width+'px';image.style.height=height+'px';image.style.transform=`translate(-50%,-50%) translate(${draft.x}px,${draft.y}px)`;
}
function accountCroppedPhoto() {
  const draft=accountPhotoDraft,crop=$('.account-crop');if(!draft||!crop)throw Error('Choose a photo first.');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=480;
  const scale=Math.max(480/draft.image.naturalWidth,480/draft.image.naturalHeight)*draft.zoom;
  const width=draft.image.naturalWidth*scale,height=draft.image.naturalHeight*scale,ratio=480/crop.clientWidth;
  canvas.getContext('2d').drawImage(draft.image,(480-width)/2+draft.x*ratio,(480-height)/2+draft.y*ratio,width,height);
  return canvas.toDataURL('image/jpeg',.88);
}
function accountNotificationsSheet() {
  const rows=[['approvals','Supply approvals','Requests waiting for your decision.']];
  accountSheet(`<h3>Notification preferences</h3><p class="account-photo-help">Choose which updates appear in Notifications.</p><form data-account-form="notifications"><div class="account-group account-notification-options">${rows.map(([key,label,help])=>`<label class="account-toggle-row"><span><strong>${label}</strong><small>${help}</small></span><input type="checkbox" name="${key}" ${accountPreference(key)?'checked':''} role="switch"><i aria-hidden="true"></i></label>`).join('')}</div><p class="account-form-help">In-app updates only. These settings do not send email or SMS.</p><p class="account-form-error" role="alert"></p><button class="button" type="submit">Save preferences${icon('check')}</button></form>`);
}
function accountWorkspaceSheet() {
  accountSheet(`<h3>Workspace details</h3><dl class="account-workspace-details"><div><dt>Organisation</dt><dd>Bangladesh Cricket Board</dd></div><div><dt>Role</dt><dd>Super Admin</dd></div><div><dt>Grounds in your workspace</dt><dd>${grounds.length} venues · 8 BCB · 14 rented</dd></div><div><dt>Timezone</dt><dd>Bangladesh · UTC +06:00</dd></div></dl><p class="account-form-help">Your role and workspace are managed by your organisation.</p>`,'Done');
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.accountEdit){accountEdit(b.dataset.accountEdit);return;}
  switch(b.dataset.accountAction){
    case'photo':accountPhotoChooser();break;
    case'notifications':accountNotificationsSheet();break;
    case'workspace':accountWorkspaceSheet();break;
    case'about':accountSheet('<h3>About BCB Grounds</h3><p>Grounds, equipment and match preparation for Bangladesh Cricket Board.</p><p class="account-form-help">Interactive prototype · Profile changes and photos are saved on this device.</p><button class="button secondary" data-photo-credits>Photo sources</button>','Done');break;
  }
});
document.addEventListener('change',async e=>{
  if(!e.target.matches('[data-account-photo-file]'))return;
  const input=e.target,file=input.files?.[0];if(!file)return;
  const sheet=input.closest('.client-sheet'),error=sheet.querySelector('.account-photo-error'),form=input.closest('form');
  input.disabled=true;if(form)form._photoPending=true;error.textContent='Preparing your photo…';
  try {
    const src=await resizePhoto(file),image=new Image();
    await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('This image could not be opened.'));image.src=src;});
    if(!sheet.isConnected)return;
    accountPhotoDraft={src,image,zoom:1,x:0,y:0};
    accountPhotoEditor();
  } catch(err){error.textContent=err.message;}
  finally{input.disabled=false;input.value='';if(form)form._photoPending=false;}
});
document.addEventListener('submit',e=>{
  const form=e.target,type=form.dataset.accountForm;if(!type)return;e.preventDefault();
  if(form._photoPending)return accountFormError(form,'Please wait for the photo to finish preparing.');
  const submit=form.querySelector('[type=submit]');submit.disabled=true;
  try {
    if(type==='details'){
      const key=form.dataset.accountKey,value=accountValue(key,new FormData(form).get('value'));
      if(value===accountProfile()[key]){closeModal();toast('No changes to save');return;}
      saveAccount({[key]:value},'Profile updated',accountFields[key].label+' changed');
    } else if(type==='photo'){
      saveAccount({photo:accountCroppedPhoto(),photoIsReference:false},'Profile photo updated','Your profile');accountPhotoDraft=null;
    } else if(type==='notifications'){
      const data=new FormData(form),notifications=Object.fromEntries(['overdue','approvals','reviews'].map(key=>[key,data.get(key)==='on']));
      if(Object.entries(notifications).every(([key,value])=>accountPreference(key)===value)){closeModal();toast('No changes to save');return;}
      saveAccount({notifications},'Notification preferences updated','Your profile');
    }
  } catch(err){accountFormError(form,err.message);}
  finally{if(submit.isConnected)submit.disabled=false;}
});
