import type {Game} from './game';
import type {Enemy} from './types';

/** Encounter identities are shared by the HUD, sprite atlas and AI. */
export const ENCOUNTERS:Record<string,{name:string;subtitle:string;tip:string;color:string}>={
 'gate-warden':{name:'宴门巨斧',subtitle:'第一封印 · 暴食的守门人',tip:'红线亮起时跳过冲锋，巨斧落地后贴身反击。',color:'#d6a064'},
 'ink-abbot':{name:'墨典院长',subtitle:'第二封印 · 被涂去的证词',tip:'离开脚下墨印，扇形墨弹之间留有空隙。',color:'#a79bdd'},
 'bone-mother':{name:'骨巢之母',subtitle:'第三封印 · 借来的生命',tip:'先清理孵出的骸骨，再跳过向外扩散的骨刺。',color:'#dad8ac'},
 'bell-keeper':{name:'负钟者',subtitle:'第四封印 · 无人回应的祈祷',tip:'跳过贴地钟波；延迟回响会落在刚才站立的位置。',color:'#86c9c2'},
 'hollow-king':{name:'空心王',subtitle:'最终封印 · 不肯结束的盛宴',tip:'跳过剑冲，在王冠弹雨的空白通道内等待，再抓住收招。',color:'#e1b270'},
 butcher:{name:'铁钩屠夫',subtitle:'宴厅精英 · 宽幅斩击',tip:'退出近身红区，重斧落地后反击。',color:'#d69270'},
 lancer:{name:'烛台枪卫',subtitle:'宴厅精英 · 直线突刺',tip:'枪尖压低时起跳，绕到身后。',color:'#d9bb79'},
 hexer:{name:'咒页修士',subtitle:'书库精英 · 定点咒印',tip:'咒印锁定后继续移动。',color:'#b49ddd'},
 mirror:{name:'镜面抄写者',subtitle:'书库精英 · 双向反射',tip:'上下两层墨弹交错，选择地面空隙。',color:'#8abbd9'},
 gravekeeper:{name:'掘墓人',subtitle:'墓窟精英 · 骨牢',tip:'离开两侧骨柱之间的狭小空间。',color:'#bdc5a5'},
 swarm:{name:'育蛾囊',subtitle:'墓窟精英 · 孵化',tip:'孵化前压制本体，及时清理飞蛾。',color:'#b9be83'},
 duelist:{name:'失时剑客',subtitle:'钟楼精英 · 退步反斩',tip:'不要追着后撤的剑客走进反斩范围。',color:'#9bc5c8'},
 storm:{name:'引雷者',subtitle:'钟楼精英 · 三连落雷',tip:'第一道雷印出现后沿一个方向移动。',color:'#a7d5e5'},
 royalguard:{name:'无首禁卫',subtitle:'王座精英 · 盾震',tip:'跳过盾牌引发的低矮冲击，等待盾牌抬起。',color:'#c8a375'},
 oracle:{name:'盲目先知',subtitle:'王座精英 · 命运裂隙',tip:'观察三道预言光柱之间的空白。',color:'#db9ab9'},
};
export interface Hazard {x:number;y:number;w:number;h:number;delay:number;life:number;damage:number;label:string;color:string;kind:'line'|'blast'|'rain';owner?:number}
export function encounterFor(e:Enemy){return ENCOUNTERS[e.variant??'']??ENCOUNTERS[e.kind==='boss'?'gate-warden':'butcher'];}
const ground=440;
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const ranged=new Set(['ink-abbot','bone-mother','hexer','mirror','swarm','storm','oracle']);
const attacks:Record<string,string[]>={
 'gate-warden':['斧刃冲锋','宴门崩落'], 'ink-abbot':['撕页扇弹','禁书墨雨'],
 'bone-mother':['骨卵孵化','白骨潮汐'], 'bell-keeper':['低鸣钟波','迟来的回响'],
 'hollow-king':['断誓剑冲','空冠裁决'], butcher:['屠宰横斩'],lancer:['烛枪突刺'],
 hexer:['脚下咒印'],mirror:['镜面交错'],gravekeeper:['合拢骨牢'],swarm:['虫囊孵化'],
 duelist:['退步反斩'],storm:['三声雷鸣'],royalguard:['无首盾震'],oracle:['预言裂隙'],
};
function mark(g:Game,e:Enemy,x:number,y:number,w:number,h:number,delay:number,damage:number,kind:Hazard['kind']='blast',life=.22){
 if(g.hazards.length>=40)return;
 w=Math.min(w,g.room.width-56);x=clamp(x,28,g.room.width-28-w);
 g.hazards.push({x,y,w,h,delay:Math.max(.6,delay),life,damage,label:e.telegraph??encounterFor(e).name,color:encounterFor(e).color,kind,owner:e.id});
}
function fire(g:Game,e:Enemy,x:number,y:number,vx:number,vy:number,damage:number,radius=6){
 if(g.shots.filter(s=>s.hostile&&s.life>0).length>=180)return;
 g.shoot(x,y,vx,vy,damage,true,encounterFor(e).color,radius,1,encounterFor(e).name+' · '+e.telegraph);
}
function fan(g:Game,e:Enemy,count:number,spread:number,speed:number,y=e.y-55){
 const a=Math.atan2((e.targetY??g.player.y)-26-y,(e.targetX??g.player.x)-e.x);
 for(let i=0;i<count;i++){const angle=a+(i-(count-1)/2)*spread;fire(g,e,e.x,y,Math.cos(angle)*speed,Math.sin(angle)*speed,12+g.floor,6);}
}
function summon(g:Game,e:Enemy,kind:'skeleton'|'bat',count:number){
 // The living-enemy cap also bounds long fights where the player ignores adds.
 count=Math.min(count,Math.max(0,80-g.room.enemies.length));
 const id=Math.max(0,...g.room.enemies.map(n=>n.id))+1;
 for(let i=0;i<count;i++){
  const x=clamp(e.x+(i-(count-1)/2)*90+(g.rng()-.5)*25,45,g.room.width-45),y=kind==='bat'?315:ground;
  const hp=(kind==='bat'?20:28)+g.floor*4;
  g.room.enemies.push({id:id+i,kind,x,y,vx:0,vy:0,hp,maxHp:hp,facing:e.facing,timer:1.7,attack:0,flash:0,dead:false,homeY:y});
  g.effect('spawn',x,y-25,30,encounterFor(e).color,.5);
 }
}
function begin(g:Game,e:Enemy){
 const id=e.variant??(e.kind==='boss'?'gate-warden':'butcher'),phase=e.bossPhase??1;
 e.move=e.move??0;e.facing=g.player.x>=e.x?1:-1;e.targetX=g.player.x;e.targetY=g.player.y;
 const move=e.move%(attacks[id]?.length??1);e.telegraph=(attacks[id]??attacks.butcher)[move];
 e.attack=id==='hollow-king'?1:id==='storm'?1.15:.9;e.actionTime=0;e.charge=0;
 const damage=e.kind==='boss'?19+g.floor:14+g.floor;
 const tx=e.targetX,attack=e.attack;
 if((id==='gate-warden'&&move===0)||id==='lancer'||(id==='hollow-king'&&move===0)){
  const end=clamp(e.x+e.facing*(id==='lancer'?350:480),45,g.room.width-45);
  mark(g,e,Math.min(e.x,end)-24,ground-52,Math.abs(end-e.x)+48,52,attack,damage,'line',.36);
  e.charge=(end-e.x)/.38;
 }else if(id==='gate-warden'){
  mark(g,e,e.x-170,ground-85,340,85,attack,damage+4,'blast');
  if(phase===2)for(const dir of [-1,1])mark(g,e,e.x+dir*245-50,ground-65,100,65,attack+.45,damage,'blast');
 }else if(id==='ink-abbot'&&move===1){
  for(const offset of [-200,0,200])mark(g,e,tx+offset-38,105,76,ground-105,attack+(offset===0?0:.22),damage,'rain');
  if(phase===2)mark(g,e,tx+100-30,105,60,ground-105,attack+.5,damage,'rain');
 }else if(id==='bone-mother'&&move===1){
  for(let i=0;i<(phase===2?4:3);i++)for(const dir of [-1,1])mark(g,e,e.x+dir*(95+i*105)-38,ground-48,76,48,attack+i*.22,damage,'line');
 }else if(id==='bell-keeper'&&move===1){
  mark(g,e,tx-70,ground-95,140,95,attack,damage,'blast');
  for(const dir of [-1,1])mark(g,e,tx+dir*175-45,ground-70,90,70,attack+.6,damage,'blast');
  if(phase===2)mark(g,e,tx-60,ground-95,120,95,attack+1.2,damage,'blast');
 }else if(id==='hollow-king'&&move===1){
  // A marked 170px corridor follows the player's CAST-TIME position, never their later movement.
  const gap=clamp(tx,180,g.room.width-180),left=clamp(e.x-560,40,g.room.width-1140);
  for(let x=left;x<Math.min(g.room.width-40,left+1120);x+=82)if(Math.abs(x+30-gap)>115)mark(g,e,x,70,60,ground-70,attack,damage,'rain',.38);
  if(phase===2)for(const dir of [-1,1])mark(g,e,gap+dir*190-34,ground-52,68,52,attack+.7,damage,'line');
 }else if(id==='butcher')mark(g,e,e.x+e.facing*88-115,ground-85,230,85,attack,damage+3);
 else if(id==='hexer')mark(g,e,tx-60,ground-110,120,110,attack,damage);
 else if(id==='gravekeeper')for(const dir of [-1,1])mark(g,e,tx+dir*100-28,ground-140,56,140,attack,damage,'rain',.5);
 else if(id==='duelist'){
  const retreat=clamp(e.x-e.facing*78,40,g.room.width-40);e.charge=(retreat-e.x)/attack;
  mark(g,e,retreat+e.facing*100-110,ground-75,220,75,attack,damage+2,'line');
 }else if(id==='storm')for(let i=0;i<3;i++)mark(g,e,tx+e.facing*i*90-26,65,52,ground-65,attack+i*.3,damage,'rain');
 else if(id==='oracle')for(const offset of [-240,0,240])mark(g,e,tx+offset-35,70,70,ground-70,attack,damage,'rain',.38);
 else if(id==='bone-mother'||id==='swarm')g.effect('spawn',e.x,e.y-35,90,encounterFor(e).color,attack);
}
function resolve(g:Game,e:Enemy){
 const id=e.variant??(e.kind==='boss'?'gate-warden':'butcher'),move=(e.move??0)%(attacks[id]?.length??1),phase=e.bossPhase??1;
 const color=encounterFor(e).color;
 if(id==='duelist')e.charge=0;
 if(e.charge){e.actionTime=.38;g.sound.play('heavy');}
 if(id==='ink-abbot'&&move===0)fan(g,e,phase===2?7:5,.24,phase===2?245:210);
 if(id==='mirror'){
  for(const dir of [-1,1])for(let i=0;i<3;i++)fire(g,e,e.x,e.y-(i%2?100:28),dir*(170+i*26),0,13+g.floor,7);
 }
 if(id==='bone-mother'&&move===0)summon(g,e,'skeleton',phase===2?4:3);
 if(id==='swarm')summon(g,e,'bat',3);
 if((id==='bell-keeper'&&move===0)||id==='royalguard'){
  for(const dir of [-1,1]){
   fire(g,e,e.x,ground-13,dir*240,0,16+g.floor,10);
   if(phase===2&&id==='bell-keeper')fire(g,e,e.x-dir*100,ground-13,dir*240,0,16+g.floor,10);
  }
  g.sound.play('bell');g.effect('shockwave',e.x,ground-4,180,color,.5);
 }
 if(id==='gate-warden'&&move===1)g.sound.play('heavy');
 g.effect(id==='ink-abbot'?'fire':'shockwave',e.x,e.y-12,90,color,.32);
 e.move=(e.move??0)+1;e.recovery=e.kind==='boss'?1.05:1.15;e.timer=e.kind==='boss'?(phase===2?.65:.95):1.05;
}
/** Return true for special enemies even while idle so generic melee AI cannot run twice. */
export function updateSpecialEnemy(g:Game,e:Enemy,dt:number):boolean{
 if(e.kind!=='elite'&&e.kind!=='boss')return false;
 if(e.dead)return true;
 e.variant=e.variant??(e.kind==='boss'?'gate-warden':'butcher');e.bossPhase=e.bossPhase??1;
 e.move=e.move??0;e.actionTime=e.actionTime??0;e.recovery=e.recovery??0;
 const movementScale=(e.slow??0)>0?.55:1;
 if(e.actionTime>0){
  e.x=clamp(e.x+(e.charge??0)*Math.min(dt,e.actionTime)*movementScale,35,g.room.width-35);e.actionTime=Math.max(0,e.actionTime-dt);
  if(e.actionTime===0){e.charge=0;if(e.variant==='hollow-king'&&e.bossPhase===2){e.telegraph='追誓斩';mark(g,e,e.x-125,ground-65,250,65,.65,22+g.floor,'line');e.recovery=1.35;}}
  return true;
 }
 if(e.attack>0){if(e.variant==='duelist')e.x=clamp(e.x+(e.charge??0)*Math.min(dt,e.attack)*movementScale,35,g.room.width-35);e.attack=Math.max(0,e.attack-dt);if(e.attack===0)resolve(g,e);return true;}
 if(e.recovery>0)return true;
 const dx=g.player.x-e.x,distance=Math.abs(dx);e.facing=dx>=0?1:-1;e.timer-=dt;
 const desired=ranged.has(e.variant)?330:135;
 if(distance>desired+30)e.x+=e.facing*(ranged.has(e.variant)?45:78)*dt*movementScale;
 else if(ranged.has(e.variant)&&distance<desired-100)e.x-=e.facing*35*dt*movementScale;
 e.x=clamp(e.x+e.vx*dt*movementScale,35,g.room.width-35);e.vx*=Math.exp(-dt*9);
 if(e.timer<=0&&distance<900)begin(g,e);
 return true;
}
export function updateHazards(g:Game,dt:number){
 for(const h of g.hazards){
  const owner=h.owner===undefined?undefined:g.room.enemies.find(e=>e.id===h.owner);
  if(h.owner!==undefined&&(!owner||owner.dead)){h.life=0;continue;}
  if(h.delay>0&&(owner?.stagger??0)>0)continue;
  // Only the elapsed ACTIVE fraction counts toward lifetime when a large frame crosses the tell.
  const previous=h.delay;h.delay-=dt;if(h.delay>0)continue;
  const activeDt=previous>0?-h.delay:dt;h.life-=activeDt;
  if(h.life<=0)continue;
  const p=g.player;
  if(p.x+12>h.x&&p.x-12<h.x+h.w&&p.y>h.y&&p.y-48<h.y+h.h)g.hurtPlayer(h.damage,encounterFor(owner??{kind:'elite'} as Enemy).name+' · '+h.label);
 }
 g.hazards=g.hazards.filter(h=>h.life>0);
}
/** Unique second phases strengthen each boss's own motif; no shared ghost-spawn transition. */
export function onEncounterHurt(g:Game,e:Enemy){
 if(e.kind!=='boss'||e.hp<=0||e.hp>=e.maxHp*.5||(e.bossPhase??1)!==1)return;
 e.bossPhase=2;e.stagger=.9;e.attack=0;e.actionTime=0;e.charge=0;e.recovery=0;e.timer=1.6;
 g.hazards=g.hazards.filter(h=>h.owner!==e.id);
 const text:Record<string,string>={'gate-warden':'断斧狂宴 · 冲击将引发两侧崩塌','ink-abbot':'血墨续篇 · 扇弹扩散，墨雨增页','bone-mother':'百骨归巢 · 孵化加速，骨潮延长','bell-keeper':'铜钟碎裂 · 钟波重叠，回响再临','hollow-king':'空冠碎裂 · 剑冲后追加追斩'};
 g.say(encounterFor(e).name+' · '+(text[e.variant??'gate-warden']??'第二誓约觉醒'));
 g.effect('armor',e.x,e.y-50,110,encounterFor(e).color,.7);g.sound.play(e.variant==='bell-keeper'?'bell':'armor');
}
