import type { ActorPose, Prop, Room } from './types';

// The whole scene is authored on a two-pixel grid. Static masonry is baked once;
// actors, flames and reward state stay dynamic and retain perfectly sharp edges.
type Ctx = CanvasRenderingContext2D;
const ink = '#0b121c', edge = '#718789', ivory = '#eee3be', gold = '#cba164';
const cache = new Map<string, HTMLCanvasElement>();
const rect = (c: Ctx, color: string, x: number, y: number, w: number, h: number) => {
  c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};
function poly(c: Ctx, color: string, points: number[]) {
  c.fillStyle = color; c.beginPath(); c.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
  c.closePath(); c.fill();
}
function line(c: Ctx, color: string, points: number[], width = 2) {
  c.strokeStyle = color; c.lineWidth = width; c.beginPath(); c.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
  c.stroke();
}
function rng(seed: number) {
  let n = seed | 0; return () => { n = (Math.imul(1664525, n) + 1013904223) | 0; return (n >>> 0) / 4294967296; };
}
function arch(c: Ctx, color: string, x: number, y: number, w: number, h: number) {
  poly(c, color, [x, y+h, x,y+36, x+8,y+22, x+w/2-10,y+6, x+w/2,y, x+w/2+10,y+6, x+w-8,y+22, x+w,y+36, x+w,y+h]);
}
function light(c: Ctx, x: number, y: number, radius: number, color: string, alpha: number) {
  c.save(); c.globalAlpha = alpha;
  const g = c.createRadialGradient(x,y,0,x,y,radius); g.addColorStop(0,color); g.addColorStop(1,'transparent');
  c.fillStyle = g; c.fillRect(x-radius,y-radius,radius*2,radius*2); c.restore();
}
function column(c: Ctx, x: number, bottom=440) {
  rect(c,'#101b25',x-17,48,34,bottom-48);
  rect(c,'#2c3e47',x-12,76,24,bottom-76); rect(c,'#42555c',x-10,78,5,bottom-94);
  rect(c,'#192a34',x+6,78,5,bottom-94);
  for(let y=95;y<bottom-12;y+=54) { rect(c,'#14232d',x-12,y,24,3); rect(c,'#526066',x-10,y+3,18,2); }
  for(let i=0;i<3;i++) { rect(c,i===1?'#4c5b62':'#2b3c46',x-19+i*3,65+i*5,38-i*6,5); }
  rect(c,'#647374',x-19,63,38,2); rect(c,'#172733',x-18,bottom-12,36,12);
  rect(c,'#5b696b',x-17,bottom-13,34,4); rect(c,'#2d424b',x-22,bottom-6,44,6);
}
function windowBay(c: Ctx, x: number, floor: number, seed: number) {
  const random = rng(seed), y=86, w=148, h=234;
  arch(c,'#0c1722',x-9,y-10,w+18,h+23);
  arch(c,'#435862',x-4,y-6,w+8,h+12); arch(c,'#6a7c7c',x,y,w,h);
  arch(c,'#172d3d',x+7,y+8,w-14,h-13);
  c.save(); c.beginPath(); c.moveTo(x+9,y+h-6); c.lineTo(x+9,y+42);c.lineTo(x+w/2,y+12);c.lineTo(x+w-9,y+42);c.lineTo(x+w-9,y+h-6);c.closePath();c.clip();
  const sky=c.createLinearGradient(0,y,0,y+h);sky.addColorStop(0,floor%3===0?'#323a53':'#294553');sky.addColorStop(1,'#4c7377');c.fillStyle=sky;c.fillRect(x,y,w,h);
  // Pixelated moon, clouds, distant towers and warm occupied windows.
  rect(c,'#92ada2',x+91,y+42,26,26);rect(c,'#c0cbb0',x+95,y+38,18,34);rect(c,'#dce0bf',x+91,y+44,26,18);
  rect(c,'#859f99',x+106,y+45,6,4);rect(c,'#a4b9a6',x+93,y+58,8,5);
  for(let i=0;i<9;i++) rect(c,'#62858955',x+random()*w,y+20+random()*120,12+random()*34,4);
  for(let i=0;i<7;i++) {
    const xx=x-12+i*27, yy=y+130+random()*70;
    rect(c,'#1b3443',xx,yy,26,150);poly(c,'#1a303e',[xx-3,yy,xx+12,yy-28,xx+29,yy]);
    rect(c,'#77918a',xx+10,yy+13,3,8);rect(c,'#769086',xx+10,yy+34,3,8);
    rect(c,'#172d3b',xx+9,yy-40,5,16);
  }
  for(let i=0;i<4;i++) {const xx=x+i*48; rect(c,'#172631',xx,y+209,34,50);for(let j=0;j<3;j++)rect(c,'#172631',xx+j*12,y+202,7,12);}
  c.restore();
  // Ribbed mullions, carved quatrefoil and leaded lancets.
  rect(c,'#405763',x+45,y+60,5,h-65);rect(c,'#718784',x+45,y+60,2,h-65);
  rect(c,'#405763',x+97,y+60,5,h-65);rect(c,'#718784',x+97,y+60,2,h-65);
  rect(c,'#455d64',x+8,y+103,w-16,6);rect(c,'#7a8c86',x+8,y+104,w-16,2);
  line(c,'#6d8281',[x+8,y+102,x+12,y+74,x+26,y+61,x+46,y+82,x+48,y+104],3);
  line(c,'#6d8281',[x+50,y+103,x+54,y+69,x+74,y+49,x+94,y+69,x+98,y+103],3);
  line(c,'#6d8281',[x+100,y+104,x+101,y+83,x+122,y+61,x+138,y+74,x+140,y+102],3);
  poly(c,'#8b9c90',[x+74,y+20,x+86,y+33,x+74,y+46,x+62,y+33]);
  poly(c,'#2e4a58',[x+74,y+25,x+81,y+33,x+74,y+41,x+67,y+33]);
  for(let yy=y+124;yy<y+h-8;yy+=34) line(c,'#65828177',[x+10,yy,x+44,yy+20,x+73,yy,x+99,yy+20,x+138,yy],1);
  rect(c,'#798783',x-7,y+h,162,4);rect(c,'#2d414a',x-11,y+h+4,170,8);rect(c,'#121f2a',x-14,y+h+12,176,5);
}
function banner(c:Ctx,x:number,y:number,color:string,variant:number) {
  rect(c,'#151e29',x-18,y-8,36,8);rect(c,gold,x-22,y-5,44,3);
  poly(c,'#101821',[x-19,y,x+20,y,x+20,y+97,x+8,y+88,x-2,y+101,x-19,y+90]);
  poly(c,color,[x-16,y,x+16,y,x+16,y+90,x+5,y+83,x-2,y+94,x-16,y+86]);
  rect(c,'#bb977a',x-13,y,2,77);rect(c,'#bb977a',x+12,y,2,82);
  poly(c,'#b99d79',[x,y+22,x+9,y+42,x+4,y+58,x,y+65,x-5,y+55,x-8,y+40]);
  rect(c,color,x-2,y+34,4,20);if(variant%2)rect(c,'#ccb88e',x-7,y+41,14,3);
}
function gargoyle(c:Ctx,x:number,y:number) {
  poly(c,'#182630',[x-26,y+6,x-35,y-17,x-18,y-8,x-11,y-15,x,y-9,x+10,y-15,x+18,y-8,x+33,y-17,x+24,y+7]);
  poly(c,'#465862',[x-10,y-8,x-6,y-23,x,y-17,x+7,y-23,x+12,y-8,x+7,y+12,x-8,y+12]);
  rect(c,'#7b8984',x-7,y-10,5,3);rect(c,'#7b8984',x+4,y-10,5,3);rect(c,'#17242e',x-4,y,9,5);
  rect(c,'#65746f',x-14,y+13,28,4);
}
function doorArt(c:Ctx,room:Room) {
  for(const d of room.doors) {
    const x=d.x, y=d.y;
    arch(c,'#101923',x-38,y-106,76,106);arch(c,'#4c6065',x-34,y-103,68,103);arch(c,'#13212b',x-27,y-96,54,96);
    for(let i=0;i<4;i++) {rect(c,'#69807b',x-34,y-67+i*18,7,3);rect(c,'#2b434c',x+27,y-67+i*18,7,3);}
    rect(c,'#718079',x-38,y-4,76,4);rect(c,'#afae8b',x-29,y-2,58,2);
    for(let i=-18;i<=18;i+=12)rect(c,d.gate?'#424b53':'#233b41',x+i,y-71,4,68);
    if(d.gate==='doubleJump') {poly(c,'#7ecab7',[x,y-84,x+8,y-74,x,y-78,x-8,y-74]);poly(c,'#7ecab7',[x,y-70,x+8,y-60,x,y-64,x-8,y-60]);}
    else if(d.gate==='breakDash') {line(c,'#cb9069',[x-23,y-66,x+23,y-25],5);line(c,'#cb9069',[x+23,y-66,x-23,y-25],5);rect(c,'#f1c58d',x-4,y-49,8,8);}
    else {rect(c,'#b9b28b',x-2,y-82,4,13);rect(c,'#b9b28b',x-6,y-77,12,3);}
  }
}
function bake(room:Room,floor:number):HTMLCanvasElement {
  const canvas=document.createElement('canvas');canvas.width=room.width;canvas.height=540;
  const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;const random=rng(room.seed);
  rect(c,'#111e29',0,0,room.width,540);
  const hues=floor%3===0?['#202837','#242c3b','#1a2433','#2a303e']:['#1f303b','#243640','#1a2b35','#2a3c44'];
  for(let y=24;y<440;y+=22)for(let x=-48;x<room.width;x+=56) {
    const xx=x+(Math.floor(y/22)%2)*28;
    rect(c,hues[Math.floor(random()*4)],xx+1,y+1,54,20);
    rect(c,'#52616a22',xx+2,y+2,51,2);
    if(random()<.2)rect(c,'#101c2888',xx+random()*30,y+9,10+random()*16,2);
  }
  // Frieze and cross-vault ribs.
  rect(c,'#0d1722',0,38,room.width,23);rect(c,'#586668',0,40,room.width,3);rect(c,'#2a3d47',0,48,room.width,8);
  for(let x=0;x<room.width;x+=24){rect(c,'#526365',x,49,10,9);rect(c,'#172833',x+2,50,6,5);}
  for(let x=80;x<room.width;x+=288) {
    windowBay(c,x,floor,room.seed+x);
    poly(c,'#94c1b608',[x+8,220,x+138,220,x+274,436,x+75,436]);
    poly(c,'#b9e0bf08',[x+26,215,x+74,215,x+239,440,x+169,440]);
    column(c,x-43);
    line(c,'#3b505a',[x-42,69,x+28,27,x+119,27,x+242,70],8);
    line(c,'#64716f',[x-42,65,x+28,23,x+119,23,x+242,66],2);
    banner(c,x+204,108,room.kind==='boss'?'#633b48':floor%3===0?'#473b59':'#354f50',room.seed);
    gargoyle(c,x+204,98);
    // Recessed tomb niches under each window.
    for(let i=0;i<3;i++) { const xx=x+8+i*46; arch(c,'#101e29',xx,344,34,80);arch(c,'#2b414a',xx+4,350,26,70);rect(c,'#11232e',xx+9,361,16,53);rect(c,'#4e6061',xx+7,413,20,5); }
    if(random()>.5){for(let j=0;j<9;j++){const yy=145+j*13,xx=x-39+Math.sin(j)*5;rect(c,'#3c534c',xx,yy,3,15);poly(c,'#4d6453',[xx,yy+4,xx-12,yy,xx-8,yy+9,xx,yy+10]);}}
  }
  // Layered play surface; highlights precisely mark physical platform tops.
  rect(c,'#07131d',0,440,room.width,100);rect(c,'#74817a',0,440,room.width,3);rect(c,'#334c51',0,443,room.width,12);rect(c,'#a1a188',0,444,room.width,2);
  for(let x=0;x<room.width;x+=48) {rect(c,'#132936',x,448,2,10);rect(c,'#476067',x+3,454,43,3);}
  for(let y=463;y<540;y+=25)for(let x=-36;x<room.width;x+=72) {
    const xx=x+(y%2)*36;rect(c,hues[Math.floor(random()*3)],xx+2,y+1,69,23);rect(c,'#3f525b',xx+3,y+2,67,2);rect(c,'#0c1b27',xx+3,y+20,67,3);
    if(random()<.16)line(c,'#0b1724',[xx+18,y+3,xx+24,y+9,xx+21,y+14,xx+30,y+22],2);
  }
  for(const p of room.platforms) {
    rect(c,'#0b1721',p.x-3,p.y,p.w+6,18);rect(c,'#82958a',p.x,p.y,p.w,3);rect(c,'#496269',p.x,p.y+3,p.w,6);rect(c,'#263e4a',p.x+3,p.y+9,p.w-6,7);
    for(let x=p.x+4;x<p.x+p.w-6;x+=22){rect(c,'#182d39',x,p.y+5,2,11);rect(c,'#688178',x+3,p.y+8,15,2);}
    poly(c,'#354c55',[p.x+7,p.y+16,p.x+29,p.y+16,p.x+13,p.y+39,p.x+7,p.y+39]);
    poly(c,'#354c55',[p.x+p.w-7,p.y+16,p.x+p.w-29,p.y+16,p.x+p.w-13,p.y+39,p.x+p.w-7,p.y+39]);
    line(c,'#596d6b',[p.x+8,p.y+18,p.x+8,p.y+33],2);
  }
  doorArt(c,room);
  // Handful of atmospheric ground props: broken masonry, grave grass and bones.
  for(let i=0;i<room.width/78;i++) {
    const x=Math.floor(random()*room.width);
    if(random()>.45){poly(c,'#465953',[x,440,x+2,424,x+6,436,x+11,419,x+10,438,x+19,426,x+15,440]);}
    else {poly(c,'#35434b',[x,439,x+3,432,x+14,433,x+19,439]);rect(c,'#68706a',x+4,432,9,2);}
  }
  return canvas;
}

