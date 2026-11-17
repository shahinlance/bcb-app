import json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment

OUT = '/home/claude/forms/BCB-Grounds-Venue-Data-Form.xlsx'
venues = [v[0] for v in json.load(open('/home/claude/forms/venues.json'))]

GREEN = '086747'
F = 'Arial'
font = lambda **k: Font(name=F, **k)
fill = lambda c: PatternFill('solid', start_color=c, end_color=c)
HEAD, INPUT, EXAMPLE, SOFT = fill(GREEN), fill('FFF8D6'), fill('EDEDED'), fill('E8F3EC')
thin = Side(style='thin', color='D0D7D3')
box = Border(left=thin, right=thin, top=thin, bottom=thin)
wrap = Alignment(wrap_text=True, vertical='top')

LISTS = {
    'Venues': venues,
    'Category': ['Equipment', 'Consumable'],
    'Group': ['Rollers', 'Mowers', 'Covers', 'Water pumps', 'Hydraulic oil', 'Fertilisers', 'Grass seed', 'Sprinklers', 'Other'],
    'Unit': ['unit', 'pieces', 'sets', 'rolls', 'metres', 'litres', 'kg', 'bags'],
    'Condition': ['Operational', 'Under maintenance', 'Needs repair', 'Available'],
    'InventoryOf': ['BCB', 'NSC'],
    'Designation': ['Head of Turf Management', 'Curator', 'Deputy Curator', 'Assistant Curator', 'Head Groundsman', 'Groundsman'],
    'JobStatus': ['Permanent', 'Contractual', 'Casual'],
    'Division': ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'],
    'StaffStatus': ['Active', 'On leave', 'Inactive'],
}

wb = Workbook()

# ── Lists (hidden) ─────────────────────────────────────────────
ls = wb.create_sheet('Lists')
ref = {}
for col, (name, items) in enumerate(LISTS.items(), start=1):
    c = ls.cell(row=1, column=col, value=name); c.font = font(bold=True)
    for r, v in enumerate(items, start=2):
        ls.cell(row=r, column=col, value=v).font = font()
    L = ls.cell(row=1, column=col).column_letter
    ref[name] = f"Lists!${L}$2:${L}${len(items) + 1}"
ls.sheet_state = 'hidden'

def dv_list(ws, key, rng, prompt):
    dv = DataValidation(type='list', formula1=ref[key], allow_blank=True, showDropDown=False)
    dv.error = 'Please choose from the list.'; dv.errorTitle = 'Not in list'
    dv.prompt = prompt; dv.promptTitle = 'Choose from the list'
    dv.showErrorMessage = True; dv.showInputMessage = True
    ws.add_data_validation(dv); dv.add(rng)

def dv_date(ws, rng):
    dv = DataValidation(type='date', operator='between', formula1='DATE(1980,1,1)', formula2='DATE(2035,12,31)', allow_blank=True)
    dv.error = 'Enter a date, e.g. 15-01-2024.'; dv.errorTitle = 'Date needed'; dv.showErrorMessage = True
    ws.add_data_validation(dv); dv.add(rng)

def dv_number(ws, rng, whole=False, maxv=100000):
    dv = DataValidation(type='whole' if whole else 'decimal', operator='between', formula1='0', formula2=str(maxv), allow_blank=True)
    dv.error = 'Enter a number (0 or more).'; dv.errorTitle = 'Number needed'; dv.showErrorMessage = True
    ws.add_data_validation(dv); dv.add(rng)

# ── Shared table builder ───────────────────────────────────────
def build_table(ws, title, subtitle, cols, example, n_rows):
    ws['A1'] = title; ws['A1'].font = font(bold=True, size=14, color=GREEN)
    ws['A2'] = subtitle; ws['A2'].font = font(size=10, color='555555')
    ws.row_dimensions[3].height = 42
    first, last = 5, 4 + n_rows
    for i, (head, width, note, _) in enumerate(cols, start=1):
        c = ws.cell(row=3, column=i, value=head)
        c.font = font(bold=True, color='FFFFFF', size=10); c.fill = HEAD; c.alignment = Alignment(wrap_text=True, vertical='center'); c.border = box
        if note: c.comment = Comment(note, 'BCB Grounds')
        ws.column_dimensions[c.column_letter].width = width
        e = ws.cell(row=4, column=i, value=example[i - 1])
        e.font = font(italic=True, color='666666', size=10); e.fill = EXAMPLE; e.border = box; e.alignment = wrap
        for r in range(first, last + 1):
            d = ws.cell(row=r, column=i); d.fill = INPUT; d.border = box; d.font = font(size=10); d.alignment = wrap
    ws.freeze_panes = 'B5'
    return first, last

