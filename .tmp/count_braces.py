import re, sys

filepath = sys.argv[1]
with open(filepath) as f:
    text = f.read()

# Remove block comments
text_nc = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
# Remove line comments
text_nc = re.sub(r'//.*', '', text_nc)
# Remove template literals
text_nc = re.sub(r'`[^`]*`', '``', text_nc)
# Remove double-quoted strings
text_nc = re.sub(r'"[^"]*"', '""', text_nc)
# Remove single-quoted strings
text_nc = re.sub(r"'[^']*'", "''", text_nc)

opens = text_nc.count('{')
closes = text_nc.count('}')
print(f'Opens: {opens}, Closes: {closes}, Diff: {opens - closes}')

# Track running brace depth per line of original file
lines = text.split('\n')
depth = 0
in_block_comment = False
for i, line in enumerate(lines, 1):
    # Simple block comment tracking
    if '/*' in line and not in_block_comment:
        in_block_comment = True
    if '*/' in line and in_block_comment:
        in_block_comment = False
        continue
    if in_block_comment:
        continue
    
    # Remove line comments and strings for brace counting
    clean = re.sub(r'//.*', '', line)
    clean = re.sub(r'"[^"]*"', '""', clean)
    clean = re.sub(r"'[^']*'", "''", clean)
    clean = re.sub(r'`[^`]*`', '``', clean)
    
    o = clean.count('{')
    c = clean.count('}')
    if o > 0 or c > 0:
        depth += o - c
        if depth <= 1:
            print(f'  Line {i}: depth={depth} o={o} c={c} | {line.rstrip()[:80]}')
