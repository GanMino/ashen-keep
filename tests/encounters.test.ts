import test from 'node:test';
import assert from 'node:assert/strict';
import type {Game} from '../src/game';
import type {Enemy} from '../src/types';
import {ENCOUNTERS,onEncounterHurt,updateHazards,updateSpecialEnemy,type Hazard} from '../src/encounters';

function fixture(variant:string,kind:Enemy['kind']='boss'){
 const e:Enemy={id:1,kind,variant,x:650,y:440,vx:0,vy:0,hp:600,maxHp:600,facing:-1,timer:0,attack:0,flash:0,dead:false,homeY:440};
 const hits:{damage:number;cause:string}[]=[];
 const g={floor:3,player:{x:480,y:440},room:{width:1600,enemies:[e]},hazards:[] as Hazard[],shots:[] as {hostile:boolean;life:number;vx:number;vy:number;y:number}[],rng:()=>.4,
 effect:()=>{},say:()=>{},sound:{play:()=>{}},hurtPlayer:(damage:number,cause:string)=>hits.push({damage,cause}),
 shoot:(_x:number,y:number,vx:number,vy:number,_damage:number,hostile:boolean)=>g.shots.push({hostile,life:2.2,vx,vy,y})} as unknown as Game;
 return {g,e,hits};
}
function attack(variant:string,move=0,kind:Enemy['kind']='boss'){
 const f=fixture(variant,kind);f.e.move=move;updateSpecialEnemy(f.g,f.e,.016);
 const tells=f.g.hazards.map(h=>({...h}));const windup=f.e.attack;updateSpecialEnemy(f.g,f.e,windup+.001);
 return {...f,tells,windup};
}

test('five bosses use distinct attacks with readable windup and recovery',()=>{
 const gate=attack('gate-warden'),ink=attack('ink-abbot'),bone=attack('bone-mother'),bell=attack('bell-keeper'),king=attack('hollow-king',1);
 assert(gate.tells.some(h=>h.kind==='line'));assert((gate.e.actionTime??0)>0);
 assert.equal(ink.g.shots.length,5);assert(new Set(ink.g.shots.map(s=>s.vy)).size>1);
 assert.equal(bone.g.room.enemies.filter(e=>e.kind==='skeleton').length,3);
 assert.equal(bell.g.shots.length,2);assert(bell.g.shots.every(s=>s.y===427&&s.vy===0));
 assert(king.tells.length>=6);assert(king.tells.every(h=>h.kind==='rain'));
 for(const f of [gate,ink,bone,bell,king]){assert(f.windup>=.6);assert((f.e.recovery??0)>=1);assert.equal(f.hits.length,0);}
});

test('boss alternative attacks retain their own mechanics',()=>{
 const gate=attack('gate-warden',1),ink=attack('ink-abbot',1),bone=attack('bone-mother',1),bell=attack('bell-keeper',1),king=attack('hollow-king');
 assert.equal(gate.tells.length,1);assert.equal(gate.tells[0].kind,'blast');
 assert.equal(ink.tells.length,3);assert(ink.tells.every(h=>h.h>300));
 assert.equal(bone.tells.length,6);assert(new Set(bone.tells.map(h=>h.delay)).size===3);
 assert.equal(bell.tells.length,3);assert(new Set(bell.tells.map(h=>h.delay)).size===2);
 assert((king.e.charge??0)!==0);
});

test('hazards visibly warn before damage; jumping clears low ground attacks',()=>{
 const {g,e,hits}=fixture('gate-warden');updateSpecialEnemy(g,e,.016);
 const h=g.hazards[0];g.player.x=h.x+h.w/2;
 updateHazards(g,.5);assert.equal(hits.length,0);assert(h.delay>0);
 updateHazards(g,.39);assert.equal(hits.length,0);
 updateHazards(g,.02);assert.equal(hits.length,1);
 g.player.y=370;updateHazards(g,.016);assert.equal(hits.length,1);
 e.dead=true;updateHazards(g,.016);assert.equal(g.hazards.length,0);
});

test('final crown barrage preserves a wide cast-time safe corridor',()=>{
 const {g,e}=fixture('hollow-king');e.move=1;updateSpecialEnemy(g,e,.016);
 const x=g.player.x;assert(g.hazards.length>5);
 assert(g.hazards.every(h=>h.x+h.w<x-50||h.x>x+50));
 g.player.x=1000;assert(g.hazards.every(h=>h.x+h.w<x-50||h.x>x+50),'safe gap must not track movement');
});

