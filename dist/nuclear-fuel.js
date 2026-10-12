// Isolated nuclear fuel-cycle simulation for LAST CITY v0.2.22.
// Integration with world buildings, campaign electricity and UI follows after tests.
import {createCoolingSystem,startReactor,stepCooling,resetScram} from './nuclear-cooling.js';

const finite=(value,name)=>{if(!Number.isFinite(value)||value<0)throw Error('Invalid '+name);return value;};
export const NUCLEAR_RATES=Object.freeze({uraniumMining:0.35,orePerFuel:12,fuelPerEnergy:0.025,reactorMaxPower:12,pumpEnergyPerTick:0.2});
export function createNuclearPlant(lake){
 return {lakeCell:{x:lake.x,y:lake.y},cooling:createCoolingSystem(lake),fuel:0,uraniumOre:0,energyProduced:0,uraniumMined:0};
}
export function mineUranium(deposit,plant,{dt=1,workerReady=false,powered=false}={}){
 finite(dt,'dt');if(dt>2)throw Error('Invalid dt');
 if(deposit?.feature!=='uranium'||!workerReady||!powered)return 0;
 finite(deposit.uraniumReserve,'uraniumReserve');
 const amount=Math.min(deposit.uraniumReserve,NUCLEAR_RATES.uraniumMining*dt);
 deposit.uraniumReserve-=amount;plant.uraniumOre+=amount;plant.uraniumMined+=amount;return amount;
}
export function fabricateFuel(plant,{dt=1,workerReady=false,powered=false}={}){
 finite(dt,'dt');if(dt>2)throw Error('Invalid dt');
 if(!workerReady||!powered)return 0;
 finite(plant.uraniumOre,'uraniumOre');
 const oreUsed=Math.min(plant.uraniumOre,dt*NUCLEAR_RATES.orePerFuel);
 plant.uraniumOre-=oreUsed;
 const fuel=oreUsed/NUCLEAR_RATES.orePerFuel;plant.fuel+=fuel;return fuel;
}
export function tickNuclearPlant(lake,plant,{dt=1,powerRequested=0,pumpPowered=false,pipeConnected=false,exchangerReady=false,operatorReady=false}={}){
 finite(dt,'dt');finite(powerRequested,'powerRequested');if(dt>2)throw Error('Invalid dt');
 finite(plant.fuel,'fuel');
 const result=stepCooling(lake,plant.cooling,{
  dt,powerRequested:Math.min(powerRequested,NUCLEAR_RATES.reactorMaxPower),
  fuelAvailable:plant.fuel/NUCLEAR_RATES.fuelPerEnergy,
  pumpPowered,pipeConnected,exchangerReady,operatorReady
 });
 const consumed=Math.min(plant.fuel,result.output*NUCLEAR_RATES.fuelPerEnergy);
 plant.fuel-=consumed;plant.energyProduced+=result.output;
 return {...result,fuelConsumed:consumed,remainingFuel:plant.fuel};
}
export function commissionReactor(lake,plant,conditions={}){
 return startReactor(lake,plant.cooling,{...conditions,fuelAvailable:plant.fuel});
}
export function inspectAndReset(plant,{inspected=false}={}){return resetScram(plant.cooling,{inspected});}
