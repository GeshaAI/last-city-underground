import {test} from 'node:test';import assert from 'node:assert/strict';
import {GOLD_PROJECTS,purchaseGoldProject} from '../dist/gold-projects.js';
test('gold project purchase deducts only once',()=>{
 const stock={gold:50},built=new Set();
 const result=purchaseGoldProject(stock,'nuclearPlant',built);
 assert.equal(result.ok,true);assert.equal(stock.gold,20);
 assert.equal(purchaseGoldProject(stock,'nuclearPlant',built).ok,false);assert.equal(stock.gold,20);
});
test('unaffordable and unknown projects do not spend gold',()=>{
 const stock={gold:4},built=new Set();
 assert.equal(purchaseGoldProject(stock,'undergroundRadar',built).ok,false);
 assert.equal(purchaseGoldProject(stock,'invalid',built).ok,false);
 assert.equal(stock.gold,4);assert.equal(built.size,0);
});
test('all gold projects have positive finite costs',()=>{
 assert.equal(Object.keys(GOLD_PROJECTS).length,6);
 for(const p of Object.values(GOLD_PROJECTS))assert(Number.isFinite(p.gold)&&p.gold>0);
});
