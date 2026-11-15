// Fixture times are recorded in Bangladesh time, independent of the device zone.
function matchInstant(value) {
  return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value || '') ? value : value + '+06:00').getTime();
}
function matchPhase(match, now = Date.now()) {
  if (match.status === 'Cancelled') return 'Cancelled';
  if (matchInstant(match.end) <= now) return 'Ended';
  return matchInstant(match.start) <= now ? 'Running' : 'Upcoming';
}
function groundMatchRecords(view, now = Date.now()) {
  if (state.mode === 'Empty') return [];
  return db.matches.filter(m => m.ground === state.ground &&
    (view === 'History' ? ['Ended', 'Cancelled'].includes(matchPhase(m, now)) : matchPhase(m, now) === view))
    .sort((a, b) => view === 'History' ? matchInstant(b.start) - matchInstant(a.start) : matchInstant(a.start) - matchInstant(b.start));
}
function matchDateTime(value) {
  return new Date(matchInstant(value)).toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  });
}
function groundFixtureCard(m, now) {
  const phase = matchPhase(m, now);
  return `<article class="ground-fixture"><div class="ground-fixture-phase ${phase.toLowerCase()}">${icon(phase === 'Running' ? 'activity' : 'match')}<span>${phase==='Running'?'Ongoing':phase}</span></div>${matchCard(m)}<div class="ground-fixture-end">${phase === 'Ended' ? 'Ended' : phase === 'Cancelled' ? 'Scheduled end' : 'Ends'} ${matchDateTime(m.end)} · BST</div></article>`;
}
function groundMatchSection(view, list, now) {
  const title = view === 'Running' ? 'Ongoing' : view === 'History' ? 'Recent' : 'Upcoming';
  const emptyText = view === 'Running' ? 'No ongoing match.' : view === 'History' ? 'No recent matches recorded.' : 'No upcoming match scheduled.';
  return `<section class="ground-match-section" aria-labelledby="ground-${view.toLowerCase()}-heading"><div class="ground-match-section-heading"><h2 id="ground-${view.toLowerCase()}-heading">${title}</h2><span>${list.length}</span></div>${list.length ? list.map(m => groundFixtureCard(m, now)).join('') : `<div class="ground-match-empty">${icon(view === 'Running' ? 'activity' : 'match')}<p>${emptyText}</p></div>`}</section>`;
}
function groundMatches(){const g=G(state.ground),now=Date.now();return header(g.short,esc(g.name),'Grounds')+groundTabs('ground-matches')+groundMatchSection('Running',groundMatchRecords('Running',now),now)+groundMatchSection('History',groundMatchRecords('History',now).filter(m=>m.status!=='Cancelled'),now)+groundMatchSection('Upcoming',groundMatchRecords('Upcoming',now),now)+(isSuper()?'<button class="button" data-go="add-match">Add match</button>':'')+((db.matches||[]).some(m=>m.ground===g.id&&m.status==='Cancelled')?section('Cancelled')+db.matches.filter(m=>m.ground===g.id&&m.status==='Cancelled').map(m=>groundFixtureCard(m,now)).join(''):'');}
function toggleGroundMatchHistory() {
  const scroll = $('.appbody')?.scrollTop || 0;
  state.groundMatchHistory = !state.groundMatchHistory;
  render();
  if ($('.appbody')) $('.appbody').scrollTop = scroll;
  $('#ground-match-history-toggle')?.focus({ preventScroll: true });
}
function matchDefaultTimes(now = Date.now()) {
  const toInput = time => new Date(time + 6 * 3600000).toISOString().slice(0, 16);
  const start = state.day && !state.scope ? matchInstant(`${state.year}-${String(state.month + 1).padStart(2, '0')}-${String(state.day).padStart(2, '0')}T14:00`) : Math.ceil((now + 3600000) / 1800000) * 1800000;
  return { start: toInput(start), end: toInput(start + 8 * 3600000) };
}
function validateMatchTiming(values) {
  if (!grounds.some(g => g.id === +values.ground)) throw Error('Choose a valid ground.');
  if (state.scope && +values.ground !== state.ground) throw Error('This fixture must stay at the selected ground.');
  const start = matchInstant(values.start), end = matchInstant(values.end);
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw Error('Enter a valid start and end date.');
  if (end <= start) throw Error('End time must be later than the start time.');
}
function findMatchConflict(values, excludeId = null) {
  return db.matches.find(m => m.id !== excludeId && m.ground === +values.ground && m.status !== 'Cancelled' &&
    matchInstant(values.start) < matchInstant(m.end) && matchInstant(values.end) > matchInstant(m.start));
}
function finishMatchForm(match) {
  if (state.editMatch && state.history.at(-1)?.screen === 'match' && state.history.at(-1).match === match.id) {
    back();
    return;
  }
  Object.assign(state, { match: match.id, ground: match.ground, editMatch: false, screen: 'match', search: '' });
  // Replace the saved form so Back returns to the originating fixture list.
  if (CLIENT_MODE) syncClientRoute(false);
  render();
}

