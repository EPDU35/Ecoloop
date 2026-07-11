import re

with open('migrations/versions/d352e6418378_init_schema.py', 'r') as f:
    content = f.read()

content = content.replace("sa.text('now()')", "sa.text('CURRENT_TIMESTAMP')")

with open('migrations/versions/d352e6418378_init_schema.py', 'w') as f:
    f.write(content)
