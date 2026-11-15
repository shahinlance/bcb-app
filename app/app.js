const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={home:'M3 10l9-7 9 7v10H4V10m5 10v-7h6v7',ground:'M4 8c0-6 16-6 16 0v8c0 6-16 6-16 0V8m0 0c0 6 16 6 16 0m-9 1h2v6h-2z',work:'M9 5V3h6v2M5 5h14v16H5zM8 10l2 2 5-5m-7 9h8',request:'M5 3h10l4 4v14H5zm10 0v5h4M8 12h8m-8 4h5',match:'M4 5h16v16H4zM8 3v4m8-4v4M4 10h16m-12 4h2m4 0h2m-8 3h2',bell:'M6 9a6 6 0 0112 0v6l2 2H4l2-2V9m4 11h4',chevron:'M9 5l7 7-7 7',back:'M15 5l-7 7 7 7',search:'M16 16l5 5M18 10a8 8 0 11-16 0 8 8 0 0116 0',plus:'M12 5v14M5 12h14',check:'M5 12l5 5L20 6',alert:'M12 3L2 21h20L12 3m0 6v5m0 3v.1',clock:'M12 8v5l3 2M22 12a10 10 0 11-20 0 10 10 0 0120 0',box:'M3 7l9-5 9 5-9 5-9-5m0 0v11l9 4 9-4V7M12 12v10m-5-17 9 5',pitch:'M6 3h12v18H6zM4 7h16M4 17h16m-10-6h4',user:'M16 7a4 4 0 11-8 0 4 4 0 018 0M4 21v-3c0-7 16-7 16 0v3',team:'M14 8a4 4 0 11-8 0 4 4 0 018 0M2 21v-3c0-6 16-6 16 0v3M18 3c5 1 5 7 0 8m2 4c2 1 2 3 2 6',settings:'M12 8a4 4 0 110 8 4 4 0 010-8M9 2h6l1 4 4 1 2 5-3 3 1 4-5 3-3-3-4 1-4-4 1-4-3-3 3-5 4 1z',activity:'M3 12h4l3-8 4 16 3-8h4',photo:'M3 6h4l2-3h6l2 3h4v15H3zM16 13a4 4 0 11-8 0 4 4 0 018 0',shield:'M12 2l8 3v7c0 5-8 10-8 10S4 17 4 12V5l8-3m-4 9 3 3 5-5',signal:'M3 19v-3m5 3v-6m5 6V9m5 10V5',wifi:'M2 8c5-5 15-5 20 0M6 12c4-3 8-3 12 0m-8 4c2-1 2-1 4 0m-2 3h.1',battery:'M2 6h18v12H2zM22 10v4M5 9h12v6H5z',menu:'M4 6h16M4 12h16M4 18h16',expand:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',arrow:'M4 12h16m-6-6 6 6-6 6',logout:'M9 4H3v16h6m6-13 5 5-5 5m-7-5h12',refresh:'M20 8a9 9 0 10 1 8m-1-8V2m0 6h-6',download:'M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5',leaf:'M21 3C5 0 0 11 7 17S23 15 21 3M3 21L16 8'};
const icon=(n,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n]||paths.box}"/></svg>`;
const groundArt=(i=0)=>`<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="32" rx="27" ry="24" fill="${['#dce8ce','#dde9d7','#e5e9cf'][i%3]}" stroke="#c5d4b6"/><ellipse cx="32" cy="32" rx="22" ry="19" stroke="#fafdf7" stroke-width="1.2"/><path d="M16 20v24m8-30v36m16-36v36m8-30v24" stroke="#b7ceac" stroke-width="6" opacity=".32"/><rect x="27" y="21" width="10" height="23" rx="1" fill="#dfd5ad" stroke="#d1c49b"/><path d="M27 25h10M27 40h10" stroke="white"/></svg>`;
const grounds=[
  {
    "id": 1,
    "short": "SBNCS, Mirpur",
    "name": "Sher-e-Bangla National Cricket Stadium",
    "city": "Mirpur, Dhaka",
    "admin": "Rafiqul Islam",
    "status": "Needs attention",
    "updated": "Today, 7:10 AM",
    "priority": 1,
    "venueType": "BCB ground",
    "legacy": true
  },
  {
    "id": 2,
    "short": "BSSFLMRCS, Chattogram",
    "name": "Bir Shrestha Shaheed Flight Lieutenant Matiur Rahman Cricket Stadium",
    "city": "Chattogram",
    "admin": "Arif Hossain",
    "status": "On track",
    "updated": "Today, 7:25 AM",
    "priority": 2,
    "venueType": "BCB ground",
    "legacy": true
  },
  {
    "id": 3,
    "short": "SICS, Sylhet",
    "name": "Sylhet International Cricket Stadium",
    "city": "Sylhet",
    "admin": "Mahmud Hasan",
    "status": "Needs attention",
    "updated": "Today, 6:50 AM",
    "priority": 3,
    "venueType": "BCB ground",
    "legacy": true
  },
  {
    "id": 4,
    "short": "SRGCS, Fatullah",
    "name": "SRGCS, Fatullah",
    "city": "Fatullah, Narayanganj",
    "admin": "Rafiqul Islam",
    "status": "On track",
    "updated": "Today, 7:05 AM",
    "priority": 4,
    "venueType": "BCB ground",
    "legacy": true
  },
  {
    "id": 5,
    "short": "DCS, Khulna",
    "name": "Khulna Divisional Cricket Stadium",
    "city": "Khulna",
    "admin": "Arif Hossain",
    "status": "On track",
    "updated": "Today, 7:20 AM",
    "priority": 5,
    "venueType": "BCB ground",
    "legacy": true
  },
  {
    "id": 8,
    "short": "DCS, Rajshahi",
    "name": "Rajshahi Divisional Cricket Stadium",
    "city": "Rajshahi",
    "admin": "Mahmud Hasan",
    "status": "On track",
    "updated": "Today, 6:45 AM",
    "priority": 6,
    "venueType": "BCB ground",
    "legacy": true
  },
  {
    "id": 6,
    "short": "SCS, Bogura",
    "name": "Shaheed Chandu Stadium",
    "city": "Bogura",
    "admin": "Mahmud Hasan",
    "status": "Update needed",
    "updated": "16 Oct, 4:30 PM",
    "priority": 7,
    "venueType": "BCB ground",
    "legacy": true
  },
  {
    "id": 9,
    "short": "KJDCS, Barishal",
    "name": "KJDCS, Barishal",
    "city": "Barishal",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 8,
    "venueType": "BCB ground",
    "legacy": false
  },
  {
    "id": 10,
    "short": "BKSP- 3 & 4",
    "name": "Bangladesh Krira Shikkha Protisthan · Grounds 3 & 4",
    "city": "",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 9,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 11,
    "short": "NCG, Purbachal",
    "name": "NCG, Purbachal",
    "city": "Purbachal",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 10,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 7,
    "short": "Cox's Bazar Cricket Stadium",
    "name": "Cox's Bazar Cricket Stadium",
    "city": "Cox's Bazar",
    "admin": "Arif Hossain",
    "status": "On track",
    "updated": "Today, 7:00 AM",
    "priority": 11,
    "venueType": "Rented venue",
    "legacy": true
  },
  {
    "id": 12,
    "short": "BT Ground, Teguria",
    "name": "BT Ground, Teguria",
    "city": "Teguria",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 12,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 13,
    "short": "City Club",
    "name": "City Club",
    "city": "",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 13,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 14,
    "short": "DUG",
    "name": "DUG",
    "city": "",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 14,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 15,
    "short": "JHG",
    "name": "JHG",
    "city": "",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 15,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 16,
    "short": "Fens Cricket Academy",
    "name": "Fens Cricket Academy",
    "city": "",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 16,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 17,
    "short": "Cricketers Academy",
    "name": "Cricketers Academy",
    "city": "",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 17,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 18,
    "short": "PKSP- 1 & 2",
    "name": "PKSP- 1 & 2",
    "city": "",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 18,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 19,
    "short": "Narayangonj Dristict Stadium",
    "name": "Narayanganj District Stadium",
    "city": "Narayanganj",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 19,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 20,
    "short": "Rangpur Cricket Garden",
    "name": "Rangpur Cricket Garden",
    "city": "Rangpur",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 20,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 21,
    "short": "Ulab",
    "name": "Ulab",
    "city": "",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 21,
    "venueType": "Rented venue",
    "legacy": false
  },
  {
    "id": 22,
    "short": "Daffodils University",
    "name": "Daffodils University",
    "city": "",
    "admin": null,
    "status": "No report",
    "updated": "Not recorded",
    "priority": 22,
    "venueType": "Rented venue",
    "legacy": false
  }
];
const seed={works:[{id:101,title:'Repair the main pitch roller',ground:1,asset:1,owner:'Rafiqul Islam',priority:'Critical',due:'2026-10-19T16:00',status:'In progress',note:'Hydraulic pressure drops during operation. Service the pump and complete a supervised test run.',check:[['Inspect hydraulic pump',true],['Replace the damaged seal',true],['Complete a 30-minute test run',false]],logs:[['Repair started · seal ordered','Today, 7:10 AM'],['Assigned to Rafiqul Islam','17 Oct, 10:30 AM']]},{id:102,title:'Replace damaged boundary covers',ground:3,asset:4,owner:'Mahmud Hasan',priority:'High',due:'2026-10-17T17:00',status:'Blocked',note:'Waiting for replacement material from the supplier.',check:[['Inspect damaged covers',true],['Replace covers',false],['Check water resistance',false]],logs:[['Blocked · waiting for material','Today, 6:50 AM']]},{id:103,title:'Inspect drainage channels',ground:1,asset:0,owner:'Rafiqul Islam',priority:'Normal',due:'2026-10-20T12:00',status:'Assigned',note:'Clear debris and check water flow around the south boundary.',check:[['Clear channels',false],['Run drainage test',false]],logs:[['Work assigned','Today, 7:00 AM']]},{id:104,title:'Service outfield mower',ground:2,asset:2,owner:'Arif Hossain',priority:'Normal',due:'2026-10-20T16:00',status:'Ready for review',note:'Blade sharpened and engine serviced. Test run completed.',check:[['Service engine',true],['Sharpen blade',true],['Test run',true]],logs:[['Service completed · ready for review','Today, 7:25 AM']]},{id:105,title:'Prepare practice wicket',ground:1,asset:0,owner:'Rafiqul Islam',priority:'High',due:'2026-10-21T16:00',status:'In progress',note:'Prepare wicket 03 for the upcoming training session.',check:[['Surface inspection',true],['Rolling',false],['Final check',false]],logs:[['Surface inspection done','Today, 6:45 AM']]}],requests:[{id:201,title:'New pitch covers',ground:1,qty:2,unit:'pieces',cost:85000,reason:'Existing covers have tears near the seams. Replacements are needed before the next match.',needed:'2026-10-22',status:'Submitted',owner:'Rafiqul Islam',received:0},{id:202,title:'Hydraulic oil',ground:1,qty:20,unit:'litres',cost:12000,reason:'Replenishment for the main roller service.',needed:'2026-10-20',status:'Approved',owner:'Rafiqul Islam',received:0},{id:203,title:'Irrigation sprinklers',ground:3,qty:6,unit:'pieces',cost:18000,reason:'Replace damaged sprinkler heads near the east boundary.',needed:'2026-10-25',status:'Submitted',owner:'Mahmud Hasan',received:0}],inventory:[{id:1,title:'Main pitch roller',ground:1,type:'Equipment',condition:'Needs repair',qty:1,unit:'unit',min:0,code:'MIR-RL-001'},{id:2,title:'Outfield mower',ground:2,type:'Equipment',condition:'Under maintenance',qty:1,unit:'unit',min:0,code:'CTG-MW-001'},{id:3,title:'Practice mower',ground:1,type:'Equipment',condition:'Operational',qty:1,unit:'unit',min:0,code:'MIR-MW-002'},{id:4,title:'Boundary covers',ground:3,type:'Equipment',condition:'Needs repair',qty:4,unit:'pieces',min:0,code:'SYL-CV-001'},{id:5,title:'Hydraulic oil',ground:1,type:'Consumable',condition:'Available',qty:8,unit:'litres',min:15,code:'MIR-HO-001'},{id:6,title:'Turf fertiliser',ground:1,type:'Consumable',condition:'Available',qty:120,unit:'kg',min:50,code:'MIR-TF-001'},{id:7,title:'Water pump',ground:1,type:'Equipment',condition:'Operational',qty:1,unit:'unit',min:0,code:'MIR-WP-001'},{id:8,title:'Grass seed',ground:2,type:'Consumable',condition:'Available',qty:40,unit:'kg',min:20,code:'CTG-GS-001'}],matches:[{id:301,title:'Bangladesh vs Sri Lanka',ground:1,start:'2026-10-24T14:00',end:'2026-10-24T22:00',format:'ODI',status:'Confirmed',pitch:'Pitch 02',owner:'Rafiqul Islam',checks:[['Pitch inspection approved',false],['Outfield prepared',true],['Equipment ready',false],['Drainage checked',true],['Covers available',false]]},{id:302,title:'Bangladesh vs Sri Lanka',ground:2,start:'2026-10-28T14:00',end:'2026-10-28T22:00',format:'ODI',status:'Tentative',pitch:'Pitch 01',owner:'Arif Hossain',checks:[['Pitch inspection approved',false],['Outfield prepared',false],['Equipment ready',false]]},{id:303,title:'National team training',ground:3,start:'2026-10-30T09:00',end:'2026-10-30T17:00',format:'Training',status:'Confirmed',pitch:'Practice 01',owner:'Mahmud Hasan',checks:[['Training pitch prepared',false],['Nets checked',true]]}],pitches:{},activity:[{title:'Morning inspection submitted',detail:'Rafiqul Islam · Mirpur · Today, 7:10 AM'},{title:'Mower service ready for review',detail:'Arif Hossain · Chattogram · Today, 7:25 AM'}],notificationsRead:false};
let db;try{db=JSON.parse(localStorage.getItem(STORAGE_KEY))||structuredClone(seed)}catch{db=structuredClone(seed)}
initialiseIssues();
prepareInventoryGroups();
initialisePitchCatalog();
db.retiredWorkRecords=db.retiredWorkRecords||db.works;db.works=[];
prepareClientData();
let state={groundMatchHistory:false,teamDesignation:'head-turf',teamMember:'rafiqul-islam',teamGround:'All',memberWork:'Active',inventoryGroup:'rollers',groupGround:'All',groupCondition:'All',issue:401,issueUrgency:'All',issueGround:'All',issueCategory:'All',issueState:'All',issueAsset:null,assignIssue:null,requestIssue:null,requestPart:null,screen:'home',role:'Super Admin',mode:'Live',ground:1,work:101,request:201,asset:1,match:301,filter:'All grounds',workFilter:'All',reqFilter:'All',invFilter:'All',search:'',scope:false,history:[],full:false,month:calendarToday().month,year:calendarToday().year,day:null,calendarFocus:null};
const groups=[['Morning overview',[['home','Grounds overview','home'],['alerts','Notifications','bell']]],['Grounds & pitch',[['grounds','All grounds','ground'],['ground','Ground overview','ground'],['ground-inventory','Ground inventory','box'],['ground-matches','Ground matches','match'],['pitch','Pitches','pitch'],['pitch-update','Add pitch report','photo'],['pitch-details','Pitch details','pitch'],['pitch-edit','Edit pitch','pitch'],['pitch-report','Pitch report','pitch'],['pitch-report-edit','Edit pitch report','photo']]],['Issues & repairs',[['issues','All issues','alert'],['issue-detail','Issue details','settings'],['report-issue','Report an issue','plus']]],['Requests & approvals',[['requests','Requests','request'],['request-detail','Request details','request'],['new-request','New request','plus']]],['Inventory',[['inventory','Inventory overview','box'],['inventory-group','Inventory group','box'],['asset','Item details','box'],['stock','Stock movement','activity'],['transfers','Ground transfers','arrow']]],['Match planning',[['matches','Match calendar','match'],['match','Match details','match'],['add-match','Add a match','plus']]],['Team & settings',[['team','Grounds team','team'],['team-group','Designation members','team'],['employee-profile','Employee profile','user'],['activity','Activity log','activity'],['settings','My profile','user']]]];
const allScreens=groups.flatMap(g=>g[1]);const screenInfo=()=>allScreens.find(x=>x[0]===state.screen)||allScreens[0];
const G=id=>grounds.find(g=>g.id===Number(id))||grounds[0], W=()=>db.works.find(x=>x.id===state.work)||db.works[0],R=()=>db.requests.find(x=>x.id===state.request)||db.requests[0],A=()=>db.inventory.find(x=>x.id===state.asset)||db.inventory[0],M=()=>db.matches.find(x=>x.id===state.match)||db.matches[0];
const meName=()=>window.BCB_USER?.name||window.BCB_USER?.email||'Signed-in user',isSuper=()=>state.role==='Super Admin',canEdit=()=>state.role!=='Visitor',adminName=()=>G(state.ground).admin;
const fmt=(x,opts={day:'numeric',month:'short'})=>new Date(x).toLocaleDateString('en-GB',opts), nowDemo=new Date('2026-10-18T08:00');
const overdue=w=>new Date(w.due)<nowDemo&&!['Completed','Cancelled'].includes(w.status);const activeWork=()=>db.works.filter(w=>!['Completed','Cancelled'].includes(w.status));const colour=s=>/Critical|Urgent|Out of service|Blocked|Needs repair|Rejected/.test(s)?'red':/High|Open|attention|progress|Submitted|Assigned|review|verification|maintenance|Partially/.test(s)?'amber':/Update|Cancelled|No report/.test(s)?'gray':'green';
const status=s=>`<span class="status ${colour(s)}">${esc(s)}</span>`,chip=(s,c='')=>`<span class="chip ${c}">${esc(s)}</span>`;
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db))}catch{throw Error('Storage is full. Export your data and use a smaller photo or reset the demo.')}return true}
function log(title,detail=''){db.activity.unshift({title,detail:`${detail||meName()} · Just now`});persist()}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
function go(screen,opts={}){if(['work','work-detail','assign','update-work','review'].includes(screen))screen='issues';if(CLIENT_MODE){clientScroll[clientViewKey()]=$('.appbody')?.scrollTop||0;syncClientRoute(false)}state.history.push({...state,history:[]});Object.assign(state,{assignIssue:null,requestIssue:null,requestPart:null},opts,{screen,search:''});if(screen==='settings')state.scope=false;if(screen==='report-issue'&&opts.issueAsset===undefined)state.issueAsset=state.history.at(-1)?.screen==='asset'?state.asset:null;if(screen==='review'&&!opts.work){const selected=W();const w=selected?.status==='Ready for review'?selected:db.works.find(w=>w.status==='Ready for review');if(w)state.work=w.id}if(screen==='stock'&&A()?.type!=='Consumable'){const a=db.inventory.find(a=>a.type==='Consumable');if(a)state.asset=a.id}if(CLIENT_MODE)syncClientRoute();render()}
function back(){if(CLIENT_MODE&&state.history.length){window.history.back();return}if(state.history.length){const prev=state.history.pop(),history=state.history;state={...prev,history};render()}else go('home')}
const action=(label,screen,cls='',ic='')=>`<button class="button ${cls}" data-go="${screen}">${ic?icon(ic):''}${label}</button>`;
const section=(title,link='',screen='')=>`<div class="section-title"><h2>${title}</h2>${link?`<button class="textbtn" data-go="${screen}">${link}</button>`:''}</div>`;
const header=(title,sub='',backTo='Back')=>`<div class="backbar"><button data-action="back">${icon('back')}${backTo}</button><span>${state.scope?esc(G(state.ground).short):'BCB Grounds'}</span></div><h1 class="app-title">${title}</h1>${sub?`<p class="app-subtitle">${sub}</p>`:''}`;
const empty=(title,desc,cta='',screen='')=>`<div class="empty"><div class="symbol">${icon(screen==='add-match'?'match':'leaf')}</div><h3>${title}</h3><p>${desc}</p>${cta&&canEdit()?action(cta,screen):''}</div>`;
const field=(label,name,type='text',value='',required=true,extra='')=>`<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''} ${extra}></label>`;
const select=(label,name,values,selected='')=>`<label class="field">${label}<select name="${name}" required>${values.map(v=>{const [value,text]=Array.isArray(v)?v:[v,v];return `<option value="${esc(value)}" ${String(value)===String(selected)?'selected':''}>${esc(text)}</option>`}).join('')}</select></label>`;
const textarea=(label,name,value='',req=true)=>`<label class="field">${label}<textarea name="${name}" ${req?'required':''}>${esc(value)}</textarea></label>`;
const groundSelect=(id=state.ground)=>select('Ground','ground',grounds.map(g=>[g.id,g.short]),id);
const form=(type,content,label)=>`<form data-form="${type}">${content}<div class="form-error" role="alert"></div><button class="button" type="submit">${label}${icon('arrow')}</button></form>`;
const permission=(kind='Admin')=>empty('Viewing access only',`Switch to ${kind} in the screen explorer to try this action.`);
function groundCard(g){const ws=activeWork().filter(w=>w.ground===g.id),cr=openIssues().filter(i=>i.ground===g.id&&i.urgency==='Urgent').length,od=ws.filter(overdue).length,rq=db.requests.filter(r=>r.ground===g.id&&r.status==='Submitted').length,match=db.matches.filter(m=>m.ground===g.id&&m.status!=='Cancelled'&&matchInstant(m.end)>Date.now()).sort((a,b)=>a.start.localeCompare(b.start))[0];let st=g.status;if(openIssues().some(i=>i.ground===g.id))st='Needs attention';else if(g.status!=='No report'&&g.id!==6)st='On track';return `<article class="ground-card" tabindex="0" role="button" data-ground="${g.id}" aria-label="Open ${g.short}"><div class="ground-top"><div class="ground-thumb real-ground-thumb">${mediaThumbnail('ground',g.id)||icon('ground')}</div><div><h3 class="ground-title">${esc(g.short)}</h3><div class="sub">${String(g.priority).padStart(2,'0')} · ${g.venueType}</div></div>${icon('chevron','chev')}</div><div class="row" style="margin-top:13px">${status(st)}<span class="sub" style="font-size:9px">${g.status==='No report'?'Awaiting first report':g.id===6?'2 days ago':'Updated today'}</span></div>${cr||od||rq?`<div class="chips">${cr?`<button class="chip red" data-ground-filter="issues" data-gid="${g.id}">${icon('alert')}${cr} Urgent issues</button>`:''}${od?`<button class="chip amber" data-ground-filter="overdue" data-gid="${g.id}">${icon('clock')}${od} Overdue</button>`:''}${rq?`<button class="chip" data-ground-filter="requests" data-gid="${g.id}">${icon('request')}${rq} Requests</button>`:''}</div>`:''}<div class="card-foot"><span>${icon('match')}${match?`${fmt(match.start)} · ${match.format}`:'No upcoming match'}</span><span>View venue ${icon('chevron')}</span></div></article>`}
function home(){const need=new Set(openIssues().filter(i=>i.urgency==='Urgent').map(i=>i.ground)).size,pending=db.requests.filter(r=>r.status==='Submitted').length;let gs=grounds.filter(g=>(state.filter==='All grounds'||state.filter==='Needs attention'&&g.status==='Needs attention'||state.filter==='On track'&&g.status==='On track')&&`${g.short} ${g.name} ${g.city}`.toLowerCase().includes(state.search.toLowerCase()));return `<div class="app-top"><div class="app-brand">${icon('ground')} BCB GROUNDS</div><button class="icon-btn" data-go="alerts" aria-label="Notifications">${icon('bell')}${!db.notificationsRead?'<i class="notice-dot"></i>':''}</button></div><p class="greeting">Sunday, 18 October</p><h1 class="app-title">Good morning, ${esc(meName())}.</h1><p class="app-subtitle">A clear view of every ground.</p>${state.mode==='Empty'?empty('Your grounds start here','Once grounds are added by your organisation, their latest condition will appear here.'): `<button class="summary" style="width:100%;text-align:left;margin-top:0" data-go="issues" data-issue-filter-priority="Urgent"><div class="row"><div class="alert-icon">${icon('alert')}</div><div style="flex:1"><strong>${need} grounds need attention</strong><p>${openIssues().filter(i=>i.urgency==='Urgent').length} urgent issues · review faults & repair needs</p></div>${icon('chevron')}</div></button><div class="summary-metrics">${summaryMetric(grounds.length,'Total venues','ground',{tag:'button',attributes:'data-go="grounds"'})}${summaryMetric(String(activeWork().length).padStart(2,'0'),'Active work','work',{tag:'button',attributes:'data-go="work"'})}${summaryMetric(String(pending).padStart(2,'0'),'New requests','request',{tag:'button',attributes:'data-go="requests"'})}</div>${section('Your grounds','View all','grounds')}<div class="filters">${['All grounds','Needs attention','On track'].map(x=>`<button class="filter ${state.filter===x?'active':''}" data-home-filter="${x}">${x}</button>`).join('')}</div>${gs.map(groundCard).join('')}`}`}
function groundTabs(active){return `<nav class="segmented" aria-label="Ground sections">${[['ground','Overview'],['ground-inventory','Inventory'],['pitch','Pitch'],['ground-matches','Matches']].map(([s,t])=>`<button class="${active===s?'active':''}" data-ground-tab="${s}" aria-current="${active===s?'page':'false'}">${t}</button>`).join('')}</nav>`}
function workRow(w){return `<button class="list-row" data-work="${w.id}"><div class="symbol ${w.priority==='Critical'?'red':w.status==='Blocked'?'amber':''}">${icon('work')}</div><div class="grow"><strong>${esc(w.title)}</strong><small>${G(w.ground).short} · ${esc(w.owner)}</small><div class="chips" style="margin-top:7px">${chip(w.status,colour(w.status))}${overdue(w)?chip('Overdue','red'):chip('Due '+fmt(w.due))}</div></div>${icon('chevron','chev')}</button>`}
function photo(p){return photoGallery('pitch',state.ground,'Pitch inspection')}
function groundOverview(){const g=G(state.ground),ws=activeWork().filter(w=>w.ground===g.id),ms=db.matches.filter(m=>m.ground===g.id&&m.status!=='Cancelled'&&matchInstant(m.end)>Date.now()).sort((a,b)=>matchInstant(a.start)-matchInstant(b.start)),p=db.pitches[g.id];return header(g.short,`${esc(g.name)}<br>Last report: ${p?'Just now':g.updated}`,'Grounds')+`<div class="ground-venue-meta">${chip(g.venueType)}<span>Priority ${g.priority} of ${grounds.length}</span></div>`+photoGallery('ground',g.id,g.name)+photoManageButton('ground',g.id)+groundTabs('ground')+status(p?.status||g.status)+(state.mode==='Empty'?empty('No ground report yet','The curator’s first inspection will bring this overview to life.'):`${groundIssues(g.id)}${section(ms[0]&&matchPhase(ms[0])==='Running'?'Running match':'Next match','All matches','ground-matches')}${ms[0]?matchCard(ms[0]):`<div class="card"><h3>No match scheduled</h3><p>Plan the next fixture for this ground.</p>${isSuper()?action('Add match','add-match','secondary','plus'):''}</div>`}${section('Latest pitch report','View report','pitch')}${!g.legacy&&!p?'<div class="card"><h3>No pitch report yet</h3><p>Add the first inspection for this venue.</p></div>':photo(p)+`<div class="row">${status(p?.status||'Needs preparation')}<span class="sub">${esc(p?.pitch||'Pitch 02')} · ${p?'Just now':'7:10 AM'}</span></div>`}${section('Requests','View all','requests')}<div class="card"><h3>${db.requests.filter(r=>r.ground===g.id&&r.status==='Submitted').length} awaiting approval</h3><p>Equipment and supplies requested by the curator.</p></div>`)}
function groundView(){return groundOverview()+venueGroundsTeam(state.ground);}
function pitchView(){return pitchDirectory();}
function pitchForm(){return pitchReportEditor();}
function requestRow(r){return `<button class="list-row" data-request="${r.id}"><div class="symbol">${icon('box')}</div><div class="grow"><strong>${esc(r.title)}</strong><small>${r.qty} ${esc(r.unit)} · ${G(r.ground).short}</small><div class="chips" style="margin-top:7px">${chip(r.status,colour(r.status))}</div></div>${icon('chevron','chev')}</button>`}
function requests(withHeader=true){const rs=state.mode==='Empty'?[]:db.requests.filter(r=>(!state.scope||r.ground===state.ground)&&(state.reqFilter==='All'||r.status===state.reqFilter));return (withHeader?header('Requests','The right supplies, at the right time.'):'')+`<div class="row"><span class="badge-label">${rs.length} requests</span>${canEdit()?'<button class="button small" data-go="new-request">'+icon('plus')+' New request</button>':''}</div><div class="filters">${['All','Submitted','Approved','Received','Rejected'].map(t=>`<button class="filter ${state.reqFilter===t?'active':''}" data-request-filter="${t}">${t}</button>`).join('')}</div>`+(rs.length?rs.map(requestRow).join(''):empty('All caught up','There are no requests in this view.','Create request','new-request'))}
function requestDetail(){const r=R();if(!r||state.mode==='Empty')return header('Request details')+empty('No requests yet','Create a request to get started.');return header('Request details',`REQ-${r.id} · ${G(r.ground).short}`)+status(r.status)+`<h2 style="font-size:24px;letter-spacing:-.6px">${esc(r.title)}</h2><div class="details"><div><small>Quantity requested</small><strong>${r.qty} ${esc(r.unit)}</strong></div><div><small>Estimated total</small><strong>৳${Number(r.cost).toLocaleString()}</strong></div><div><small>Required by</small><strong>${fmt(r.needed)}</strong></div><div><small>Requested by</small><strong>${esc(r.owner)}</strong></div></div>${section('Why it’s needed')}<div class="card soft"><p>${esc(r.reason)}</p></div>${r.reviewNote?`<div class="card"><h3>Review note</h3><p>${esc(r.reviewNote)}</p></div>`:''}${['Submitted','Changes requested'].includes(r.status)&&isSuper()&&r.owner!==meName()?form('request-review',select('Decision','decision',['Approve','Request changes','Reject'])+textarea('Decision note','note','',false),'Submit decision'):''}${['Approved','Partially received'].includes(r.status)?`<div class="card"><h3>${r.received} of ${r.qty} ${esc(r.unit)} received</h3><p>Stock updates only after receipt is confirmed.</p></div>${canEdit()?form('receive',field('Quantity received now','qty','number','',true,`min="1" max="${r.qty-r.received}" step="any"`),'Confirm receipt'):''}`:''}${r.status==='Changes requested'&&canEdit()?form('revise-request',textarea('Updated reason / response','reason',r.reason),'Resubmit request'):''}${r.status==='Received'?'<div class="card soft"><h3>Received & added to inventory</h3><p>The full requested quantity is now recorded.</p></div>':''}${r.owner===meName()&&r.status==='Submitted'?'<p class="inline-note">A different approver must review your own request.</p>':''}`}
function newRequest(){if(!canEdit())return header('New request')+permission();return header('New request','Tell the team what your ground needs.')+form('request',linkedPartRequestFields()+groundSelect()+field('Item name','title')+select('Category','category',['Equipment','Consumable'])+'<div class="field-grid">'+field('Quantity','qty','number','',true,'min="1" step="any"')+select('Unit','unit',['pieces','units','litres','kg','bags'])+'</div>'+field('Estimated total cost (BDT)','cost','number','',true,'min="0"')+field('Required by','needed','date','2026-10-22')+textarea('Why is it needed?','reason'),'Submit request')}
function inventory(withHeader=true){return inventoryRegister(withHeader)}
function asset(){const a=A();if(!a||state.mode==='Empty')return header('Item details')+empty('No item selected','Choose an item from inventory.');return header('Item details',`${G(a.ground).short} · ${esc(a.code)}`)+photoGallery('asset',a.id,a.title)+photoManageButton('asset',a.id)+`<h2 style="font-size:25px;letter-spacing:-.7px">${esc(a.title)}</h2>${status(a.type==='Equipment'?assetCondition(a):a.qty<a.min?'Low stock':'Available')}<div class="details"><div><small>Inventory ID</small><strong>${esc(a.code)}</strong></div><div><small>Inventory of</small><strong>${['NSC','BCB'].includes(a.inventoryOf)?a.inventoryOf:'Not recorded'}</strong></div><div><small>Date added</small><strong>${inventoryDateLabel(a.addedDate)}</strong></div><div><small>Available quantity</small><strong>${a.qty} ${esc(a.unit)}</strong></div><div><small>Category</small><strong>${a.type}</strong></div><div><small>Location</small><strong>${G(a.ground).short} · Grounds store</strong></div>${a.type==='Consumable'?'<div><small>Minimum stock</small><strong>'+a.min+' '+esc(a.unit)+'</strong></div>':''}</div>${a.qty<a.min?'<div class="summary"><strong>Stock is below the minimum</strong><p>Request a replenishment to avoid delays.</p></div>':''}${canEdit()?(a.type==='Consumable'?action('Record stock movement','stock','','plus'):action('Report an issue','report-issue','','alert')):''}${assetIssues(a)}${section('Inventory history')}${(a.history||[]).map(h=>`<div class="list-row"><div>${icon('activity')}</div><div class="grow"><strong>${esc(h)}</strong><small>Recorded in this browser</small></div></div>`).join('')||'<p class="sub">Opening balance · Demo inventory register</p>'}`}
function stock(){const a=A();if(!canEdit())return header('Stock movement')+permission();return header('Stock movement',`${esc(a.title)} · ${a.qty} ${esc(a.unit)} available`)+form('stock',select('Movement type','type',['Receive','Issue / use','Return','Adjustment','Transfer to ground'])+field('Quantity','qty','number','',true,'min="0.01" step="any"')+select('Destination · for transfers only','destination',grounds.filter(g=>g.id!==a.ground).map(g=>[g.id,g.short]))+textarea('Reference / reason','note')+'<p class="inline-note">For Adjustment, enter the new total quantity. Every change is recorded in the item history.</p>','Save movement')}
function matchCard(m){return `<button class="match-card" data-match="${m.id}"><div class="match-photo">${mediaThumbnail('match',m.id)}<span>${normalisePhotos(m).length?'Program photos':'Venue reference'}</span></div><div class="row"><span class="match-date">${matchDateTime(m.start)} · BST</span>${chip(m.format)}</div><div class="match-teams"><span class="team-flag"></span>${esc(m.title.includes(' vs ')?m.title.split(' vs ')[0]:m.title)}${m.title.includes(' vs ')?'<span style="font-size:10px;color:#9ba58f;font-weight:400">vs</span><span class="team-flag alt"></span>'+esc(m.title.split(' vs ')[1]):''}</div><div class="row"><span class="sub">${G(m.ground).short} · ${esc(m.pitch)}</span>${status(m.status)}</div>${matchPreparationMeter(m)}</button>`}
function matches(){return matchCalendarPage()}
function matchDetail(){const m=M();if(!m||state.mode==='Empty')return header('Match details')+empty('No match selected','Add a fixture to start preparing.','Add match','add-match');const blockers=matchPreparation(m).blockers;return header('Match details',`${G(m.ground).short} · ${esc(m.format)}`)+matchCard(m)+photoGallery('match',m.id,'Match / program photos')+`<div class="details"><div><small>Ends</small><strong>${matchDateTime(m.end)} · BST</strong></div></div>${blockers?`<div class="summary"><strong>${blockers} ${blockers===1?'blocker remains':'blockers remain'}</strong><p>Resolve urgent issues and critical work before confirming readiness.</p></div>`:''}${section('Preparation checklist')}${m.checks.map(([t,c],i)=>`<label class="check-row"><input data-match-check="${i}" type="checkbox" ${c?'checked':''} ${canEdit()&&m.status!=='Cancelled'?'':'disabled'}>${esc(t)}</label>`).join('')}<p class="inline-note">Preparation progress does not replace the curator’s final readiness assessment.</p>${isSuper()&&m.status!=='Cancelled'?'<button class="button secondary" data-action="edit-match">Edit / reschedule match</button><button class="textbtn" data-action="cancel-match">Cancel match</button>':''}`}
function matchForm(){
  if(!isSuper())return header('Add match')+permission('Super Admin');
  const m=state.editMatch?M():null, ground=m?.ground||state.ground, defaults=matchDefaultTimes();
  const groundField=state.scope?`<input type="hidden" name="ground" value="${ground}"><div class="match-ground-field"><span>Ground</span><strong>${esc(G(ground).short)}</strong><small>${esc(G(ground).name)}</small></div>`:groundSelect(ground);
  return header(m?'Edit match':'Add match',state.scope?`${esc(G(ground).short)} · ${m?'Update this ground’s fixture.':'Add a fixture for this ground.'}`:'Reserve a date and give preparation a clear owner.')+form('match',field('Match title / teams','title','text',m?.title||'')+groundField+photoUpload('photo','Program / match photos',normalisePhotos(m),demoImage(groundImages[ground],'Demo venue reference'),'Add a venue photo, setup plan or preparation reference.')+select('Format','format',['ODI','T20','Test','Training','Domestic'],m?.format)+field('Start · Bangladesh time','start','datetime-local',m?.start||defaults.start)+field('End · Bangladesh time','end','datetime-local',m?.end||defaults.end)+field('Pitch identifier','pitch','text',m?.pitch||'Pitch 02')+select('Status','status',['Tentative','Confirmed'],m?.status),'Save match')
}
function team(){return teamDirectoryPage()}
function alerts(){const list=accountPreference('approvals')?db.requests.filter(r=>r.status==='Submitted'):[];return header('Notifications','Supply requests awaiting a decision.')+(list.length?list.map(requestRow).join(''):empty('You’re all caught up','New supply requests will appear here.'));}
function activity(){return header('Activity log','A clear record of what changed.')+(state.mode==='Empty'?empty('No activity yet','Updates and stock movements appear here.'):db.activity.map(a=>`<div class="list-row"><div class="symbol">${icon('activity')}</div><div class="grow"><strong>${esc(a.title)}</strong><small>${esc(a.detail)}</small></div></div>`).join(''))}
function settings(){return header('Settings','Your workspace, at a glance.')+`<div class="card"><div class="row"><div class="avatar">${state.role==='Admin'?'RI':state.role==='Visitor'?'GC':'FA'}</div><div style="flex:1"><h3>${esc(meName())}</h3><span class="sub">${state.role}</span></div>${icon('shield')}</div></div><div class="list-row"><div class="grow"><strong>Workspace</strong><small>Bangladesh Cricket Board · Demo workspace</small></div></div><div class="list-row"><div class="grow"><strong>Timezone</strong><small>Asia / Dhaka · UTC +06:00</small></div></div><div class="list-row"><div class="grow"><strong>Data storage</strong><small>Saved locally in this browser. No shared staff accounts.</small></div></div>${select('Preview as','previewRole',['Visitor','Super Admin','Admin'],state.role)}<button class="button secondary" data-action="export">${icon('download')}Export workspace data</button><button class="button secondary" data-photo-credits>Demo photo sources</button><button class="button danger" data-action="reset">Reset demo data</button><p class="inline-note">Ground names, people, schedules and operational records are demonstration data. This browser app follows iOS interaction patterns; it is not a native App Store build.</p>`}
function searchBox(placeholder){return `<label class="search">${icon('search')}<input data-search="app" value="${esc(state.search)}" placeholder="${placeholder}" aria-label="${placeholder}"></label>`}
function content(){if(state.screen==='pitch-details')return pitchDetailsPage();if(state.screen==='pitch-edit')return pitchEditor();if(state.screen==='pitch-report')return pitchReportPage();if(state.screen==='pitch-report-edit')return pitchReportEditor();if(['work','work-detail','assign','update-work','review'].includes(state.screen))return issuesPage();switch(state.screen){case'home':return home();case'issues':return issuesPage();case'issue-detail':return issueDetail();case'grounds':return header('All grounds',`${grounds.filter(g=>g.venueType==='BCB ground').length} BCB grounds · ${grounds.filter(g=>g.venueType==='Rented venue').length} rented venues · Priority order`)+searchBox('Find a ground')+(state.mode==='Empty'?empty('No grounds available','Your organisation’s grounds will appear here.'):grounds.filter(g=>`${g.short} ${g.name} ${g.city}`.toLowerCase().includes(state.search.toLowerCase())).map(groundCard).join('')||empty('No matching grounds','Try a different ground name or city.'));case'ground':return groundView();case'ground-inventory':return groundInventory();case'ground-matches':return groundMatches();case'pitch':return pitchView();case'pitch-update':return pitchForm();case'requests':return requests();case'transfers':return transfers();case'request-detail':return requestDetail();case'new-request':return newRequest();case'inventory':return inventory();case'inventory-group':return inventoryGroupPage();case'asset':return asset();case'stock':return stock();case'report-issue':return issueForm();case'matches':return matches();case'match':return matchDetail();case'add-match':return matchForm();case'team':return team();case'team-group':return teamDesignationPage();case'employee-profile':return teamMemberProfile();case'alerts':return alerts();case'activity':return activity();case'settings':return settings();default:return clientHome()}}
const notes={issues:['Every issue, one clear view','Filter by urgency, ground and category. Every card names the machine, damaged part and supplies needed.',['Find the issue','Check the fault & parts','Assign repair work']], 'issue-detail':['From fault to fix','See what failed, what it affects, which parts are needed and who owns the repair.',['Inspect the fault','Source the parts','Verify the repair']],home:['A morning briefing','See which grounds need attention, what is overdue and what needs approval.',['Scan grounds in priority order','Open a ground','Review and assign work']],ground:['One ground, in focus','The next match, latest pitch inspection and active work are always close together.',['Check ground condition','Review preparation','Assign an owner']],pitch:['Evidence before assumptions','Read the curator’s assessment, inspect photos and see what needs to happen next.',['View latest report','Check observations','Update the next action']],assign:['One accountable owner','A Super Admin assigns an admin. The admin coordinates workers and reports progress.',['Describe the work','Choose admin & deadline','Assign and track']],requests:['From need to receipt','Approve a request, confirm delivery, then update stock. Approval alone never adds inventory.',['Review the request','Approve or return','Confirm received quantity']],matches:['Prepare before match day','See fixtures by date and ground. Conflicting bookings are flagged before saving.',['Choose a date','Add the fixture','Track preparation']]};
function render(){if(CLIENT_MODE)return renderClient();const navScrollBefore=$('.nav-scroll')?.scrollTop||0;const info=screenInfo(),group=groups.find(g=>g[1].some(s=>s[0]===state.screen)),note=notes[state.screen]||[info[1],'Explore this screen, try an action, and follow it through to the next step.',['Review the details','Take the next action','Track the outcome']];$('#app').innerHTML=`<aside class="sidebar"><div class="brand"><div class="brandmark">${icon('ground')}</div><div><strong>bcb-grounds<span style="color:#85a177">.</span></strong><small>BCB GROUNDS MANAGEMENT</small></div></div><div class="project-label"><span>SCREEN EXPLORER</span><span>${allScreens.length} screens</span></div><label class="nav-search">${icon('search')}<input placeholder="Find a screen…" aria-label="Find a screen" id="navsearch"></label><nav class="nav-scroll">${groups.map(([title,items])=>`<section class="nav-group"><h3>${title}</h3>${items.map(([id,name,ic])=>`<button class="nav-item ${id===state.screen?'active':''}" data-screen="${id}" aria-current="${id===state.screen?'page':'false'}">${icon(ic)}<span>${name}</span><span class="number">${String(allScreens.findIndex(s=>s[0]===id)+1).padStart(2,'0')}</span></button>`).join('')}</section>`).join('')}</nav><div class="side-foot"><i class="live-dot"></i>Interactive build <span style="margin-left:auto">v1.2</span></div></aside><main class="workspace ${state.full?'full':''}"><header class="toolbar"><div class="crumb"><button class="mobile-toggle" data-action="menu" aria-label="Open screen explorer">${icon('menu')}</button><span>BCB Grounds</span>${icon('chevron')}<strong>${group[0]}</strong></div><div class="toolbar-right"><span><i class="live-dot"></i> Browser-saved demo</span><button class="toolbar-badge" data-action="preview-options">${state.role} · ${state.mode}</button><button data-action="expand" aria-label="Toggle focused view">${icon('expand')}</button></div></header><div class="stage-heading"><div><div class="eyebrow">${group[0]}</div><h1>${info[1]}</h1><p>${note[0]}. Designed for a calmer working day.</p></div><span class="device-label">${icon('shield')} iPhone · 390 × 844</span></div><div class="stage"><div class="phone-wrap"><div class="phone"><div class="statusbar"><span>9:41</span><i class="island"></i><div class="system-icons">${icon('signal')}${icon('wifi')}${icon('battery','battery')}</div></div>${state.mode==='Offline'?'<div class="offline">Offline preview · browser data remains available</div>':''}<div class="appbody"><div class="phone-content">${content()}</div></div><nav class="phone-footer">${[['home','Home','home'],['issues','Issues','alert'],['work','Work','work'],['requests','Requests','request'],['matches','Matches','match']].map(([id,t,ic])=>`<button data-tab="${id}" class="${(id==='home'&&['home','grounds','ground','ground-inventory','ground-matches','pitch','inventory'].includes(state.screen)||id==='home'&&state.scope&&['match','add-match','asset','stock'].includes(state.screen))||id==='issues'&&['issues','issue-detail','report-issue'].includes(state.screen)||state.screen.startsWith(id)||id==='work'&&['assign','review','update-work'].includes(state.screen)||id==='matches'&&!state.scope&&['match','add-match'].includes(state.screen)?'active':''}">${icon(ic)}<span>${t}</span></button>`).join('')}<div class="home-indicator"></div></nav></div><div style="text-align:center;margin-top:16px;font-size:10px;color:#9ba495">Scroll inside the screen to explore</div></div><aside class="inspector"><div class="eyebrow" style="margin-bottom:12px">Experience the app as</div><div class="role-switch">${['Visitor','Super Admin','Admin'].map(r=>`<button class="${state.role===r?'chosen':''}" data-role="${r}">${icon(r==='Super Admin'?'shield':'user')}${r}</button>`).join('')}</div><h2>${note[0]}</h2><p>${note[1]}</p><hr><h2>Screen state</h2><div class="state-switch">${['Live','Empty','Offline'].map(m=>`<button data-mode="${m}" class="${state.mode===m?'active':''}">${m}</button>`).join('')}</div><p class="prototype-note">Preview normal content, an empty view or an offline notice.</p><hr><h2>The flow</h2>${note[2].map((s,i)=>`<div class="flow-step"><i>${i+1}</i>${s}</div>`).join('')}<hr><span class="help-tag">${icon('check')} Working interactions</span><p class="prototype-note">Demo data · Saved in this browser.<br>Role switching previews permissions.<br>Workers have no app interface.</p><button class="textbtn" data-go="settings">Workspace settings →</button></aside></div></main>`;bind();$('.nav-scroll').scrollTop=navScrollBefore;}
function closeModal(){if(CLIENT_MODE)closeClientSheet();else $('.modal-backdrop')?.remove()}
function showModal(html){if(CLIENT_MODE){showClientSheet(html);return}$('.phone').insertAdjacentHTML('beforeend',`<div class="modal-backdrop"><div class="modal">${html}<button class="button secondary" data-action="close-modal">Close</button></div></div>`)}
function bind(){const n=$('#navsearch');n.addEventListener('input',()=>{const q=n.value.toLowerCase();document.querySelectorAll('.nav-item').forEach(el=>el.hidden=!el.textContent.toLowerCase().includes(q));document.querySelectorAll('.nav-group').forEach(g=>g.hidden=![...g.querySelectorAll('.nav-item')].some(e=>!e.hidden))});document.querySelectorAll('[data-search="app"]').forEach(e=>e.addEventListener('input',()=>{const pos=e.selectionStart;state.search=e.value;const scroll=$('.appbody').scrollTop;$('.phone-content').innerHTML=content();const next=$('[data-search="app"]');if(next){next.focus();next.setSelectionRange(pos,pos)}$('.appbody').scrollTop=scroll;bindAppSearch()}));const pr=$('[name=previewRole]');if(pr)pr.addEventListener('change',()=>{state.role=pr.value;render()})}
function bindAppSearch(){const e=$('[data-search="app"]');if(e)e.addEventListener('input',()=>{state.search=e.value;const pos=e.selectionStart,scroll=$('.appbody').scrollTop;$('.phone-content').innerHTML=CLIENT_MODE?clientContent():content();const next=$('[data-search="app"]');next.focus();next.setSelectionRange(pos,pos);$('.appbody').scrollTop=scroll;bindAppSearch()})}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-ground]'))e.target.click();if(e.key==='Escape')closeModal()});
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-ground]');if(!b)return;
if(b.dataset.issue){const i=db.issues.find(i=>String(i.id)===b.dataset.issue);if(i)go('issue-detail',{issue:i.id,ground:i.ground});return}
if(b.dataset.groundIssues){go('issues',{scope:false,issueGround:String(b.dataset.groundIssues),issueUrgency:'All',issueCategory:'All',issueState:'Active'});return}
if(b.dataset.issueUrgency){state.issueUrgency=b.dataset.issueUrgency;render();return}
if(b.dataset.issuePart!==undefined){preparePartRequest(Number(b.dataset.issuePart));return}
if(b.dataset.screen){go(b.dataset.screen,{...(b.dataset.screen==='issues'?{issueUrgency:'All',issueGround:'All',issueCategory:'All',issueState:'All'}:{}),scope:['ground','ground-inventory','ground-matches','pitch','pitch-update'].includes(b.dataset.screen),editMatch:false,workFilter:'All',reqFilter:'All',invFilter:'All',mode:'Live'});return}
if(b.dataset.groundFilter){const id=Number(b.dataset.gid),f=b.dataset.groundFilter;if(f==='issues'){go('issues',{issueGround:String(id),issueUrgency:'Urgent',issueCategory:'All',issueState:'Active',scope:false});return}go(f==='requests'?'requests':'work',{ground:id,scope:true,workFilter:f==='critical'?'Critical':'Overdue',reqFilter:'Submitted'});return}
if(b.dataset.ground){go('ground',{ground:Number(b.dataset.ground),scope:true});return}
if(b.dataset.groundTab){go(b.dataset.groundTab,{scope:true,day:null,groundMatchHistory:false,invFilter:'All'});return}
if(b.dataset.groundMatchHistory!==undefined){toggleGroundMatchHistory();return}
if(b.dataset.work){const w=db.works.find(x=>x.id===Number(b.dataset.work));go('work-detail',{work:w.id,ground:w.ground});return}
if(b.dataset.request){const r=db.requests.find(x=>x.id===Number(b.dataset.request));go('request-detail',{request:r.id,ground:r.ground});return}
if(b.dataset.receiveTransfer){if(!canEdit())return;const t=(db.transfers||[]).find(t=>t.id===+b.dataset.receiveTransfer);if(!t||t.status!=='In transit')return;let a=db.inventory.find(a=>a.title===t.title&&a.ground===t.to&&a.unit===t.unit);if(a)a.qty+=t.qty;else{a={id:Date.now(),title:t.title,ground:t.to,type:t.type,condition:t.type==='Equipment'?'Operational':'Available',qty:t.qty,unit:t.unit,min:0,code:'TR-'+String(t.id).slice(-6)};db.inventory.push(a)}t.status='Received';log('Transfer received',t.title+' · '+G(t.to).short);render();toast('Transfer received and destination stock updated');return}if(b.dataset.asset){const a=db.inventory.find(x=>x.id===Number(b.dataset.asset));go('asset',{asset:a.id,ground:a.ground});return}
if(b.dataset.match){const m=db.matches.find(x=>x.id===Number(b.dataset.match));go('match',{match:m.id,ground:m.ground});return}
if(b.dataset.role){state.role=b.dataset.role;render();return}
if(b.dataset.mode){state.mode=b.dataset.mode;render();return}
if(b.dataset.tab){go(b.dataset.tab,{scope:false,workFilter:'All',reqFilter:'All',invFilter:'All',day:null,mode:'Live',issueGround:'All',issueCategory:'All',issueUrgency:'All',issueState:'All'});return}
if(b.dataset.go){go(b.dataset.go,{...(b.dataset.go==='ground-matches'?{scope:true,groundMatchHistory:false}:{}),...(CLIENT_MODE&&['grounds','inventory','team','requests','work','review'].includes(b.dataset.go)&&state.screen==='home'?{scope:false,workFilter:'All',reqFilter:'All',invFilter:'All'}:{}),...(b.dataset.go==='issues'?{scope:false,issueGround:state.scope?String(state.ground):'All',issueUrgency:b.dataset.issueFilterPriority||'All',issueCategory:'All',issueState:'All'}:{}),workFilter:b.dataset.filter||(CLIENT_MODE&&b.dataset.go==='work'?'Active':state.workFilter),reqFilter:b.dataset.requestFilterTarget||(CLIENT_MODE&&state.screen==='home'?'All':state.reqFilter),editMatch:false});return}
if(b.dataset.homeFilter){state.filter=b.dataset.homeFilter;render();return}
if(b.dataset.workFilter){state.workFilter=b.dataset.workFilter;render();return}
if(b.dataset.requestFilter){state.reqFilter=b.dataset.requestFilter;render();return}
if(b.dataset.invFilter){state.invFilter=b.dataset.invFilter;render();return}
if(b.dataset.month){calendarChangeMonth(Number(b.dataset.month));return}
if(b.dataset.day){calendarSelectDay(Number(b.dataset.day));return}
if(b.dataset.assignOwner)return;
if(false){go('assign');$('[name=owner]').value=b.dataset.assignOwner;const g=grounds.find(g=>g.admin===b.dataset.assignOwner);$('[name=ground]').value=g.id;return}
const act=b.dataset.action;if(!act)return;
if(['assign-issue','reassign','reopen'].includes(act))return;
switch(act){case'new-issue':go('report-issue',{issueAsset:null});break;case'clear-issue-filters':Object.assign(state,{issueUrgency:'All',issueGround:'All',issueCategory:'All',issueState:'All',search:''});render();break;case'add-item':if(canEdit())showModal(inventoryAddItemForm());break;case'back':back();break;case'preview-options':showModal('<h3>Preview controls</h3><div class="role-switch">'+['Visitor','Super Admin','Admin'].map(r=>'<button data-role="'+r+'">'+r+'</button>').join('')+'</div><div class="state-switch">'+['Live','Empty','Offline'].map(m=>'<button data-mode="'+m+'">'+m+'</button>').join('')+'</div>');break;case'menu':$('.sidebar').classList.toggle('open');break;case'expand':state.full=!state.full;render();break;case'clear-day':calendarClearDay();break;case'close-modal':closeModal();break;case'photo':{const p=db.pitches[state.ground];showModal(`<h3>${esc(p?.pitch||'Pitch 02')}</h3><img src="${p?.photo||'assets/pitch.jpg'}" alt="Pitch inspection enlarged"><p>${p?.photo?'Uploaded inspection image':'Reference photo of Cricket Central, Sydney. Not an actual BCB inspection. ESPNcricinfo / Getty Images.'}</p>`);break}case'read':db.notificationsRead=true;persist();render();toast('All notifications marked as read');break;case'edit-match':go('add-match',{editMatch:true});break;case'cancel-match':showModal('<h3>Cancel this match?</h3><p>The fixture stays in the calendar as cancelled. Its preparation checklist is retained for the record.</p><button class="button danger" data-action="confirm-cancel-match">Cancel match</button>');break;case'confirm-cancel-match':if(isSuper()){M().status='Cancelled';log('Match cancelled',M().title);render();toast('Match cancelled')}break;case'reset':showModal('<h3>Reset this demo?</h3><p>This removes changes saved in this browser and restores the sample grounds, work and requests.</p><button class="button danger" data-action="confirm-reset">Reset demo data</button>');break;case'confirm-reset':db=structuredClone(seed);persist();state.ground=1;state.work=101;state.request=201;state.asset=1;state.match=301;if(CLIENT_MODE){prepareClientData();state.screen='home';state.history=[];syncClientRoute(false)}render();toast('Workspace restored');break;case'export':{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({workspace:'BCB Grounds BCB demo',grounds,...db},null,2)],{type:'application/json'}));a.download='bcb-grounds-workspace.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Workspace data exported');break}}
});
document.addEventListener('change',e=>{if(e.target.dataset.issueFilter){state[e.target.dataset.issueFilter]=e.target.value;render();return}if(e.target.name==='ground'&&e.target.closest('[data-form=issue]')){const sel=e.target.closest('form').querySelector('[name=asset]');sel.innerHTML='<option value="0">No machine — ground / area issue</option>'+db.inventory.filter(a=>a.ground===+e.target.value&&a.type==='Equipment').map(a=>'<option value="'+a.id+'">'+esc(a.title)+' · '+esc(a.code)+'</option>').join('');}if(e.target.matches('[data-match-check]')&&canEdit()){M().checks[Number(e.target.dataset.matchCheck)][1]=e.target.checked;log('Match preparation updated',M().title);const scroll=$('.appbody').scrollTop;render();$('.appbody').scrollTop=scroll}if(e.target.name==='ground'&&e.target.closest('form')){const owner=e.target.closest('form').querySelector('[name=owner]');if(owner)owner.value=G(e.target.value).admin}});
async function readPhoto(file){if(!file||!file.size)return null;if(!file.type.startsWith('image/'))throw Error('Please select an image file.');if(file.size>3*1024*1024)throw Error('Please choose an image smaller than 3 MB.');return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('The photo could not be read. Please try again.'));r.readAsDataURL(file)})}
function error(form,message){const el=form.querySelector('.form-error');el.textContent=message;el.style.display='block';el.scrollIntoView({block:'nearest'})}
document.addEventListener('submit',async e=>{const f=e.target;if(!f.dataset.form||['pitch-profile','pitch-report'].includes(f.dataset.form))return;if(['work','progress','review','reassign','reopen'].includes(f.dataset.form)){e.preventDefault();return;}e.preventDefault();if(!canEdit())return error(f,'This role has viewing access only.');if(f._photoPending)return error(f,'Please wait for the photos to finish preparing.');const snapshot=structuredClone(db);const data=new FormData(f),v=Object.fromEntries(data.entries()),type=f.dataset.form;const superTypes=['work','review','request-review','match','reassign','reopen'];if(superTypes.includes(type)&&!isSuper())return error(f,'Only a Super Admin can perform this action.');if(['work','request','issue','match'].includes(type)&&!String(v.title||'').trim())return error(f,'Please enter a title.');const submit=f.querySelector('[type=submit]');submit.disabled=true;try{switch(type){case'record-photos':{const photos=await collectPhotos(f,'photos');let record;if(v.kind==='ground'){db.groundPhotos=db.groundPhotos||{};record=db.groundPhotos[v.recordId]||(db.groundPhotos[v.recordId]={})}else if(v.kind==='asset')record=db.inventory.find(a=>a.id===+v.recordId);else if(v.kind==='issue')record=db.issues.find(i=>String(i.id)===String(v.recordId));if(!record)throw Error('This record could not be found.');Object.assign(record,photoValues(photos));log('Photos updated',v.kind);render();toast('Photos saved');break}case'add-item':{if(state.scope&&+v.ground!==state.ground)throw Error('This item must stay at the selected ground.');const entry=inventoryEntryValues(v);const images=await collectPhotos(f,'photo');const a={...photoValues(images),...entry,id:Date.now(),createdAt:new Date().toISOString(),ground:+v.ground,type:v.category,condition:v.category==='Equipment'?'Operational':'Available',qty:+v.qty,unit:v.unit,min:+v.min,history:[`Added to inventory · ${inventoryDateLabel(entry.addedDate)}`]};db.inventory.push(a);state.asset=a.id;log('Inventory item added',a.title);clearInventoryDraft();go('asset');toast('Inventory item added');break}case'work':{const checks=v.check.split('\n').map(x=>x.trim()).filter(Boolean);if(!checks.length)throw Error('Add at least one completion step.');const linked=v.issueId?db.issues.find(i=>String(i.id)===String(v.issueId)):null;if(linked&&issueWork(linked))throw Error('This issue already has linked work.');if(linked&&linked.ground!==+v.ground)throw Error('Repair work must stay at the reported ground.');const id=Date.now();db.works.unshift({id,title:v.title.trim(),ground:+v.ground,asset:linked?.asset||0,owner:v.owner,priority:v.priority,due:v.due,status:'Assigned',note:v.note,check:checks.map(t=>[t,false]),logs:[['Assigned to '+v.owner,'Just now']]});if(linked)linked.work=id;state.work=id;log('Work assigned: '+v.title,v.owner);go('work-detail');toast('Work assigned to '+v.owner);break}
case'progress':{const w=W(),checks=w.check.map(([t],i)=>[t,data.has('check-'+i)]),evidencePhotos=await collectPhotos(f,'evidence',w.evidencePhotos?{photos:w.evidencePhotos}:w.evidence?{photo:w.evidence}:null),photo=evidencePhotos[0]?.src||null;if(v.status==='Ready for review'&&checks.some(c=>!c[1]))throw Error('Complete every checklist step before submitting for review.');if(v.status==='Ready for review'&&!evidencePhotos.some(p=>!p.demo))throw Error('Add an evidence photo before submitting for review.');w.status=v.status;w.note=v.note;w.check=checks;w.evidencePhotos=evidencePhotos;w.evidence=photo;w.logs.unshift([v.status+' · '+v.note,'Just now']);log('Progress updated: '+w.title,w.owner);go('work-detail');toast(v.status==='Ready for review'?'Sent to Super Admin for review':'Progress updated');break}
case'review':{const w=W();if(w.status!=='Ready for review')throw Error('This work is not awaiting review.');if(v.decision==='Return for changes'&&!v.note.trim())throw Error('Explain what needs to change.');w.status=v.decision==='Approve completion'?'Completed':'In progress';w.logs.unshift([w.status+(v.note?' · '+v.note:''),'Just now']);if(w.status==='Completed'&&w.asset){const a=db.inventory.find(a=>a.id===w.asset);if(a)a.condition=openIssues().some(i=>i.asset===a.id)?'Needs repair':'Operational'}log('Work '+w.status.toLowerCase()+': '+w.title);go('work-detail');toast(w.status==='Completed'?'Completion verified':'Returned to the responsible admin');break}
case'request':{if(v.issueId){const origin=db.issues.find(i=>String(i.id)===String(v.issueId)),part=origin?.parts[+v.partIndex];if(!origin||!part)throw Error('The linked issue or part no longer exists.');if(+v.ground!==origin.ground)throw Error('The part request must use the issue’s ground.');if(v.title.trim().toLowerCase()!==part.name.toLowerCase()||v.unit!==part.unit)throw Error('Keep the linked part name and unit unchanged. Create a separate request for another item.');}const id=Date.now();db.requests.unshift({id,title:v.title.trim(),ground:+v.ground,qty:+v.qty,unit:v.unit,category:v.category,cost:+v.cost,reason:v.reason,needed:v.needed,status:'Submitted',owner:meName(),received:0,issueId:v.issueId||null,partIndex:v.partIndex!==undefined?+v.partIndex:null});state.request=id;log('Request submitted: '+v.title);go('request-detail');toast('Request submitted for approval');break}
case'request-review':{const r=R();if(r.owner==='Fahim')throw Error('A different Super Admin must approve this request.');if(v.decision!=='Approve'&&!v.note.trim())throw Error('Add a reason for this decision.');r.status=({'Approve':'Approved','Request changes':'Changes requested','Reject':'Rejected'})[v.decision];r.reviewNote=v.note;log('Request '+r.status.toLowerCase()+': '+r.title);render();toast('Decision recorded');break}
case'revise-request':{const r=R();r.reason=v.reason;r.status='Submitted';log('Request resubmitted',r.title);render();toast('Request resubmitted');break}case'receive':{const r=R(),qty=+v.qty;if(!['Approved','Partially received'].includes(r.status))throw Error('This request is not approved for receipt.');if(!(qty>0)||qty>r.qty-r.received)throw Error('Enter a quantity within the remaining approved amount.');r.received+=qty;r.status=r.received===r.qty?'Received':'Partially received';let a=db.inventory.find(a=>a.ground===r.ground&&a.title.toLowerCase()===r.title.toLowerCase()&&a.unit===r.unit);if(a)a.qty+=qty;else{a={id:Date.now(),title:r.title,ground:r.ground,type:r.category||(/covers|sprinklers/i.test(r.title)?'Equipment':'Consumable'),condition:r.category==='Equipment'?'Operational':'Available',qty,unit:r.unit,min:0,code:'NEW-'+String(r.id).slice(-5)};db.inventory.push(a)}a.history=a.history||[];a.history.unshift(`Received ${qty} ${r.unit} · REQ-${r.id}`);log('Supplies received: '+r.title,`${qty} ${r.unit} · ${G(r.ground).short}`);render();toast('Receipt saved and stock updated');break}
case'stock':{const a=A(),qty=+v.qty;if(!(qty>0))throw Error('Enter a positive quantity.');if(['Issue / use','Transfer to ground'].includes(v.type)&&qty>a.qty)throw Error(`Only ${a.qty} ${a.unit} are available.`);a.qty=v.type==='Adjustment'?qty:['Issue / use','Transfer to ground'].includes(v.type)?a.qty-qty:a.qty+qty;if(v.type==='Transfer to ground'){db.transfers=db.transfers||[];db.transfers.unshift({id:Date.now(),title:a.title,from:a.ground,to:+v.destination,qty,unit:a.unit,type:a.type,status:'In transit',note:v.note});}a.history=a.history||[];a.history.unshift(`${v.type}: ${qty} ${a.unit} · ${v.note}`);log('Stock movement: '+a.title,v.type+' · '+qty+' '+a.unit);go('asset');toast('Stock movement recorded');break}
case'issue':{const a=v.asset&&+v.asset?db.inventory.find(a=>a.id===+v.asset):null;if(a&&a.ground!==+v.ground)throw Error('The selected machine belongs to another ground.');for(const key of ['component','symptoms','impact','repair','location'])if(!String(v[key]||'').trim())throw Error('Please complete the fault, impact and repair details.');const parts=[];for(let n=0;n<3;n++){const name=String(v['partName'+n]||'').trim(),qty=+v['partQty'+n];if(name&&!(qty>0))throw Error('Enter a positive quantity for each required part.');if(!name&&qty>0)throw Error('Enter the part name for each quantity.');if(name)parts.push({name,qty,unit:v['partUnit'+n],provisional:v.diagnosis==='Suspected · inspection required'})}const images=await collectPhotos(f,'photo');const id=Date.now();db.issues.unshift({...photoValues(images),id,title:v.title.trim(),ground:+v.ground,asset:a?.id||0,location:v.location,category:v.category,urgency:v.urgency,component:v.component,symptoms:v.symptoms,impact:v.impact,availability:v.availability,repair:v.repair,diagnosis:v.diagnosis,parts,work:null,reported:'Just now',reporter:meName()});if(a)a.condition='Needs repair';state.issue=id;log('Issue reported: '+v.title);go('issue-detail');toast('Issue reported');break}
case'pitch':{const previous=db.pitches[v.ground],images=await collectPhotos(f,'photo',previous);if(!images.length)throw Error('Add a photo for this pitch inspection.');db.pitches[v.ground]={...photoValues(images),pitch:v.pitch,status:v.status,surface:v.surface,grass:v.grass,moisture:v.moisture||'Not measured',next:v.next,note:v.note,updated:new Date().toISOString()};state.ground=+v.ground;log('Pitch report updated',G(v.ground).short+' · '+v.pitch);go('pitch',{mode:'Live'});toast('Pitch report saved');break}
case'match':{validateMatchTiming(v);const conflict=findMatchConflict(v,state.editMatch?state.match:null);if(conflict)throw Error('This ground is already booked for '+conflict.title+'. Choose another time.');const old=state.editMatch?M():null,id=old?.id||Date.now();const images=await collectPhotos(f,'photo',old);const m={...photoValues(images),id,title:v.title.trim(),ground:+v.ground,start:v.start,end:v.end,pitch:v.pitch,owner:old?.owner||'',format:v.format,status:v.status,checks:old?.checks||[['Pitch inspection approved',false],['Outfield prepared',false],['Equipment ready',false],['Drainage checked',false],['Covers available',false]]};if(old)db.matches=db.matches.map(x=>x.id===id?m:x);else db.matches.push(m);log(old?'Match rescheduled':'Match added',m.title);finishMatchForm(m);toast(old?'Match updated · review preparation deadlines':'Match added with preparation checklist');break}
case'reassign':{const w=W();w.owner=v.owner;w.logs.unshift(['Reassigned to '+v.owner+' · '+v.note,'Just now']);log('Work reassigned: '+w.title,v.owner);render();toast('Work reassigned');break}
case'reopen':{const w=W();w.status='In progress';w.logs.unshift(['Reopened · '+v.note,'Just now']);log('Work reopened: '+w.title);render();toast('Work reopened');break}
}}catch(err){db=snapshot;error(f,err.message)}finally{if(submit?.isConnected)submit.disabled=false}});
BCB_BOOT(()=>{if(CLIENT_MODE)syncClientRoute(false);render();});

function transfers(withHeader=true){const ts=state.mode==='Empty'?[]:(db.transfers||[]);return (withHeader?header('Ground transfers','Stock moves only when receipt is confirmed.'):'')+(ts.length?ts.map(t=>`<div class="card"><h3>${esc(t.title)}</h3><p>${G(t.from).short} → ${G(t.to).short}</p><div class="row"><span class="sub">${t.qty} ${esc(t.unit)}</span>${status(t.status)}</div>${t.status==='In transit'&&canEdit()?`<button class="button secondary" data-receive-transfer="${t.id}">Confirm receipt at ${G(t.to).short}</button>`:''}</div>`).join(''):empty('No transfers yet','Open a stock item and choose “Transfer to ground” to dispatch supplies.','Open inventory','inventory'))}
