import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld} from '../dist/engine.js';
import {enrichRareGeology,validateRareGeology} from '../dist/rare-geology.js';
const snapshot=w=>JSON.parse(JSON.stringify(w));
test('rare geology deterministic and idempotent',()=>{
 const a=createWorld(2048),b=createWorld(2048);
 const first=enrichRareGeology(a),second=enrichRareGeology(b);
 assert.deepEqual(first,second);assert.equal(first.added,5);
 assert.deepEqual(a.cells,b.cells);
 const before=snapshot(a);assert.equal(enrichRareGeology(a).skipped,true);assert.deepEqual(a,before);assert(validateRareGeology(a));
});
test('migration never overwrites existing sites, jobs, explored cells or deposits',()=>{
 const w=createWorld(33);w.bunkerBounds={w:30,h:20};
 const original=snapshot(w);
 w.jobs=[{x:25,y:10}];w.projectSites=[{x:26,y:10}];
 const protectedCells=w.cells.filter(c=>c.feature||c.building||c.seen||c.surveyed||c.type!=='rock'||(c.x===25&&c.y===10)||(c.x===26&&c.y===10));
 const protectedBefore=snapshot(protectedCells);
 enrichRareGeology(w);
 assert.deepEqual(protectedCells,protectedBefore);
 assert(w.cells.filter(c=>['gold','uranium','coolingLake'].includes(c.feature)).every(c=>c.x<30&&c.y<20));
 assert.equal(original.people.length,w.people.length);
});
test('no eligible rock produces no destructive changes',()=>{
 const w=createWorld(12);for(const c of w.cells)if(c.type==='rock')c.seen=true;
 const before=snapshot(w.cells);const result=enrichRareGeology(w);
 assert.equal(result.added,0);assert.deepEqual(w.cells,before);
});
test('corrupted lake and mineral reserves are rejected',()=>{
 const w=createWorld(2);enrichRareGeology(w);
 const gold=w.cells.find(c=>c.feature==='gold');gold.goldReserve=-1;
 assert.throws(()=>validateRareGeology(w));gold.goldReserve=0;
 const lake=w.cells.find(c=>c.feature==='coolingLake');lake.coolingWater=Infinity;
 assert.throws(()=>validateRareGeology(w));
});
