// Opt-in integration layer for the v0.2.22 nuclear economy.
// Call explicitly from the engine after world save migration and building placement are implemented.
import {extractRareMineral,createRareStock} from './rare-mining.js';
import {createNuclearPlant,mineUranium,fabricateFuel,tickNuclearPlant,commissionReactor} from './nuclear-fuel.js';
import {validateRareGeology} from './rare-geology.js';
export function createNuclearEconomy(world,lakeCell){
 if(!world?.cells?.includes(lakeCell)||lakeCell.feature!=='coolingLake')throw Error('Lake must belong to world');
 validateRareGeology(world);
 return {stock:createRareStock(world.resources),plant:createNuclearPlant(lakeCell),lake:{x:lakeCell.x,y:lakeCell.y},totalEnergy:0};
}
export function nuclearEconomyTick(world,state,{
 dt=1,miners=[],fuelFabricatorReady=false,fuelFabricatorPowered=false,
 pumpPowered=false,pipeConnected=false,exchangerReady=false,operatorReady=false,powerRequested=0
}={}){
 if(!Number.isFinite(dt)||dt<0||dt>2)throw Error('Invalid dt');
 const lake=world.cells.find(c=>c.x===state.lake.x&&c.y===state.lake.y&&c.feature==='coolingLake');
 if(!lake)throw Error('Cooling lake missing');
 let gold=0,uranium=0;
 for(const entry of miners){
  if(!world.cells.includes(entry.cell))throw Error('Mineral cell outside world');
  const {cell,workerReady=false,powered=false}=entry;
  const r=extractRareMineral(cell,state.stock,{dt,workerReady,powered,storageLimit:entry.storageLimit??Infinity});
  if(cell.feature==='gold')gold+=r.extracted;
  if(cell.feature==='uranium')uranium+=r.extracted;
 }
 // Uranium is transferred into the plant ore stock only when the fuel fabricator runs.
 if(fuelFabricatorReady&&fuelFabricatorPowered){
  const transfer=Math.min(state.stock.uranium,12*dt);
  state.stock.uranium-=transfer;state.plant.uraniumOre+=transfer;
 }
 const fuel=fabricateFuel(state.plant,{dt,workerReady:fuelFabricatorReady,powered:fuelFabricatorPowered});
 const reactor=tickNuclearPlant(lake,state.plant,{dt,powerRequested,pumpPowered,pipeConnected,exchangerReady,operatorReady});
 state.totalEnergy+=reactor.output;
 return {gold,uranium,fuel,reactor};
}
export {commissionReactor};
