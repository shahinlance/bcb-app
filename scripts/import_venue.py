"""Convert one venue's workbook + photos into BCB Grounds records.

Usage: python3 -I import_venue.py <venue_dir> <venue_id> <code> <repo_app_dir>
  venue_dir has: <name>.xlsx, got.tsv (kind \t title-or-serial \t downloaded blob name)
Writes: <venue_dir>/records.json and resized photos into <repo_app_dir>/media/<code>/.
"""
import sys, os, re, json, secrets, datetime
from openpyxl import load_workbook
from PIL import Image, ImageOps

venue_dir, venue_id, code, app_dir = sys.argv[1], int(sys.argv[2]), sys.argv[3].upper(), sys.argv[4]
BLOBS = '/tmp/claude-tool-results/0dda43a0-9f25-5310-a445-fd36b4ffe1ed'
media_rel = f'media/{code.lower()}'
media_dir = os.path.join(app_dir, media_rel)
os.makedirs(media_dir, exist_ok=True)
problems = []

# Keep photo names stable across re-imports: same source blob -> same token
token_file = os.path.join(venue_dir, 'photo_tokens.json')
tokens = json.load(open(token_file)) if os.path.exists(token_file) else {}

def save_photo(blob, max_side):
    key = f'{blob}@{max_side}'
    if key not in tokens: tokens[key] = secrets.token_hex(10)
    name = f'{tokens[key]}.jpg'
    out = os.path.join(media_dir, name)
    if not os.path.exists(out):
        im = ImageOps.exif_transpose(Image.open(os.path.join(BLOBS, blob)))
        if im.mode in ('RGBA', 'LA', 'P'):
            bg = Image.new('RGB', im.size, (255, 255, 255)); im = im.convert('RGBA'); bg.paste(im, mask=im.split()[-1]); im = bg
        im = im.convert('RGB'); im.thumbnail((max_side, max_side), Image.LANCZOS)
        im.save(out, 'JPEG', quality=80, optimize=True, progressive=True)
    return f'{media_rel}/{name}'

# ── photos index ──────────────────────────────────────────────────────
inv_photos, staff_photos = {}, {'office': {}, 'grounds': {}}
for line in open(os.path.join(venue_dir, 'got.tsv')):
    kind, title, blob = line.rstrip('\n').split('\t')
    if kind == 'inv':
        stem = os.path.splitext(title)[0].strip()
        m = re.match(r'^(\d+|pitch clay)\s*(?:\((\d+)\)|-(\d+))?$', stem, re.I)
        if not m: problems.append(f'Photo name not understood: {title}'); continue
        key = 'clay' if m.group(1).lower() == 'pitch clay' else int(m.group(1))
        order = int(m.group(2) or m.group(3) or 0)
        inv_photos.setdefault(key, []).append((order, blob))
    else:
        staff_photos[kind][int(title)] = blob

# ── value cleaning ────────────────────────────────────────────────────
def clean(v):
    if v is None: return None
    if isinstance(v, str):
        v = re.sub(r'\s+', ' ', v).strip()
        return v or None
    if isinstance(v, float) and v.is_integer(): return int(v)
    return v

def to_date(v, label, who):
    if v in (None, ''): return None
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime('%Y-%m-%d')
    m = re.match(r'^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$', str(v).strip())
    if not m: problems.append(f'{who}: {label} "{v}" is not a date'); return str(v)
    d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
    if mo > 12 and d <= 12: d, mo = mo, d  # day/month written the other way round
    try: return datetime.date(y, mo, d).strftime('%Y-%m-%d')
    except ValueError: problems.append(f'{who}: {label} "{v}" is not a real date'); return str(v)

def phone(v):
    if v is None: return None
    digits = re.sub(r'\D', '', str(v))
    if digits.startswith('880'): digits = '0' + digits[3:]
    return f'{digits[:5]} {digits[5:]}' if len(digits) == 11 and digits.startswith('01') else str(v)

def label_of(h): return re.sub(r'\s*\*\s*$', '', str(h)).strip()
HIDE = {'photo file name'}

wb = load_workbook(os.path.join(venue_dir, [f for f in os.listdir(venue_dir) if f.endswith('.xlsx')][0]), data_only=True)
def rows_of(ws):
    hdr = [c.value for c in ws[1]]
    cols = [(i, label_of(h)) for i, h in enumerate(hdr) if h not in (None, '')]
    for r in ws.iter_rows(min_row=2, values_only=True):
        rec = {lab: clean(r[i]) if i < len(r) else None for i, lab in cols}
        if any(v not in (None, '') for k, v in rec.items() if k.lower() != 'serial'):
            yield cols, rec

records = {'assets': [], 'pitchClay': [], 'staff': []}