export function drawBackground(c:Ctx,room:Room,cameraX:number,time:number,floor:number):void {
  const key=`${room.seed}:${room.id}:${room.width}:${floor}`;
  let bg=cache.get(key);if(!bg){bg=bake(room,floor);cache.set(key,bg);if(cache.size>12)cache.delete(cache.keys().next().value!);}
  c.save();c.imageSmoothingEnabled=false;c.drawImage(bg,Math.round(-cameraX),0);
  for(let wx=284;wx<room.width;wx+=288) {
    const x=Math.round(wx-cameraX);if(x<-140||x>1100)continue;
    const flicker=Math.sin(time*10+wx)*.06+Math.sin(time*17)*.025;
    light(c,x,254,125,'#e99645',.24+flicker);light(c,x,256,39,'#f7a550',.2);
    rect(c,'#091822',x-7,264,14,22);rect(c,'#a48153',x-6,263,12,4);rect(c,'#6e6250',x-2,266,4,16);rect(c,'#1a2430',x-5,282,10,4);
    const sway=Math.round(Math.sin(time*14+wx)*2);
    poly(c,'#b75332',[x-5,263,x-8,253,x-3,246,x+sway,235,x+4,247,x+7,255,x+4,263]);
    poly(c,'#efae55',[x-3,262,x-5,254,x+2,244,x+4,255,x+2,262]);rect(c,'#ffe6a1',x-1,254,3,7);
    for(let i=0;i<3;i++){const phase=(time*.55+i*.34+wx*.002)%1;rect(c,'#e8ad6799',x+Math.sin(i+time)*5,240-phase*45,2,2);}
  }
  // Slow motes in the moonlight; do not hide combat silhouettes.
  for(let i=0;i<14;i++){const x=(i*173+Math.sin(time*.3+i)*24-cameraX*.15)%1000;const y=80+(i*61+time*4)%335;rect(c,'#a9c5b733',x,y,2,2);}
  c.restore();
}

