/* Inventory types lead to individual assets across the national grounds register. */
function inventoryToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const part = name => parts.find(p=>p.type===name).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
function inventoryDateValid(value) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;
  const date=new Date(value+'T00:00:00Z');
  return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
}
function inventoryDateLabel(value) {
  return inventoryDateValid(value)?new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z')):'Not recorded';
}
function inventoryEntryValues(values) {
  const title=String(values.title||'').trim(),code=String(values.code||'').trim(),addedDate=String(values.addedDate||''),inventoryOf=String(values.inventoryOf||'');
  if(!title)throw Error('Please enter an item name.');
  if(!code)throw Error('Please enter an Inventory ID.');
  if(db.inventory.some(a=>String(a.code).trim().toLowerCase()===code.toLowerCase()))throw Error('This Inventory ID already exists. Please use a unique ID.');
  if(!['NSC','BCB'].includes(inventoryOf))throw Error('Please choose NSC or BCB under Inventory of.');
  if(!inventoryDateValid(addedDate))throw Error('Please choose a valid date added.');
  return {title,code,addedDate,inventoryOf};
}
function inventoryAddItemForm() {
  return '<h3>Add inventory item</h3>'+form('add-item',
    field('Item name','title')+
    field('Inventory ID','code','text','',true,'placeholder="e.g. MIR-RL-004" autocomplete="off" maxlength="64"')+
    select('Inventory of','inventoryOf',[['','Select NSC or BCB'],'NSC','BCB'])+
    field('Date added','addedDate','date',inventoryToday())+
    '<p class="inventory-date-help">Today by default. Change the date if needed.</p>'+
    (state.scope?`<input type="hidden" name="ground" value="${state.ground}"><div class="match-ground-field"><span>Ground</span><strong>${esc(G(state.ground).short)}</strong><small>${esc(G(state.ground).name)}</small></div>`:groundSelect())+select('Category','category',['Equipment','Consumable'])+
    field('Opening quantity','qty','number','1',true,'min="0" step="any"')+
    select('Unit','unit',['units','pieces','litres','kg','bags'])+
    field('Minimum stock','min','number','0',true,'min="0"')+
    photoUpload('photo','Machine / item photos',[],demoImage('machine-roller','Demo equipment reference')),'Add item');
}
const inventoryTypes = [
  {id:'rollers',title:'Rollers',singular:'roller',image:'machine-roller',pattern:/roller/i},
  {id:'mowers',title:'Mowers',singular:'mower',image:'machine-mower',pattern:/mower/i},
  {id:'covers',title:'Covers',singular:'cover',image:'ground-bogura',pattern:/cover/i},
  {id:'pumps',title:'Water pumps',singular:'pump',image:'machine-pump',pattern:/pump/i},
  {id:'oil',title:'Hydraulic oil',singular:'oil',symbol:'box',pattern:/oil/i},
  {id:'fertiliser',title:'Fertilisers',singular:'fertiliser',symbol:'leaf',pattern:/fertilis|fertiliz/i},
  {id:'seed',title:'Grass seed',singular:'seed',symbol:'leaf',pattern:/seed/i},
  {id:'sprinklers',title:'Sprinklers',singular:'sprinkler',symbol:'settings',pattern:/sprinkler/i}
];
function inventoryType(a) {
  return inventoryTypes.find(t=>t.id===a.inventoryGroup)||inventoryTypes.find(t=>t.pattern.test(a.title))||{
    id:'custom-'+a.type.toLowerCase()+'-'+a.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    title:a.title,singular:a.title.toLowerCase(),symbol:a.type==='Equipment'?'settings':'box'
  };
}
function prepareInventoryGroups() {
  const plan=[[1,'MIR',3],[2,'CTG',3],[3,'SYL',3],[4,'FAT',2],[5,'KHU',3],[6,'BOG',2],[7,'COX',2],[8,'RAJ',2]];
  const additions=[];let id=9001;
  for(const [ground,prefix,count] of plan)for(let n=1;n<=count;n++){
    if(ground===1&&n===1)continue;
    additions.push({id:id++,title:(n===1?'Main pitch roller':'Pitch roller '+String(n).padStart(2,'0')),inventoryGroup:'rollers',ground,type:'Equipment',condition:'Operational',qty:1,unit:'unit',min:0,code:prefix+'-RL-'+String(n).padStart(3,'0'),demo:true});
  }
  const faults=[
    {id:9401,code:'SYL-RL-002',title:'Roller drum bearing worn',component:'Front drum bearing',symptoms:'A grinding noise and excess play were reported at the front drum.',impact:'Rolling is paused until the bearing is inspected and replaced.',repair:'Inspect the drum bearing, replace the worn bearing and complete a supervised test run.',parts:[{name:'Drum bearing',qty:1,unit:'pieces'}]},
    {id:9402,code:'RAJ-RL-001',title:'Roller engine stalls under load',component:'Fuel filter and fuel supply',symptoms:'The engine stalls when rolling starts under load.',impact:'This roller is unavailable for preparation until the fault is confirmed.',repair:'Inspect fuel supply and the filter, confirm the cause and test operation under load.',parts:[]}
  ];
  for(const target of [seed,db]){
    if(target.inventoryGroupSchema===1)continue;
    for(const a of additions)if(!target.inventory.some(x=>x.code===a.code||x.id===a.id))target.inventory.push(structuredClone(a));
    for(const fault of faults){
      const a=target.inventory.find(x=>x.code===fault.code);if(!a||!a.demo)continue;
      if(!target.issues.some(i=>i.id===fault.id))target.issues.push({id:fault.id,title:fault.title,ground:a.ground,asset:a.id,location:'Grounds equipment bay',category:'Machinery',urgency:'High',component:fault.component,symptoms:fault.symptoms,impact:fault.impact,availability:'Out of service',repair:fault.repair,parts:structuredClone(fault.parts),work:null,reported:'Demo inspection · 18 Oct',reporter:grounds.find(g=>g.id===a.ground).admin,diagnosis:'Demo fault · inspection required'});
      a.condition='Needs repair';
    }
    target.inventoryGroupSchema=1;
  }
}
function inventoryInScope() { return state.mode==='Empty'?[]:db.inventory.filter(a=>!state.scope||a.ground===state.ground); }
function inventoryGroups(items=inventoryInScope()) {
  const groups=new Map();
  for(const a of items){const t=inventoryType(a);if(!groups.has(t.id))groups.set(t.id,{...t,items:[]});groups.get(t.id).items.push(a);}
  return [...groups.values()].sort((a,b)=>{
    const ai=inventoryTypes.findIndex(t=>t.id===a.id),bi=inventoryTypes.findIndex(t=>t.id===b.id);
    return (ai<0?99:ai)-(bi<0?99:bi)||a.title.localeCompare(b.title);
  });
}
function inventoryNeedsRepair(a) { return a.type==='Equipment'&&assetCondition(a)==='Needs repair'; }
function inventoryLowStock(a) { return a.type==='Consumable'&&a.qty<a.min; }
function inventoryQuantity(items) {
  const quantities=new Map();
  for(const a of items){const unit=/^units?$/.test(a.unit)?'units':/^pieces?$/.test(a.unit)?'pieces':a.unit;quantities.set(unit,(quantities.get(unit)||0)+Number(a.qty||0));}
  return [...quantities].map(([unit,qty])=>({qty,unit:qty===1&&['units','pieces'].includes(unit)?unit.slice(0,-1):unit}));
}
function quantityText(items) { return inventoryQuantity(items).map(q=>new Intl.NumberFormat('en-GB').format(q.qty)+' '+q.unit).join(' · '); }
function inventoryGroupImage(group) {
  const own=group.items.map(a=>normalisePhotos(a)[0]).find(Boolean);
  const photo=own||(group.image?demoImage(group.image,'Equipment type reference'):null);
  return photo?`<img src="${esc(photo.src)}" alt="${esc(group.title)} ${photo.demo?'reference photo':'photo'}" loading="lazy">`:icon(group.symbol||'box');
}
function inventoryMetric(value,label,symbol,filter='') {
  return summaryMetric(value,label,symbol,{tag:filter?'button':'div',attributes:filter?`data-inventory-metric="${esc(filter)}"`:''});
}
function inventoryGroupCard(group) {
  const repair=group.items.filter(inventoryNeedsRepair).length,low=group.items.filter(inventoryLowStock).length;
  const groundsCount=new Set(group.items.map(a=>a.ground)).size;
  return `<button class="inventory-group-card" data-inventory-group="${esc(group.id)}" aria-label="${esc(group.title)} · ${esc(quantityText(group.items))} · ${groundsCount} ${groundsCount===1?'ground':'grounds'}${repair?' · '+repair+' need repair':''}">
    <div class="inventory-group-top"><div class="inventory-group-thumb">${inventoryGroupImage(group)}</div><div class="grow"><strong>${esc(group.title)}</strong><small>${state.scope?esc(G(state.ground).short):'Across '+groundsCount+' '+(groundsCount===1?'ground':'grounds')}</small><span class="inventory-group-quantity">${esc(quantityText(group.items))}</span></div>${icon('chevron','chev')}</div>
    <div class="inventory-group-foot">${repair?`<span class="inventory-group-warning">${icon('settings')}${repair} ${repair===1?'item needs':'items need'} repair</span>`:low?`<span class="inventory-group-warning">${icon('alert')}${low} low-stock ${low===1?'record':'records'}</span>`:`<span class="inventory-group-ok">${icon('check')}${group.items[0].type==='Equipment'?'No repair issue reported':'Stock available'}</span>`}<span>View ${group.items[0].type==='Equipment'?'items':'stock'}${icon('arrow')}</span></div>
  </button>`;
}
function inventoryRegister(withHeader=true) {
  const items=inventoryInScope(),groups=inventoryGroups(items);
  const matching=groups.filter(g=>(state.invFilter==='All'||state.invFilter==='Equipment'&&g.items.some(a=>a.type==='Equipment')||state.invFilter==='Consumable'&&g.items.some(a=>a.type==='Consumable')||state.invFilter==='Needs repair'&&g.items.some(inventoryNeedsRepair)||state.invFilter==='Low stock'&&g.items.some(inventoryLowStock))&&g.title.toLowerCase().includes(state.search.toLowerCase()));
  return (withHeader?header('Inventory',state.scope?G(state.ground).short:'Equipment and supplies, grouped by type.'):'')+(state.scope?groundTabs('ground-inventory'):'')+
    `<div class="inventory-register-action">${canEdit()?'<button class="textbtn" data-action="add-item">'+icon('plus')+' Add inventory item</button>':''}</div><div class="summary-metrics summary-metrics--inventory">${inventoryMetric(groups.length,'Item types','box','All')}${inventoryMetric(items.filter(inventoryNeedsRepair).length,'Needs repair','settings','Needs repair')}${inventoryMetric(items.filter(inventoryLowStock).length,'Low stock','alert','Low stock')}</div>
    <div class="filters">${['All','Equipment','Consumable','Needs repair','Low stock'].map(f=>`<button class="filter ${state.invFilter===f?'active':''}" data-inv-filter="${f}">${f}</button>`).join('')}</div>${searchBox('Search item types')}
    <div class="inventory-list-caption"><span>${matching.length} item ${matching.length===1?'type':'types'}</span><span>Tap a type to see every item</span></div>
    ${matching.length?matching.map(inventoryGroupCard).join(''):`<div class="empty"><div class="symbol">${icon('box')}</div><h3>No matching item types</h3><p>Try another type or clear the current filters.</p><button class="button secondary" data-clear-inventory>Clear filters</button></div>`}`;
}
function currentInventoryGroup() { return inventoryGroups().find(g=>g.id===state.inventoryGroup); }
function inventoryMemberRow(a) {
  const issue=openIssues().find(i=>i.asset===a.id),condition=a.type==='Equipment'?assetCondition(a):inventoryLowStock(a)?'Low stock':'Available';
  return `<button class="inventory-member" data-asset="${a.id}" aria-label="${esc(G(a.ground).short)} · ${esc(a.code)} · ${esc(condition)}">
    <div class="inventory-member-top"><div class="inventory-member-thumb">${mediaThumbnail('asset',a.id)||icon(a.type==='Equipment'?'settings':'box')}</div><div class="grow"><strong>${esc(a.title)}</strong><small>${esc(G(a.ground).short)} · ${esc(a.code)}</small><span class="inventory-member-status">${status(condition)}<span>${a.qty} ${esc(a.unit)}</span></span></div>${icon('chevron','chev')}</div>
    ${issue?`<div class="inventory-member-fault">${icon('alert')}<div><strong>${esc(issue.component)}</strong><span>${esc(issue.title)}</span></div></div>`:''}
  </button>`;
}
function inventoryGroupPage() {
  const group=currentInventoryGroup();
  if(!group)return header('Item group')+empty('No items in this group','Return to inventory to choose another item type.','Open inventory','inventory');
  const all=group.items,isEquipment=all[0].type==='Equipment',repairs=all.filter(inventoryNeedsRepair).length,low=all.filter(inventoryLowStock).length,groundCount=new Set(all.map(a=>a.ground)).size;
  const qty=inventoryQuantity(all),total=qty.length===1?qty[0].qty:all.length,totalLabel=qty.length===1&&group.items[0].type==='Equipment'?'Total '+qty[0].unit:qty.length===1?qty[0].unit+' in stock':'Stock records';
  const list=all.filter(a=>(state.groupGround==='All'||a.ground===+state.groupGround)&&(state.groupCondition==='All'||state.groupCondition==='Needs repair'&&inventoryNeedsRepair(a)||state.groupCondition==='Low stock'&&inventoryLowStock(a)||assetCondition(a)===state.groupCondition)&&[a.title,a.code,G(a.ground).name,G(a.ground).short,openIssues().find(i=>i.asset===a.id)?.component||''].join(' ').toLowerCase().includes(state.search.toLowerCase())).sort((a,b)=>Number(inventoryNeedsRepair(b))-Number(inventoryNeedsRepair(a))||G(a.ground).priority-G(b.ground).priority||a.code.localeCompare(b.code));
  const inGroup=new Set(all.map(a=>a.ground));
  return header(esc(group.title),state.scope?G(state.ground).name:'Every registered item, across Bangladesh.','Inventory')+
    `<div class="summary-metrics summary-metrics--inventory group-metrics">${inventoryMetric(total,totalLabel,'box','')}${inventoryMetric(isEquipment?repairs:low,isEquipment?'Needs repair':'Low stock',isEquipment?'settings':'alert','')}${inventoryMetric(groundCount,'Grounds','ground','')}</div>
    <div class="inventory-group-filters"><label>Ground<select data-inventory-filter="groupGround" aria-label="Filter items by ground"><option value="All">${state.scope?'This ground':'All grounds'}</option>${grounds.filter(g=>inGroup.has(g.id)).map(g=>`<option value="${g.id}" ${String(state.groupGround)===String(g.id)?'selected':''}>${esc(g.short)}</option>`).join('')}</select></label><label>Condition<select data-inventory-filter="groupCondition" aria-label="Filter items by condition">${['All',...(group.items.some(a=>a.type==='Equipment')?['Needs repair','Operational','Under maintenance']:['Low stock','Available'])].map(s=>`<option value="${s}" ${state.groupCondition===s?'selected':''}>${s==='All'?'All conditions':s}</option>`).join('')}</select></label></div>
    ${searchBox('Search ground or asset ID')}<div class="inventory-list-caption"><span>${list.length} of ${all.length} ${all[0].type==='Equipment'?'items':'stock records'}</span><span>${isEquipment?'Repair issues shown first':'Stock levels by ground'}</span></div>
    ${list.length?list.map(inventoryMemberRow).join(''):`<div class="empty"><div class="symbol">${icon('search')}</div><h3>No matching items</h3><p>Try another ground, condition or asset ID.</p><button class="button secondary" data-clear-inventory>Clear filters</button></div>`}`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.inventoryGroup){go('inventory-group',{inventoryGroup:b.dataset.inventoryGroup,groupGround:'All',groupCondition:['Needs repair','Low stock'].includes(state.invFilter)?state.invFilter:'All'});return;}
  if(b.dataset.inventoryMetric){state.invFilter=b.dataset.inventoryMetric;state.search='';render();return;}
  if(b.dataset.clearInventory!==undefined){Object.assign(state,{invFilter:'All',groupGround:'All',groupCondition:'All',search:''});render();}
});
document.addEventListener('change',e=>{if(e.target.dataset.inventoryFilter){state[e.target.dataset.inventoryFilter]=e.target.value;render();}});

