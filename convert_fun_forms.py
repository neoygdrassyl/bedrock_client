#!/usr/bin/env python3
"""
Convert 8 React class components in fun_forms to functional components with hooks.
Handles: imports, class→function, constructor→useState, lifecycle→useEffect,
         this.props/state/setState/methods replacements, render unwrapping.
"""
import re
import os
import sys

def camel_setter(name):
    """Convert 'load' → 'setLoad', 'vrSelected' → 'setVrSelected'."""
    return 'set' + name[0].upper() + name[1:]

def find_matching_brace(content, start):
    """Find position after matching closing brace from start position (which is right after opening {)."""
    depth = 1
    i = start
    while i < len(content) and depth > 0:
        if content[i] == '{':
            depth += 1
        elif content[i] == '}':
            depth -= 1
        i += 1
    return i

def extract_state_vars(content):
    """Extract state variables from this.state = { ... } in constructor."""
    match = re.search(r'this\.state\s*=\s*\{', content)
    if not match:
        return {}
    
    brace_end = find_matching_brace(content, match.end())
    state_block = content[match.end():brace_end-1]
    state_vars = {}
    
    # Parse top-level key: value pairs
    current_key = None
    current_val_start = None
    
    for m in re.finditer(r"['\"]?(\w+)['\"]?\s*:", state_block):
        prefix = state_block[:m.start()]
        d = prefix.count('{') + prefix.count('[') + prefix.count('(') \
          - prefix.count('}') - prefix.count(']') - prefix.count(')')
        if d == 0:
            if current_key is not None and current_val_start is not None:
                val = state_block[current_val_start:m.start()].strip().rstrip(',').strip()
                state_vars[current_key] = val
            current_key = m.group(1)
            current_val_start = m.end()
    
    if current_key is not None and current_val_start is not None:
        val = state_block[current_val_start:].strip().rstrip(',').strip()
        state_vars[current_key] = val
    
    return state_vars

def find_all_setState_keys(content):
    """Find all state variable names ever set via this.setState."""
    refs = set()
    for m in re.finditer(r'this\.setState\(\{', content):
        start = m.end()
        end = find_matching_brace(content, start)
        block = content[start:end-1]
        for km in re.finditer(r"['\"]?(\w+)['\"]?\s*:", block):
            prefix = block[:km.start()]
            d = prefix.count('{') + prefix.count('[') + prefix.count('(') \
              - prefix.count('}') - prefix.count(']') - prefix.count(')')
            if d == 0:
                refs.add(km.group(1))
    return refs

def replace_setState_calls(content, state_vars):
    """Replace this.setState({ key: val, ... }) with setKey(val); ..."""
    result = []
    i = 0
    pattern = 'this.setState({'
    
    while i < len(content):
        idx = content.find(pattern, i)
        if idx == -1:
            result.append(content[i:])
            break
        
        result.append(content[i:idx])
        
        # Find matching closing }
        inner_start = idx + len(pattern)
        inner_end = find_matching_brace(content, inner_start)
        
        # Check for ) after }
        rest_after = content[inner_end:inner_end+10].lstrip()
        if rest_after.startswith(')'):
            paren_pos = content.index(')', inner_end)
            end_pos = paren_pos + 1
        else:
            end_pos = inner_end
        
        block = content[inner_start:inner_end-1]
        
        # Parse top-level key:value pairs
        pairs = []
        current_key = None
        current_val_start = None
        
        for km in re.finditer(r"['\"]?(\w+)['\"]?\s*:", block):
            prefix = block[:km.start()]
            d = prefix.count('{') + prefix.count('[') + prefix.count('(') \
              - prefix.count('}') - prefix.count(']') - prefix.count(')')
            if d == 0:
                if current_key is not None and current_val_start is not None:
                    val = block[current_val_start:km.start()].strip().rstrip(',').strip()
                    pairs.append((current_key, val))
                current_key = km.group(1)
                current_val_start = km.end()
        
        if current_key is not None and current_val_start is not None:
            val = block[current_val_start:].strip().rstrip(',').strip()
            pairs.append((current_key, val))
        
        if pairs:
            # Get indentation from current line
            line_start = content.rfind('\n', 0, idx) + 1
            indent = ''
            for c in content[line_start:idx]:
                if c in ' \t':
                    indent += c
                else:
                    break
            
            setter_calls = []
            for key, val in pairs:
                setter = camel_setter(key)
                setter_calls.append(f"{setter}({val})")
            
            replacement = (';\n' + indent).join(setter_calls)
            result.append(replacement)
        else:
            # Couldn't parse, keep as-is but remove this.
            result.append('setState({' + block + '})')
        
        i = end_pos
    
    return ''.join(result)