function boot(c:Ctx,x:number,y:number,color:string) {rect(c,ink,x-4,y-10,10,12);rect(c,color,x-3,y-10,7,9);rect(c,'#a7b3a0',x-3,y-10,6,2);rect(c,'#334853',x-4,y-2,12,3);}
function skull(c:Ctx,x:number,y:number,size=1) {
  c.save();c.translate(x,y);c.scale(size,size);
  poly(c,ink,[-9,-17,7,-17,11,-12,10,1,5,7,-5,7,-9,2]);
  rect(c,'#9daba0',-7,-15,15,16);rect(c,'#d6d7b9',-6,-16,12,12);rect(c,'#eee4c8',-5,-15,9,3);
  rect(c,'#202d36',-6,-9,5,5);rect(c,'#202d36',3,-9,5,5);rect(c,'#d47066',-4,-8,2,2);rect(c,'#d47066',5,-8,2,2);
  poly(c,'#43564f',[0,-5,3,-1,-2,-1]);rect(c,'#c0c3a9',-5,1,11,4);
  for(let i=-3;i<7;i+=3)rect(c,'#4b5a55',i,1,1,4);c.restore();
}
function knight(c:Ctx,p:ActorPose,step:number,bob:number) {
  const swing=p.attack>0;
  poly(c,ink,[-10,-43,-20,-39,-20+step,-10,-12,-16,-6,-8,2,-18,5,-37]);
  poly(c,'#a14449',[-10,-41,-17,-37,-18+step,-13,-11,-19,-5,-12,0,-22,1,-37]);
  poly(c,'#da7260',[-13,-39,-11,-20,-6,-17,-7,-33]);
  boot(c,-6-step*.7,-1,'#667d84');boot(c,7+step*.7,-1,'#8d9e9d');
  poly(c,ink,[-12,-40,9,-40,14,-29,10,-15,-10,-15,-15,-29]);
  poly(c,'#758e95',[-10,-37,6,-39,11,-28,7,-19,-8,-19,-12,-28]);
  poly(c,'#bcc5b3',[-9,-36,-2,-38,2,-26,-3,-20,-10,-25]);rect(c,'#3b5663',1,-34,7,11);
  rect(c,'#253b48',-11,-19,22,5);rect(c,'#d8b574',-2,-19,5,5);rect(c,'#293d49',-3,-18,2,2);
  c.save();c.translate(0,bob);rect(c,ink,-9,-57,21,20);poly(c,'#a5b7b2',[-7,-56,6,-57,11,-51,9,-39,-7,-39]);
  rect(c,'#d8d9bf',-6,-55,9,4);rect(c,'#293f4c',-5,-48,16,6);rect(c,'#d7eece',4,-47,6,2);rect(c,'#66818a',-7,-43,15,4);
  rect(c,'#bf5760',-6,-65,5,10);rect(c,'#dd8670',-8,-64,7,3);rect(c,'#994552',-13,-60,8,5);c.restore();
  // Sword changes pivot during a strike; blade remains distinct at rest.
  c.save();c.translate(10,-30);c.rotate(swing?1.2:0.18);
  rect(c,ink,-3,-34,8,41);poly(c,'#ced8c9',[-2,-27,1,-38,4,-27,4,-3,-2,-3]);rect(c,'#7e9ca4',2,-28,2,24);rect(c,'#dfc586',-7,-4,17,4);rect(c,'#5c423a',0,0,4,11);rect(c,'#f0dba6',-1,10,6,3);c.restore();
  poly(c,ink,[-18,-34,-5,-33,-5,-18,-11,-12,-19,-19]);poly(c,'#547483',[-16,-32,-7,-31,-7,-20,-11,-16,-17,-21]);rect(c,'#b5c1ad',-14,-28,2,10);rect(c,'#b5c1ad',-17,-25,8,2);
}
function witch(c:Ctx,p:ActorPose,step:number,bob:number) {
  poly(c,ink,[-10,-36,10,-36,18+step,-3,7,-6,-1,0,-16,-2]);
  poly(c,'#70566e',[-8,-35,8,-35,14+step,-5,6,-9,-1,-3,-13,-4]);
  poly(c,'#b58b98',[-5,-31,-1,-6,4,-7,5,-30]);poly(c,'#433d57',[-7,-29,-12,-6,-5,-7,-2,-25]);
  rect(c,'#ddb67d',-10,-25,21,4);rect(c,'#ead2a1',-1,-26,5,6);
  c.save();c.translate(0,bob);rect(c,'#372939',-9,-50,20,18);rect(c,'#d6ae98',-5,-49,12,13);rect(c,'#f0ceb1',-3,-48,10,7);rect(c,'#40364d',4,-44,3,3);
  poly(c,ink,[-20,-49,-10,-54,-6,-70,1,-76,9,-57,19,-53,17,-49]);
  poly(c,'#8d7086',[-16,-52,-8,-55,-4,-69,1,-72,7,-55,15,-52]);poly(c,'#443a54',[-3,-68,2,-72,7,-55,2,-54]);
  rect(c,'#d7b981',-9,-57,17,3);rect(c,'#f0dbad',2,-58,4,5);c.restore();
  rect(c,'#bfa180',9,-35,8,5);rect(c,'#e1c0a5',13,-34,8,5);
  c.save();c.translate(22,-25);c.rotate(p.attack>0?.55:0);rect(c,ink,-3,-29,7,48);rect(c,'#916d57',-1,-25,3,42);rect(c,'#dfbc79',-3,-23,7,5);
  poly(c,'#ca895e',[-7,-30,-5,-39,0,-32,6,-40,9,-31,4,-25,-3,-25]);poly(c,'#d3e2c0',[-3,-32,0,-40,4,-32,0,-28]);c.restore();
}
function ranger(c:Ctx,p:ActorPose,step:number,bob:number) {
  poly(c,ink,[-9,-42,-17,-32,-22+step,-11,-12,-14,-9,-8,-2,-20,3,-39]);
  poly(c,'#437b72',[-10,-40,-14,-30,-19+step,-15,-12,-19,-9,-13,-4,-23,0,-36]);poly(c,'#79a28c',[-10,-37,-11,-28,-15,-19,-11,-21,-7,-32]);
  boot(c,-5-step,-1,'#5e6f60');boot(c,7+step,-1,'#7a896e');
  poly(c,ink,[-10,-37,8,-37,12,-18,-9,-15,-13,-27]);poly(c,'#879477',[-8,-35,6,-35,9,-20,-8,-19,-10,-27]);rect(c,'#385950',-4,-34,6,16);line(c,'#b49872',[-7,-35,9,-20],4);rect(c,'#594a3d',-9,-20,20,5);rect(c,'#d8bc7f',2,-20,5,4);
  c.save();c.translate(0,bob);poly(c,ink,[-12,-43,-8,-58,2,-64,11,-53,11,-39,-4,-37]);poly(c,'#548678',[-10,-45,-7,-56,1,-61,9,-52,9,-40,-3,-40]);poly(c,'#7ba592',[-8,-52,1,-59,6,-53,-1,-49]);rect(c,'#233c3f',-1,-51,11,10);rect(c,'#e2bc95',2,-50,7,6);rect(c,'#28383d',6,-48,3,2);rect(c,'#536e5c',0,-44,10,5);c.restore();
  rect(c,'#b7a082',8,-32,14,5);rect(c,'#e4c3a0',17,-33,6,6);
  const pull=p.attack>0?9:0;line(c,ink,[22,-49,30,-39,33,-25,29,-12,20,-3],5);line(c,'#bd9b69',[22,-49,30,-39,33,-25,29,-12,20,-3],3);line(c,'#dce2bb',[22,-48,18-pull,-26,20,-4],1);
  line(c,'#ad8963',[14-pull,-26,42,-26],2);poly(c,'#d2ddd0',[43,-26,35,-30,35,-22]);
}
function skeleton(c:Ctx,p:ActorPose,step:number,bob:number) {
  line(c,ink,[-5,-24,-8-step,-13,-7-step,0],8);line(c,'#a4b4a8',[-5,-24,-8-step,-13,-7-step,0],4);
  line(c,ink,[5,-24,7+step,-13,10+step,0],8);line(c,'#d1d2b6',[5,-24,7+step,-13,10+step,0],4);
  rect(c,'#536861',-11-step,-3,9,4);rect(c,'#8e9e90',6+step,-3,12,4);
  rect(c,ink,-10,-43,21,22);rect(c,'#718981',-2,-44,4,23);
  for(let i=0;i<4;i++){const y=-39+i*5;rect(c,'#b2c0aa',-8,y,19-i,3);rect(c,'#e0debd',-7,y,6,2);}
  rect(c,'#626e61',-9,-25,19,5);rect(c,'#4a393b',-7,-22,16,6);
  skull(c,1,-45+bob);
  line(c,'#9cae9f',[-8,-40,-15,-30,-10,-23],4);line(c,'#bcc8ad',[8,-39,17,-31,23,-34],4);
  c.save();c.translate(24,-33);c.rotate(p.attack>0?1.4:.3);rect(c,'#6a5243',-1,-3,3,14);rect(c,'#b69561',-5,-5,11,3);poly(c,'#8ca1a0',[-2,-5,-2,-25,4,-33,3,-5]);rect(c,'#d3d2b0',0,-25,2,19);c.restore();
}
function bat(c:Ctx,p:ActorPose) {
  const flap=Math.round(Math.sin(p.time*15)*10);
  poly(c,ink,[-3,-18,-18,-32+flap,-34,-35+flap,-28,-17,-25,-6,-16,-14,-6,-6,0,-11]);
  poly(c,'#65536c',[-4,-17,-18,-28+flap,-30,-31+flap,-25,-18,-24,-12,-16,-18,-7,-10,0,-13]);
  line(c,'#927386',[-6,-16,-18,-27+flap,-23,-15],2);
  poly(c,ink,[3,-18,18,-32+flap,34,-35+flap,28,-17,25,-6,16,-14,6,-6,0,-11]);
  poly(c,'#806076',[4,-17,18,-28+flap,30,-31+flap,25,-18,24,-12,16,-18,7,-10,0,-13]);
  line(c,'#ad8092',[6,-16,18,-27+flap,23,-15],2);
  poly(c,'#252336',[-7,-27,-4,-36,0,-29,5,-35,9,-25,7,-7,0,-2,-7,-8]);rect(c,'#b96c7c',-5,-25,4,3);rect(c,'#f0a091',3,-25,4,3);rect(c,'#d7d2ba',-3,-17,2,4);rect(c,'#d7d2ba',3,-17,2,4);
}
function wraith(c:Ctx,p:ActorPose,bob:number) {
  const drift=Math.sin(p.time*6)*4;
  poly(c,'#152931',[-11,-46,8,-48,16,-28,13,-10,20+drift,-1,4,-6,-3,2,-11,-7,-20,-3,-15,-24]);
  poly(c,'#4b8b86',[-10,-43,7,-45,13,-29,8,-12,13+drift,-5,2,-11,-5,-3,-7,-13,-15,-8,-11,-25]);
  poly(c,'#80b4a1',[-7,-42,-1,-44,-3,-19,-6,-11,-8,-24]);poly(c,'#31595c',[3,-41,9,-28,6,-17,1,-12,2,-27]);
  c.save();c.translate(0,bob);poly(c,ink,[-13,-43,-10,-57,0,-66,12,-56,15,-42,7,-38,-6,-39]);poly(c,'#56867d',[-11,-45,-8,-56,0,-62,9,-54,12,-43,5,-41,-5,-42]);poly(c,'#132c35',[-6,-51,6,-54,8,-44,-5,-44]);rect(c,'#cef2cc',-5,-50,4,3);rect(c,'#cef2cc',4,-50,4,3);c.restore();
  line(c,'#82b79b',[10,-37,18,-27,26,-30],5);poly(c,'#bad9b3',[23,-33,32,-38,29,-32,34,-30,26,-27]);
}
function elite(c:Ctx,p:ActorPose,step:number,bob:number) {
  c.save();c.scale(1.25,1.25);
  poly(c,ink,[-17,-42,-21,-9,-10,-13,-1,-7,11,-14,17,-36]);poly(c,'#753f51',[-14,-41,-17,-13,-10,-17,-2,-12,9,-18,13,-35]);
  boot(c,-8-step,-1,'#596174');boot(c,9+step,-1,'#7f808d');
  poly(c,ink,[-16,-42,12,-45,18,-27,11,-14,-13,-14,-20,-29]);poly(c,'#64758b',[-14,-40,10,-42,15,-28,9,-19,-11,-18,-16,-29]);poly(c,'#9b9ca1',[-13,-39,-3,-39,-1,-24,-8,-21,-14,-28]);
  for(let i=0;i<3;i++)line(c,'#b2aa9a',[-8,-34+i*5,4,-30+i*5,10,-36+i*5],2);
  rect(c,'#473e47',-13,-18,27,5);rect(c,'#cfaa78',-2,-19,6,6);
  c.save();c.translate(0,bob);skull(c,1,-45,1.05);
  poly(c,'#333e52',[-11,-54,-14,-69,-6,-65,-4,-76,1,-65,9,-76,10,-64,16,-70,13,-54]);
  line(c,'#bd9476',[-10,-56,-8,-64,-2,-61,3,-66,8,-61,12,-64,12,-56],3);rect(c,'#e89683',1,-59,5,5);c.restore();
  c.save();c.translate(22,-31);c.rotate(p.attack>0?1.1:-.15);rect(c,ink,-4,-37,9,68);rect(c,'#9b7660',-1,-33,3,62);poly(c,'#697b8d',[-1,-35,13,-41,25,-32,29,-19,17,-21,12,-27,-1,-24]);line(c,'#cccbbe',[15,-39,24,-31,27,-22],3);rect(c,'#d6b982',-4,-32,8,5);c.restore();
  poly(c,'#83909a',[-20,-39,-10,-37,-11,-27,-23,-27]);poly(c,'#b7b5a7',[-19,-40,-13,-43,-10,-36]);c.restore();
}
function boss(c:Ctx,p:ActorPose,step:number,bob:number) {
  // Crowned revenant: broad armored shoulders, torn royal mantle, chained greatblade.
  poly(c,ink,[-34,-92,-44,-49,-50+step,-9,-27,-13,-16,-2,3,-12,21,-3,37,-17,38,-77]);
  poly(c,'#6f3e50',[-30,-89,-37,-49,-43+step,-13,-28,-19,-16,-7,2,-18,21,-9,31,-20,33,-74]);
  poly(c,'#aa6269',[-26,-83,-31,-42,-27,-20,-20,-15,-20,-45,-13,-79]);poly(c,'#452f42',[17,-84,16,-37,21,-15,28,-23,26,-58]);
  boot(c,-14-step,-1,'#586a7d');boot(c,17+step,-1,'#8e959c');
  rect(c,ink,-23,-38,50,25);poly(c,'#4f6275',[-20,-37,20,-38,23,-16,10,-14,5,-31,-5,-29,-7,-13,-24,-16]);
  poly(c,ink,[-30,-88,25,-88,34,-60,21,-34,-24,-34,-38,-59]);poly(c,'#657c8e',[-27,-84,22,-85,29,-60,17,-40,-20,-40,-31,-60]);
  poly(c,'#b6b5a8',[-24,-82,-10,-81,-3,-48,-16,-45,-26,-61]);poly(c,'#344b61',[0,-80,20,-82,24,-61,12,-43,1,-49]);
  for(let i=0;i<4;i++){line(c,'#a6aaa4',[-14,-72+i*7,1,-64+i*6,18,-74+i*7],3);}
  rect(c,'#3a3542',-24,-38,49,8);rect(c,'#d1ae75',-6,-39,13,9);rect(c,'#673f49',-3,-37,6,5);
  // Spiked articulated pauldrons.
  poly(c,ink,[-33,-84,-43,-94,-43,-82,-55,-85,-47,-73,-54,-63,-34,-54,-20,-68]);
  poly(c,'#8d96a1',[-34,-81,-40,-89,-39,-77,-49,-80,-43,-70,-48,-64,-34,-59,-25,-69]);
  poly(c,ink,[25,-83,37,-97,38,-81,49,-87,43,-72,51,-67,33,-54,21,-68]);poly(c,'#687c92',[28,-81,35,-90,35,-78,43,-81,38,-70,44,-66,33,-59,25,-69]);
  c.save();c.translate(0,bob);skull(c,0,-89,1.45);
  poly(c,ink,[-17,-107,-20,-128,-9,-121,-3,-134,4,-121,15,-132,19,-107]);
  poly(c,'#b69261',[-14,-108,-17,-123,-9,-116,-3,-130,5,-116,14,-126,16,-108]);rect(c,'#f0d19a',-15,-112,31,4);rect(c,'#d77868',-3,-115,6,8);c.restore();
  line(c,'#4a6073',[29,-64,39,-44,47,-49],15);line(c,'#919ba1',[30,-66,38,-46,47,-49],7);
  c.save();c.translate(48,-49);c.rotate(p.attack>0?1.05:-.2);rect(c,ink,-6,-21,14,99);rect(c,'#9e715b',-2,-25,5,25);rect(c,'#d9ba7b',-13,-3,28,6);poly(c,'#899fa8',[-5,5,7,5,10,63,1,83,-7,62]);poly(c,'#cad3c4',[-5,6,-1,6,1,76,-4,63]);rect(c,'#3b6579',1,11,3,46);rect(c,'#f3dc9d',-4,-29,9,7);c.restore();
}

