import re

with open('migrations/versions/2ef3cb52a123_v3_4_migration.py', 'r') as f:
    content = f.read()

def replacer(match):
    indent = match.group(1)
    table = match.group(2)
    # If it's already wrapped in an if statement, we don't want to double wrap it, but it's fine for now, wait let's just do it
    # Actually if it already has "if 'table' in inspector", it will just be nested, which is harmless.
    # We must ensure we add the extra indent to the subsequent lines of the block!
    # A safer way to do this is to just replace the with statement, but we also need to indent the block inside it.
    pass

# A better way without regex for block indentation is just inserting the if statement and adding 4 spaces to the next lines until we hit a line with the same or less indent.
lines = content.split('\n')
new_lines = []
in_batch = False
batch_indent = 0
for line in lines:
    match = re.match(r'(^[ \t]+)with op\.batch_alter_table\(\'([^\']+)\', schema=None\) as batch_op:', line)
    if match:
        indent_str = match.group(1)
        table = match.group(2)
        # Check if previous line already has inspector check
        if new_lines and f"if '{table}' in inspector.get_table_names():" in new_lines[-1]:
            # already wrapped
            new_lines.append(line)
        else:
            new_lines.append(f"{indent_str}if '{table}' in inspector.get_table_names():")
            new_lines.append(f"    {line}")
            in_batch = True
            batch_indent = len(indent_str)
    elif in_batch:
        if line.strip() == '' or len(line) - len(line.lstrip()) > batch_indent:
            if line.strip() == '':
                new_lines.append(line)
            else:
                new_lines.append(f"    {line}")
        else:
            in_batch = False
            new_lines.append(line)
    else:
        new_lines.append(line)

with open('migrations/versions/2ef3cb52a123_v3_4_migration.py', 'w') as f:
    f.write('\n'.join(new_lines))
