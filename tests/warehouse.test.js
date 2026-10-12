import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,cell,restore,serialize,step,setProductionTarget,command,jobAction,dismantleCheck} from '../dist/engine.js';
import {capacity,stockFull,barData} from '../dist/economy.js';
import {roomAlert} from '../dist/render.js';
test('existing and added warehouses each contribute 600, with stock and costs retained on load',()=>{let s=createWorld(1),stock={...s.resources};assert.equal(capacity(s),850);cell(s,18,7).building='storage';assert.equal(capacity(s),1450);let loaded=restore(serialize(s));assert.equal(capacity(loaded),1450);assert.deepEqual(loaded.resources,stock);});
test('old full stock becomes partly filled, and flashing starts at the new exact capacity',()=>{let s=createWorld(1),c=cell(s,16,7);s.resources.metal=450;assert.equal(roomAlert(s,c),null);assert.equal(stockFull(s).length,0);s.resources.metal=850;assert.deepEqual(stockFull(s),['metal']);assert.equal(roomAlert(s,c).kind,'full');assert.equal(barData(s,c).max,850*8);});
test('production targets, cancellation and salvage use the same expanded headroom',()=>{let s=createWorld(1);assert.equal(setProductionTarget(s,cell(s,19,7),800),null);cell(s,18,7).building=null;assert.equal(command(s,'build',18,7,'home'),null);s.resources.material=700;assert.equal(jobAction(s,s.jobs[0].id,'cancel'),null);assert.equal(s.resources.material,718);assert.equal(dismantleCheck(s,cell(s,17,7)),null);});