export function drawActor(c:Ctx,p:ActorPose):void {
  const step=p.moving?Math.round(Math.sin(p.time*13)*4):0;
  const bob=p.moving?Math.round(Math.sin(p.time*26)):Math.round(Math.sin(p.time*3));
  c.save();c.translate(Math.round(p.x),Math.round(p.y));
  const radius=p.kind==='boss'?43:p.kind==='elite'?26:17;
  if(p.grounded){rect(c,'#08121d88',-radius,-1,radius*2,5);rect(c,'#060d1788',-radius+5,1,radius*2-10,3);}
  c.scale(p.facing<0?-1:1,1);c.imageSmoothingEnabled=false;
  // Blink on hit without losing the costume silhouette.
  if(p.flash>0)c.globalAlpha=.58+.42*Math.abs(Math.sin(p.time*70));
  switch(p.kind) {
    case 'knight':knight(c,p,step,bob);break;case 'witch':witch(c,p,step,bob);break;case 'ranger':ranger(c,p,step,bob);break;
    case 'skeleton':skeleton(c,p,step,bob);break;case 'bat':bat(c,p);break;case 'wraith':wraith(c,p,bob);break;case 'elite':elite(c,p,step,bob);break;case 'boss':boss(c,p,step,bob);break;
  }
  c.restore();
}