function matchPreparation(match) {
  const checks=Array.isArray(match.checks)?match.checks:[],done=checks.filter(c=>c[1]).length;
  const percent=checks.length?Math.round(done/checks.length*100):0;
  const current=!['Cancelled','Ended'].includes(matchPhase(match));
  const issues=current?openIssues().filter(i=>i.ground===match.ground&&i.urgency==='Urgent'):[];
  const works=current?activeWork().filter(w=>w.ground===match.ground&&w.priority==='Critical'&&!issues.some(i=>i.work===w.id)):[];
  const blockers=issues.length+works.length;
  const tone=match.status==='Cancelled'?'cancelled':blockers||percent<40?'danger':percent===100?'ready':'progress';
  const label=match.status==='Cancelled'?'Cancelled':blockers?'Blocked':!checks.length?'Checklist needed':percent===100?'Preparation complete':matchPhase(match)==='Ended'?'Recorded preparation':percent<40?'Needs preparation':percent<80?'In preparation':'Nearly ready';
  return {done,total:checks.length,percent,blockers,tone,label};
}
function matchPreparationMeter(match) {
  const p=matchPreparation(match);
  return `<div class="match-preparation ${p.tone}${p.blockers?' has-blocker':''}" style="--prep-percent:${p.percent}%"><div class="match-preparation-heading"><span>Preparation</span><strong>${p.percent}<small>%</small></strong></div><div class="match-preparation-track" role="progressbar" aria-label="Preparation checklist" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}" aria-valuetext="${p.done} of ${p.total} checks complete${p.blockers?', '+p.blockers+(p.blockers===1?' blocker remains':' blockers remain'):''}"><span class="match-preparation-remaining"></span><i class="match-preparation-marker">${p.tone==='ready'?icon('check'):''}</i></div><div class="match-preparation-caption"><span class="match-preparation-state">${p.label}</span><span>${p.blockers?p.blockers+' '+(p.blockers===1?'blocker':'blockers'):p.done+' of '+p.total+' checks'}</span></div></div>`;
}
function calendarToday(now=Date.now()) {
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date(now));
  const get=name=>+parts.find(p=>p.type===name).value;
  return {year:get('year'),month:get('month')-1,day:get('day')};
}
function calendarDate(year,month,day) { return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; }
function calendarRecords(day=null) {
  if(state.mode==='Empty')return [];
  const start=matchInstant(calendarDate(state.year,state.month,day||1)+'T00:00');
  const next=new Date(Date.UTC(state.year,state.month+(day?0:1),day?day+1:1));
  const end=matchInstant(calendarDate(next.getUTCFullYear(),next.getUTCMonth(),next.getUTCDate())+'T00:00');
  return db.matches.filter(m=>(!state.scope||m.ground===state.ground)&&matchInstant(m.start)<end&&matchInstant(m.end)>start).sort((a,b)=>matchInstant(a.start)-matchInstant(b.start));
}
function calendarMonthLabel(year=state.year,month=state.month) {
  return new Date(Date.UTC(year,month,1)).toLocaleDateString('en-GB',{timeZone:'UTC',month:'long',year:'numeric'});
}
function matchCalendarPage() {
  const today=calendarToday(),monthLabel=calendarMonthLabel(),monthMatches=calendarRecords(),list=state.day?calendarRecords(state.day):monthMatches;
  const days=new Date(Date.UTC(state.year,state.month+1,0)).getUTCDate(),offset=(new Date(Date.UTC(state.year,state.month,1)).getUTCDay()+6)%7;
  const todayInMonth=today.month===state.month&&today.year===state.year;
  const focus=state.calendarFocus?.startsWith(calendarDate(state.year,state.month,1).slice(0,7))?+state.calendarFocus.slice(-2):state.day||(todayInMonth?today.day:1);
  const selectedLabel=state.day?new Date(Date.UTC(state.year,state.month,state.day)).toLocaleDateString('en-GB',{timeZone:'UTC',weekday:'short',day:'numeric',month:'long'}):'Scheduled matches';
  return header('Match calendar',state.scope?G(state.ground).short:'Plan ahead. Be ready for every fixture.')+(state.scope?groundTabs('ground-matches'):'')+
    `<section class="match-calendar" aria-label="Match date selector"><div class="match-calendar-toolbar"><button class="calendar-month-title" data-calendar-picker aria-label="Choose month, ${monthLabel}" aria-haspopup="dialog"><strong>${monthLabel}</strong>${icon('chevron')}</button><button class="calendar-today" data-calendar-today>Today</button><button class="calendar-month-arrow" data-month="-1" aria-label="Previous month">${icon('back')}</button><button class="calendar-month-arrow" data-month="1" aria-label="Next month">${icon('chevron')}</button></div><div class="match-calendar-weekdays" aria-hidden="true">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>'<span>'+d+'</span>').join('')}</div><div class="match-calendar-grid" role="group" aria-label="${monthLabel} dates">${'<span class="calendar-blank"></span>'.repeat(offset)}${Array.from({length:days},(_,n)=>{
      const day=n+1,date=calendarDate(state.year,state.month,day),events=calendarRecords(day),isToday=todayInMonth&&day===today.day,selected=state.day===day;
      return `<button class="calendar-date${isToday?' is-today':''}${selected?' is-selected':''}${events.length?' has-fixtures':''}" data-day="${day}" data-date="${date}" aria-pressed="${selected}" ${isToday?'aria-current="date"':''} tabindex="${focus===day?0:-1}" aria-label="${day} ${monthLabel}${isToday?', today':''}, ${events.length} ${events.length===1?'fixture':'fixtures'}"><span>${day}</span>${events.length?`<i class="calendar-event-marker">${events.length>1?events.length:''}</i>`:''}</button>`;
    }).join('')}${'<span class="calendar-blank"></span>'.repeat((7-(offset+days)%7)%7)}</div><div class="match-calendar-key"><span>${monthMatches.length} ${monthMatches.length===1?'fixture':'fixtures'} this month</span><span><i></i>Match day</span></div></section>
    <div class="calendar-list-heading"><div aria-live="polite"><h2>${selectedLabel}</h2><span>${list.length} ${list.length===1?'fixture':'fixtures'} · Bangladesh time</span></div>${isSuper()?`<button class="button small" data-go="add-match">${icon('plus')}Add match</button>`:''}</div>${state.day?'<button class="calendar-clear-selection" data-action="clear-day">Show all dates'+icon('chevron')+'</button>':''}
    <div class="calendar-fixtures">${list.length?list.map(matchCard).join(''):empty(state.day?'No fixtures on this date':'No fixtures this month','Add the next fixture when its date is confirmed.',isSuper()?'Add match':'','add-match')}</div>`;
}
function calendarRender(focusSelector='') {
  const scroll=$('.appbody')?.scrollTop||0;render();
  if($('.appbody'))$('.appbody').scrollTop=scroll;
  if(focusSelector)$(focusSelector)?.focus({preventScroll:true});
}
function calendarChangeMonth(delta) {
  const date=new Date(Date.UTC(state.year,state.month+delta,1));
  Object.assign(state,{year:date.getUTCFullYear(),month:date.getUTCMonth(),day:null,calendarFocus:null});
  calendarRender(`[data-month="${delta}"]`);
}
function calendarSelectDay(day) {
  state.day=state.day===day?null:day;state.calendarFocus=calendarDate(state.year,state.month,day);
  calendarRender(`[data-day="${day}"]`);
}
function calendarClearDay() { state.day=null;calendarRender('.calendar-today'); }
let calendarPickerYear;
function calendarPickerContent() {
  return `<div class="calendar-picker-year"><button class="icon-btn" data-calendar-year="-1" aria-label="Previous year">${icon('back')}</button><strong>${calendarPickerYear}</strong><button class="icon-btn" data-calendar-year="1" aria-label="Next year">${icon('chevron')}</button></div><div class="calendar-picker-months">${Array.from({length:12},(_,month)=>{const label=new Date(Date.UTC(2026,month,1)).toLocaleDateString('en-GB',{month:'short',timeZone:'UTC'}),selected=calendarPickerYear===state.year&&month===state.month;return `<button data-calendar-pick="${month}" aria-pressed="${selected}" class="${selected?'selected':''}" aria-label="${label} ${calendarPickerYear}">${label}</button>`;}).join('')}</div>`;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.calendarPicker!==undefined){calendarPickerYear=state.year;showModal('<h3>Choose month</h3><div class="calendar-month-picker">'+calendarPickerContent()+'</div>');const close=$('.client-sheet .sheet-scroll > [data-action="close-modal"]');if(close)close.textContent='Cancel';return;}
  if(b.dataset.calendarYear){calendarPickerYear+=+b.dataset.calendarYear;$('.calendar-month-picker').innerHTML=calendarPickerContent();$(`[data-calendar-year="${b.dataset.calendarYear}"]`)?.focus();return;}
  if(b.dataset.calendarPick!==undefined){Object.assign(state,{year:calendarPickerYear,month:+b.dataset.calendarPick,day:null,calendarFocus:null});calendarRender('.calendar-month-title');return;}
  if(b.dataset.calendarToday!==undefined){const today=calendarToday();Object.assign(state,{year:today.year,month:today.month,day:today.day,calendarFocus:calendarDate(today.year,today.month,today.day)});calendarRender(`[data-day="${today.day}"]`);}
});
document.addEventListener('keydown',e=>{
  const button=e.target.closest('[data-date]');if(!button||state.screen!=='matches')return;
  const key=e.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(key))return;
  e.preventDefault();const date=new Date(button.dataset.date+'T12:00:00Z');
  if(key==='PageUp'||key==='PageDown'){
    const day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+(key==='PageUp'?-1:1));date.setUTCDate(Math.min(day,new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate()));
  }else{const weekday=(date.getUTCDay()+6)%7,step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-weekday,End:6-weekday}[key];date.setUTCDate(date.getUTCDate()+step);}
  const changed=date.getUTCFullYear()!==state.year||date.getUTCMonth()!==state.month;
  Object.assign(state,{year:date.getUTCFullYear(),month:date.getUTCMonth(),calendarFocus:calendarDate(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())});if(changed)state.day=null;
  calendarRender(`[data-date="${state.calendarFocus}"]`);
});