# ── Inventory → assets ────────────────────────────────────────────────
COND_FIX = {'repair needed': 'Needs repair'}
for cols, r in rows_of(wb['Inventory']):
    serial = int(r['Serial'])
    who = f'Asset #{serial} {r.get("Item name")}'
    cond = r.get('Condition')
    if cond and cond.lower() in COND_FIX: cond = COND_FIX[cond.lower()]
    unit = r.get('Unit')
    fields = []
    for _, lab in cols:
        if lab.lower() in HIDE: continue
        v = r.get(lab); t = 'text'
        if lab == 'Condition': v = cond
        elif lab == 'Unit' and isinstance(v, str) and v.lower() == 'unit': v = 'unit'
        elif lab == 'Quantity' and v is not None: t = 'number'
        fields.append([lab, v, t])
    photos = [save_photo(b, 1400) for _, b in sorted(inv_photos.get(serial, []))]
    if not photos: problems.append(f'{who}: no photo')
    if not r.get('Group'): problems.append(f'{who}: no Group (shown under "Other")')
    records['assets'].append({
        'id': f'{code}-A-{serial:03d}', 'ground': venue_id, 'serial': serial,
        'name': r.get('Item name'), 'category': r.get('Category'), 'group': r.get('Group') or 'Other',
        'qty': r.get('Quantity'), 'unit': unit.lower() if isinstance(unit, str) and unit.lower() == 'unit' else unit,
        'condition': cond, 'brand': r.get('Brand / model'), 'photos': photos, 'fields': fields})

# ── Pitch Clay ────────────────────────────────────────────────────────
for cols, r in rows_of(wb['Pitch Clay']):
    serial = int(r['Serial'] or 1)
    fields = [[lab, r.get(lab), 'number' if isinstance(r.get(lab), (int, float)) else 'text'] for _, lab in cols if lab.lower() not in HIDE]
    present_key = next((lab for _, lab in cols if lab.lower().startswith('present')), None)
    photos = [save_photo(b, 1400) for _, b in sorted(inv_photos.get('clay', []))]
    records['pitchClay'].append({'id': f'{code}-CLAY-{serial}', 'ground': venue_id, 'serial': serial,
        'color': r.get('Clay Color'), 'present': r.get(present_key), 'photos': photos, 'fields': fields})

# ── Staff ─────────────────────────────────────────────────────────────
NID_OK = {10, 13, 17}
seen_phones = {}
for sheet, team, kind, prefix in [('Office Team', 'Office Team', 'office', 'OT'), ('Grounds Team', 'Grounds Team', 'grounds', 'GT')]:
    for cols, r in rows_of(wb[sheet]):
        serial = int(r['Serial']); name = r.get('Full name'); who = f'{team} #{serial} {name}'
        joining = to_date(r.get('Joining Date'), 'Joining Date', who)
        confirm = to_date(r.get('Confirmation Date'), 'Confirmation Date', who)
        if joining and confirm and re.match(r'\d{4}-', joining) and re.match(r'\d{4}-', confirm) and confirm < joining:
            problems.append(f'{who}: confirmed ({confirm}) before joining ({joining})')
        nid = r.get('NID Number'); nid = str(nid) if nid is not None else None
        if nid and len(re.sub(r'\D', '', nid)) not in NID_OK: problems.append(f'{who}: NID has {len(nid)} digits')
        ph = phone(r.get('Mobile number'))
        if ph: seen_phones.setdefault(ph, []).append(who)
        fields = []
        for _, lab in cols:
            if lab.lower() in HIDE: continue
            v = r.get(lab); t = 'text'
            if lab == 'Joining Date': v, t = joining, 'date'
            elif lab == 'Confirmation Date': v, t = confirm, 'date'
            elif lab == 'Mobile number': v, t = ph, 'phone'
            elif lab == 'Email': t = 'email'
            elif lab == 'NID Number': v = nid
            elif lab.lower().startswith('experience'): v = None  # calculated in the app from Joining Date
            fields.append([lab, v, t])
        blob = staff_photos[kind].get(serial)
        if not blob: problems.append(f'{who}: no photo')
        records['staff'].append({'id': f'{code}-{prefix}-{serial:02d}', 'ground': venue_id, 'team': team, 'serial': serial,
            'name': name, 'designation': r.get('Designation'), 'jobStatus': r.get('Job status'), 'joining': joining,
            'photo': save_photo(blob, 600) if blob else None, 'fields': fields})
for ph, who in seen_phones.items():
    if len(who) > 1: problems.append(f'Same mobile {ph}: ' + ' and '.join(who))

json.dump(tokens, open(token_file, 'w'), indent=0)
json.dump(records, open(os.path.join(venue_dir, 'records.json'), 'w'), ensure_ascii=False)
print({k: len(v) for k, v in records.items()}, 'photos on disk:', len(os.listdir(media_dir)),
      'MB:', round(sum(os.path.getsize(os.path.join(media_dir, f)) for f in os.listdir(media_dir)) / 1e6, 2))
print('\n'.join('• ' + p for p in problems))
