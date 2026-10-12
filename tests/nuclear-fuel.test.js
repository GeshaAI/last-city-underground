import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createNuclearPlant,mineUranium,fabricateFuel,tickNuclearPlant,commissionReactor} from '../dist/nuclear-fuel.js';
const lake=()=>({feature:'coolingLake',x:8,y:9,coolingWater:4000,coolingWaterMax:4000,rechargeRate:0.03,temperature:12,pollution:0});
const ready={pumpPowered:true,pipeConnected:true,exchangerReady:true,operatorReady:true};
test('uranium mining depletes finite reserve only with worker and power',()=>{
 const l=lake(),p=createNuclearPlant(l),ore={feature:'uranium',uraniumReserve:0.5};
 assert.equal(mineUranium(ore,p,{dt:1,powered:true}),0);
 assert.equal(mineUranium(ore,p,{dt:1,powered:true,workerReady:true}),0.35);
 assert(Math.abs(mineUranium(ore,p,{dt:1,powered:true,workerReady:true})-0.15)<1e-8);
 assert.equal(mineUranium(ore,p,{dt:1,powered:true,workerReady:true}),0);
 assert.equal(ore.uraniumReserve,0);
});
test('fuel fabrication consumes ore without inventing material',()=>{
 const l=lake(),p=createNuclearPlant(l);p.uraniumOre=24;
 assert.equal(fabricateFuel(p,{workerReady:true,powered:false}),0);
 assert.equal(fabricateFuel(p,{workerReady:true,powered:true}),1);
 assert.equal(p.uraniumOre,12);assert.equal(p.fuel,1);
});
test('reactor requires fuel and cooling and consumes fuel for produced energy',()=>{
 const l=lake(),p=createNuclearPlant(l);
 assert(commissionReactor(l,p,ready));
 p.fuel=2;assert.equal(commissionReactor(l,p,ready),null);
 const before=p.fuel;
 const r=tickNuclearPlant(l,p,{...ready,dt:1,powerRequested:6});
 assert(r.output>0);assert(r.output<=6);
 assert(Math.abs(before-p.fuel-r.output*0.025)<1e-8);
 assert.equal(p.energyProduced,r.output);
});
test('failed pump stops production and does not burn nuclear fuel',()=>{
 const l=lake(),p=createNuclearPlant(l);p.fuel=1;
 assert.equal(commissionReactor(l,p,ready),null);
 const r=tickNuclearPlant(l,p,{...ready,pumpPowered:false,powerRequested:10});
 assert.equal(r.output,0);assert.equal(r.fuelConsumed,0);
 assert.equal(p.fuel,1);assert.equal(r.state,'scrammed');
});
test('fuel-cycle state survives JSON save/load deterministically',()=>{
 const l=lake(),p=createNuclearPlant(l);p.fuel=1;
 commissionReactor(l,p,ready);
 const saved=JSON.parse(JSON.stringify({l,p}));
 assert.deepEqual(tickNuclearPlant(l,p,{...ready,powerRequested:3}),tickNuclearPlant(saved.l,saved.p,{...ready,powerRequested:3}));
 assert.deepEqual(p,saved.p);
});
