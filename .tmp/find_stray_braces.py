import re, glob

pattern = re.compile(r'^\s*function\s+\w+\s*\(.*\)\s*\{')
brace_pattern = re.compile(r'^\s*\}\s*$')

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
        if pattern.match(line):
            # Check next 1-3 lines for standalone }
            for j in range(1, 4):
                if i + j < len(lines):
                    if brace_pattern.match(lines[i+j]):
                        # Check if there's more code after the brace (not end of file)
                        has_more = False
                        for k in range(i+j+1, min(i+j+5, len(lines))):
                            if lines[k].strip() and not lines[k].strip().startswith('//'):
                                has_more = True
                                break
                        if has_more:
                            print(f'MATCH: {fpath}:{i+1}')
                            end = min(i+j+5, len(lines))
                            for idx in range(i, end):
                                print(f'  {idx+1}: {lines[idx].rstrip()}')
                            print('  ---')
                            matches.append((fpath, i+1))
                        break

print(f'\nTotal matches: {len(matches)}')
