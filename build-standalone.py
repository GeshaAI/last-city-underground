from pathlib import Path
import re
root=Path(__file__).parent
d=root/'dist'
js='\n'.join(re.sub(r'^import .*?;\n','',p.read_text(),flags=re.M).replace('export ','') for p in [d/'engine.js',d/'economy.js',d/'render.js',d/'campaign.js',d/'campaign-render.js',d/'storage.js',d/'app.js'])
html=(d/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+ (d/'style.css').read_text()+'</style>').replace('<script type="module" src="app.js"></script>','<script type="module">'+js+'</script>')
(root/'LAST_CITY_v0.1.html').write_text(html)