export function drawProp(c:Ctx,p:Prop,time:number):void {
  const x=Math.round(p.x),y=Math.round(p.y);c.save();c.translate(x,y);
  if(p.kind==='chest') {
    if(!p.used)light(c,0,-18,64,'#d8ae68',.2);
    rect(c,ink,-24,-28,48,30);rect(c,'#664b3e',-22,-25,44,25);rect(c,'#a27649',-20,-22,40,7);rect(c,'#483c39',-20,-13,40,12);
    for(const xx of [-18,14]){rect(c,'#cbad70',xx,-24,4,25);rect(c,'#f0d290',xx,-24,3,3);}
    if(p.used){poly(c,'#715244',[-23,-28,-19,-42,21,-42,24,-28]);rect(c,'#d0ac70',-20,-41,41,3);rect(c,'#0d1c27',-17,-26,34,12);}
    else {rect(c,'#dab97b',-4,-16,8,11);rect(c,'#4e443c',-1,-12,3,5);rect(c,'#e6ca8d',-20,-25,40,2);const yy=-38+Math.sin(time*3)*3;poly(c,'#f0cf86',[0,yy-4,3,yy,0,yy+4,-3,yy]);}
    rect(c,'#a08357',-25,-2,50,3);
  } else if(p.kind==='altar') {
    if(!p.used)light(c,0,-40,94,'#75b59e',.28);
    rect(c,'#172b35',-29,-8,58,8);rect(c,'#7c8d7e',-26,-9,52,3);rect(c,'#304953',-17,-34,34,26);rect(c,'#5f786f',-15,-33,8,23);rect(c,'#a0aa8c',-23,-39,46,6);rect(c,'#394f54',-26,-35,52,4);
    for(const xx of [-18,18]){rect(c,'#d6c79d',xx,-49,4,10);if(!p.used){rect(c,'#efc274',xx,-55,4,6);rect(c,'#fff0ba',xx+1,-54,2,4);}}
    poly(c,p.used?'#4a635c':'#a4dcc0',[-9,-51,0,-71,9,-51,0,-42]);poly(c,p.used?'#35494a':'#ecedc4',[0,-68,6,-51,0,-46]);
    rect(c,gold,-3,-29,6,10);
  } else {
    light(c,0,-54,115,'#9bd7bd',.3);
    arch(c,'#0a1926',-37,-114,74,114);arch(c,'#687f7b',-33,-110,66,110);arch(c,'#244d53',-26,-103,52,103);
    arch(c,'#6ba08a',-21,-96,42,96);arch(c,'#afc6a2',-15,-87,30,87);
    for(let i=0;i<6;i++){const yy=-15-i*11;rect(c,'#e1dcad',-26+i*3,yy,52-i*6,2);}
    for(let i=0;i<6;i++){const yy=-15-((time*22+i*17)%80);rect(c,'#f0efc5',Math.sin(i*4+time)*14,yy,2,4);}
    rect(c,'#d4d5ad',-38,-3,76,3);
  }
  c.restore();
}

export function drawForeground(c:Ctx,room:Room,cameraX:number,time:number,floor:number):void {
  // Very restrained low fog and near masonry keep the action plane open.
  void room;void time;void floor;c.save();
  const shade=c.createLinearGradient(0,486,0,540);shade.addColorStop(0,'#070f1900');shade.addColorStop(1,'#070f19b8');c.fillStyle=shade;c.fillRect(0,486,960,54);
  for(let wx=20;wx<room.width;wx+=610){const x=Math.round(wx-cameraX*1.04);if(x<-50||x>1010)continue;poly(c,'#0c1925',[x-10,540,x-11,494,x-15,488,x-15,480,x+9,480,x+9,488,x+5,494,x+8,540]);rect(c,'#233640',x-15,480,24,3);}
  c.restore();
}