test('all ten elite variants produce distinct signatures',()=>{
 const variants=['butcher','lancer','hexer','mirror','gravekeeper','swarm','duelist','storm','royalguard','oracle'];
 const signatures=new Set<string>();
 for(const id of variants){
  const f=attack(id,0,'elite');assert(ENCOUNTERS[id]);assert(f.e.telegraph);
  signatures.add(JSON.stringify({hazards:f.tells.map(h=>[h.w,h.h,h.delay]),shots:f.g.shots.map(s=>[s.vx,s.vy,s.y]),adds:f.g.room.enemies.length,charge:f.e.charge,x:f.e.x}));
 }
 assert.equal(signatures.size,10);
});

test('boss phase transition is single-use, cancels old attacks and adds no generic ghosts',()=>{
 for(const id of ['gate-warden','ink-abbot','bone-mother','bell-keeper','hollow-king']){
  const {g,e}=fixture(id);updateSpecialEnemy(g,e,.016);e.hp=250;onEncounterHurt(g,e);
  assert.equal(e.bossPhase,2);assert.equal(e.attack,0);assert.equal(g.hazards.length,0);assert.equal(g.room.enemies.length,1);
  e.timer=.2;onEncounterHurt(g,e);assert.equal(e.timer,.2);
 }
});

test('encounter resources and movement stay bounded under repeated casts',()=>{
 const {g,e}=fixture('ink-abbot');
 for(let i=0;i<100;i++){e.attack=0;e.recovery=0;e.timer=0;e.move=i%2;updateSpecialEnemy(g,e,.016);updateSpecialEnemy(g,e,1.1);}
 assert(g.hazards.length<=40);assert(g.shots.length<=180);
 assert(g.hazards.every(h=>h.x>=28&&h.x+h.w<=g.room.width-28));
 const bone=fixture('bone-mother');for(let i=0;i<100;i++){bone.e.move=0;bone.e.attack=0;bone.e.recovery=0;bone.e.timer=0;updateSpecialEnemy(bone.g,bone.e,.016);updateSpecialEnemy(bone.g,bone.e,1.1);}
 assert(bone.g.room.enemies.length<=80);assert(new Set(bone.g.room.enemies.map(e=>e.id)).size===bone.g.room.enemies.length);
 const gate=fixture('gate-warden');gate.e.x=80;updateSpecialEnemy(gate.g,gate.e,.016);updateSpecialEnemy(gate.g,gate.e,1);updateSpecialEnemy(gate.g,gate.e,20);
 assert(gate.e.x>=35&&gate.e.x<=gate.g.room.width-35);
});

test('pending hazard warning cannot fire while its owner windup is staggered',()=>{
 const {g,e,hits}=fixture('gate-warden');updateSpecialEnemy(g,e,.016);
 const h=g.hazards[0];g.player.x=h.x+h.w/2;const warning=h.delay;e.stagger=.5;
 for(let i=0;i<30;i++)updateHazards(g,1/60);
 assert.equal(hits.length,0);assert.equal(h.delay,warning);assert.equal(e.attack,.9);
 e.stagger=0;updateHazards(g,.85);assert.equal(hits.length,0);
 updateHazards(g,.06);assert.equal(hits.length,1);
});

test('frost slows encounter motion without changing attack windup or hazard clocks',()=>{
 const normal=fixture('gate-warden'),frost=fixture('gate-warden');
 normal.g.player.x=frost.g.player.x=100;normal.e.timer=frost.e.timer=5;frost.e.slow=2;
 updateSpecialEnemy(normal.g,normal.e,.1);updateSpecialEnemy(frost.g,frost.e,.1);
 assert(Math.abs((650-frost.e.x)/(650-normal.e.x)-.55)<.001);
 normal.e.timer=frost.e.timer=0;updateSpecialEnemy(normal.g,normal.e,.016);updateSpecialEnemy(frost.g,frost.e,.016);
 updateSpecialEnemy(normal.g,normal.e,.25);updateSpecialEnemy(frost.g,frost.e,.25);
 updateHazards(normal.g,.25);updateHazards(frost.g,.25);
 assert.equal(frost.e.attack,normal.e.attack);assert.equal(frost.g.hazards[0].delay,normal.g.hazards[0].delay);
});
