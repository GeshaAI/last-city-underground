// Pure cooling model for LAST CITY v0.2.22.
// Isolated until reactor/building integration is complete; no live saves are changed.
export const COOLING_DEFAULTS=Object.freeze({lakeTemperature:12,maxLakeTemperature:35,maxReactorTemperature:95,scramTemperature:90,thermalMass:40,ambientLoss:0.02,pumpCapacity:8,heatPerPower:1.6,exchangerEfficiency:0.75});
const finite=(n,name)=>{if(!Number.isFinite(n)||n<0)throw Error('Invalid '+name);return n;};
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export function createCoolingSystem(lake,config={}){
 if(lake?.feature!=='coolingLake')throw Error('A cooling lake is required');
 const cfg={...COOLING_DEFAULTS,...config};
 for(const [key,value] of Object.entries(cfg))finite(value,key);
 if(cfg.thermalMass===0||cfg.maxReactorTemperature<=cfg.scramTemperature||cfg.exchangerEfficiency>1)throw Error('Invalid cooling parameters');
 return {reactorTemperature:cfg.lakeTemperature,reactorState:'offline',scrammed:false,config:cfg};
}
// Tick returns actual output; water is drawn and returned, with explicit evaporation losses.
// Primary reactor coolant is closed-loop; lake water only enters the heat exchanger.
export function stepCooling(lake,system,{dt=1,powerRequested=0,fuelAvailable=0,pumpPowered=false,pipeConnected=false,exchangerReady=false,operatorReady=false,evaporationFraction=0.005}={}){
 finite(dt,'dt');finite(powerRequested,'powerRequested');finite(fuelAvailable,'fuelAvailable');finite(evaporationFraction,'evaporationFraction');
 if(dt>2||evaporationFraction>1)throw Error('Invalid timestep or evaporation');
 if(lake?.feature!=='coolingLake'||!system?.config)throw Error('Cooling system missing');
 for(const key of ['coolingWater','coolingWaterMax','temperature','rechargeRate'])finite(lake[key],key);
 if(lake.coolingWater>lake.coolingWaterMax)throw Error('Lake exceeds capacity');
 const cfg=system.config;
 let state=system.reactorState;
 if(!['offline','running','scrammed'].includes(state))throw Error('Invalid reactor state');
 let temp=finite(system.reactorTemperature,'reactorTemperature');
 const ready=!!(pumpPowered&&pipeConnected&&exchangerReady&&operatorReady&&lake.coolingWater>0&&lake.temperature<cfg.maxLakeTemperature);
 let coolingCapacity=0,withdrawal=0,returned=0,evaporated=0,output=0;
 if(ready&&state==='running'&&!system.scrammed){
   withdrawal=Math.min(lake.coolingWater,cfg.pumpCapacity*dt);
   coolingCapacity=withdrawal*cfg.exchangerEfficiency*Math.max(0,1-lake.temperature/cfg.maxLakeTemperature);
   const temperatureHeadroom=Math.max(0,(cfg.scramTemperature-temp)*cfg.thermalMass);
   output=Math.min(powerRequested*dt,fuelAvailable,coolingCapacity/cfg.heatPerPower,temperatureHeadroom/cfg.heatPerPower);
   const heat=output*cfg.heatPerPower;
   temp+=Math.max(0,heat-coolingCapacity)/cfg.thermalMass;
   evaporated=withdrawal*evaporationFraction;
   returned=withdrawal-evaporated;
   lake.coolingWater=clamp(lake.coolingWater-evaporated,0,lake.coolingWaterMax);
   lake.temperature+=Math.max(0,heat)*0.0003;
 }
 // Passive cooldown; no energy production without active cooling.
 temp=Math.max(cfg.lakeTemperature,temp-(temp-cfg.lakeTemperature)*cfg.ambientLoss*dt);
 lake.temperature=Math.max(cfg.lakeTemperature,lake.temperature-(lake.temperature-cfg.lakeTemperature)*0.002*dt);
 lake.coolingWater=Math.min(lake.coolingWaterMax,lake.coolingWater+lake.rechargeRate*dt);
 if(state==='running'&&(!ready||temp>=cfg.scramTemperature)){
   state='scrammed';system.scrammed=true;output=0;
 }
 system.reactorState=state;system.reactorTemperature=temp;
 return {output,ready,coolingCapacity,withdrawal,returned,evaporated,state,reactorTemperature:temp,lakeTemperature:lake.temperature,lakeWater:lake.coolingWater};
}
export function startReactor(lake,system,{pumpPowered=false,pipeConnected=false,exchangerReady=false,operatorReady=false,fuelAvailable=0}={}){
 if(system.scrammed||system.reactorState==='scrammed')return 'Требуется проверка и сброс аварийной защиты';
 if(!pumpPowered||!pipeConnected||!exchangerReady||!operatorReady||lake?.feature!=='coolingLake'||lake.coolingWater<=0||lake.temperature>=system.config.maxLakeTemperature)return 'Нет исправного охлаждения';
 if(fuelAvailable<=0)return 'Нет ядерного топлива';
 system.reactorState='running';return null;
}
export function resetScram(system,{inspected=false}={}){
 if(!inspected)return 'Требуется осмотр';
 if(system.reactorTemperature>system.config.lakeTemperature+10)return 'Реактор ещё не остыл';
 system.scrammed=false;system.reactorState='offline';return null;
}
