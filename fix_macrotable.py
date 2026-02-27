import re

filepath = 'src/app/pages/user/fun_forms/fun_macrotable..js'
with open(filepath, 'r') as f:
    content = f.read()

count_before = content.count('this.')

comment_ranges = []
for m in re.finditer(r'/\*[\s\S]*?\*/', content):
    comment_ranges.append((m.start(), m.end()))
for m in re.finditer(r'//[^\n]*', content):
    comment_ranges.append((m.start(), m.end()))

def in_comment(pos):
    for start, end in comment_ranges:
        if start <= pos < end:
            return True
    return False

replacements = [
    ('this.props.NAVIGATION_GEN', 'NAVIGATION_GEN'),
    ('this.props.setSelectedRow', 'setSelectedRow'),
    ('this.props.date_start', 'date_start'),
    ('this.props.date_end', 'date_end'),
    ('this.props.swaMsg', 'swaMsg'),
    ('this._UPDATE_FILTERS_IDPUBIC', '_UPDATE_FILTERS_IDPUBIC'),
    ('this._UPDATE_FILTERS', '_UPDATE_FILTERS'),
    ('this._FILTER_LIST', '_FILTER_LIST'),
    ('this.retrieveMacroClocks', 'retrieveMacroClocks'),
    ('this.retrieveMacro', 'retrieveMacro'),
    ('this.changeList', 'changeList'),
    ('this.setState(', 'setState('),
    ('this.setState({', 'setState({'),
    ('this.state.', 'state.'),
]

for old, new in replacements:
    new_content = []
    last_end = 0
    for m in re.finditer(re.escape(old), content):
        if not in_comment(m.start()):
            new_content.append(content[last_end:m.start()])
            new_content.append(new)
            last_end = m.end()
    new_content.append(content[last_end:])
    content = ''.join(new_content)

count_after = content.count('this.')

with open(filepath, 'w') as f:
    f.write(content)

print(f'this. refs: {count_before} before -> {count_after} after')

# Check remaining non-comment this. refs
comment_ranges2 = []
for m2 in re.finditer(r'/\*[\s\S]*?\*/', content):
    comment_ranges2.append((m2.start(), m2.end()))
for m2 in re.finditer(r'//[^\n]*', content):
    comment_ranges2.append((m2.start(), m2.end()))

def in_comment2(pos):
    for s, e in comment_ranges2:
        if s <= pos < e:
            return True
    return False

lines = content.split('\n')
pos = 0
remaining = []
for i, line in enumerate(lines, 1):
    for m in re.finditer(r'this\.', line):
        abs_pos = pos + m.start()
        if not in_comment2(abs_pos):
            remaining.append(f'  Line {i}: {line.strip()[:120]}')
    pos += len(line) + 1

if remaining:
    print(f'Remaining non-comment this. refs ({len(remaining)}):')
    for r in remaining:
        print(r)
else:
    print('No remaining non-comment this. references!')
