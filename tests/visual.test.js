import {test} from 'node:test';
import assert from 'node:assert/strict';
import {W,createWorld,step,command} from '../dist/engine.js';
import {residentPose,portrait,roomIcon,TW,TH} from '../dist/render.js';
test('sleeping residents occupy separate beds in their real room',()=>{let s=createWorld(2);for(let i=0;i<4;i++){let p=s.people[i];p.x=14;p.y=7;p.task='Отдых';p.path=[];}let poses=s.people.slice(0,4).map(p=>residentPose(s,p));assert(poses.every(p=>p.kind==='sleep'&&p.x>=14*TW&&p.x<15*TW&&p.y>=7*TH&&p.y<8*TH));assert.equal(new Set(poses.map(p=>`${p.x},${p.y}`)).size,4);s.people[0].path=[{x:15,y:7}];assert.equal(residentPose(s,s.people[0]).kind,'walk');});
test('working pose requires a resident actually at the equipment',()=>{let s=createWorld(2),p=s.people[0];p.x=17;p.y=7;p.task='Генератор';p.target={x:17,y:7};assert.equal(residentPose(s,p).kind,'operate');p.path=[{x:17,y:7}];assert.equal(residentPose(s,p).kind,'walk');});
test('portraits respond to resident needs and illustrated icons are SVG',()=>{let s=createWorld(1),p=s.people[0];let happy=portrait(p);p.health=30;let sad=portrait(p);assert.notEqual(happy,sad);p.fatigue=90;assert.notEqual(sad,portrait(p));for(let type of ['home','generator','farm','water','lab','drill','inspect','dig'])assert(roomIcon(type).startsWith('<svg'));});
test('idle resident still takes a new construction command',()=>{let s=createWorld(2);for(let i=0;i<10;i++)step(s,1);assert(s.people.some(p=>p.task==='Свободен'));assert.equal(command(s,'dig',22,7),null);for(let i=0;i<60;i++)step(s,1);assert.equal(s.cells[7*W+22].type,'open');});
