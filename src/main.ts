import './style.css';
import {Game} from './game';
import {GameRenderer} from './renderer';
import {GameUI} from './ui';
const game=new Game();
const renderer=new GameRenderer(document.querySelector<HTMLCanvasElement>('#game')!);
const ui=new GameUI(document.querySelector<HTMLElement>('#ui')!,{
 selectClass:id=>{game.selectedClass=id;game.sound.play('loot');},start:()=>game.start(),pause:()=>game.pause(),resume:()=>game.resume(),restart:()=>game.start(),menu:()=>{game.phase='menu';game.clearInput();game.preview();},toggleMap:()=>game.toggleMap(),toggleMute:()=>game.toggleMute(),toggleMotion:()=>{game.reducedMotion=!game.reducedMotion;},chooseUpgrade:id=>game.selectUpgrade(id),input:(key,down)=>{game.sound.unlock();game.input(key,down);}
});
const keyCodes=['ArrowLeft','ArrowRight','ArrowUp','Space','KeyW','KeyA','KeyD','KeyJ','KeyK','KeyL','KeyE','ShiftLeft','Escape','KeyM'];
window.addEventListener('keydown',e=>{if(keyCodes.includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Escape'){if(game.phase==='map')game.toggleMap();else game.pause();}else if(e.code==='KeyM')game.toggleMap();else if(e.code==='Enter'&&game.phase==='menu')game.start();else if(game.phase==='upgrade'&&['Digit1','Digit2','Digit3'].includes(e.code)){const choice=game.upgrades[Number(e.code.slice(-1))-1];if(choice)game.selectUpgrade(choice.id);}else if(game.phase==='playing'){game.sound.unlock();game.input(e.code,true);}});
window.addEventListener('keyup',e=>game.input(e.code,false));
window.addEventListener('blur',()=>{game.clearInput();if(game.phase==='playing')game.pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){game.clearInput();if(game.phase==='playing')game.pause();}});
const canvas=document.querySelector<HTMLCanvasElement>('#game')!;canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&game.phase==='playing'){game.input('Mouse0',true);canvas.setPointerCapture(e.pointerId);}});canvas.addEventListener('pointerup',()=>game.input('Mouse0',false));canvas.addEventListener('pointercancel',()=>game.input('Mouse0',false));canvas.addEventListener('lostpointercapture',()=>game.input('Mouse0',false));
let last=performance.now(),acc=0,frameTime=16.67,frames=0;
function loop(now:number){const dt=Math.min(.1,(now-last)/1000);last=now;frameTime=frameTime*.95+dt*1000*.05;acc+=dt;while(acc>=1/60){game.tick(1/60);acc-=1/60;}renderer.render(game);game.sound.setAmbience(game.phase==='playing');ui.update(game.getState());frames++;requestAnimationFrame(loop);}requestAnimationFrame(loop);
if(import.meta.env.DEV||new URLSearchParams(location.search).has('test')){
 window.__ASHEN_GAME__=game;
 window.__THREE_GAME_DIAGNOSTICS__={get renderer(){const i=renderer.renderer.info;return {calls:i.render.calls,triangles:i.render.triangles,geometries:i.memory.geometries,textures:i.memory.textures};},get state(){return {phase:game.phase,floor:game.floor,room:game.room.id,kills:game.kills,enemies:game.room.enemies.filter(e=>!e.dead).length,fps:Math.round(1000/frameTime),frameTime,frames,particles:game.particles.length};},physics:{engine:'custom-2d-one-way-aabb',timestep:1/60},renderConfig:{dpr:1,postPasses:1,shadowLights:0,textureMemoryMB:1.98}};
 window.__THREE_GAME_TEST_HOOKS__={seed:(n:number)=>{game.seed=n;game.rng=()=>.5;},setPausedForScreenshot:(v:boolean)=>{game.frozen=v;},setReducedMotion:(v:boolean)=>{game.reducedMotion=v;},hideDebugUi:()=>{},setState:async(state:string)=>{
   await renderer.ready;
   if(!['menu','active-play','boss','elite','boss-phase2','paused','dead','upgrade'].includes(state))throw new Error('Unknown state '+state);
   game.start(game.seed);game.time=8;
   if(state==='menu'){game.phase='menu';game.preview();}
   else if(state==='elite'){game.travel(game.rooms.find(r=>r.kind==='elite')!.id);game.player.x=510;game.cameraX=180;const e=game.room.enemies.find(e=>e.kind==='elite')!;e.x=670;e.armorBroken=true;e.hp=e.maxHp*.5;game.player.attack=.18;game.attackDuration=.29;game.attackCombo=3;game.attackFacing=1;game.effect('slash',510,405,130,'#ffe0a9',.3,3);game.effect('armor',670,398,48,'#eee4ba',.4);}
   else if(state==='boss'||state==='boss-phase2'){game.elites=2;game.doubleJump=true;game.breakDash=true;game.travel(game.rooms.find(r=>r.kind==='boss')!.id);game.player.x=600;game.cameraX=220;if(state==='boss-phase2'){const boss=game.room.enemies.find(e=>e.kind==='boss')!;game.hurtEnemy(boss,boss.maxHp*.55);game.shake=0;game.hitstop=0;boss.flash=0;game.floaters=[];}}
   else{game.travel(1);game.player.x=510;game.player.y=440;game.cameraX=180;game.player.attack=.18;game.attackDuration=.29;game.attackCombo=2;game.attackFacing=1;game.effect('slash',510,405,108,'#d0ede0',.2,2);game.effect('impact',590,410,25,'#f8ddb0',.18);game.room.enemies.forEach((e,i)=>{if(i<5){e.x=650+i*48;e.y=e.kind==='bat'?330:440;}});if(state==='paused')game.pause();if(state==='dead'){game.player.hp=0;game.phase='dead';}if(state==='upgrade'){game.xp=game.xpNext;game.checkLevel();}}
   renderer.render(game);ui.update(game.getState());return {state};
 }};
}
