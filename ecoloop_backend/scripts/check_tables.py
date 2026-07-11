import glob
import re

created_tables = set()
for filename in glob.glob('migrations/versions/*.py'):
    with open(filename, 'r') as f:
        content = f.read()
    matches = re.findall(r"op\.create_table\(\s*['\"]([^'\"]+)['\"]", content)
    for m in matches:
        created_tables.add(m)

print(f"CREATED TABLES ({len(created_tables)}):", sorted(list(created_tables)))