function groundInventoryItems() {
  return state.mode === 'Empty' ? [] : db.inventory.filter(a => a.ground === state.ground);
}
function groundInventory() {
  const g = G(state.ground), items = groundInventoryItems(), query = state.search.trim().toLowerCase();
  const list = items.filter(a => (state.invFilter === 'All' || a.type === state.invFilter || state.invFilter === 'Needs repair' && inventoryNeedsRepair(a) || state.invFilter === 'Low stock' && inventoryLowStock(a)) && [a.title, a.code].join(' ').toLowerCase().includes(query))
    .sort((a,b) => Number(inventoryNeedsRepair(b)) - Number(inventoryNeedsRepair(a)) || a.title.localeCompare(b.title) || a.code.localeCompare(b.code));
  return header(g.short, esc(g.name), 'Grounds') + groundTabs('ground-inventory') +
    `<div class="summary-metrics summary-metrics--inventory ground-inventory-metrics">${inventoryMetric(items.length,'Items','box','All')}${inventoryMetric(items.filter(inventoryNeedsRepair).length,'Needs repair','settings','Needs repair')}${inventoryMetric(items.filter(inventoryLowStock).length,'Low stock','alert','Low stock')}</div>
    <div class="ground-inventory-heading"><h2>Inventory items</h2>${canEdit()?`<button class="textbtn" data-action="add-item">${icon('plus')}Add item</button>`:''}</div>
    ${searchBox('Search item name or Inventory ID')}
    <div class="ground-inventory-filter"><span>${list.length} of ${items.length} items</span><label>Show<select data-ground-inventory-filter aria-label="Filter ground inventory">${[['All','All items'],['Equipment','Equipment'],['Consumable','Consumables'],['Needs repair','Needs repair'],['Low stock','Low stock']].map(([value,label])=>`<option value="${value}" ${state.invFilter===value?'selected':''}>${label}</option>`).join('')}</select></label></div>
    <div class="ground-inventory-list" aria-label="Inventory at ${esc(g.short)}">${list.length?list.map(inventoryMemberRow).join(''):items.length?`<div class="empty"><div class="symbol">${icon('search')}</div><h3>No matching items</h3><p>Try another item name, Inventory ID or filter.</p><button class="button secondary" data-clear-inventory>Clear filters</button></div>`:`<div class="empty"><div class="symbol">${icon('box')}</div><h3>No inventory recorded</h3><p>Items added to ${esc(g.short)} will appear here.</p></div>`}</div>`;
}
document.addEventListener('change',e=>{
  if(e.target.dataset.groundInventoryFilter === undefined)return;
  state.invFilter = e.target.value;
  render();
});
