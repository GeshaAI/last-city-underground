// Rare-gold high technology purchases; isolated until main-world integration.
export const GOLD_PROJECTS=Object.freeze({
 nuclearPlant:{name:'Атомная электростанция',gold:30},
 automationCenter:{name:'Центр автоматизации',gold:15},
 undergroundRadar:{name:'Подземный радар',gold:10},
 defenseSystem:{name:'Защитные системы бункера',gold:12},
 scienceComplex:{name:'Научный комплекс',gold:20},
 interBunkerComms:{name:'Межбункерная связь',gold:8}
});
export function purchaseGoldProject(stock,projectId,completed=new Set()){
 const project=GOLD_PROJECTS[projectId];
 if(!project)return {ok:false,reason:'Неизвестная технология'};
 if(completed.has(projectId))return {ok:false,reason:'Уже построено'};
 if(!Number.isFinite(stock?.gold)||stock.gold<0)return {ok:false,reason:'Повреждён запас золота'};
 if(stock.gold<project.gold)return {ok:false,reason:'Недостаточно золота'};
 stock.gold-=project.gold;completed.add(projectId);
 return {ok:true,spent:project.gold,remaining:stock.gold,name:project.name};
}
