import glob

for filename in glob.glob('migrations/versions/*.py'):
    with open(filename, 'r') as f:
        content = f.read()
    if "sa.text('now()')" in content:
        content = content.replace("sa.text('now()')", "sa.text('CURRENT_TIMESTAMP')")
        with open(filename, 'w') as f:
            f.write(content)
