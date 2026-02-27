import re

filepath = 'src/app/pages/user/funmanage.page.js'
with open(filepath, 'r') as f:
    content = f.read()

count_before = content.count('this.')
print(f"this. count BEFORE: {count_before}")

# 1. Remove render() { wrapper line
content = content.replace('    render() {\n', '')

# 2. Fix closing braces at end: remove the extra } that was closing render()
content = content.replace('        );\n    }\n}\n\nexport default FUN_MANAGE;',
                           '        );\n}\n\nexport default FUN_MANAGE;')

# 3. this.setState patterns
content = content.replace("this.setState({ date_start: date_start });", "setDate_start(date_start);")
content = content.replace("this.setState({ date_end: date_end })", "setDate_end(date_end)")
content = content.replace("this.setState({ date_start: e.target.value })", "setDate_start(e.target.value)")
content = content.replace("this.setState({ date_end: e.target.value })", "setDate_end(e.target.value)")
content = content.replace("(id) => this.setState({ selectedRow: id })", "(id) => setSelectedRow(id)")

# 4. this.state.X -> X (state variables) - specific first, then generic
content = content.replace('this.state.fillActive', 'fillActive')
content = content.replace('this.state.modal_c', 'modal_c')
content = content.replace('this.state.modal_n', 'modal_n')
content = content.replace('this.state.modal_d', 'modal_d')
content = content.replace('this.state.modal_alert', 'modal_alert')
content = content.replace('this.state.modal_clocK', 'modal_clocK')
content = content.replace('this.state.modal_record_arc', 'modal_record_arc')
content = content.replace('this.state.modal_record_law', 'modal_record_law')
content = content.replace('this.state.modal_record_eng', 'modal_record_eng')
content = content.replace('this.state.modal_record_ph', 'modal_record_ph')
content = content.replace('this.state.modal_record_review', 'modal_record_review')
content = content.replace('this.state.modal_exp', 'modal_exp')
content = content.replace('this.state.modal_macro', 'modal_macro')
content = content.replace('this.state.modal_report', 'modal_report')
content = content.replace('this.state.modal', 'modal')
content = content.replace('this.state.currentPublic', 'currentPublic')
content = content.replace('this.state.list_started', 'list_started')
content = content.replace('this.state.list_complete', 'list_complete')
content = content.replace('this.state.date_start', 'date_start')
content = content.replace('this.state.date_end', 'date_end')
content = content.replace('this.state.selectedRow', 'selectedRow')
content = content.replace('this.state.defaultFilter', 'defaultFilter')

# 5. this.methodName -> methodName (specific long names first to avoid partial matches)
content = content.replace('this.setSubtmitRows', 'setSubtmitRows')
content = content.replace('this.retrievSingle', 'retrievSingle')
content = content.replace('this.openModal', 'openModal')
content = content.replace('this.toggle_NEGATIVE', 'toggle_NEGATIVE')
content = content.replace('this.toggle_report', 'toggle_report')
content = content.replace('this.toggle_recordArc', 'toggle_recordArc')
content = content.replace('this.toggle_recordLaw', 'toggle_recordLaw')
content = content.replace('this.toggle_recordEng', 'toggle_recordEng')
content = content.replace('this.toggle_recordPH', 'toggle_recordPH')
content = content.replace('this.toggle_recordReview', 'toggle_recordReview')
content = content.replace('this.toggle_macro', 'toggle_macro')
content = content.replace('this.toggle_alert', 'toggle_alert')
content = content.replace('this.toggle_clock', 'toggle_clock')
content = content.replace('this.toggle_exp', 'toggle_exp')
content = content.replace('this.toggle_c', 'toggle_c')
content = content.replace('this.toggle_n', 'toggle_n')
content = content.replace('this.toggle_d', 'toggle_d')
content = content.replace('this.toggle', 'toggle')
content = content.replace('this.navigation_version', 'navigation_version')
content = content.replace('this.navigation', 'navigation')
content = content.replace('this.requestUpdate', 'requestUpdate')
content = content.replace('this.retrievePublish', 'retrievePublish')

# Catch-all for any remaining this.state. references
content = re.sub(r'this\.state\.(\w+)', r'\1', content)

count_after = content.count('this.')
print(f"this. count AFTER: {count_after}")

# Show remaining if any
if count_after > 0:
    for i, line in enumerate(content.split('\n'), 1):
        if 'this.' in line:
            print(f"  Line {i}: {line.strip()}")

with open(filepath, 'w') as f:
    f.write(content)

print("Done!")
