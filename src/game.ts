import type {ClassId,Enemy,Phase,Room,UIState,Upgrade} from './types';
import {createFloor,floorCount,populate,random} from './world';
import {Sound} from './audio';
import type {Effect,EffectKind,Debris} from './effects';
export const W=960,H=540,GROUND=440;
export const strikeRadius=(kind:Enemy['kind'])=>kind==='boss'?185:kind==='elite'?135:70;
export interface Particle{x:number;y:number;vx:number;vy:number;life:number;max:number;color:string;size:number}
export interface Floater{x:number;y:number;text:string;color:string;life:number}
export interface Shot{x:number;y:number;vx:number;vy:number;life:number;damage:number;hostile:boolean;color:string;radius:number;pierce:number;hit:Set<number>;cause:string}
export interface Pickup{x:number;y:number;value:number;kind:'xp'|'gold'|'heal'}
const UPGRADES:Upgrade[]=[
{id:'power',name:'刃上余烬',subtitle:'锋刃 · 进攻',description:'所有攻击伤害提高 25%。',icon:'✦',color:'#dcb875'},
{id:'haste',name:'疾风誓约',subtitle:'敏捷 · 连击',description:'普通攻击间隔缩短 16%。',icon:'↯',color:'#95d5bd'},
{id:'vital',name:'不朽心脏',subtitle:'生命 · 续航',description:'生命上限 +25，并恢复 35 生命。',icon:'♥',color:'#df8c87'},
{id:'vampire',name:'猩红契印',subtitle:'鲜血 · 吸取',description:'每次击杀恢复 2 点生命，可叠加。',icon:'◈',color:'#d97b87'},
{id:'reach',name:'延伸之影',subtitle:'范围 · 割草',description:'近战范围 +20%；远程额外发射一枚弹幕。',icon:'⟡',color:'#c0b6ea'},
{id:'cooldown',name:'月轮沙漏',subtitle:'秘术 · 技能',description:'职业技能冷却缩短 20%。',icon:'◷',color:'#91b9dc'},
{id:'magnet',name:'拾魂灯笼',subtitle:'探索 · 收集',description:'拾取范围 +100，经验获取提高 20%。',icon:'✧',color:'#e1ca85'},
{id:'thunder',name:'雷鸣遗骨',subtitle:'雷霆 · 连锁',description:'每第 4 次攻击引发范围雷击，造成 55 点伤害。',icon:'ϟ',color:'#a7ddd5'}];
const classStats={knight:{hp:140,damage:30,speed:255,rate:.34},witch:{hp:95,damage:21,speed:250,rate:.4},ranger:{hp:110,damage:18,speed:290,rate:.24}};
export class Game {
 phase:Phase='menu'; selectedClass:ClassId='knight';seed=0;totalFloors=3;floor=1;rooms:Room[]=[];room!:Room;rng=random(1);
 player={x:175,y:440,vx:0,vy:0,hp:140,maxHp:140,facing:1,grounded:true,jumps:0,invuln:0,attack:0,dash:0};
 keys=new Set<string>();pressed=new Set<string>();time=0;elapsed=0;cameraX=0;shake=0;hitstop=0;frozen=false;reducedMotion=false;
 attackDuration=.3;attackCombo=0;attackFacing=1;attackIsSkill=false;comboReset=0;pendingStrike:null|{delay:number;damage:number;range:number;heavy:boolean;facing:number;skill:boolean}=null;effects:Effect[]=[];debris:Debris[]=[];shakeDirection=1;
 attackCd=0;skillCd=0;dashCd=0;damage=30;speed=255;attackRate=.34;skillRate=7;reach=1;extraShots=0;lifesteal=0;magnet=160;xpMultiplier=1;thunder=0;attackCount=0;
 xp=0;xpNext=40;level=1;kills=0;gold=0;elites=0;bossDefeated=false;doubleJump=false;breakDash=false;combo=0;comboTime=0;best=0;
 particles:Particle[]=[];floaters:Floater[]=[];shots:Shot[]=[];pickups:Pickup[]=[];upgrades:Upgrade[]=[];relics:string[]=[];notice='';noticeTime=0;interact='';sound=new Sound();deathCause='';
 constructor(){try{this.best=Number(localStorage.getItem('ashen-best')||0);this.sound.muted=localStorage.getItem('ashen-muted')==='true';}catch{}this.seed=Date.now()%1000000;this.preview();}
 preview(){this.rng=random(this.seed);this.rooms=createFloor(this.seed,1);this.room=this.rooms[0];this.initRoom();this.cameraX=0;this.player.x=440;this.player.y=440;}
 input(key:string,down:boolean){if(down){if(!this.keys.has(key))this.pressed.add(key);this.keys.add(key);}else this.keys.delete(key);}
 clearInput(){this.keys.clear();this.pressed.clear();}
 initRoom(){this.room.visited=true;if(!this.room.initialized){this.room.enemies=populate(this.room,this.floor);this.room.initialized=true;this.room.cleared=this.room.enemies.length===0;}}
 start(seed?:number){
  this.seed=seed??crypto.getRandomValues(new Uint32Array(1))[0]%999999;this.rng=random(this.seed);this.totalFloors=floorCount(this.seed);this.floor=1;
  const s=classStats[this.selectedClass];this.player={x:175,y:440,vx:0,vy:0,hp:s.hp,maxHp:s.hp,facing:1,grounded:true,jumps:0,invuln:1.8,attack:0,dash:0};
  this.damage=s.damage;this.speed=s.speed;this.attackRate=s.rate;this.skillRate=7;this.reach=1;this.extraShots=0;this.lifesteal=0;this.magnet=160;this.xpMultiplier=1;this.thunder=0;this.attackCount=0;
  this.xp=0;this.xpNext=40;this.level=1;this.kills=0;this.gold=0;this.elapsed=0;this.elites=0;this.bossDefeated=false;this.doubleJump=false;this.breakDash=false;this.combo=0;this.relics=[];this.upgrades=[];this.attackCd=0;this.skillCd=0;this.dashCd=0;
  this.loadFloor();this.phase='playing';this.clearInput();this.sound.unlock();this.sound.setMuted(this.sound.muted);this.say('闯入古堡 · 击败两名精英，夺取亡王封印');
 }
 loadFloor(){this.rooms=createFloor(this.seed,this.floor);this.room=this.rooms[0];this.initRoom();this.player.x=175;this.player.y=440;this.player.vx=this.player.vy=0;this.player.grounded=true;this.cameraX=0;this.clearEffects();this.elites=0;this.bossDefeated=false;}
 clearEffects(){this.pendingStrike=null;this.effects=[];this.debris=[];this.player.attack=0;this.attackCombo=0;this.comboReset=0;this.particles=[];this.floaters=[];this.shots=[];this.pickups=[];this.hitstop=0;this.shake=0;}
 say(s:string){this.notice=s;this.noticeTime=4;}
 pause(){if(this.phase==='playing'){this.phase='paused';this.clearInput();}else if(this.phase==='paused')this.resume();}
 resume(){if(this.phase==='paused'||this.phase==='map'){this.phase='playing';this.clearInput();}}
 toggleMap(){if(this.phase==='playing'){this.phase='map';this.clearInput();}else if(this.phase==='map')this.resume();}
 toggleMute(){this.sound.unlock();this.sound.setMuted(!this.sound.muted);try{localStorage.setItem('ashen-muted',String(this.sound.muted));}catch{}}
 selectUpgrade(id:string){if(this.phase!=='upgrade'||!this.upgrades.some(u=>u.id===id))return;this.applyUpgrade(id);this.upgrades=[];this.phase='playing';this.clearInput();this.checkLevel();}
 applyUpgrade(id:string){
  const u=UPGRADES.find(u=>u.id===id);if(!u)return;
  if(id==='power')this.damage*=1.25;if(id==='haste')this.attackRate=Math.max(.1,this.attackRate*.84);
  if(id==='vital'){this.player.maxHp+=25;this.player.hp=Math.min(this.player.maxHp,this.player.hp+35);}if(id==='vampire')this.lifesteal+=2;
  if(id==='reach'){this.reach+=.2;this.extraShots++;}if(id==='cooldown')this.skillRate=Math.max(1.5,this.skillRate*.8);if(id==='magnet'){this.magnet+=100;this.xpMultiplier+=.2;}if(id==='thunder')this.thunder++;
  this.relics.push(u.name);this.say('获得 '+u.name+' · '+u.description);this.sound.play('level');
 }
 checkLevel(){if(this.xp<this.xpNext||this.phase!=='playing')return;this.xp-=this.xpNext;this.level++;this.xpNext=Math.round(this.xpNext*1.28+12);this.player.hp=Math.min(this.player.maxHp,this.player.hp+10);
  const choices=[...UPGRADES];this.upgrades=[];for(let i=0;i<3;i++)this.upgrades.push(choices.splice(Math.floor(this.rng()*choices.length),1)[0]);this.phase='upgrade';this.clearInput();this.sound.play('level');}
 burst(x:number,y:number,color:string,n=14){for(let i=0;i<n;i++){const a=this.rng()*Math.PI*2,s=50+this.rng()*170;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.3+this.rng()*.35,max:.7,color,size:2+Math.floor(this.rng()*3)});}if(this.particles.length>400)this.particles.splice(0,this.particles.length-400);}
 float(x:number,y:number,text:string,color='#f1d7a1'){this.floaters.push({x,y,text,color,life:.7});if(this.floaters.length>60)this.floaters.shift();}
 effect(kind:EffectKind,x:number,y:number,radius=30,color='#f7dbab',duration=.25,variant=0,facing=this.player.facing,targetX?:number,targetY?:number){this.effects.push({kind,x,y,radius,color,duration,life:duration,variant,facing,targetX,targetY});if(this.effects.length>140)this.effects.shift();}
 shatter(e:Enemy,armor=false){const kind:Debris['kind']=armor?'metal':e.kind==='skeleton'?'bone':e.kind==='wraith'?'cloth':e.kind==='bat'?'cloth':'metal';const count=armor?12:e.kind==='boss'?26:9;for(let i=0;i<count;i++){const dir=Math.sign(e.x-this.player.x)||this.player.facing;this.debris.push({x:e.x+(this.rng()-.5)*24,y:e.y-15-this.rng()*(e.kind==='boss'?85:40),vx:dir*(50+this.rng()*170)+(this.rng()-.5)*120,vy:-80-this.rng()*260,angle:this.rng()*6,spin:(this.rng()-.5)*15,life:1.1+this.rng()*.7,duration:1.8,size:4+this.rng()*8,color:kind==='bone'?'#c9c6a1':kind==='metal'?'#8b9997':e.kind==='wraith'?'#75aba9':'#835c70',kind,bounces:0});}if(this.debris.length>200)this.debris.splice(0,this.debris.length-200);}
 updateFeedback(dt:number){for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);for(const d of this.debris){d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=700*dt;d.angle+=d.spin*dt;d.life-=dt;if(d.y>GROUND-2){d.y=GROUND-2;if(d.bounces<2){d.vy=-Math.abs(d.vy)*.3;d.vx*=.55;d.spin*=.4;d.bounces++;}else{d.vy=0;d.vx*=.8;d.spin=0;}}}this.debris=this.debris.filter(d=>d.life>0);}

 hurtEnemy(e:Enemy,damage:number,knock=60){if(e.dead)return;
  const armored=e.kind==='elite'&&!e.armorBroken;if(armored)damage*=.78;
  e.hp-=damage;e.flash=.085;e.stagger=Math.max(e.stagger??0,e.kind==='boss'?.035:e.kind==='elite'?.09:.15);e.vx+=(Math.sign(e.x-this.player.x)||this.player.facing)*knock;
  this.float(e.x,e.y-(e.kind==='boss'?123:e.kind==='elite'?99:65),String(Math.round(damage)),armored?'#b0c6ca':'#f3d6a4');this.effect('impact',e.x,e.y-(e.kind==='boss'?60:34),knock>150?34:19,armored?'#b4d6dc':'#ffdfaa',.17,this.attackCount);
  this.burst(e.x,e.y-28,armored?'#abb9b6':'#dfc69a',3);this.sound.play(armored?'armor':'hit');
  if(this.selectedClass==='knight'){this.hitstop=Math.max(this.hitstop,knock>150?.055:.024);this.shake=Math.max(this.shake,knock>150?.22:.07);this.shakeDirection=this.attackFacing;}
  if(e.kind==='elite'&&!e.armorBroken&&e.hp<e.maxHp*.55){e.armorBroken=true;e.stagger=.65;this.shatter(e,true);this.effect('armor',e.x,e.y-42,60,'#e8e6c7',.4);this.float(e.x,e.y-110,'破甲','#efba79');this.sound.play('armor');this.hitstop=Math.max(this.hitstop,.065);this.shake=.24;}
  if(e.kind==='boss'&&e.hp>0&&e.hp<e.maxHp*.5&&(e.bossPhase??1)===1){e.bossPhase=2;e.stagger=.8;e.attack=0;e.timer=1.3;this.shatter(e,true);this.effect('shockwave',e.x,e.y-60,320,'#a7d9d7',.9);this.say('负钟者 · 铜钟碎裂，亡魂涌出');this.sound.play('bell');this.shake=.4;for(let i=0;i<2;i++)this.room.enemies.push({id:e.id+10000+i,kind:'wraith',x:Math.max(45,Math.min(this.room.width-45,e.x+(i?100:-100))),y:320,vx:0,vy:0,hp:35*this.floor,maxHp:35*this.floor,facing:-1,timer:1.8,attack:0,flash:0,dead:false,homeY:320});}

  if(e.hp<=0){e.dead=true;this.kills++;this.combo++;this.comboTime=3;this.player.hp=Math.min(this.player.maxHp,this.player.hp+this.lifesteal);this.sound.play('kill');this.shatter(e);this.effect('impact',e.x,e.y-30,30,'#faf0cb',.25);this.burst(e.x,e.y-25,'#c6d6b5',5);if(this.lifesteal)this.effect('soul',e.x,e.y-25,25,'#bd6674',.45,0,1,this.player.x,this.player.y-25);if(this.selectedClass==='ranger')this.effect('impact',e.x,e.y-25,40,'#a5cfd2',.3,3);if(this.selectedClass==='witch'&&(e.burn??0)>0){this.effect('fire',e.x,e.y-25,100,'#fa9d62',.45);for(const other of this.room.enemies)if(!other.dead&&other.id!==e.id&&Math.abs(other.x-e.x)<145){other.burn=Math.max(other.burn??0,2.4);other.burnTick=.2;}}
   const special=e.kind==='elite'||e.kind==='boss';for(let i=0;i<(special?9:2);i++)this.pickups.push({x:e.x+(this.rng()-.5)*40,y:e.y-12-this.rng()*30,value:special?10:4,kind:i%3===0?'gold':'xp'});
   if(this.rng()<.09)this.pickups.push({x:e.x,y:e.y-10,value:9,kind:'heal'});
   if(e.kind==='elite'){this.elites++;if(!this.doubleJump){this.doubleJump=true;this.say('遗能觉醒：二段跳 · 空中再次按跳跃，可回访高塔秘库');}else if(!this.breakDash){this.breakDash=true;this.say('遗能觉醒：破障冲刺 · 现在可以穿越封印秘库');}else{this.applyUpgrade(UPGRADES[Math.floor(this.rng()*UPGRADES.length)].id);}this.player.hp=Math.min(this.player.maxHp,this.player.hp+25);this.shake=.25;this.hitstop=.06;}
   if(e.kind==='boss'){this.bossDefeated=true;this.say(this.floor===this.totalFloors?'亡王已陨落 · 前往右侧烬火，终结轮回':'亡王已陨落 · 前往右侧烬火，进入下一层');this.player.hp=Math.min(this.player.maxHp,this.player.hp+40);this.shake=.4;this.hitstop=.1;}
  }
 }
 hurtPlayer(damage:number,cause:string){const p=this.player;if(p.invuln>0||this.phase!=='playing')return;p.hp=Math.max(0,p.hp-damage);p.invuln=.85;this.shake=.25;this.hitstop=.04;this.combo=0;this.float(p.x,p.y-65,'−'+damage,'#f18982');this.burst(p.x,p.y-28,'#c86461');this.sound.play('hurt');if(p.hp<=0){this.phase='dead';this.deathCause=cause;this.notice='倒在'+cause+'之下';this.saveBest();this.clearInput();}}
 saveBest(){this.best=Math.max(this.best,this.kills);try{localStorage.setItem('ashen-best',String(this.best));}catch{}}
 shoot(x:number,y:number,vx:number,vy:number,damage:number,hostile=false,color='#c2edc9',radius=5,pierce=1,cause='幽魂法术'){this.shots.push({x,y,vx,vy,damage,hostile,color,radius,pierce,cause,life:2.2,hit:new Set()});}
 attack(){const p=this.player;this.attackCombo=this.comboReset>0?this.attackCombo%3+1:1;this.comboReset=.9;this.attackFacing=p.facing;this.attackIsSkill=false;this.attackCount++;
  const heavy=this.selectedClass==='knight'&&this.attackCombo===3;this.attackDuration=this.selectedClass==='knight'?(heavy?.42:.29):.23;p.attack=this.attackDuration;this.attackCd=Math.max(this.attackRate,heavy?.39:.18);
  if(this.selectedClass==='knight'){
   this.pendingStrike={delay:heavy?.18:.13,damage:this.damage*(heavy?1.75:this.attackCombo===2?1.12:1),range:108*this.reach*(heavy?1.2:1),heavy,facing:p.facing,skill:false};this.sound.play('swing');
  }else{
   this.sound.play(this.selectedClass==='witch'?'fire':'arrow');const count=(this.selectedClass==='witch'?2:1)+this.extraShots;
   for(let i=0;i<count;i++){const angle=(i-(count-1)/2)*.13;this.shoot(p.x+p.facing*20,p.y-30,p.facing*Math.cos(angle)*(this.selectedClass==='ranger'?760:450),Math.sin(angle)*300,this.damage,false,this.selectedClass==='witch'?'#efaa6c':'#b6e3d2',this.selectedClass==='witch'?7:3,this.selectedClass==='ranger'?3:2);}
   this.effect(this.selectedClass==='witch'?'fire':'impact',p.x+p.facing*30,p.y-30,14,this.selectedClass==='witch'?'#efac6a':'#b8e9d9',.12);
  }
  if(this.thunder&&this.attackCount%4===0){const target=this.room.enemies.find(e=>!e.dead&&Math.abs(e.x-p.x)<550);if(target){this.effect('lightning',p.x,p.y-40,550,'#d7ffff',.3,2,1,target.x,target.y-30);for(const e of this.room.enemies)if(!e.dead&&Math.abs(e.x-target.x)<150){this.effect('lightning',target.x,target.y-30,200,'#d7ffff',.3,3,1,e.x,e.y-30);this.hurtEnemy(e,55*this.thunder,60);}}}
 }
 resolveStrike(){const strike=this.pendingStrike;if(!strike)return;this.pendingStrike=null;const p=this.player;
  this.effect('slash',p.x,p.y-35,strike.range,strike.heavy?'#ffe3ac':'#caeadc',strike.heavy?.3:.2,strike.skill?3:this.attackCombo,strike.facing);
  if(strike.skill)this.effect('shockwave',p.x,p.y-5,strike.range,'#eed6a5',.5);
  let hits=0;for(const e of this.room.enemies)if(!e.dead&&Math.abs(e.y-p.y)<(strike.skill?180:100)&&Math.abs(e.x-p.x)<strike.range&&(strike.skill||(e.x-p.x)*strike.facing>-30)){this.hurtEnemy(e,strike.damage,strike.heavy?290:130);hits++;}
  if(hits&&strike.heavy)this.sound.play('heavy');
 }
 skill(){const p=this.player;this.skillCd=this.skillRate;this.attackCd=Math.max(this.attackCd,.3);this.attackFacing=p.facing;this.attackIsSkill=true;this.attackDuration=.5;p.attack=.5;p.invuln=Math.max(p.invuln,.4);this.shake=.2;
  if(this.selectedClass==='knight'){this.pendingStrike={delay:.22,damage:this.damage*3.6,range:235,heavy:true,facing:p.facing,skill:true};this.sound.play('swing');}
  else{
   this.sound.play(this.selectedClass==='witch'?'fire':'arrow');const radius=360;
   this.effect(this.selectedClass==='witch'?'fire':'shockwave',p.x,p.y-26,radius,this.selectedClass==='witch'?'#f8ac68':'#b8dfd3',.55);
   for(const e of this.room.enemies)if(!e.dead&&Math.abs(e.x-p.x)<radius&&Math.abs(e.y-p.y)<180){if(this.selectedClass==='witch'){e.burn=3;e.burnTick=.3;}this.hurtEnemy(e,this.damage*3.6,230);}
   for(let i=-3;i<=3;i++)this.shoot(p.x,p.y-30,p.facing*(560-Math.abs(i)*20),i*70,this.damage*1.8,false,this.selectedClass==='witch'?'#efab6f':'#d9f1ce',this.selectedClass==='witch'?8:3,5);
  }
  this.float(p.x,p.y-105,this.selectedClass==='knight'?'月刃风暴':this.selectedClass==='witch'?'烬印连爆':'千羽齐射','#e8d8ab');
 }
 travel(target:number){const old=this.room;for(const item of this.pickups){if(item.kind==='xp')this.xp+=item.value*this.xpMultiplier;else if(item.kind==='gold')this.gold+=item.value;else this.player.hp=Math.min(this.player.maxHp,this.player.hp+item.value);}
  this.room=this.rooms[target];this.initRoom();const door=this.room.doors.find(d=>d.target===old.id);this.player.x=(door?.x??150)+(door&&door.x>this.room.width/2?-65:65);this.player.y=door?.y??440;this.player.vx=this.player.vy=0;this.player.grounded=this.player.y===440;this.player.jumps=0;this.player.invuln=1.2;this.cameraX=Math.max(0,Math.min(this.room.width-W,this.player.x-W*.42));this.clearEffects();this.clearInput();this.say(this.room.kind==='boss'?'负钟者苏醒 · 注意地面的攻击预警':this.room.name);this.sound.play('door');this.checkLevel();}
 interactWithWorld(){const p=this.player;
  for(const prop of this.room.props)if(!prop.used&&Math.abs(prop.x-p.x)<75&&Math.abs(prop.y-p.y)<65){
   if(prop.kind==='chest'){if(!this.room.cleared){this.say('先消灭房间中的敌人，解除宝箱封印');return;}prop.used=true;this.gold+=15+Math.floor(this.rng()*25);this.applyUpgrade(UPGRADES[Math.floor(this.rng()*UPGRADES.length)].id);this.burst(prop.x,prop.y-20,'#e5c77e',28);return;}
   if(prop.kind==='altar'){if(this.gold<20){this.say('圣所祝福需要 20 枚金币');return;}if(p.hp>=p.maxHp){this.say('生命已满，烛火为你保留');return;}prop.used=true;this.gold-=20;p.hp=p.maxHp;this.sound.play('level');this.say('烛火祝福 · 生命已完全恢复');return;}
   if(prop.kind==='exit'&&this.bossDefeated){prop.used=true;if(this.floor>=this.totalFloors){this.phase='won';this.saveBest();this.clearInput();}else{this.floor++;this.loadFloor();this.player.hp=Math.min(this.player.maxHp,this.player.hp+30);this.say('踏入第 '+this.floor+' 层 · 古堡正在重组');}return;}
  }
  const door=this.room.doors.find(d=>Math.abs(d.x-p.x)<62&&Math.abs(d.y-p.y)<70);if(!door)return;
  if(door.gate==='doubleJump'&&!this.doubleJump){this.say('需要二段跳 · 击败第一名精英以觉醒');return;}if(door.gate==='breakDash'&&!this.breakDash){this.say('需要破障冲刺 · 击败第二名精英以觉醒');return;}
  if(this.rooms[door.target].kind==='boss'&&this.elites<2){this.say('亡王大门需要两枚精英封印 · '+this.elites+'/2');return;}this.travel(door.target);
 }
 tick(dt:number){
  if(this.frozen)return;
  if(this.phase==='menu'){this.time+=dt;return;}if(this.phase!=='playing')return;
  this.time+=dt;this.elapsed+=dt;this.noticeTime-=dt;if(this.noticeTime<=0)this.notice='';this.shake=Math.max(0,this.shake-dt);this.updateFeedback(dt);if(this.hitstop>0){this.hitstop-=dt;return;}
  const p=this.player;this.comboReset-=dt;this.attackCd-=dt;this.skillCd=Math.max(0,this.skillCd-dt);this.dashCd=Math.max(0,this.dashCd-dt);p.invuln=Math.max(0,p.invuln-dt);p.attack=Math.max(0,p.attack-dt);p.dash=Math.max(0,p.dash-dt);if(this.pendingStrike){this.pendingStrike.delay-=dt;if(this.pendingStrike.delay<=0)this.resolveStrike();}this.comboTime-=dt;if(this.comboTime<=0)this.combo=0;
  const left=this.keys.has('ArrowLeft')||this.keys.has('KeyA'),right=this.keys.has('ArrowRight')||this.keys.has('KeyD'),axis=Number(right)-Number(left);
  if(axis)p.facing=axis;
  if(this.pressed.has('Space')||this.pressed.has('KeyW')||this.pressed.has('ArrowUp')){if(p.grounded||(this.doubleJump&&p.jumps<2)){p.vy=-610;p.grounded=false;p.jumps++;this.sound.play('jump');this.burst(p.x,p.y,'#8fa7a6',4);this.effect('shockwave',p.x,p.y,24,'#a6b7a2',.23);}}
  if((this.pressed.has('ShiftLeft')||this.pressed.has('KeyL'))&&this.dashCd<=0){p.dash=.19;p.invuln=Math.max(p.invuln,.28);this.dashCd=.85;this.sound.play('dash');this.burst(p.x,p.y-20,'#8fdbce',10);}
  if((this.keys.has('KeyJ')||this.keys.has('Mouse0'))&&this.attackCd<=0)this.attack();
  if(this.pressed.has('KeyK')&&this.skillCd<=0)this.skill();
  p.vx=p.dash>0?p.facing*850:axis*this.speed*(this.selectedClass==='knight' && this.pendingStrike?.heavy ? .75 : 1);
  if(p.dash>0)this.effect('dash',p.x,p.y-2,55,'#a1d3cf',.2,0,p.facing);
  const oldY=p.y;p.x=Math.max(28,Math.min(this.room.width-28,p.x+p.vx*dt));p.vy+=1480*dt;p.y+=p.vy*dt;p.grounded=false;
  if(p.vy>=0){let landing=GROUND;for(const platform of this.room.platforms)if(p.x>platform.x-10&&p.x<platform.x+platform.w+10&&oldY<=platform.y+1&&p.y>=platform.y)landing=Math.min(landing,platform.y);if(p.y>=landing){if(p.vy>250){this.effect('shockwave',p.x,landing,25,'#b2af90',.18);this.sound.play('land');}p.y=landing;p.vy=0;p.grounded=true;p.jumps=0;}}
  if(p.dash>0&&this.breakDash)for(const e of this.room.enemies)if(!e.dead&&e.flash<=0&&Math.abs(e.x-p.x)<50&&Math.abs(e.y-p.y)<65)this.hurtEnemy(e,this.damage*.8,160);
  for(const e of this.room.enemies)this.updateEnemy(e,dt);
  for(const shot of this.shots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;
   if(shot.hostile){if(Math.abs(shot.x-p.x)<shot.radius+14&&Math.abs(shot.y-(p.y-26))<shot.radius+23){this.hurtPlayer(shot.damage,shot.cause);shot.life=0;}}
   else for(const e of this.room.enemies)if(!e.dead&&!shot.hit.has(e.id)&&Math.abs(shot.x-e.x)<(e.kind==='boss'?44:22)+shot.radius&&Math.abs(shot.y-(e.y-(e.kind==='boss'?52:24)))<(e.kind==='boss'?58:28)+shot.radius){shot.hit.add(e.id);if(this.selectedClass==='witch'){e.burn=Math.max(e.burn??0,2);e.burnTick=e.burnTick??.45;}this.hurtEnemy(e,shot.damage,this.selectedClass==='ranger'?95:45);shot.pierce--;if(shot.pierce<=0){shot.life=0;break;}}
  }
  this.shots=this.shots.filter(s=>s.life>0&&s.x>0&&s.x<this.room.width&&s.y>0&&s.y<460);
  for(const item of this.pickups){const dx=p.x-item.x,dy=p.y-22-item.y,d=Math.hypot(dx,dy);if(d<this.magnet){item.x+=dx*Math.min(1,dt*9);item.y+=dy*Math.min(1,dt*9);}if(d<23){if(item.kind==='xp')this.xp+=item.value*this.xpMultiplier;else if(item.kind==='gold')this.gold+=item.value;else p.hp=Math.min(p.maxHp,p.hp+item.value);item.value=0;this.sound.play('loot');}}
  this.pickups=this.pickups.filter(i=>i.value>0);
  for(const t of this.particles){t.x+=t.vx*dt;t.y+=t.vy*dt;t.vy+=300*dt;t.life-=dt;}this.particles=this.particles.filter(t=>t.life>0);
  for(const t of this.floaters){t.y-=33*dt;t.life-=dt;}this.floaters=this.floaters.filter(t=>t.life>0);
  if(!this.room.cleared&&this.room.enemies.every(e=>e.dead)){this.room.cleared=true;this.gold+=10;this.say(this.room.kind==='boss'?this.notice:'房间已净化 · +10 金币');}
  this.cameraX+=(Math.max(0,Math.min(this.room.width-W,p.x-W*.42))-this.cameraX)*Math.min(1,dt*7);
  this.updatePrompt();if(this.pressed.has('KeyE'))this.interactWithWorld();this.pressed.clear();this.checkLevel();
 }
 updateEnemy(e:Enemy,dt:number){if(e.dead)return;const p=this.player;e.flash=Math.max(0,e.flash-dt);e.recovery=Math.max(0,(e.recovery??0)-dt);
  if((e.burn??0)>0){e.burn=Math.max(0,(e.burn??0)-dt);e.burnTick=(e.burnTick??.5)-dt;if(e.burnTick<=0){e.burnTick=.6;this.hurtEnemy(e,this.damage*.22,0);this.effect('fire',e.x,e.y-26,23,'#df9c62',.3);}if(e.dead)return;}
  if((e.stagger??0)>0){e.stagger=Math.max(0,(e.stagger??0)-dt);e.x=Math.max(35,Math.min(this.room.width-35,e.x+e.vx*dt));e.vx*=Math.exp(-dt*7);return;}
const dx=p.x-e.x,dist=Math.abs(dx);e.facing=dx>=0?1:-1;e.vx*=Math.exp(-dt*9);
  if(e.kind==='bat'){if(dist<800){e.x+=Math.sign(dx)*65*dt+e.vx*dt;e.y+=(p.y-20-e.y)*dt*.8;}e.y+=Math.sin(this.time*5+e.id)*dt*9;e.x=Math.max(35,Math.min(this.room.width-35,e.x));if(dist<30&&Math.abs(e.y-p.y)<50)this.hurtPlayer(8+this.floor,'噬月蝠群');return;}
  if(e.kind==='wraith'){if(dist<700){e.x+=(dist>250?Math.sign(dx)*38:-Math.sign(dx)*16)*dt+e.vx*dt;e.y=330+Math.sin(this.time*2+e.id)*18;e.timer-=dt;if(e.timer<=0){const dy=p.y-25-(e.y-28),len=Math.hypot(dx,dy);this.shoot(e.x,e.y-28,dx/len*190,dy/len*190,12+this.floor*2,true,'#d88c99',7);e.timer=2.8;}}e.x=Math.max(35,Math.min(this.room.width-35,e.x));return;}
  const boss=e.kind==='boss',elite=e.kind==='elite';const range=boss?145:elite?105:40,speed=boss?55:elite?77:65;
  if(e.attack>0){e.attack-=dt;if(e.attack<=0){e.recovery=.18;if(boss){const damage=e.hp<e.maxHp*.5?26:21;if(dist<strikeRadius(e.kind)&&p.y>GROUND-85)this.hurtPlayer(damage,'负钟者重槌');this.burst(e.x+e.facing*80,GROUND-6,'#e49b73',12);this.effect('shockwave',e.x,GROUND-8,220,e.bossPhase===2?'#a9d8d2':'#dab078',.55);this.sound.play('bell');for(const sign of [-1,1])this.shoot(e.x,GROUND-12,sign*210,0,14+(this.floor-1)*2,true,'#e1ab7f',10,1,'震钟声波');e.timer=e.hp<e.maxHp*.5?1.1:1.75;}else{if(dist<strikeRadius(e.kind)&&Math.abs(e.y-p.y)<75)this.hurtPlayer(elite?18:9,elite?'古堡精英':'骸骨守卫');e.timer=elite?1.1:1.3;}}
  }else if((e.recovery??0)<=0){e.timer-=dt;if(dist>range*.7&&dist<1000)e.x+=e.facing*speed*dt;e.x+=e.vx*dt;if(dist<range&&e.timer<=0&&Math.abs(e.y-p.y)<130)e.attack=boss?.85:elite?.6:.45;}
  e.x=Math.max(35,Math.min(this.room.width-35,e.x));
 }
 updatePrompt(){const p=this.player;this.interact='';for(const prop of this.room.props)if(!prop.used&&Math.abs(prop.x-p.x)<75&&Math.abs(prop.y-p.y)<65){this.interact=prop.kind==='chest'?(this.room.cleared?'E  开启宝箱':'清除敌人以解锁宝箱'):prop.kind==='altar'?'E  恢复生命 · 20 金币':this.bossDefeated?'E  '+(this.floor===this.totalFloors?'终结轮回':'进入下一层'):'';if(this.interact)return;}
  const d=this.room.doors.find(d=>Math.abs(d.x-p.x)<62&&Math.abs(d.y-p.y)<70);if(d)this.interact='E  '+d.label;}
 getState():UIState{const boss=this.room.enemies.find(e=>e.kind==='boss'&&!e.dead);return {phase:this.phase,selectedClass:this.selectedClass,hp:Math.ceil(this.player.hp),maxHp:this.player.maxHp,xp:Math.floor(this.xp),xpNext:this.xpNext,level:this.level,floor:this.floor,totalFloors:this.totalFloors,roomName:this.room.name,roomKind:this.room.kind,roomId:this.room.id,rooms:this.rooms,kills:this.kills,gold:this.gold,elites:this.elites,bossDefeated:this.bossDefeated,skillCooldown:this.skillCd,dashCooldown:this.dashCd,combo:this.combo,elapsed:this.elapsed,seed:this.seed,notice:this.notice,interact:this.interact,upgrades:this.upgrades,relics:this.relics,doubleJump:this.doubleJump,breakDash:this.breakDash,bossHp:boss?.hp??0,bossMaxHp:boss?.maxHp??0,muted:this.sound.muted,reducedMotion:this.reducedMotion,best:this.best};}
}
