#!/usr/bin/env python3
"""Migration script: convert record_eng_sismic.component.js from class to functional component."""
import re

FILE = 'src/app/pages/user/records/eng/record_eng_sismic.component.js'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Backup
with open(FILE + '.bak', 'w', encoding='utf-8') as f:
    f.write(content)

lines = content.split('\n')

# ============================================================
# 1. METHOD DECLARATIONS: Convert class method syntax to function declarations
# ============================================================

# Regular method syntax → function declarations
method_conversions = {
    '    get_d233() {': '    function get_d233() {',
    '    set_d231() {': '    function set_d231() {',
    '    set_d232() {': '    function set_d232() {',
    '    set_d233() {': '    function set_d233() {',
    '    set_d236() {': '    function set_d236() {',
    '    get_d236() {': '    function get_d236() {',
    '    set_d237() {': '    function set_d237() {',
    '    set_values() {': '    function set_values() {',
    '    LOAD_STEP(_id_public) {': '    function LOAD_STEP(_id_public) {',
}

for old, new in method_conversions.items():
    content = content.replace(old, new)

# Arrow function assignments → const declarations
arrow_conversions = [
    ('    _GET_CHILD_SISMIC = () => {', '    const _GET_CHILD_SISMIC = () => {'),
    ('    _GET_STEP_TYPE_INDEX = (', '    const _GET_STEP_TYPE_INDEX = ('),
    ('    _GET_DENPLAC_VALUE = () => {', '    const _GET_DENPLAC_VALUE = () => {'),
    ('    _GET_PESOPLAC_VALUE = (row) => {', '    const _GET_PESOPLAC_VALUE = (row) => {'),
    ('    _get_COLPAN_VALUE = (row) => {', '    const _get_COLPAN_VALUE = (row) => {'),
    ('    _get_VIGA = (height) => {', '    const _get_VIGA = (height) => {'),
    ('    _get_TOT = (row) => {', '    const _get_TOT = (row) => {'),
    ('    _get_WIHIK = (row) => {', '    const _get_WIHIK = (row) => {'),
    ('    _get_CVI = (row) => {', '    const _get_CVI = (row) => {'),
    ('    _get_F_x = (row) => {', '    const _get_F_x = (row) => {'),
    ('    _get_F_y = (row) => {', '    const _get_F_y = (row) => {'),
    ('    _get_SUMLEVEL = (', '    const _get_SUMLEVEL = ('),
    ('    _GET_TOTAL = () => {', '    const _GET_TOTAL = () => {'),
]

for old, new in arrow_conversions:
    content = content.replace(old, new, 1)

# ============================================================
# 2. RENDER METHOD: Remove render() wrapper and fix destructuring
# ============================================================

# Remove render() { line
content = content.replace('    render() {\n', '')

# Fix props destructuring (remove this.)
content = content.replace(
    '        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, version } = this.props;',
    '        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, version, requestUpdateRecord } = props;'
)

# Remove empty state destructuring
content = content.replace('        const { } = this.state;\n', '')

# ============================================================
# 3. Add qedit state after d237 useState
# ============================================================
content = content.replace(
    '    const [d237, setD237] = useState(undefined);\n',
    '    const [d237, setD237] = useState(undefined);\n    const [qedit, setQedit] = useState({});\n'
)

# ============================================================
# 4. Replace ALL this. references
# ============================================================

# this.setState patterns (must be done BEFORE generic this.state replacements)
content = content.replace("this.setState({ d237: op })", "setD237(op)")
content = content.replace("this.setState({ edit: false })", "setEdit(false)")
content = content.replace("this.setState({ edit: row })", "setEdit(row)")

# this.setState({ new: ... })
content = content.replace(
    "this.setState({ new: e.target.checked })",
    "setIsNew(e.target.checked)"
)

# this.setState({ sort: sortDirection })
content = content.replace(
    "this.setState({ sort: sortDirection })",
    "setSort(sortDirection)"
)

# this.setState({ ['qedit_' + row.id]: true })
content = content.replace(
    "this.setState({ ['qedit_' + row.id]: true })",
    "setQedit(prev => ({ ...prev, [row.id]: true }))"
)

# this.setState({ ['qedit_' + _id]: false })
content = content.replace(
    "this.setState({ ['qedit_' + _id]: false })",
    "setQedit(prev => ({ ...prev, [_id]: false }))"
)

# this.state['qedit_' + row.id] → qedit[row.id]
content = content.replace("this.state['qedit_' + row.id]", "qedit[row.id]")

# this.state.d237 → d237 (in _GET_TOTAL, rename to _d237 to avoid shadowing)
content = content.replace(
    "let d237 = this.state.d237 ?? 1;",
    "let _d237 = d237 ?? 1;"
)