# ── Start here ─────────────────────────────────────────────────
st = wb.active; st.title = 'Start here'
st.column_dimensions['A'].width = 30; st.column_dimensions['B'].width = 46; st.column_dimensions['C'].width = 4
st['A1'] = 'BCB Grounds · Venue data form'; st['A1'].font = font(bold=True, size=16, color=GREEN)
st['A2'] = 'Please fill this in for ONE venue and send it back with the photos.'; st['A2'].font = font(size=11, color='444444')

st['A4'] = 'About this venue'; st['A4'].font = font(bold=True, size=12)
fields = [('Venue *', 'Choose from the list'), ('Filled in by (full name) *', ''), ('Designation', ''), ('Mobile number', ''), ('Date filled in', '')]
for i, (label, ph) in enumerate(fields, start=5):
    a = st.cell(row=i, column=1, value=label); a.font = font(bold=True, size=10)
    b = st.cell(row=i, column=2, value=None); b.fill = INPUT; b.border = box; b.font = font(size=11)
dv_list(st, 'Venues', 'B5', 'Choose your venue.')
st['B8'].number_format = '@'
st['B9'].number_format = 'DD-MM-YYYY'; dv_date(st, 'B9')

st['A11'] = 'Summary (fills in automatically)'; st['A11'].font = font(bold=True, size=12)
st['A12'] = 'Inventory items entered'; st['A12'].font = font(size=10)
st['B12'] = "=COUNTA(Inventory!A5:A304)"; st['B12'].font = font(bold=True)
st['A13'] = 'Staff members entered'; st['A13'].font = font(size=10)
st['B13'] = "=COUNTA('Grounds Team'!A5:A104)"; st['B13'].font = font(bold=True)
st['A14'] = 'Photos mentioned'; st['A14'].font = font(size=10)
st['B14'] = "=COUNTA(Inventory!N5:N304)+COUNTA('Grounds Team'!M5:M104)"; st['B14'].font = font(bold=True)
for c in ('B12', 'B13', 'B14'): st[c].fill = SOFT; st[c].alignment = Alignment(horizontal='left')

st['A16'] = 'How to fill it in'; st['A16'].font = font(bold=True, size=12)
steps = [
    ('Colours', 'Yellow cells are for you to fill in. Grey rows are examples only — do not change them. Green rows are headings.'),
    ('Required', 'Columns marked * must be filled in. Leave anything you don\'t know blank — do not guess.'),
    ('Drop-down lists', 'Click a yellow cell with a list and choose from it. Typing something different will be refused.'),
    ('Inventory tab', 'One row per item. For identical items (e.g. 12 covers in the same condition) use one row with Quantity 12. If items differ in condition, use separate rows.'),
    ('Grounds Team tab', 'One row per person who works at this venue, from Curator to Groundsman.'),
    ('Dates', 'Type dates as 15-01-2024 (day-month-year).'),
    ('Photos', 'Take one clear photo per item / person. Name each photo file exactly as written in the "Photo file name" column (e.g. MIR-RL-001.jpg or Rafiqul-Islam.jpg).'),
    ('Sending back', 'Put this Excel file and all photos in one folder, zip it, and send it to the BCB Grounds team. Name the zip after your venue, e.g. Mirpur-data.zip.'),
    ('Questions', 'Hover over any heading (or look for the small red corner) to see what it means.'),
]
for i, (k, v) in enumerate(steps, start=17):
    a = st.cell(row=i, column=1, value=k); a.font = font(bold=True, size=10); a.alignment = Alignment(vertical='top')
    b = st.cell(row=i, column=2, value=v); b.font = font(size=10); b.alignment = wrap
    st.row_dimensions[i].height = 44 if len(v) > 90 else 30

st['A27'] = 'Legend'; st['A27'].font = font(bold=True, size=12)
for r, (f_, t) in enumerate([(INPUT, 'Fill in'), (EXAMPLE, 'Example — leave as is'), (HEAD, 'Heading')], start=28):
    st.cell(row=r, column=1).fill = f_; st.cell(row=r, column=1).border = box
    st.cell(row=r, column=2, value=t).font = font(size=10)

