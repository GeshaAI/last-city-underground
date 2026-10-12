// Save-safe standalone rare mineral extraction rules.
// These helpers do not mutate legacy campaign resources until explicitly integrated.
const rate={gold:0.18,uranium:0.35};
const key={gold:'goldReserve',uranium:'uraniumReserve'};
export function extractRareMineral(cell,stock,{dt=1,workerReady=false,powered=false,storageLimit=Infinity}={}){
 if(!cell||!(cell.feature in rate))return {extracted:0,reason:'нет месторождения'};
 if(!Number.isFinite(dt)||dt<0||dt>2||!(storageLimit>=0))throw Error('Invalid extraction parameters');
 const feature=cell.feature,k=key[feature],remaining=cell[k];
 if(!Number.isFinite(remaining)||remaining<0||!Number.isFinite(stock[feature])||stock[feature]<0)throw Error('Invalid mineral stock');
 if(!workerReady||!powered)return {extracted:0,reason:!powered?'нет энергии':'нет шахтёра'};
 const amount=Math.max(0,Math.min(remaining,rate[feature]*dt,storageLimit-stock[feature]));
 cell[k]=remaining-amount;
 stock[feature]+=amount;
 return {extracted:amount,reason:amount>0?'добыча':remaining<=0?'залежь исчерпана':'склад заполнен'};
}
export function createRareStock(existing={}){return {gold:existing.gold??0,uranium:existing.uranium??0};}
