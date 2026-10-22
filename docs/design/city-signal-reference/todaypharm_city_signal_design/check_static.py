#!/usr/bin/env python3
"""Static QA for delivered HTML/CSS/JS. Does not claim browser runtime verification."""
from pathlib import Path
from bs4 import BeautifulSoup
import tinycss2, subprocess, json, re
root=Path(__file__).resolve().parent
pages=[root/'index.html']+sorted((root/'pages').glob('*.html'))
errors=[]
links=0
for f in pages+[root/'preview.html']:
    html=f.read_text(encoding='utf-8')
    soup=BeautifulSoup(html,'html.parser')
    if f.name!='preview.html':
        if len(soup.find_all('h1'))!=1:errors.append(f'{f.name}: h1 count != 1')
        if len(soup.find_all('main'))!=1:errors.append(f'{f.name}: main count != 1')
        if len(soup.find_all('header',class_='site-header'))!=1:errors.append(f'{f.name}: site header missing')
        if len(soup.find_all('footer',class_='footer'))!=1:errors.append(f'{f.name}: footer missing')
        if len(soup.find_all('meta',attrs={'name':'robots'}))!=1:errors.append(f'{f.name}: robots meta missing')
        if 'DESIGN PROTOTYPE' not in html:errors.append(f'{f.name}: prototype disclosure missing')
    ids=[]
    for tag in soup.find_all(id=True):ids.append(tag['id'])
    if len(set(ids))!=len(ids):errors.append(f'{f.name}: duplicate ids {len(ids)-len(set(ids))}')
    for tag in soup.find_all(['a','link','img','script']):
        attr='href' if tag.name in ['a','link'] else 'src'
        href=tag.get(attr)
        if not href:continue
        if tag.name=='img' and not tag.get('alt'):errors.append(f'{f.name}: image has empty alt')
        if href.startswith(('#','data:','http:','https:','mailto:','tel:','javascript:')):continue
        path=(f.parent/href.split('?',1)[0].split('#',1)[0]).resolve()
        links+=1
        if not path.is_file():errors.append(f'{f.name}: missing asset/link {href}')
    if re.search(r'\{(?:eyebrow|blocklink)\(',html):errors.append(f'{f.name}: unresolved generator template')

css=(root/'assets/design.css').read_text(encoding='utf-8')
rules=tinycss2.parse_stylesheet(css,skip_whitespace=True,skip_comments=True)
parse_errors=[str(x) for x in rules if x.type=='error']
for item in rules:
    if item.type=='qualified-rule':parse_errors.extend(str(x) for x in tinycss2.parse_declaration_list(item.content,skip_whitespace=True,skip_comments=True) if x.type=='error')
errors.extend(f'CSS syntax: {e}' for e in parse_errors)
js=subprocess.run(['node','--check',str(root/'assets/design.js')],capture_output=True,text=True)
if js.returncode:errors.append('JS syntax: '+js.stderr.strip())
preview=BeautifulSoup((root/'preview.html').read_text(encoding='utf-8'),'html.parser')
items=preview.select('[data-preview-target]')
if len(items)!=20:errors.append(f'preview navigator expected 20, has {len(items)}')
for item in items:
    if not (root/item['data-preview-target']).is_file():errors.append(f'preview item missing {item["data-preview-target"]}')
for item in pages:
    if '\n' not in item.read_text(encoding='utf-8'):errors.append(f'{item.name}: not editable text')
res={
 'checked_page_types':len(pages),
 'preview_navigator_items':len(items),
 'validated_local_links_and_assets':links,
 'css_rule_count':len(rules),
 'javascript_syntax_check': 'passed' if js.returncode==0 else 'failed',
 'static_validation': 'passed' if not errors else 'failed',
 'errors':errors,
 'browser_runtime_validation': 'not_run (Chromium policy URLBlocklist=* blocked local files and localhost)',
 'live_site_functionality_validation': 'not_run (design mockups only)',
 'runtime_scope':'These tests validate only static package structure, not visual correctness at a real browser viewport.'
}
(root/'QA_STATIC_REPORT.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(res,ensure_ascii=False,indent=2))
raise SystemExit(0 if not errors else 1)
