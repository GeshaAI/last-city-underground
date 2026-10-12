// Rare-resource geology for v0.2.22. Opt-in, save-safe migration.
// Do not call on existing worlds until gameplay, rendering and save tests are ready.
const hash=(seed,x,y,salt)=>{let n=((seed>>>0)^Math.imul(x+1,73856093)^Math.imul(y+1,19349663)^salt)>>>0;n=Math.imul(n^(n>>>16),2246822507)>>>0;return (n^(n>>>13))>>>0;};
export const RARE_GEOLOGY_VERSION=1;
export function enrichRareGeology(world,{gold=2,uranium=2,coolingLake=1}={}){
  if(world.rareGeologyVersion===RARE_GEOLOGY_VERSION)return {added:0,skipped:true};
  if(!Array.isArray(world.cells)||!Number.isFinite(world.seed))throw Error('Invalid world');
  const width=world.bunkerBounds?.w??64,height=world.bunkerBounds?.h??40;
  const occupied=new Set((world.jobs||[]).map(j=>j.x+','+j.y));
  for(const site of world.projectSites||[])occupied.add(site.x+','+site.y);
  const eligible=world.cells.filter(c=>c.x>=0&&c.y>=0&&c.x<width&&c.y<height&&c.type==='rock'&&!c.seen&&!c.surveyed&&!c.feature&&!c.building&&!occupied.has(c.x+','+c.y));
  eligible.sort((a,b)=>hash(world.seed,a.x,a.y,117)-hash(world.seed,b.x,b.y,117)||a.y-b.y||a.x-b.x);
  let added=0;const counts={gold:0,uranium:0,coolingLake:0};
  for(const [feature,amount] of [['gold',gold],['uranium',uranium],['coolingLake',coolingLake]]){
    const target=Math.max(0,Math.min(20,Math.floor(Number.isFinite(amount)?amount:0)));
    for(let i=0;i<target&&eligible.length;i++){
      const c=eligible.shift(),h=hash(world.seed,c.x,c.y,feature==='gold'?19:feature==='uranium'?37:53);
      c.feature=feature;
      if(feature==='gold'){c.goldReserve=120+h%241;c.goldMax=c.goldReserve;}
      if(feature==='uranium'){c.uraniumReserve=180+h%321;c.uraniumMax=c.uraniumReserve;}
      if(feature==='coolingLake'){c.coolingWater=3000+h%2001;c.coolingWaterMax=c.coolingWater;c.rechargeRate=0.03;c.temperature=12;c.pollution=0;}
      counts[feature]++;added++;
    }
  }
  // Flag even when no safe sites exist, so reloading never changes a played map.
  world.rareGeologyVersion=RARE_GEOLOGY_VERSION;
  return {added,counts,skipped:false};
}
export function validateRareGeology(world){
  for(const c of world.cells||[]){
    if(c.feature==='gold'||c.feature==='uranium'){
      const key=c.feature+'Reserve',max=c.feature+'Max';
      if(!Number.isFinite(c[key])||c[key]<0||!Number.isFinite(c[max])||c[max]<c[key])throw Error('Invalid rare ore reserve');
    }
    if(c.feature==='coolingLake'&&(!Number.isFinite(c.coolingWater)||c.coolingWater<0||!Number.isFinite(c.coolingWaterMax)||c.coolingWaterMax<c.coolingWater||!Number.isFinite(c.temperature)||!Number.isFinite(c.pollution)||c.pollution<0||!Number.isFinite(c.rechargeRate)||c.rechargeRate<0))throw Error('Invalid cooling lake');
  }
  return true;
}