def find_method_body(content, match_end):
    """Given position right after opening { of a method, find the full body and end position."""
    end = find_matching_brace(content, match_end)
    body = content[match_end:end-1]
    return body, end

def convert_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    basename = os.path.basename(filepath)
    
    # Find class
    class_match = re.search(r'class\s+(\w+)\s+extends\s+Component\s*\{', content)
    if not class_match:
        print(f"  ERROR: No class found in {basename}")
        return 0
    class_name = class_match.group(1)
    class_body_start = class_match.end()
    class_body_end = find_matching_brace(content, class_body_start)
    
    # Collect all props used
    all_props = set()
    for m in re.finditer(r'this\.props\.(\w+)', content):
        all_props.add(m.group(1))
    
    # Collect state vars
    state_vars = extract_state_vars(content)
    dynamic_keys = find_all_setState_keys(content)
    for k in dynamic_keys:
        if k not in state_vars:
            state_vars[k] = 'null'
    
    print(f"  Class: {class_name}")
    print(f"  Props: {sorted(all_props)}")
    print(f"  State: {state_vars}")
    
    # =====================
    # STEP 1: Replace import
    # =====================
    hooks_needed = ['useState', 'useEffect', 'useCallback']
    if not state_vars:
        hooks_needed.remove('useState')
    
    # Check if there's componentDidMount or componentDidUpdate
    has_cdm = bool(re.search(r'componentDidMount\s*\(\)\s*\{', content))
    has_cdu = bool(re.search(r'componentDidUpdate\s*\(', content))
    if not has_cdm and not has_cdu:
        hooks_needed = [h for h in hooks_needed if h != 'useEffect']
    
    hooks_str = ', '.join(hooks_needed)
    
    # Handle different import patterns
    content = re.sub(
        r"import\s+React\s*,\s*\{\s*Component\s*\}\s*from\s*['\"]react['\"];?",
        f"import React, {{ {hooks_str} }} from 'react';",
        content
    )
    content = re.sub(
        r"import\s*\{\s*Component\s*\}\s*from\s*['\"]react['\"];?",
        f"import {{ {hooks_str} }} from 'react';",
        content
    )
    # If just React imported with Component
    content = re.sub(
        r"import\s+React\s*,\s*\{\s*Component\s*,",
        f"import React, {{ {hooks_str},",
        content
    )
    
    # =====================
    # STEP 2: Replace this.setState (before other this. replacements)
    # =====================
    content = replace_setState_calls(content, state_vars)
    
    # =====================
    # STEP 3: Replace this.state.X → X
    # =====================
    content = re.sub(r'this\.state\.', '', content)
    
    # =====================
    # STEP 4: Replace this.props.X → X
    # =====================
    content = re.sub(r'this\.props\.', '', content)
    
    # =====================
    # STEP 5: Remove .bind(this) 
    # =====================
    content = re.sub(r'\.bind\(this\)', '', content)
    
    # =====================
    # STEP 6: Replace this.X → X (methods/properties)
    # =====================
    content = re.sub(r'\bthis\.(\w+)', r'\1', content)
    
    # =====================
    # STEP 7: Replace class declaration → function
    # =====================
    props_list = ', '.join(sorted(all_props))
    content = re.sub(
        r'class\s+' + re.escape(class_name) + r'\s+extends\s+Component\s*\{',
        f'function {class_name}({{ {props_list} }}) {{',
        content
    )
    
    # =====================
    # STEP 8: Remove constructor, convert state → useState
    # =====================
    content = re.sub(r'\s*super\(props\);\s*\n', '\n', content)
    content = re.sub(r'\s*constructor\(props\)\s*\{', '', content)
    
    # Replace this.state = { ... } (already transformed to state = { ... }) with useState calls
    state_assign = re.search(r'\n(\s*)state\s*=\s*\{', content)
    if state_assign:
        indent = state_assign.group(1) or '    '
        brace_start = content.index('{', state_assign.start() + len(state_assign.group(0)) - 1)
        brace_end = find_matching_brace(content, brace_start + 1)
        
        # Check for semicolon
        end_pos = brace_end
        rest = content[brace_end:brace_end+5]
        if rest.lstrip().startswith(';'):
            end_pos = content.index(';', brace_end) + 1
        
        # Generate useState calls
        use_state_lines = []
        for key, val in state_vars.items():
            setter = camel_setter(key)
            use_state_lines.append(f"{indent}const [{key}, {setter}] = useState({val});")
        
        use_state_block = '\n'.join(use_state_lines)
        content = content[:state_assign.start()] + '\n' + use_state_block + '\n' + content[end_pos:]
    elif state_vars:
        # State was set dynamically, add useState after function declaration
        func_match = re.search(r'function\s+' + re.escape(class_name) + r'\([^)]*\)\s*\{', content)
        if func_match:
            indent = '    '
            use_state_lines = []
            for key, val in state_vars.items():
                setter = camel_setter(key)
                use_state_lines.append(f"{indent}const [{key}, {setter}] = useState({val});")
            use_state_block = '\n'.join(use_state_lines)
            insert_pos = func_match.end()
            content = content[:insert_pos] + '\n' + use_state_block + '\n' + content[insert_pos:]
    
    # Remove self-assignment lines from bind removal: `retrieveItem = retrieveItem;`
    content = re.sub(r'\n\s*(\w+)\s*=\s*\1\s*;\s*(?=\n)', '', content)
    
    # Remove the extra } from the constructor
    # Look for a lone } after the useState calls that was the constructor's closing brace
    # Pattern: useState lines followed by \n    }\n 
    content = re.sub(r'(useState\([^)]*\);\n)\s*\}\n', r'\1', content)
    
    # =====================
    # STEP 9: Convert componentDidMount → useEffect
    # =====================
    cdm = re.search(r'\n(\s*)componentDidMount\s*\(\)\s*\{', content)
    if cdm:
        indent = cdm.group(1)
        body_start = cdm.end()
        body, method_end = find_method_body(content, body_start)
        body = body.strip()
        
        # Reindent body
        use_effect = f"\n{indent}useEffect(() => {{\n{indent}    {body}\n{indent}}}, []);\n"
        content = content[:cdm.start()] + use_effect + content[method_end:]
    
    # =====================
    # STEP 10: Convert componentDidUpdate → useEffect  
    # =====================
    # May need multiple passes for multiple if-blocks
    cdu = re.search(r'\n(\s*)componentDidUpdate\s*\((\w+)(?:\s*,\s*(\w+))?\)\s*\{', content)
    if cdu:
        indent = cdu.group(1)
        prev_props_name = cdu.group(2)
        prev_state_name = cdu.group(3)
        body_start = cdu.end()
        body, method_end = find_method_body(content, body_start)
        
        # Replace prevProps.X references with comment or useRef pattern
        # For now, just create the useEffect with the body
        # Replace prevProps/prevState refs
        if prev_props_name:
            body = body.replace(prev_props_name + '.', 'prev_')
        if prev_state_name:
            body = body.replace(prev_state_name + '.', 'prevState_')
        
        # Extract deps from if conditions: if (X !== prev_X)
        deps = set()
        for dm in re.finditer(r'(\w+)\s*!==?\s*prev_\1', body):
            deps.add(dm.group(1))
        if prev_state_name:
            for dm in re.finditer(r'(\w+)\s*!==?\s*prevState_\1', body):
                deps.add(dm.group(1))
        
        # Remove the if condition wrappings since useEffect handles deps
        # Transform: if (X !== prev_X) { ...body... }
        # Into just: ...body... (since useEffect only fires when deps change)
        
        # For simple single-condition componentDidUpdate, unwrap the if
        # For complex ones, keep the condition (it's still valid)
        
        body = body.strip()
        deps_str = ', '.join(sorted(deps)) if deps else ''
        
        use_effect = f"\n{indent}useEffect(() => {{\n{indent}    {body}\n{indent}}}, [{deps_str}]);\n"
        content = content[:cdu.start()] + use_effect + content[method_end:]
    
    # =====================
    # STEP 11: Convert regular class methods to const arrow functions
    # =====================
    # async methods
    content = re.sub(
        r'\n(\s+)async\s+(\w+)\s*\(([^)]*)\)\s*\{',
        lambda m: f"\n{m.group(1)}const {m.group(2)} = async ({m.group(3)}) => {{" 
            if m.group(2) not in ('render', 'componentDidMount', 'componentDidUpdate', 'constructor',
                                   'if', 'for', 'while', 'switch', 'try', 'catch', 'function')
            else m.group(0),
        content
    )
    
    # Regular methods (not keywords, not render/lifecycle)
    keywords = {'function', 'if', 'for', 'while', 'return', 'const', 'let', 'var', 'switch', 
                'try', 'catch', 'class', 'else', 'do', 'render', 'componentDidMount', 
                'componentDidUpdate', 'constructor', 'new', 'export', 'import', 'default'}
    
    def convert_method(m):
        indent = m.group(1)
        name = m.group(2)
        args = m.group(3)
        if name in keywords:
            return m.group(0)
        # Check it's actually a method definition (at class indentation level)
        if len(indent) >= 2:
            return f"\n{indent}const {name} = ({args}) => {{"
        return m.group(0)
    
    content = re.sub(
        r'\n(\s+)(\w+)\s*\(([^)]*?)\)\s*\{',
        convert_method,
        content
    )
    
    # =====================
    # STEP 12: Handle render() → unwrap
    # =====================
    # Remove render() { line
    render_match = re.search(r'\n\s*render\s*\(\)\s*\{', content)
    if render_match:
        content = content[:render_match.start()] + '\n' + content[render_match.end():]
    
    # =====================
    # STEP 13: Remove extra closing braces (from class and render)
    # =====================
    # Find export statement
    export_match = re.search(r'\n\s*export\s+default\s+', content)
    if export_match:
        before_export = content[:export_match.start()]
        after_export = content[export_match.start():]
        
        # Remove the last 2 closing braces (one from render, one from class)
        lines = before_export.rstrip().split('\n')
        braces_removed = 0
        while braces_removed < 2 and lines:
            if lines[-1].strip() == '}':
                lines.pop()
                braces_removed += 1
            elif lines[-1].strip() == '':
                lines.pop()
            else:
                break
        
        # Add back the function closing brace
        content = '\n'.join(lines) + '\n}\n' + after_export
    
    # =====================
    # STEP 14: Clean up
    # =====================
    # Remove double+ blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Remove any remaining 'this' that slipped through (except in strings/comments)
    # We'll check but not auto-fix these
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    # Count remaining issues
    this_count = len(re.findall(r'\bthis\b', content))
    extends_count = len(re.findall(r'extends\s+Component', content))
    
    print(f"  Result: {this_count} 'this' refs, {extends_count} 'extends Component'")
    
    # Show lines with remaining 'this'
    if this_count > 0:
        for i, line in enumerate(content.split('\n'), 1):
            if re.search(r'\bthis\b', line):
                print(f"    L{i}: {line.strip()[:100]}")
    
    return this_count

def main():
    base = '/home/dg21/dovela/frontend/src/app/pages/user/fun_forms/components/'
    files = [
        base + 'fun_pdf.js',
        base + 'fun_pdf_check.js',
        base + 'fun_checklist_n.js',
        base + 'fun_docs.js',
        base + 'fun_doc_confirminc.js',
        base + 'fun_doc_confirmlegal.js',
        base + 'func_clock_chart.js',
        base + 'fun_clocks_negative.component.js',
    ]
    
    total_this = 0
    for filepath in files:
        print(f"\n{'='*60}")
        print(f"Processing: {os.path.basename(filepath)}")
        print(f"{'='*60}")
        remaining = convert_file(filepath)
        if remaining:
            total_this += remaining
    
    print(f"\n{'='*60}")
    print(f"TOTAL remaining 'this' references: {total_this}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
