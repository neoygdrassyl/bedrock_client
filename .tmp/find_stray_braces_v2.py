import re, glob

files = glob.glob('src/app/pages/user/**/*.js', recursive=True)
files.sort()

matches = []

for fpath in files:
    try:
        with open(fpath, 'r', errors='replace') as f:
            lines = f.readlines()
    except:
        continue
    
    for i, line in enumerate(lines):
        # Match function declaration with { at end of line
        if re.match(r'^\s*function\s+\w+\s*\(.*\)\s*\{', line):
            # Check if next 1-3 lines has a standalone }
            # AND between { and } there's only whitespace/empty lines
            for j in range(1, 4):
                if i + j >= len(lines):
                    break
                if re.match(r'^\s*\}\s*$', lines[i+j]):
                    # Check everything between function { and } is empty/whitespace
                    body_lines = lines[i+1:i+j]
                    all_empty = all(l.strip() == '' for l in body_lines)
                    if all_empty:
                        # Check there's more code after (not end of file)
                        has_more = False
                        for k in range(i+j+1, min(i+j+10, len(lines))):
                            if lines[k].strip():
                                has_more = True
                                break
                        if has_more:
                            print(f'\n=== STRAY BRACE: {fpath} line {i+1} ===')
                            # Show context: 2 lines before through 10 lines after
                            start = max(0, i-2)
                            end = min(len(lines), i+j+10)
                            for idx in range(start, end):
                                marker = '>>>' if idx == i or idx == i+j else '   '
                                print(f'  {marker} {idx+1}: {lines[idx].rstrip()}')
                            matches.append((fpath, i+1, i+j+1))
                    break

print(f'\n\n===== SUMMARY =====')
print(f'Total files with stray braces: {len(matches)}')
for fpath, func_line, brace_line in matches:
    print(f'  {fpath}:{func_line} (stray }} on line {brace_line})')