# this.state.sort in delete_item (rename to _sort to avoid shadowing)
content = content.replace(
    "let sort = this.state.sort;",
    "let _sort = sort;"
)
# Fix subsequent uses of the shadowed sort in delete_item
content = content.replace(
    "_sort = String(sort).toUpperCase()",
    "_sort = String(_sort).toUpperCase()"
)
# Fix the RECORD_ENG_SERVICE.delete_sis call that uses the local sort
content = content.replace(
    "RECORD_ENG_SERVICE.delete_sis(id, sort, currentRecord.id)",
    "RECORD_ENG_SERVICE.delete_sis(id, _sort, currentRecord.id)"
)

# this.state.edit.id → edit.id
content = content.replace("this.state.edit.id", "edit.id")

# this.state.edit → edit (in JSX conditional)
content = content.replace("this.state.edit", "edit")

# this.state.new → isNew
content = content.replace("this.state.new", "isNew")

# ============================================================
# 5. Replace this.props. references
# ============================================================
# In methods before render, this.props.xxx → props.xxx
# But since we now have destructuring at the top, use destructured vars

# this.props.requestUpdateRecord(this.props.currentItem.id) → requestUpdateRecord(currentItem.id)
content = content.replace(
    "this.props.requestUpdateRecord(this.props.currentItem.id)",
    "requestUpdateRecord(currentItem.id)"
)
# this.props.requestUpdateRecord(currentItem.id) → requestUpdateRecord(currentItem.id)
content = content.replace(
    "this.props.requestUpdateRecord(currentItem.id)",
    "requestUpdateRecord(currentItem.id)"
)

# this.props.currentRecord → props.currentRecord (in methods defined before destructuring)
# Actually, since we haven't moved the destructuring, methods before it use props.xxx
# Let's replace remaining this.props.currentRecord
content = content.replace("this.props.currentRecord", "props.currentRecord")
content = content.replace("this.props.currentVersionR", "props.currentVersionR")
content = content.replace("this.props.currentItem", "props.currentItem")

# this.props.swaMsg.xxx → props.swaMsg.xxx (in new_x function)
content = content.replace("this.props.swaMsg.", "props.swaMsg.")

# ============================================================
# 6. Replace this.methodName() calls
# ============================================================
# All method calls - remove this. prefix
method_calls = [
    'this._GET_STEP_TYPE_INDEX(',
    'this._GET_CHILD_SISMIC(',
    'this._GET_TOTAL(',
    'this._GET_PESOPLAC_VALUE(',
    'this._GET_DENPLAC_VALUE(',
    'this._get_COLPAN_VALUE(',
    'this._get_VIGA(',
    'this._get_TOT(',
    'this._get_WIHIK(',
    'this._get_CVI(',
    'this._get_F_x(',
    'this._get_F_y(',
    'this._get_SUMLEVEL(',
    'this.LOAD_STEP(',
    'this.get_d233(',
    'this.get_d236(',
    'this.set_d231(',
    'this.set_d232(',
    'this.set_d233(',
    'this.set_d236(',
    'this.set_d237(',
    'this.set_values(',
    'this.new_x(',
]

for call in method_calls:
    content = content.replace(call, call.replace('this.', ''))

# Also handle comment: //var hi = Math.abs(this._get_SUMLEVEL(...)
# This is in a comment, but let's clean it anyway
# Already handled by the generic replacement above

# ============================================================
# 7. Remove class closing brace before export
# ============================================================
# The structure at the end is:
#         );
#     }        ← close render (already removed render opening, but closing } still there)
# }            ← close class
#
# export default RECORD_ENG_SISMIC;
#
# After removing render(), we need to remove the extra closing braces.
# The function RECORD_ENG_SISMIC needs ONE closing }, so we remove the extra one.

# Remove the class closing brace (the line with just "}" before export)
content = content.replace(
    "        );\n    }\n}\n\nexport default RECORD_ENG_SISMIC;",
    "        );\n}\n\nexport default RECORD_ENG_SISMIC;"
)

# ============================================================
# 8. Verify no remaining this. references (except in comments/strings)
# ============================================================
remaining = []
for i, line in enumerate(content.split('\n'), 1):
    # Skip comment-only lines
    stripped = line.strip()
    if stripped.startswith('//'):
        continue
    if 'this.' in line and not stripped.startswith('//'):
        remaining.append(f"  Line {i}: {line.strip()}")

if remaining:
    print(f"WARNING: {len(remaining)} remaining 'this.' references:")
    for r in remaining:
        print(r)
else:
    print("SUCCESS: Zero 'this.' references remaining (except in comments).")

# Write the result
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

# Count replacements
original = open(FILE + '.bak', 'r', encoding='utf-8').read()
original_count = original.count('this.')
final_count = content.count('this.')
# Count only non-comment this. references
comment_this = sum(1 for line in content.split('\n') if line.strip().startswith('//') and 'this.' in line)
print(f"\nOriginal 'this.' count: {original_count}")
print(f"Final 'this.' count: {final_count} (of which {comment_this} are in comments)")
print(f"Replaced: {original_count - final_count} references")
print(f"\nFile written successfully: {FILE}")
print(f"Backup saved: {FILE}.bak")
