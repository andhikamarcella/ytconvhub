from pathlib import Path
import json

root = Path(__file__).parents[1]
required = [
    'index.html', 'style.css', 'script.js', 'vercel.json',
    'privacy.html', 'terms.html', 'security.html', 'contact.html',
    'robots.txt', 'sitemap.xml', 'VERSION'
]
for name in required:
    assert (root / name).exists(), f'Missing {name}'

html = (root / 'index.html').read_text()
script = (root / 'script.js').read_text()
assert 'id="hub-search"' in html
assert 'data-theme-choice="light"' in html
assert 'data-theme-choice="dark"' in html
assert 'data-theme-choice="auto"' in html
assert 'https://ytconvpulse.vercel.app/' in script
assert 'buildSearchResults' in script

for path in root.rglob('*.json'):
    json.loads(path.read_text())

print('OK: ytconv-hub')
