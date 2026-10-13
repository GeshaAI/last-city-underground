import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld} from '../dist/engine.js';
import {createNuclearEconomy,nuclearEconomyTick,commissionReactor} from '../dist/nuclear-economy.js';
const ready={pumpPowered:true,pipeConnected:true,exchangerReady:true,operatorReady:true};
test('opt-in economy mines, fabricates fuel, then generates energy with lake cooling',()=>{
 const w=createWorld(19),lake=w.cells[0],ore=w.cells[1],gold=w.cells[2];
 Object.assign(lake,{feature:'coolingLake',coolingWater:4000,coolingWaterMax:4000,rechargeRate:0.03,temperature:12,pollution:0});
 Object.assign(ore,{feature:'uranium',uraniumReserve:60,uraniumMax:60});
 Object.assign(gold,{feature:'gold',goldReserve:20,goldMax:20});
 const state=createNuclearEconomy(w,lake);
 for(let i=0;i<45;i++)nuclearEconomyTick(w,state,{dt:1,miners:[{cell:ore,workerReady:true,powered:true},{cell:gold,workerReady:true,powered:true}],fuelFabricatorReady:true,fuelFabricatorPowered:true});
 assert(state.stock.gold>0);assert(state.plant.fuel>0);assert(ore.uraniumReserve<60);
 assert.equal(commissionReactor(lake,state.plant,{...ready,fuelAvailable:state.plant.fuel}),null);
 const result=nuclearEconomyTick(w,state,{...ready,powerRequested:5});
 assert(result.reactor.output>0);assert(state.totalEnergy>0);
 const fuel=state.plant.fuel;
 const stopped=nuclearEconomyTick(w,state,{...ready,pumpPowered:false,powerRequested:5});
 assert.equal(stopped.reactor.output,0);assert.equal(state.plant.fuel,fuel);
});
test('opt-in adapter does not change original campaign resources',()=>{
 const w=createWorld(20),lake=w.cells[0];
 Object.assign(lake,{feature:'coolingLake',coolingWater:100,coolingWaterMax:100,rechargeRate:0,temperature:12,pollution:0});
 const original=JSON.stringify(w.resources);
 const state=createNuclearEconomy(w,lake);
 nuclearEconomyTick(w,state,{dt:1});
 assert.equal(JSON.stringify(w.resources),original);
});
