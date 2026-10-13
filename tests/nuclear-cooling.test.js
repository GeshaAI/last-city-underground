import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCoolingSystem,startReactor,stepCooling,resetScram} from '../dist/nuclear-cooling.js';
const lake=()=>({feature:'coolingLake',coolingWater:4000,coolingWaterMax:4000,rechargeRate:0.03,temperature:12,pollution:0});
const ready={pumpPowered:true,pipeConnected:true,exchangerReady:true,operatorReady:true,fuelAvailable:100};
test('reactor refuses start without complete cooling and fuel',()=>{
 const l=lake(),s=createCoolingSystem(l);
 assert(startReactor(l,s,{...ready,pumpPowered:false}));
 assert(startReactor(l,s,{...ready,fuelAvailable:0}));
 assert.equal(startReactor(l,s,ready),null);
});
test('lake cooling produces finite energy and conserves pumped water',()=>{
 const l=lake(),s=createCoolingSystem(l);startReactor(l,s,ready);
 const before=l.coolingWater;
 const r=stepCooling(l,s,{...ready,dt:1,powerRequested:3});
 assert(r.output>0&&r.output<=3);assert(r.withdrawal>=r.returned);
 assert(Math.abs(r.withdrawal-r.returned-r.evaporated)<1e-9);
 assert(Math.abs(l.coolingWater-(before-r.evaporated+l.rechargeRate))<1e-8);
});
test('pump failure SCRAMs and requires inspection/cooldown before restart',()=>{
 const l=lake(),s=createCoolingSystem(l);startReactor(l,s,ready);
 const r=stepCooling(l,s,{...ready,pumpPowered:false,powerRequested:4});
 assert.equal(r.output,0);assert.equal(s.reactorState,'scrammed');
 assert(startReactor(l,s,ready));assert(resetScram(s));assert.equal(resetScram(s,{inspected:true}),null);
 assert.equal(startReactor(l,s,ready),null);
});
test('dry lake and overheated lake never produce energy',()=>{
 for(const key of ['coolingWater','temperature']){
 const l=lake(),s=createCoolingSystem(l);startReactor(l,s,ready);
 if(key==='coolingWater')l.coolingWater=0;else l.temperature=50;
 const r=stepCooling(l,s,{...ready,powerRequested:6});
 assert.equal(r.output,0);assert.equal(r.state,'scrammed');
 }
});
test('system survives JSON save/load and rejects negative lake state',()=>{
 const l=lake(),s=createCoolingSystem(l);startReactor(l,s,ready);
 const first=stepCooling(l,s,{...ready,powerRequested:4});
 const copy=JSON.parse(JSON.stringify({l,s}));
 assert.deepEqual(stepCooling(l,s,{...ready,powerRequested:4}),stepCooling(copy.l,copy.s,{...ready,powerRequested:4}));
 l.coolingWater=-1;assert.throws(()=>stepCooling(l,s,ready));
});
