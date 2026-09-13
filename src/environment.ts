import type { Room } from './types';

type Ctx = CanvasRenderingContext2D;
const W = 960, H = 540, FLOOR = 440;
const plate = new Image();
/** Stable asset readiness for the first playable frame and visual captures. */
export const assetsReady: Promise<void> = new Promise(resolve => {
  plate.onload = () => resolve();
  plate.onerror = () => { console.warn('Banquet background failed to load'); resolve(); };
  plate.src = `${import.meta.env.BASE_URL}art/banquet-moon-v2.png`;
});
const caches = new Map<string, HTMLCanvasElement>();
const rect = (c: Ctx, color: string, x: number, y: number, w: number, h: number) => {
  c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
function path(c:Ctx,color:string,p:number[],width=0) {
  c.beginPath(); c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);
  if(width){c.strokeStyle=color;c.lineWidth=width;c.stroke();}else{c.closePath();c.fillStyle=color;c.fill();}
}
function randomizer(seed:number){let a=seed|0;return()=>{a=Math.imul(a,1664525)+1013904223|0;return(a>>>0)/4294967296;};}
function glow(c:Ctx,x:number,y:number,r:number,color:string,alpha:number){
  c.save();c.globalAlpha=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
}
function arch(c:Ctx,color:string,x:number,y:number,w:number,h:number){
  path(c,color,[x,y+h,x,y+30,x+7,y+17,x+w/2,y,x+w-7,y+17,x+w,y+30,x+w,y+h]);
}
function candle(c:Ctx,x:number,y:number,t:number,size=1){
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(size,size);
  rect(c,'#1b1417',-3,-17,7,20);rect(c,'#c4ac7a',-2,-15,4,15);rect(c,'#eed6a1',-2,-15,2,12);
  rect(c,'#8c6749',1,-10,2,5);rect(c,'#eddaaa',-4,-2,8,3);
  const sway=Math.round(Math.sin(t*9+x)*1.5);
  path(c,'#b95d34',[-3,-16,-4,-22,sway,-30,3,-22,3,-16]);
  path(c,'#ffbb61',[-2,-17,-2,-22,sway,-27,2,-22,2,-17]);rect(c,'#fff0ba',-1,-22,2,5);
  c.restore();
}
function archDoor(c:Ctx,room:Room){
  for(const d of room.doors){const x=d.x,y=d.y;
    arch(c,'#070d16',x-39,y-119,78,119);arch(c,'#263444',x-36,y-116,72,116);arch(c,'#64717a',x-32,y-111,64,111);arch(c,'#111b29',x-27,y-104,54,104);
    // A recess with chamfered voussoirs and a clearly physical threshold.
    for(let n=0;n<4;n++){rect(c,'#344251',x-37,y-72+n*19,9,17);rect(c,'#738184',x-37,y-72+n*19,2,15);rect(c,'#33404e',x+28,y-72+n*19,9,17);}
    path(c,'#a39472',[x-5,y-118,x+5,y-118,x+4,y-105,x-4,y-105]);
    for(let dx=-18;dx<=18;dx+=9){rect(c,'#29303a',x+dx,y-75,6,73);rect(c,'#424450',x+dx,y-74,1,70);}
    rect(c,'#080f1a',x-24,y-73,48,2);rect(c,'#6a6559',x-24,y-36,48,4);
    rect(c,'#b6a776',x+13,y-49,3,8);rect(c,'#101923',x-42,y-3,84,7);rect(c,'#b2b4a0',x-39,y-3,78,3);
    if(d.gate==='doubleJump'){
      for(let j=0;j<2;j++)path(c,'#9ad9c6',[x-9,y-62-j*15,x,y-72-j*15,x+9,y-62-j*15,x,y-66-j*15]);
    }else if(d.gate==='breakDash'){
      path(c,'#967153',[x-25,y-76,x+25,y-24],7);path(c,'#b09971',[x+25,y-76,x-25,y-24],7);
      rect(c,'#e5bc79',x-5,y-54,10,10);rect(c,'#67493d',x-2,y-51,4,4);
    }else{
      path(c,'#b2b29a',[x-7,y-77,x,y-86,x+7,y-77,x,y-69]);rect(c,'#ede5b4',x-1,y-81,2,8);
    }
  }
}
function balcony(c:Ctx,x:number,y:number,w:number,seed:number){
  const rnd=randomizer(seed);
  // Dark contact underside and lit, exact walkable edge: no painted false steps.
  rect(c,'#050d17',x-5,y,w+10,23);rect(c,'#a0aba2',x,y,w,3);rect(c,'#536776',x,y+3,w,7);
  rect(c,'#283a4b',x-3,y+10,w+6,7);rect(c,'#b1a77c',x,y+10,w,2);rect(c,'#132231',x+2,y+17,w-4,11);
  for(let xx=x+3;xx<x+w-3;xx+=31){rect(c,'#172737',xx,y+4,2,6);rect(c,'#71838a',xx+3,y+4,Math.min(22,x+w-xx-3),2);}
  for(let xx=x+7;xx<x+w-12;xx+=30){arch(c,'#53616b',xx,y+19,18,13);arch(c,'#0b1727',xx+3,y+22,12,13);}
  path(c,'#273a4a',[x+5,y+28,x+30,y+28,x+18,y+46,x+9,y+46]);
  path(c,'#68777c',[x+5,y+28,x+12,y+28,x+12,y+44,x+9,y+44]);
  path(c,'#273a4a',[x+w-5,y+28,x+w-30,y+28,x+w-18,y+46,x+w-9,y+46]);
  rect(c,'#8a8873',x+7,y+29,18,2);rect(c,'#8a8873',x+w-25,y+29,18,2);
  for(let n=0;n<4;n++){const xx=x+15+rnd()*(w-30);rect(c,'#dde0c02a',xx,y,3+rnd()*5,1);}
}
function floorCanvas(room:Room,floor:number){
  const key=`${room.seed}:${room.id}:${floor}:${room.width}`;let cv=caches.get(key);if(cv)return cv;
  cv=document.createElement('canvas');cv.width=room.width;cv.height=H;const c=cv.getContext('2d')!,rnd=randomizer(room.seed);
  rect(c,'#080f1a',0,FLOOR,room.width,100);
  // Stone cornice: an irregular worn edge, a carved frieze and deep lower vault.
  rect(c,'#151f2d',0,FLOOR,room.width,16);rect(c,'#738082',0,FLOOR,room.width,3);rect(c,'#354958',0,443,room.width,9);
  rect(c,'#9f9b7c',0,451,room.width,2);rect(c,'#233442',0,453,room.width,14);rect(c,'#526170',0,463,room.width,3);
  const stones=['#1c2939','#202c3b','#263341','#1b2938'];
  for(let x=0;x<room.width;x+=54){
    rect(c,'#101b2a',x,442,2,10);rect(c,'#bbc0a4',x+4,440,22+rnd()*16,1);
    rect(c,'#0d1c2d',x+9,456,33,4);rect(c,'#626b69',x+10,455,32,1);
    path(c,'#0c1929',[x+38,440,x+34,446,x+40,451],1);
  }
  for(let y=469;y<540;y+=26)for(let x=-44;x<room.width;x+=88){const xx=x+(y===495?42:0);
    rect(c,stones[Math.floor(rnd()*stones.length)],xx+1,y,86,24);rect(c,'#485361',xx+3,y,82,1);rect(c,'#0c1725',xx+2,y+21,83,3);
    if(rnd()>.55){path(c,'#0c1725',[xx+18,y+1,xx+22,y+8,xx+17,y+14,xx+31,y+23],2);}
  }
  for(const p of room.platforms)balcony(c,p.x,p.y,p.w,room.seed+p.x);
  archDoor(c,room);
  // Small contact debris; deliberately below actors' ankles and away from doors.
  for(let i=0;i<room.width/48;i++){
    const x=Math.floor(rnd()*room.width);if(room.doors.some(d=>Math.abs(x-d.x)<48))continue;
    path(c,'#26303b',[x,440,x+3,435,x+9,434,x+16,440]);rect(c,'#707675',x+4,435,6,1);
    if(rnd()>.7){rect(c,'#7d8277',x+20,438,11,2);rect(c,'#a8a28b',x+21,437,3,2);}
  }
  caches.set(key,cv);if(caches.size>8)caches.delete(caches.keys().next().value!);return cv;
}
function bookshelf(c:Ctx,x:number,y:number,width:number,seed:number){
  const rnd=randomizer(seed);rect(c,'#10131e',x-5,y-130,width+10,135);arch(c,'#35313a',x-4,y-145,width+8,145);
  rect(c,'#121924',x,y-126,width,128);
  const spines=['#73534b','#545b60','#62654b','#493c50','#6d6251'];
  for(let row=0;row<4;row++){
    let xx=x+5;while(xx<x+width-5){const h=12+rnd()*12,w=3+rnd()*5;rect(c,spines[Math.floor(rnd()*5)],xx,y-row*30-h,w,h);rect(c,'#b39c663d',xx,y-row*30-5,w,1);xx+=w+1;}
    rect(c,'#564a45',x-3,y-row*30,width+6,3);rect(c,'#9c876555',x,y-row*30,width,1);
  }
  rect(c,'#76694f',x-6,y-133,width+12,4);rect(c,'#8b795366',x-3,y-133,2,133);rect(c,'#352e2d',x+width,y-133,4,133);
}
function statue(c:Ctx,x:number,y:number){
  rect(c,'#192431',x-24,y-8,48,8);rect(c,'#707671',x-20,y-12,40,4);
  path(c,'#343d47',[x-16,y-14,x-8,y-68,x-14,y-77,x-10,y-92,x,y-100,x+10,y-92,x+13,y-78,x+8,y-69,x+20,y-14]);
  path(c,'#7c8580',[x-14,y-15,x-5,y-71,x-9,y-80,x-6,y-91,x,y-96,x+5,y-91,x+5,y-79,x+2,y-69,x+7,y-16]);
  path(c,'#a1a494',[x-6,y-88,x,y-93,x+4,y-87,x+2,y-79,x-4,y-80]);
  path(c,'#303a45',[x-6,y-76,x-2,y-45,x-9,y-20],2);path(c,'#505f64',[x+4,y-72,x+14,y-21],3);
  rect(c,'#293342',x-4,y-87,3,2);rect(c,'#293342',x+1,y-87,3,2);
  path(c,'#899183',[x-8,y-69,x-15,y-48,x-1,y-46,x+3,y-55],4);
}
function gear(c:Ctx,x:number,y:number,r:number,t:number){
  c.save();c.translate(x,y);c.rotate(t);c.strokeStyle='#54493a';c.lineWidth=6;c.beginPath();c.arc(0,0,r-6,0,Math.PI*2);c.stroke();
  for(let i=0;i<16;i++){c.save();c.rotate(i*Math.PI/8);rect(c,'#5e5240',r-10,-4,13,8);rect(c,'#a7926044',r-10,-4,12,1);c.restore();}
  for(let i=0;i<6;i++){c.save();c.rotate(i*Math.PI/3);rect(c,'#403b33',4,-3,r-15,6);rect(c,'#76684b',4,-3,r-15,1);c.restore();}
  rect(c,'#9e885b',-6,-6,12,12);rect(c,'#262932',-3,-3,6,6);c.restore();
}
function hangingBell(c:Ctx,x:number,broken:boolean,time:number){
  c.save();c.translate(x,36);
  for(const dx of [-53,53]){path(c,'#171e28',[dx,-40,dx,40],5);for(let y=-30;y<35;y+=9)rect(c,'#696453',dx-2,y,4,3);}
  path(c,'#090f18',[-76,155,-58,129,-47,93,-45,55,-33,25,-15,14,-15,4,15,4,15,14,33,25,45,55,47,93,58,129,76,155]);
  path(c,'#64533d',[-68,150,-53,127,-41,91,-40,57,-30,29,-13,19,13,19,30,29,40,57,41,91,53,127,68,150]);
  path(c,'#b29a61',[-60,144,-47,125,-37,88,-35,57,-25,32,-13,24,-19,49,-22,89,-28,119,-35,144]);
  path(c,'#403b33',[8,22,25,34,34,60,35,95,49,130,57,146,17,146,9,107,4,69]);
  rect(c,'#b2a16c',-68,145,136,4);rect(c,'#3a332c',-72,149,144,8);rect(c,'#988052',-73,155,146,3);
  for(const yy of [48,98]){path(c,'#b09a6359',[-34,yy,-15,yy+5,13,yy+5,34,yy],2);}
  path(c,'#282b2d',[-9,158,-7,178,0,185,7,178,9,158]);rect(c,'#897651',-5,160,10,15);
  if(broken){path(c,'#07121b',[5,20,-10,51,6,81,-13,114,-2,136,-12,157,1,157,6,135,-2,114,17,81,0,51,13,22]);
    path(c,'#a2d0bc66',[5,28,-5,51,11,81,-7,113,1,135,-6,153],2);
    for(let i=0;i<7;i++){const t=(time*.17+i*.13)%1,xx=Math.sin(i*2.7+time*.3)*45;path(c,'#9acbb625',[xx,154-t*166,xx+7,148-t*166,xx+4,168-t*166,xx-5,179-t*166]);}
  }
  c.restore();
}
/** Draw before all pickups and actors. Uses exactly the simulation's platform/door coordinates. */
export function drawBackground(c:Ctx,room:Room,cameraX:number,time:number,floor:number):void{
  c.save();c.imageSmoothingEnabled=false;
  rect(c,'#0b1420',0,0,W,H);
  // One panoramic hall, never tiled: only a single moon exists throughout a room.
  const travel=Math.max(1,room.width-W),p=Math.max(0,Math.min(1,cameraX/travel));
  const bx=Math.round(-12-p*176),by=-46,bw=1160,bh=653;
  if(plate.complete&&plate.naturalWidth)c.drawImage(plate,bx,by,bw,bh);
  const zone=(floor-1)%4;
  const bellRoom=room.kind==='boss';
  const brokenBell=bellRoom&&room.enemies.some(e=>e.kind==='boss'&&e.bossPhase===2);
  if(zone===1)rect(c,'#274c6229',0,0,W,FLOOR);
  if(zone===2)rect(c,'#58483f25',0,0,W,FLOOR);
  if(zone===3)rect(c,'#26245532',0,0,W,FLOOR);
  // Deliberate contrast separation behind the action band while retaining architecture above.
  const dark=c.createLinearGradient(0,255,0,442);dark.addColorStop(0,'#06112000');dark.addColorStop(.6,'#09142127');dark.addColorStop(1,'#08132191');c.fillStyle=dark;c.fillRect(0,255,W,187);
  // Candle illumination tracks the practical sources in the generated plate.
  glow(c,bx+300,by+135,138,'#ed8d39',.035+Math.sin(time*4)*.012);
  glow(c,bx+503,by+371,105,'#df8839',.055+Math.sin(time*7)*.012);
  const moonx=bx+704;
  c.save();c.globalAlpha=.028+Math.sin(time*.4)*.004;path(c,'#c5deeb',[moonx-46,105,moonx+27,110,moonx-151,440,moonx-266,440]);c.restore();
  // A pair of almost imperceptible portrait eyes, aligned with the source painting.
  rect(c,'#cabb8b70',bx+135+Math.sin(time*.24)*1.1,by+146,2,1);rect(c,'#cabb8b70',bx+141+Math.sin(time*.24)*1.1,by+146,2,1);
  c.save();c.translate(-Math.round(cameraX),0);
  for(let x=310;x<room.width-150;x+=670){
    if(x-cameraX<-200||x-cameraX>1140)continue;
    if(zone===1)bookshelf(c,x-65,429,116,room.seed+x);
    else if(zone===2){statue(c,x,439);for(const dx of [-28,28])candle(c,x+dx,439,time,.75);}
    else if(zone===3){gear(c,x+15,185,69,time*.065);gear(c,x+87,264,42,-time*.108);path(c,'#283340',[x+15,0,x+15,176],6);}
    else {
      // Broken pew with satin runner: low silhouette avoids the combat read.
      rect(c,'#100f17',x-36,423,83,14);rect(c,'#5b3b33',x-36,420,83,4);rect(c,'#a07a4b',x-35,420,82,1);
      rect(c,'#271b20',x-31,425,7,14);rect(c,'#36222a',x+35,424,7,15);
      path(c,'#6b303c',[x-6,420,x+20,420,x+21,436,x+11,433,x+7,438,x-3,433]);
      rect(c,'#b38b55',x-4,420,1,11);
    }
  }
  if(bellRoom)hangingBell(c,room.width*.5,brokenBell,time);
  c.restore();
  if(brokenBell){
    c.save();c.globalAlpha=.05;path(c,'#8bd2bf',[room.width*.5-cameraX-26,205,room.width*.5-cameraX+26,205,room.width*.5-cameraX+150,439,room.width*.5-cameraX-160,439]);c.restore();
  }
  if(zone===1){for(let i=0;i<6;i++){const xx=(i*191+time*9-cameraX*.2)%1040-30,yy=140+Math.sin(time*.7+i)*25+i*26;path(c,'#c5c0a147',[xx,yy,xx+8,yy-3,xx+10,yy+4,xx+3,yy+6]);}}
  if(zone===3){
    c.save();c.globalAlpha=.1;for(let i=0;i<36;i++){const x=(i*47-time*42)%1100;const y=(i*83+time*194)%400;path(c,'#a1bccb',[x,y,x-5,y+21],1);}c.restore();
    // Very brief low-intensity lightning; reduced-motion time is frozen by renderer.
    const phase=(time+room.seed%13)%13;if(phase<.1)rect(c,'#a4bdd70b',0,0,W,440);
  }
  c.drawImage(floorCanvas(room,floor),Math.round(-cameraX),0);
  // Candles are attached to selected architecture, not uniformly repeated torches.
  for(let wx=145;wx<room.width-50;wx+=557){const xx=wx-cameraX;if(xx<-80||xx>1040)continue;
    glow(c,xx,422,61,'#db8c3e',.11+Math.sin(time*5+wx)*.015);candle(c,xx,440,time,.8);candle(c,xx+9,440,time+.7,.54);
  }
  // Sparse drifting dust follows the light, rendered on the same pixel grid.
  for(let i=0;i<18;i++){const xx=(i*149+Math.sin(time*.22+i)*25-cameraX*.06+1200)%1040-40;const yy=72+(i*37+time*2.5)%326;rect(c,i%3===0?'#ead3a84b':'#aac9ce36',xx,yy,1+(i%2),1+(i%2));}
  c.restore();
}
/** Near silhouettes stay below the walk plane, so they never conceal enemies or loot. */
export function drawForeground(c:Ctx,room:Room,cameraX:number,time:number,floor:number):void{
  void floor;c.save();
  const shade=c.createLinearGradient(0,476,0,540);shade.addColorStop(0,'#02091400');shade.addColorStop(1,'#020813dc');c.fillStyle=shade;c.fillRect(0,476,W,64);
  for(let wx=42;wx<room.width;wx+=823){const x=Math.round(wx-cameraX*1.04);if(x<-120||x>1080)continue;
    path(c,'#050b14',[x-40,540,x-23,508,x-8,513,x+2,493,x+17,499,x+26,520,x+52,532,x+61,540]);
    path(c,'#263340',[x-23,508,x-8,513,x-5,518,x-22,513]);path(c,'#333b44',[x+2,493,x+17,499,x+14,501,x+3,497]);
    path(c,'#0a171c',[x+43,540,x+45,504,x+37,487,x+47,497,x+51,481,x+53,504,x+63,495,x+55,514,x+58,540]);
    if(wx%3===0){glow(c,x-3,504,44,'#b66a33',.07);candle(c,x-3,529,time,.8);}
  }
  c.restore();
}
