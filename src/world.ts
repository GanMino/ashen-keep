import type {Room,RoomKind,Enemy,Platform} from './types';
import {CHAPTERS,chapterRoute,ROOM_NAMES} from './content';
export function random(seed:number){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function floorCount(seed:number){return 3+Math.floor(random(seed)()*3);}
function platforms(layout:number,width:number):Platform[]{
 const presets=[[[260,345,155],[580,245,160],[850,345,190]],[[230,350,170],[500,330,210],[820,350,180]],[[300,330,170],[560,245,240],[910,330,160]],[[270,350,130],[440,245,180],[760,350,220]],[[230,345,180],[570,345,180],[920,245,220]]];
 return presets[layout].filter(([x])=>x<width-230).map(([x,y,w])=>({x,y,w}));
}
export function createFloor(seed:number,floor:number):Room[]{
 const rng=random(seed+floor*7919),ri=(a:number,b:number)=>a+Math.floor(rng()*(b-a+1));
 const chapter=chapterRoute(seed,floorCount(seed))[Math.min(floor-1,floorCount(seed)-1)],zone=CHAPTERS[chapter],rooms:Room[]=[],flip=rng()>.5?1:-1;
 function add(kind:RoomKind,mx:number,my:number,encounter?:string):number{
  const id=rooms.length,width=kind==='boss'?1500:['event','shop','sanctuary','treasure','entrance'].includes(kind)?1080:ri(12,15)*100,layout=(id+chapter+ri(0,4))%5;
  const name=kind==='entrance'?zone.name+' · 入口':kind==='boss'?zone.name+' · 谒见厅':kind==='elite'?'印记守卫 · '+(rooms.filter(r=>r.kind==='elite').length+1):kind==='shop'?'拾骨商人的铺席':kind==='event'?'莉娅的遗灯':kind==='sanctuary'?'旅人的烛火':kind==='challenge'?'贪欲试炼':kind==='treasure'?'封缄遗物库':ROOM_NAMES[layout];
  const room:Room={id,kind,name,chapter,layout,encounter,width,seed:ri(1,9999999),platforms:kind==='boss'?[{x:280,y:330,w:180},{x:1030,y:330,w:180}]:platforms(layout,width),doors:[],props:[],visited:false,cleared:false,mapX:mx,mapY:my*flip,enemies:[],initialized:false};
  const prop=kind==='treasure'?'chest':kind==='sanctuary'?'altar':kind==='boss'?'exit':kind==='shop'?'shop':kind==='event'?'memory':kind==='challenge'?'trial':undefined;
  if(prop)room.props.push({x:kind==='boss'?width-145:width*.52,y:440,kind:prop,used:false});
  if(kind==='treasure')room.props.push({x:width*.75,y:440,kind:'pact',used:false});
  rooms.push(room);return id;
 }
 add('entrance',0,0);add('combat',1,0);add('elite',2,-1,zone.elites[0]);add('combat',2,1);add('elite',3,1,zone.elites[1]);add('combat',3,-1);add('boss',4,0,zone.boss);
 add('shop',0,-1);add('event',0,1);add('sanctuary',2,2);add('treasure',2,-2);add('challenge',4,1);
 const links:[number,number,('doubleJump'|'breakDash')?][]=[[0,1],[1,2],[1,3],[2,5],[3,4],[4,6],[5,6],[0,7],[0,8],[3,9],[2,10,'doubleJump'],[4,11]];
 if(rng()>.45){const id=add('treasure',4,-1);links.push([5,id,'breakDash']);}
 if(rng()>.5){const id=add('combat',5,1);rooms[id].name='遗落军械室';rooms[id].props.push({x:rooms[id].width*.65,y:440,kind:'chest',used:false});links.push([11,id]);}
 for(const [a,b,gate]of links){
  for(const [from,to,forward]of [[a,b,true],[b,a,false]] as const){const room=rooms[from];let x=forward?room.width-85:85;const occupied=room.doors.some(d=>Math.abs(d.x-x)<100);if(occupied)x=room.width*(room.doors.length===1?.38:.65);
   room.doors.push({x,y:440,target:to,gate:forward?gate:undefined,label:rooms[to].name});
  }
 }
 return rooms;
}
export function populate(room:Room,floor:number):Enemy[]{
 const rng=random(room.seed+floor*101),enemies:Enemy[]=[];
 if(['treasure','sanctuary','shop','event','challenge'].includes(room.kind))return enemies;
 const chapter=room.chapter??0,count=room.kind==='entrance'?4:room.kind==='boss'?1:room.kind==='elite'?5:8+Math.floor(rng()*5),scale=1+(floor-1)*.18;
 const roster=[['skeleton','goblin','flying-eye'],['goblin','wraith','flying-eye'],['skeleton','mushroom','wraith'],['flying-eye','goblin','wraith'],['skeleton','wraith','goblin']][chapter];
 for(let i=0;i<count;i++){
  let variant=roster[Math.floor(rng()*roster.length)],kind:Enemy['kind']=variant==='flying-eye'?'bat':variant==='wraith'?'wraith':'skeleton';
  if(i===0&&(room.kind==='elite'||room.kind==='boss')){kind=room.kind;variant=room.encounter??(kind==='boss'?'gate-warden':'butcher');}
  const hp=Math.round(({skeleton:30,bat:19,wraith:36,elite:220,boss:600}[kind])*scale);
  const x=kind==='boss'?room.width*.65:kind==='elite'?room.width*.58:340+rng()*(room.width-510),y=kind==='bat'?285+rng()*55:kind==='wraith'?345:440;
  enemies.push({id:room.id*100+i,kind,variant,x,y,vx:0,vy:0,hp,maxHp:hp,facing:-1,timer:rng()*2+1,attack:0,flash:0,dead:false,homeY:y});
 }
 return enemies;
}
