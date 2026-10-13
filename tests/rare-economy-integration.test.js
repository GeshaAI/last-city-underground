import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,restore,serialize,BUILD} from '../dist/engine.js';
import {recipe,RESOURCE_NAMES} from '../dist/economy.js';
test('gold and uranium mines have production recipes and resource labels',()=>{
 const w=createWorld(123);
 const gold={building:'goldMine',goldReserve:5},uranium={building:'uraniumMine',uraniumReserve:5};
 assert.equal(recipe(w,gold).input.goldDeposit,recipe(w,gold).output.gold);
 assert.equal(recipe(w,uranium).input.uraniumDeposit,recipe(w,uranium).output.uranium);
 assert.equal(RESOURCE_NAMES.gold,'Золото');assert.equal(RESOURCE_NAMES.uranium,'Уран');
 assert(BUILD.goldMine&&BUILD.uraniumMine);
});
test('new mineral resource balances persist across restore',()=>{
 const w=createWorld(1234);w.resources.gold=12;w.resources.uranium=7;w.resources.nuclearFuel=3;
 const loaded=restore(serialize(w));
 assert.equal(loaded.resources.gold,12);assert.equal(loaded.resources.uranium,7);assert.equal(loaded.resources.nuclearFuel,3);
});
test('old world without rare resource keys migrates safely',()=>{
 const w=createWorld(1234);delete w.resources.gold;delete w.resources.uranium;delete w.resources.nuclearFuel;
 const loaded=restore(serialize(w));
 assert.equal(loaded.resources.gold,0);assert.equal(loaded.resources.uranium,0);assert.equal(loaded.resources.nuclearFuel,0);
});
