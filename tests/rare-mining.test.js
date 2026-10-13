import {test} from 'node:test';import assert from 'node:assert/strict';
import {extractRareMineral,createRareStock} from '../dist/rare-mining.js';
test('gold mine requires a worker and power and cannot exceed reserve',()=>{
 const c={feature:'gold',goldReserve:0.2},s=createRareStock();
 assert.equal(extractRareMineral(c,s,{powered:true}).extracted,0);
 assert.equal(extractRareMineral(c,s,{workerReady:true}).extracted,0);
 assert.equal(extractRareMineral(c,s,{powered:true,workerReady:true}).extracted,0.18);
 assert(Math.abs(extractRareMineral(c,s,{powered:true,workerReady:true}).extracted-0.02)<1e-9);
 assert.equal(c.goldReserve,0);assert(Math.abs(s.gold-0.2)<1e-9);
});
test('uranium storage limit prevents extraction and loss',()=>{
 const c={feature:'uranium',uraniumReserve:2},s=createRareStock({uranium:0.9});
 const r=extractRareMineral(c,s,{powered:true,workerReady:true,storageLimit:1});
 assert(Math.abs(r.extracted-0.1)<1e-9);assert(Math.abs(c.uraniumReserve-1.9)<1e-9);
 assert.equal(extractRareMineral(c,s,{powered:true,workerReady:true,storageLimit:1}).extracted,0);
});
test('extraction survives save/load and rejects corrupted resources',()=>{
 const c={feature:'gold',goldReserve:5},s=createRareStock();
 extractRareMineral(c,s,{powered:true,workerReady:true});
 const restored=JSON.parse(JSON.stringify({c,s}));
 assert.deepEqual(extractRareMineral(c,s,{powered:true,workerReady:true}),extractRareMineral(restored.c,restored.s,{powered:true,workerReady:true}));
 assert.deepEqual({c,s},restored);
 c.goldReserve=-1;assert.throws(()=>extractRareMineral(c,s,{powered:true,workerReady:true}));
});
