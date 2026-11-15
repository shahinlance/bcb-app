/* A real drag handle, with a separate scroll area for the form. */
const inventoryFormDrafts = new Map();
function inventoryDraftKey() { return state.scope ? 'ground:' + state.ground : 'all'; }
let sheetSequence = 0;
const sheetMetadata = new WeakMap();
function rememberInventoryDraft(sheet) {
  const f = sheet.querySelector('[data-form="add-item"]');
  if (!f) return;
  const values = {};
  for (const input of f.elements) if (input.name && !['file','submit','button'].includes(input.type)) values[input.name] = input.value;
  const widget = f.querySelector('[data-photo-upload="photo"]');
  inventoryFormDrafts.set(inventoryDraftKey(), {values, photos: widget ? structuredClone(uploadDraft(widget)) : []});
}
function clearInventoryDraft() { inventoryFormDrafts.delete(inventoryDraftKey()); }
function restoreInventoryDraft(sheet) {
  const f = sheet.querySelector('[data-form="add-item"]');
  const inventoryFormDraft = inventoryFormDrafts.get(inventoryDraftKey());
  if (!f || !inventoryFormDraft) return;
  for (const input of f.elements) if (input.name in inventoryFormDraft.values && input.type !== 'file') input.value = inventoryFormDraft.values[input.name];
  const widget = f.querySelector('[data-photo-upload="photo"]');
  if (widget) { widget._photos = structuredClone(inventoryFormDraft.photos); refreshUpload(widget); }
}
function resetSheetPosition(sheet) {
  sheet.classList.remove('sheet-dragging');
  sheet.style.transition = 'transform 200ms ease-out';
  sheet.style.transform = 'translateY(0)';
}
function closeClientSheet(sheet = document.querySelector('.client-sheet')) {
  if (!sheet || sheet.dataset.closing) return;
  if ([...sheet.querySelectorAll('form')].some(f => f._photoPending)) {
    resetSheetPosition(sheet); toast('Please wait for the photos to finish preparing.'); return;
  }
  rememberInventoryDraft(sheet);
  sheet.dataset.closing = 'true';
  sheet.classList.remove('sheet-dragging');
  const finish = () => {
    if (!sheet.isConnected) return;
    const opener = sheetMetadata.get(sheet)?.opener;
    sheet.closest('.modal-backdrop').remove();
    if (opener?.isConnected) opener.focus({preventScroll:true});
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
  sheet.style.animation = 'none';
  sheet.style.transition = 'transform 180ms ease-in';
  sheet.style.transform = `translateY(${sheet.offsetHeight + 30}px)`;
  sheet.addEventListener('transitionend', e => { if (e.target === sheet && e.propertyName === 'transform') finish(); }, {once:true});
  setTimeout(finish, 220);
}
function bindSheetDrag(sheet) {
  const handle = sheet.querySelector('[data-sheet-handle]');
  let start = null, suppressClick = false;
  handle.addEventListener('pointerdown', e => {
    if (!e.isPrimary || e.button !== 0 || sheet.dataset.closing) return;
    start = {id:e.pointerId, x:e.clientX, y:e.clientY, lastY:e.clientY, lastTime:e.timeStamp, velocity:0, distance:0};
    suppressClick = false;
    sheet.style.animation = 'none'; sheet.style.transition = 'none';
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', e => {
    if (!start || e.pointerId !== start.id) return;
    const dt = e.timeStamp - start.lastTime;
    if (dt > 0) start.velocity = (e.clientY - start.lastY) / dt;
    start.lastY = e.clientY; start.lastTime = e.timeStamp;
    start.distance = Math.max(0, e.clientY - start.y);
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) suppressClick = true;
    if (start.distance > 6) sheet.classList.add('sheet-dragging');
    sheet.style.transform = `translateY(${start.distance}px)`;
  });
  const end = (e, cancelled = false) => {
    if (!start || e.pointerId !== start.id) return;
    const drag = start; start = null;
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    const threshold = Math.min(140, sheet.offsetHeight * .22);
    const fast = drag.distance > 45 && drag.velocity > .6 && e.timeStamp - drag.lastTime < 100;
    if (!cancelled && (drag.distance > threshold || fast)) closeClientSheet(sheet);
    else resetSheetPosition(sheet);
  };
  handle.addEventListener('pointerup', e => end(e));
  handle.addEventListener('pointercancel', e => end(e, true));
  handle.addEventListener('click', e => {
    e.preventDefault();
    if (suppressClick) { suppressClick = false; return; }
    closeClientSheet(sheet);
  });
}
function showClientSheet(html) {
  const current = document.querySelector('.client-sheet');
  if (current) { rememberInventoryDraft(current); current.closest('.modal-backdrop').remove(); }
  const opener = document.activeElement;
  const titleId = 'sheet-title-' + (++sheetSequence);
  $('.phone').insertAdjacentHTML('beforeend', `<div class="modal-backdrop"><div class="modal client-sheet" role="dialog" aria-modal="true" aria-labelledby="${titleId}"><button type="button" class="sheet-handle" data-sheet-handle aria-label="Drag down or tap to close"><span></span></button><div class="sheet-scroll">${html}<button class="button secondary" data-action="close-modal">Close</button></div></div></div>`);
  const sheet = document.querySelector('.client-sheet');
  const heading = sheet.querySelector('h3');
  if (heading) heading.id = titleId; else { sheet.removeAttribute('aria-labelledby'); sheet.setAttribute('aria-label','Details'); }
  sheetMetadata.set(sheet, {opener});
  restoreInventoryDraft(sheet); bindSheetDrag(sheet);
  sheet.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const targets = [...sheet.querySelectorAll('button, input:not([type="hidden"]), select, textarea, a[href], [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
    const first = targets[0], last = targets.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  sheet.querySelector('.sheet-handle').focus({preventScroll:true});
}
