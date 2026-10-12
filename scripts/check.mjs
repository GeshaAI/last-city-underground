import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
function run(command,args){const r=spawnSync(command,args,{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout||`${command} failed`);}
for(const f of readdirSync('dist').filter(f=>f.endsWith('.js'))){
 run(process.execPath,['--check',`dist/${f}`]);
 const source=readFileSync(`dist/${f}`,'utf8');
 for(const [,ref] of source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)){
  assert.ok(ref.startsWith('./'),`External module: ${ref}`);
  assert.ok(existsSync(resolve('dist',ref)),`Missing module: ${ref}`);
 }
}
const html=readFileSync('dist/index.html','utf8');
for(const [,ref] of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
 if(ref.startsWith('#')||ref.startsWith('data:'))continue;
 assert.ok(!/^(https?:|\/)/.test(ref),`Nonrelative asset: ${ref}`);
 assert.ok(existsSync(resolve('dist',ref)),`Missing asset: ${ref}`);
}
const before=readFileSync('LAST_CITY_v0.1.html');
run('python3',['build-standalone.py']);
assert.deepEqual(readFileSync('LAST_CITY_v0.1.html'),before,'Standalone stale: npm run build and commit result');
const standalone=before.toString().match(/<script type="module">([\s\S]*?)<\/script>/);
assert.ok(standalone,'Standalone module missing');
const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:standalone[1],encoding:'utf8'});
assert.equal(check.status,0,check.stderr);
console.log('PASS: JS syntax, local module/HTML assets, reproducible standalone, standalone syntax');