# ── Inventory ──────────────────────────────────────────────────
inv = wb.create_sheet('Inventory')
inv_cols = [
    ('Item name *', 26, 'What the item is, e.g. Pitch roller, Outfield mower, Hydraulic oil.', None),
    ('Category *', 14, 'Equipment = machines and tools you keep using. Consumable = things that get used up (oil, fertiliser, seed).', 'Category'),
    ('Group *', 15, 'Which inventory group it belongs to. Choose Other if none fits.', 'Group'),
    ('Asset code / ID', 16, 'The code painted or written on the item, if any. e.g. MIR-RL-001', None),
    ('Quantity *', 11, 'How many / how much you have now.', None),
    ('Unit *', 10, 'unit, pieces, litres, kg …', 'Unit'),
    ('Condition *', 18, 'Equipment: Operational, Under maintenance or Needs repair. Consumables: Available.', 'Condition'),
    ('Minimum stock', 12, 'Consumables only: the lowest amount you should keep. The app warns when stock goes below this.', None),
    ('Inventory of *', 12, 'Who owns the item: BCB or NSC.', 'InventoryOf'),
    ('Date added', 13, 'When the item arrived at this venue (day-month-year). Leave blank if unknown.', None),
    ('Brand / model', 18, 'e.g. Toro Reelmaster 3100', None),
    ('Serial number', 16, 'From the maker\'s plate, if any.', None),
    ('Notes', 30, 'Anything else useful: faults, missing parts, where it is stored.', None),
    ('Photo file name', 20, 'Exact name of the photo file you are sending for this item, e.g. MIR-RL-001.jpg', None),
]
inv_ex = ['Main pitch roller', 'Equipment', 'Rollers', 'MIR-RL-001', 1, 'unit', 'Operational', None, 'BCB', '15-01-2024', 'Aveling Barford 2.5T', 'AB-55120', 'EXAMPLE ROW — stored in the machine shed', 'MIR-RL-001.jpg']
f0, f1 = build_table(inv, 'Inventory', 'One row per item. Grey row 4 is an example. Start filling from row 5.', inv_cols, inv_ex, 300)
for col, key in [('B', 'Category'), ('C', 'Group'), ('F', 'Unit'), ('G', 'Condition'), ('I', 'InventoryOf')]:
    dv_list(inv, key, f'{col}{f0}:{col}{f1}', 'Choose from the list.')
dv_number(inv, f'E{f0}:E{f1}'); dv_number(inv, f'H{f0}:H{f1}')
dv_date(inv, f'J{f0}:J{f1}')
for r in range(f0, f1 + 1):
    inv[f'J{r}'].number_format = 'DD-MM-YYYY'; inv[f'D{r}'].number_format = '@'; inv[f'L{r}'].number_format = '@'

# ── Grounds Team ───────────────────────────────────────────────
tm = wb.create_sheet('Grounds Team')
tm_cols = [
    ('Full name *', 26, 'Full name as on the NID or job letter.', None),
    ('Designation *', 24, 'Their job title.', 'Designation'),
    ('Mobile number', 16, 'e.g. 01712-345678', None),
    ('Email', 24, 'Only if they have one.', None),
    ('Job status', 14, 'Permanent, Contractual or Casual.', 'JobStatus'),
    ('Joining date', 13, 'When they joined (day-month-year).', None),
    ('Experience (years)', 12, 'Total years of grounds / turf work.', None),
    ('Home district', 16, 'e.g. Bogura', None),
    ('Division', 14, 'Home division.', 'Division'),
    ('Status *', 12, 'Active, On leave or Inactive.', 'StaffStatus'),
    ('Also works at', 22, 'Other venues this person regularly works at, if any.', None),
    ('Notes', 28, 'Skills, certificates, anything useful.', None),
    ('Photo file name', 20, 'Exact name of their photo file, e.g. Rafiqul-Islam.jpg. A clear head-and-shoulders photo.', None),
]
tm_ex = ['Rafiqul Islam', 'Head Groundsman', '01712-345678', None, 'Permanent', '01-03-2015', 11, 'Bogura', 'Rajshahi', 'Active', None, 'EXAMPLE ROW', 'Rafiqul-Islam.jpg']
t0, t1 = build_table(tm, 'Grounds Team', 'One row per person at this venue. Grey row 4 is an example. Start filling from row 5.', tm_cols, tm_ex, 100)
for col, key in [('B', 'Designation'), ('E', 'JobStatus'), ('I', 'Division'), ('J', 'StaffStatus')]:
    dv_list(tm, key, f'{col}{t0}:{col}{t1}', 'Choose from the list.')
dv_number(tm, f'G{t0}:G{t1}', whole=True, maxv=60)
dv_date(tm, f'F{t0}:F{t1}')
for r in range(t0, t1 + 1):
    tm[f'F{r}'].number_format = 'DD-MM-YYYY'; tm[f'C{r}'].number_format = '@'

wb.move_sheet('Lists', offset=3)
for ws in wb.worksheets:
    ws.sheet_view.showGridLines = ws.title != 'Start here'
wb.active = 0
wb.save(OUT)
print('saved', OUT)
