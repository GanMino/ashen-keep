import type {Room,RoomKind,Enemy} from './types';
export function random(seed:number){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function floorCount(seed:number){return 3+Math.floor(random(seed)()*3);}
const names=['遗忘回廊','灰烬藏书室','破碎长廊','荆棘庭院','无光墓室','沉钟礼拜堂'];
export function createFloor(seed:number,floor:number):Room[]{
 const rng=random(seed+floor*7919), ri=(a:number,b:number)=>a+Math.floor(rng()*(b-a+1));
 const rooms:Room[]=[]; const combatCount=ri(2,4);
 const kinds:RoomKind[]=['entrance','combat','elite',...Array<RoomKind>(combatCount-1).fill('combat'),'elite','boss'];
 function add(kind:RoomKind,mapX:number,mapY:number):Room{
  const id=rooms.length,width=kind==='boss'?1560:ri(14,18)*100;
  const room:Room={id,kind,name:kind==='entrance'?'古堡门厅':kind==='elite'?(rooms.filter(r=>r.kind==='elite').length===0?'守誓者之庭':'裂甲者之厅'):kind==='boss'?'亡王谒见厅':kind==='treasure'?'封缄秘库':kind==='sanctuary'?'烛火圣所':names[ri(0,names.length-1)],width,seed:ri(1,9999999),platforms:[],doors:[],props:[],visited:false,cleared:false,mapX,mapY,enemies:[],initialized:false};
  for(let x=260;x<width-200;x+=ri(220,300)){room.platforms.push({x,y:ri(0,1)?350:330,w:ri(120,190)});if(rng()>.6)room.platforms.push({x:x+60,y:245,w:120});}
  if(kind==='treasure') room.props.push({x:width/2,y:440,kind:'chest',used:false});
  if(kind==='sanctuary') room.props.push({x:width/2,y:440,kind:'altar',used:false});
  if(kind==='boss')room.props.push({x:width-145,y:440,kind:'exit',used:false});
  if(kind==='combat' && rng()>.45)room.props.push({x:width*.67,y:440,kind:'chest',used:false});
  rooms.push(room);return room;
 }
 kinds.forEach((k,i)=>add(k,i,0));
 for(let i=0;i<kinds.length-1;i++){const a=rooms[i],b=rooms[i+1];a.doors.push({x:a.width-85,y:440,target:b.id,label:b.name});b.doors.push({x:85,y:440,target:a.id,label:a.name});}
 // Side branches intentionally placed before traversal unlocks to invite revisits.
 for(const [at,kind,gate] of [[1,'treasure','doubleJump'],[2,'sanctuary',undefined],[kinds.length-3,'treasure','breakDash']] as const){
  const parent=rooms[at], branch=add(kind,at,kind==='sanctuary'?1:-1);
  const y=gate==='doubleJump'?245:440,x=parent.width*.52;
  if(gate==='doubleJump')parent.platforms.push({x:x-60,y:245,w:120},{x:x-220,y:345,w:100});
  parent.doors.push({x,y,target:branch.id,gate,label:gate==='doubleJump'?'高塔秘库 · 二段跳':gate==='breakDash'?'封印秘库 · 破障冲刺':branch.name});
  branch.doors.push({x:85,y:440,target:parent.id,label:'返回 '+parent.name});
 }
 return rooms;
}
export function populate(room:Room,floor:number):Enemy[]{
 const rng=random(room.seed+floor*101),enemies:Enemy[]=[];
 if(room.kind==='treasure'||room.kind==='sanctuary')return enemies;
 const count=room.kind==='entrance'?6:room.kind==='boss'?7:12+Math.floor(rng()*10)+floor*2;
 const scale=1+(floor-1)*.22;
 for(let i=0;i<count;i++){
  let kind:Enemy['kind']=rng()<.24?'bat':rng()<.2?'wraith':'skeleton';
  if(i===0 && (room.kind==='elite'||room.kind==='boss'))kind=room.kind;
  const hp=Math.round(({skeleton:34,bat:23,wraith:44,elite:270,boss:760}[kind])*scale);
  const x=kind==='boss'?room.width*.62:kind==='elite'?room.width*.54:350+rng()*(room.width-540),y=kind==='bat'?260+rng()*90:kind==='wraith'?345:440;
  enemies.push({id:room.id*100+i,kind,x,y,vx:0,vy:0,hp,maxHp:hp,facing:-1,timer:rng()*2+1,attack:0,flash:0,dead:false,homeY:y});
 }
 return enemies;
}
