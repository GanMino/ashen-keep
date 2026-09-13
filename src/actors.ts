import type { ActorPose } from './types';

type Ctx = CanvasRenderingContext2D;
type Pose = ActorPose & {attackProgress?:number;combo?:number;skill?:boolean;armorBroken?:boolean;bossPhase?:number;velocityY?:number};
const ink='#080e19', metal='#718593', bright='#dee3ca', gold='#c5a26d';
const sprites=new Map<string,HTMLCanvasElement>();
const R=(c:Ctx,color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function P(c:Ctx,color:string,pts:number[]){c.fillStyle=color;c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fill();}
function L(c:Ctx,color:string,pts:number[],width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='butt';c.lineJoin='bevel';c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.stroke();}
function joint(c:Ctx,x:number,y:number,color=metal,size=4){R(c,ink,x-size-1,y-size-1,size*2+2,size*2+2);R(c,color,x-size,y-size,size*2,size*2);R(c,bright,x-size,y-size,size,2);}
function limb(c:Ctx,pts:number[],color:string,w=8){L(c,ink,pts,w+4);L(c,color,pts,w);L(c,'#b0bbae',pts.map((v,i)=>i%2?v-2:v-1),2);}
function boot(c:Ctx,x:number,y:number,color:string){P(c,ink,[x-5,y-11,x+4,y-11,x+5,y-4,x+10,y-3,x+10,y+1,x-6,y+1]);P(c,color,[x-3,y-10,x+3,y-10,x+3,y-3,x+8,y-2,x+8,y-1,x-4,y-1]);R(c,'#b7c2b1',x-3,y-10,5,2);R(c,'#2c3c4b',x-5,y,15,2);}
function legs(c:Ctx,p:Pose,step:number,color=metal,wide=7){
  const air=!p.grounded, rising=(p.velocityY??-1)<0, a=air?(rising?-5:-2):step, b=air?(rising?5:2):-step;
  limb(c,[-wide,-26,-wide+a*.5,-16,-wide+a,-5],'#354250',7);joint(c,-wide+a*.5,-16,'#677682',3);boot(c,-wide+a,air?(rising?-5:-1):0,color);
  limb(c,[wide-2,-25,wide+b*.6,-16,wide+b,-5],color,8);joint(c,wide+b*.6,-15,'#9eaaa7',3);boot(c,wide+b,air?-1:0,color);
}
function cape(c:Ctx,time:number,step:number,color:string,large=false){const k=large?1.5:1;c.save();c.scale(k,k);const flow=Math.round(Math.sin(time*Math.PI*2)*3)-Math.abs(step);P(c,ink,[-8,-49,-19,-43,-23+flow,-20,-33+flow,-5,-23,-10,-17,-2,-11,-11,-7,-7,1,-27,0,-43]);P(c,color,[-9,-46,-16,-42,-20+flow,-19,-28+flow,-9,-22,-14,-17,-6,-12,-15,-9,-12,-3,-28,-3,-42]);P(c,'#4c2436',[-8,-41,-10,-23,-17,-6,-12,-26,-12,-41]);L(c,'#d47962',[-15,-41,-18+flow,-20,-24+flow,-13],2);L(c,'#bd645c',[-10,-39,-10,-23,-14,-15],2);c.restore();}
function sword(c:Ctx,angle:number){c.save();c.rotate(angle);P(c,ink,[-5,9,-6,-42,-1,-54,4,-47,6,-40,5,10]);P(c,'#b1c7ca',[-3,-5,-4,-40,-1,-49,2,-44,3,-39,3,-5]);P(c,'#edf0d7',[-3,-6,-3,-40,-1,-49,0,-39,0,-6]);R(c,'#4e7c8b',1,-38,2,31);R(c,ink,-11,-8,24,7);R(c,gold,-10,-7,21,4);R(c,'#f2d59d',-9,-7,8,2);R(c,'#5f3c32',-1,-3,4,12);R(c,'#e6bb70',-2,8,6,4);R(c,'#93c7c0',0,-29,2,4);c.restore();}
function attackAngle(p:Pose,rest=.25){if(!(p.attack>0))return rest;const q=p.attackProgress??.38;const heavy=p.combo===3;return q<.2?rest-(q/.2)*1.1:q<.55?-1.05+((q-.2)/.35)*(heavy?3.8:3.15):2.1-(q-.55)/.45*(2.1-rest);}
function knight(c:Ctx,p:Pose,step:number,bob:number){
 const q=p.attackProgress??0, wind=p.attack>0&&q<.2, active=p.attack>0&&q>=.2&&q<.55;
 cape(c,p.time,step,'#994652');legs(c,p,step);
 c.save();c.translate(active?3:wind?-2:0,bob+(wind?2:0));
 // Three overlapping cuirass plates, a cold edge and warm material reflections.
 P(c,ink,[-14,-46,7,-47,16,-35,11,-21,-11,-20,-17,-34]);P(c,'#708695',[-11,-43,5,-44,12,-35,9,-25,-9,-24,-13,-33]);P(c,'#d1d9c7',[-10,-42,-4,-44,0,-34,-4,-27,-10,-29,-12,-34]);P(c,'#384c60',[3,-41,9,-39,11,-34,7,-27,1,-27]);L(c,'#b4c5bd',[-11,-30,-3,-27,9,-30],2);L(c,'#a8b3a6',[-10,-25,-2,-22,9,-25],2);
 P(c,'#3a4553',[-11,-22,10,-22,13,-13,5,-14,0,-17,-4,-13,-13,-14]);L(c,'#8c9f9b',[-11,-21,-12,-15,-6,-15,-4,-20],2);L(c,'#879a98',[3,-20,5,-15,11,-15,9,-21],2);
 R(c,'#4b332f',-11,-24,23,4);R(c,gold,-2,-25,6,6);R(c,'#392d32',0,-23,2,2);
 // Front arm follows a real sword pivot throughout anticipation, cut and recovery.
 const handX=active?18:wind?5:14, handY=active?-32:wind?-43:-35;
 limb(c,[6,-41,12,-34,handX,handY],metal,7);joint(c,10,-40,'#9eafb0',5);L(c,bright,[6,-44,12,-44,15,-40],2);
 c.save();c.translate(handX,handY);sword(c,attackAngle(p));joint(c,0,1,'#819795',3);c.restore();
 // Shield covers the off hand without hiding the breastplate.
 P(c,ink,[-21,-38,-10,-36,-8,-22,-16,-15,-24,-23]);P(c,'#42586c',[-20,-35,-12,-34,-11,-24,-16,-19,-21,-24]);L(c,'#adbea9',[-20,-35,-12,-34,-11,-24,-16,-19,-21,-24,-20,-35],2);R(c,gold,-17,-33,2,10);R(c,gold,-20,-29,8,2);
 // Visor, cheek plates, vent cut-outs and a trailing horsehair crest.
 P(c,ink,[-10,-59,-3,-64,8,-60,12,-52,10,-44,-8,-44,-13,-51]);P(c,'#9cafb3',[-8,-58,-2,-61,7,-58,9,-52,8,-46,-7,-46,-10,-51]);P(c,'#dce4cf',[-7,-58,-2,-60,5,-58,6,-54,-8,-54]);R(c,'#253849',-8,-53,18,5);R(c,'#d7eecf',3,-52,6,2);P(c,'#78919c',[-8,-48,-2,-49,1,-45,-6,-44]);R(c,'#435966',3,-48,6,2);R(c,bright,-10,-55,2,6);
 P(c,'#602535',[-3,-61,-7,-69,-17,-68,-21,-62,-14,-64,-8,-63]);P(c,'#d46c62',[-3,-62,-6,-67,-14,-67,-18,-64,-9,-65,-7,-61]);R(c,'#ee9a77',-13,-68,7,2);
 c.restore();
}
function witch(c:Ctx,p:Pose,step:number,bob:number){
 const active=p.attack>0, cast=active?Math.sin((p.attackProgress??.4)*Math.PI):0;
 P(c,ink,[-12,-40,9,-42,14,-21,20+step,-3,11,-5,4,0,-4,-4,-15,0,-20,-3,-12,-22]);P(c,'#655075',[-10,-39,7,-40,10,-20,16+step,-5,9,-8,3,-4,-4,-8,-14,-3,-16,-5,-10,-23]);P(c,'#b287a0',[-6,-35,-3,-19,2,-6,6,-7,4,-22,1,-37]);P(c,'#343148',[-10,-33,-8,-23,-13,-6,-7,-8,-3,-24]);L(c,gold,[-11,-13,-8,-8,-2,-9,3,-6,9,-10,14,-7],2);
 R(c,'#493343',-10,-29,20,5);R(c,gold,-9,-28,19,2);R(c,'#f0cf92',-1,-30,5,6);P(c,'#bd965f',[-6,-22,-2,-19,-6,-15,-10,-19]);R(c,'#ece0bc',-7,-21,2,4);
 c.save();c.translate(0,bob);P(c,'#302639',[-10,-56,8,-54,11,-37,5,-30,5,-46,-4,-46,-8,-32,-13,-37]);P(c,'#cbab99',[-5,-54,5,-53,8,-45,4,-41,-4,-42,-7,-48]);R(c,'#f0d2ad',-4,-52,9,5);R(c,'#483546',4,-49,3,2);R(c,'#9f7181',2,-43,4,2);
 P(c,ink,[-23,-52,-11,-59,-8,-70,0,-80,7,-76,7,-62,15,-58,23,-51,9,-48,-12,-49]);P(c,'#826780',[-19,-53,-9,-58,-6,-69,1,-77,5,-74,4,-60,12,-56,18,-52,7,-51,-11,-52]);P(c,'#b98b9a',[-8,-59,-5,-68,0,-73,-1,-60]);P(c,'#44384f',[0,-74,4,-74,3,-59,11,-55,5,-54,-2,-59]);L(c,gold,[-9,-59,0,-57,8,-59],3);P(c,'#efdab0',[0,-61,3,-58,0,-55,-3,-58]);c.restore();
 limb(c,[-10,-37,-17,-29,-13,-24],'#5d4561',6);R(c,'#d7baa2',-16,-25,6,5);
 limb(c,[8,-38,15,-32-cast*4,24+cast*6,-33-cast*9],'#92708a',6);P(c,'#eed1b2',[23+cast*6,-38-cast*9,29+cast*6,-38-cast*9,33+cast*6,-34-cast*9,26+cast*6,-31-cast*9]);
 c.save();c.translate(-17,-27);c.rotate(-.1);R(c,ink,-3,-34,7,57);R(c,'#9b7558',-1,-32,3,54);L(c,gold,[-2,-30,-8,-37,-6,-44,1,-47,8,-42,7,-35,1,-31],2);P(c,'#c0efc7',[0,-44,5,-39,1,-34,-4,-38]);R(c,'#f1f0cf',0,-42,2,5);c.restore();
 if(active){const x=33+cast*7,y=-42-cast*9;P(c,'#567d9466',[x-13,y,x-4,y-12,x+8,y-9,x+14,y+2,x+3,y+12,x-9,y+8]);P(c,'#d69bd0',[x,y-8,x+6,y-2,x+3,y+6,x-5,y+3,x-7,y-4]);R(c,'#fff2ce',x-2,y-4,4,7);}
}
function ranger(c:Ctx,p:Pose,step:number,bob:number){
 const pull=p.attack>0?Math.sin((p.attackProgress??.35)*Math.PI)*12:3;
 cape(c,p.time,step,'#3c7069');legs(c,p,step,'#687d70');
 // Quiver and individual fletchings sit behind the shoulder.
 c.save();c.translate(-10,-40);c.rotate(-.3);R(c,ink,-4,-12,12,30);R(c,'#776049',-2,-10,8,24);R(c,'#c8a374',-2,-9,8,3);for(let i=0;i<3;i++){R(c,'#afbc9c',i*3-2,-23,1,16);P(c,'#d5d4ac',[i*3-2,-24,i*3-5,-29,i*3-1,-27,i*3,-21]);}c.restore();
 P(c,ink,[-12,-42,7,-43,14,-26,9,-19,-10,-19,-15,-30]);P(c,'#557469',[-10,-40,5,-40,11,-27,7,-23,-8,-22,-12,-30]);P(c,'#a0b191',[-9,-39,-4,-40,-1,-29,-5,-25,-10,-29]);P(c,'#2b4748',[1,-38,6,-37,8,-28,3,-26]);L(c,'#a88c61',[-9,-41,9,-22],4);R(c,'#483b32',-11,-23,23,5);R(c,gold,2,-24,5,6);L(c,'#68897a',[-9,-18,-11,-10,-3,-14,2,-10,7,-13,10,-18],3);
 c.save();c.translate(0,bob);P(c,ink,[-14,-45,-12,-55,-1,-67,8,-61,14,-49,9,-40,-4,-38]);P(c,'#527f71',[-11,-46,-9,-55,-1,-64,6,-59,11,-49,7,-43,-4,-42]);P(c,'#9fbaa0',[-9,-55,-2,-61,3,-59,6,-54,-2,-54,-8,-49]);P(c,'#192c33',[-2,-53,8,-54,10,-47,6,-43,-3,-46]);R(c,'#d9b491',2,-52,7,5);R(c,'#eff0c6',6,-51,2,2);P(c,'#638777',[-3,-48,1,-46,9,-46,6,-40,-3,-42]);L(c,'#b2ba8c',[-8,-43,-2,-40,5,-41],2);c.restore();
 limb(c,[8,-37,18,-33,27,-33],'#81977d',6);R(c,'#ecc9a1',25,-36,6,6);limb(c,[-6,-36,3-pull*.65,-28,20-pull,-33],'#677e70',6);R(c,'#d7b795',18-pull,-35,5,4);
 L(c,ink,[27,-59,34,-53,38,-43,39,-32,36,-18,29,-9,25,-6],6);L(c,'#b19361',[27,-59,34,-53,38,-43,39,-32,36,-18,29,-9,25,-6],3);L(c,'#e0c28e',[28,-57,33,-52,36,-43],2);L(c,'#dbe0b7',[27,-58,20-pull,-33,25,-7],1);
 if(!p.attackProgress||p.attackProgress<.55){L(c,'#b5a27c',[15-pull,-33,49,-33],2);P(c,'#e8ead1',[51,-33,44,-37,44,-29]);P(c,'#739985',[16-pull,-33,11-pull,-37,18-pull,-36,21-pull,-33]);}
}
function skull(c:Ctx,x:number,y:number,s=1){c.save();c.translate(x,y);c.scale(s,s);P(c,ink,[-8,-15,-3,-18,6,-17,10,-12,9,-3,5,0,4,5,-5,5,-6,0,-10,-5]);P(c,'#b9beaa',[-7,-13,-2,-16,5,-15,8,-11,7,-4,3,-2,3,3,-4,3,-5,-2,-8,-5]);P(c,'#e7dec0',[-6,-13,-2,-15,5,-14,6,-11,-6,-9]);R(c,'#172331',-6,-8,5,4);R(c,'#162330',3,-9,4,4);R(c,'#ed936a',-4,-7,2,2);R(c,'#f5ab76',4,-8,2,2);P(c,'#435454',[0,-6,2,-2,-2,-2]);for(let i=-3;i<=3;i+=3)R(c,'#657468',i,1,1,3);c.restore();}
function skeleton(c:Ctx,p:Pose,step:number,bob:number){
 const s=step*.8;limb(c,[-6,-25,-10-s,-14,-10+s,-3],'#82988e',3);joint(c,-10-s,-14,'#aab3a0',2);limb(c,[5,-25,8+s,-14,11-s,-3],'#c4c6a9',3);joint(c,8+s,-14,'#ccd0ad',2);R(c,'#a4b29d',-14+s,-2,10,3);R(c,'#dae0b7',7-s,-2,11,3);
 L(c,ink,[0,-43,0,-26],7);L(c,'#aeb6a0',[0,-43,0,-26],3);
 for(let i=0;i<4;i++){const y=-41+i*4;L(c,ink,[-8,y,-9,y+2,-3,y+4,6,y+2,9,y-1],4);L(c,i%2?'#a8b49f':'#d4d4b5',[-8,y,-9,y+2,-3,y+4,6,y+2,9,y-1],2);}
 P(c,'#675346',[-10,-27,8,-27,11,-19,5,-21,1,-15,-4,-21,-10,-17]);R(c,'#8e9b88',-8,-27,17,4);R(c,'#d7c08c',-2,-27,4,4);
 limb(c,[-9,-40,-17,-30,-13,-25],'#a6b59d',3);joint(c,-16,-31,'#b9c2a9',2);limb(c,[9,-40,17,-30,22,-34],'#c8ceb0',3);skull(c,1,-46+bob);L(c,'#747d6c',[-6,-57,-2,-60,0,-56],1);
 c.save();c.translate(23,-33);c.rotate(attackAngle(p,.4));R(c,'#6c5445',-1,-2,4,11);R(c,gold,-5,-6,12,3);P(c,ink,[-4,-7,-3,-28,4,-37,6,-21,4,-6]);P(c,'#8c9e9d',[-2,-7,-1,-28,3,-32,4,-21,2,-7]);R(c,'#dde0bd',-1,-26,2,14);R(c,'#684534',1,-17,3,3);c.restore();
}
function bat(c:Ctx,p:Pose){const flap=Math.round(Math.sin(p.time*Math.PI*4)*14);for(const s of [-1,1]){c.save();c.scale(s,1);P(c,ink,[3,-19,12,-31+flap,24,-37+flap,43,-36+flap,34,-26+flap*.5,31,-12,24,-18,17,-9,11,-14,3,-10]);P(c,'#66475e',[5,-20,14,-29+flap,25,-34+flap,38,-34+flap,30,-25+flap*.5,29,-17,23,-23,17,-14,11,-19,5,-13]);L(c,'#ab7b84',[6,-20,24,-33+flap,30,-20],2);L(c,'#956b79',[24,-33+flap,17,-15],1);P(c,'#ad6d76',[8,-19,15,-28+flap,23,-32+flap,18,-24+flap*.5]);c.restore();}P(c,ink,[-8,-25,-8,-38,-2,-31,4,-34,9,-41,11,-26,9,-14,3,-5,-4,-8,-9,-17]);P(c,'#534356',[-6,-26,-6,-34,-1,-27,5,-30,8,-36,8,-24,6,-13,2,-8,-3,-11,-7,-18]);R(c,'#f5b6a1',-5,-24,4,3);R(c,'#ee917d',4,-25,4,3);R(c,'#f1e0bb',-3,-17,2,5);R(c,'#f1e0bb',4,-18,2,5);L(c,'#a27479',[-2,-11,0,-6,-3,-3],1);}
function wraith(c:Ctx,p:Pose,bob:number){const t=p.time;P(c,ink,[-10,-51,9,-51,15,-32,13,-17,24,-5,11,-8,4,-1,-3,-9,-16,1,-13,-18,-21,-14,-16,-37]);P(c,'#346c6f',[-9,-48,8,-48,11,-33,8,-18,18,-8,8,-11,3,-5,-3,-15,-12,-4,-8,-22,-16,-18,-11,-36]);for(let i=0;i<4;i++){const x=-9+i*5,drift=Math.sin(t*Math.PI*2+i)*4;P(c,i%2?'#70aaa0':'#568d8d',[x,-43,x+3,-42,x+2+drift,-16,x-3+drift,-5,x-1,-25]);}
 c.save();c.translate(0,bob);P(c,ink,[-16,-47,-13,-60,-3,-72,5,-69,15,-57,17,-43,7,-40,-8,-40]);P(c,'#588d88',[-13,-48,-10,-59,-3,-68,3,-66,12,-56,13,-46,6,-43,-7,-43]);P(c,'#a8c9b0',[-10,-55,-4,-64,0,-65,-2,-57,-8,-50]);P(c,'#102531',[-7,-54,3,-58,10,-51,6,-45,-6,-45]);R(c,'#e0f9cd',-5,-51,4,2);R(c,'#b7f1c5',4,-52,4,2);R(c,'#6fa898',0,-46,3,4);c.restore();
 L(c,'#44777a',[-11,-38,-24,-27,-23,-16],6);L(c,'#92c2ac',[-12,-38,-23,-27,-23,-19],2);L(c,'#92c2ac',[10,-37,21,-30,30,-35],4);for(let i=0;i<3;i++)L(c,'#d1e2b9',[27,-34+i*2,34+i*2,-37+i*2],1);
}
function axe(c:Ctx,angle:number){c.save();c.rotate(angle);L(c,ink,[0,24,0,-48],8);L(c,'#8b634a',[0,23,0,-47],4);L(c,'#d3af7e',[-1,20,-1,-46],1);P(c,ink,[-3,-43,9,-49,22,-52,29,-46,32,-31,25,-19,18,-25,12,-28,0,-29,-9,-24,-17,-29,-18,-41,-12,-48]);P(c,'#708291',[0,-41,10,-46,22,-49,26,-44,29,-32,25,-24,19,-29,13,-32,0,-32,-9,-28,-14,-31,-15,-40,-11,-44]);P(c,'#cad1c2',[22,-48,26,-43,29,-32,25,-25,23,-32,24,-41]);L(c,'#d0c3a2',[-14,-39,-13,-33,-10,-30],2);R(c,gold,-3,-41,7,5);P(c,'#293c4c',[9,-41,19,-43,21,-36,16,-34]);c.restore();}
function elite(c:Ctx,p:Pose,step:number,bob:number){
 c.save();c.scale(1.2,1.2);cape(c,p.time,step,'#592e42');legs(c,p,step,'#687889',10);P(c,ink,[-18,-54,12,-56,22,-42,15,-24,-16,-24,-24,-40]);P(c,p.armorBroken?'#302c3b':'#52647c',[-16,-51,10,-53,18,-41,12,-28,-13,-27,-20,-40]);
 if(p.armorBroken){P(c,'#734454',[-10,-47,2,-48,8,-39,3,-27,-4,-32,-9,-25,-13,-37]);L(c,'#c99a82',[-8,-43,3,-39,-6,-36,4,-32],2);P(c,'#7ba9a1',[0,-47,5,-41,1,-35,-3,-40]);R(c,'#d8dbc0',0,-42,2,5);P(c,'#798b92',[-17,-49,-10,-46,-13,-39,-17,-37,-21,-43]);}else{P(c,'#a0a8ac',[-15,-49,-4,-51,0,-36,-8,-31,-16,-36]);P(c,'#34465f',[3,-49,11,-49,16,-40,8,-32,1,-36]);for(let i=0;i<3;i++)L(c,'#c0b9a6',[-10,-44+i*5,-2,-40+i*4,9,-46+i*5],2);R(c,'#755543',-11,-28,24,5);R(c,gold,-2,-29,6,6);}
 for(const x of [-20,17]){P(c,ink,[x-8,-51,x-5,-60,x+5,-56,x+11,-45,x+8,-34,x-8,-35,x-12,-43]);P(c,'#7c8a97',[x-6,-50,x-4,-56,x+4,-53,x+8,-44,x+5,-38,x-6,-38,x-9,-43]);L(c,'#d1cbb5',[x-5,-50,x+3,-51,x+7,-45],2);P(c,'#a6aaa6',[x-5,-55,x-6,-65,x+1,-57]);R(c,'#25364c',x-5,-43,11,3);}
 c.save();c.translate(0,bob);P(c,ink,[-14,-58,-13,-71,-6,-80,7,-79,16,-67,14,-55,5,-49,-8,-51]);P(c,'#323646',[-12,-60,-10,-70,-5,-76,5,-76,13,-66,11,-57,4,-52,-6,-54]);P(c,'#afb0a2',[-5,-73,5,-73,11,-66,8,-56,2,-52,-5,-56,-8,-66]);P(c,'#ded8bd',[-4,-72,2,-73,3,-67,-5,-63]);L(c,'#243445',[-5,-65,0,-63,7,-66],3);R(c,'#e99770',3,-65,3,2);L(c,'#3e484e',[-2,-60,-1,-55,3,-56,5,-61],2);c.restore();
 limb(c,[17,-44,25,-32,26,-38],'#71828e',8);c.save();c.translate(26,-37);axe(c,attackAngle(p,-.2));joint(c,0,0,'#a6aea6',4);c.restore();limb(c,[-20,-39,-24,-27,-17,-22],'#58697c',7);c.restore();
}
function boss(c:Ctx,p:Pose,step:number,bob:number){
 const broken=p.bossPhase===2, sway=Math.sin(p.time*Math.PI)*2;
 // The bell is deliberately wider than the body: a recognizable church silhouette.
 c.save();c.translate(-14,-47+sway);P(c,ink,[-38,0,-33,-13,-27,-32,-25,-58,-17,-70,-13,-77,4,-80,15,-69,20,-50,24,-30,32,-12,37,-2,34,8,-36,8]);
 if(!broken){P(c,'#795e3e',[-34,0,-29,-14,-24,-33,-22,-56,-15,-67,-10,-73,3,-75,12,-66,16,-49,20,-29,28,-11,33,0,30,5,-31,5]);P(c,'#b49a63',[-26,-14,-21,-34,-20,-55,-14,-66,-8,-70,-10,-49,-14,-29,-20,-9]);P(c,'#4b4437',[4,-72,11,-65,14,-49,18,-29,26,-11,30,1,16,0,5,-18]);L(c,'#d4b37b',[-28,-14,-15,-11,9,-11,26,-14],3);L(c,'#d3b279',[-22,-50,-8,-47,10,-49],2);L(c,'#292e30',[-1,-71,-5,-58,2,-48,-4,-33,5,-23,1,-9],3);L(c,'#c8ac70',[-2,-70,-6,-58,1,-48,-5,-32],1);P(c,'#bfa373',[-6,-42,3,-42,3,-30,9,-30,9,-25,3,-25,3,-16,-2,-16,-2,-25,-8,-25,-8,-30,-2,-30,-2,-42]);R(c,'#dcc091',-32,1,63,3);}
 else{P(c,'#816744',[-35,0,-29,-16,-24,-33,-20,-24,-16,-37,-11,-19,-7,-8,-13,4,-32,5]);P(c,'#a48958',[10,-9,18,-31,23,-24,26,-11,33,0,30,5,15,5]);L(c,'#e4c68b',[-25,-31,-20,-24,-16,-37,-11,-19],2);P(c,'#355c6888',[-23,-31,-29,-67,-16,-93,-4,-88,11,-96,23,-78,16,-53,3,-37]);P(c,'#689e9a',[-17,-36,-21,-62,-11,-83,-1,-81,8,-90,16,-75,10,-52,-1,-41]);P(c,'#b4d2b7',[-11,-54,-13,-70,-7,-78,1,-77,6,-71,2,-59]);R(c,'#0b2d3b',-10,-69,5,4);R(c,'#0b2d3b',0,-70,5,4);L(c,'#dcf3cd',[-16,-59,-23,-42,-17,-31],2);L(c,'#94c9b6',[10,-69,21,-51,15,-38],3);}
 // Cast bronze suspension lugs and rivets stay on the shattered shell.
 R(c,ink,-12,-85,24,10);R(c,gold,-9,-83,17,7);R(c,'#35382f',-4,-81,7,4);for(let i=0;i<5;i++)R(c,'#e0bd7e',-25+i*11,-3,2,2);c.restore();
 cape(c,p.time,step,'#473242',true);legs(c,p,step*.9,'#677482',15);
 P(c,ink,[-24,-75,18,-77,31,-57,20,-28,-20,-27,-32,-54]);P(c,'#414953',[-20,-72,15,-74,25,-55,17,-32,-17,-31,-26,-54]);P(c,'#797e7e',[-18,-70,-7,-72,-3,-54,-10,-35,-17,-37,-23,-54]);P(c,'#252e3c',[4,-70,16,-68,21,-54,11,-37,1,-43]);for(let i=0;i<3;i++)L(c,'#9c917a',[-16,-61+i*7,0,-54+i*6,16,-64+i*7],3);
 L(c,'#a59774',[-19,-73,-9,-59,1,-51,14,-36],4);for(let i=0;i<5;i++)R(c,'#d1b584',-18+i*7,-71+i*8,3,3);R(c,'#4e352e',-19,-33,39,6);R(c,gold,-5,-34,12,8);R(c,'#524531',-2,-32,6,4);
 c.save();c.translate(3,bob);P(c,ink,[-17,-75,-17,-90,-10,-105,3,-111,15,-101,22,-87,19,-73,7,-68,-7,-69]);P(c,'#434344',[-14,-78,-14,-89,-8,-102,3,-107,12,-98,18,-87,16,-77,6,-72,-5,-73]);P(c,'#72685b',[-12,-90,-6,-99,1,-102,0,-92,-8,-85]);P(c,'#0d1a23',[-7,-90,5,-96,13,-86,10,-77,-5,-77]);R(c,'#d9c99c',-5,-87,4,3);R(c,'#f0d2a0',5,-88,4,3);for(let i=0;i<3;i++)L(c,'#a18e69',[-6+i*7,-98,-8+i*7,-75],2);L(c,'#c4a87b',[-12,-83,13,-84],2);c.restore();
 limb(c,[-24,-60,-30,-39,-23,-29],'#656e73',12);joint(c,-24,-61,'#8a8d85',8);limb(c,[23,-62,36,-45,43,-51],'#747c7e',13);joint(c,25,-63,'#a5a390',8);
 // Pendulum hammer: long shaft, heavy angular bronze head and dangling chain.
 c.save();c.translate(43,-50);c.rotate(attackAngle(p,.1));L(c,ink,[0,27,0,-51],10);L(c,'#81674e',[0,26,0,-48],5);L(c,'#d7b17b',[-1,23,-1,-46],1);P(c,ink,[-17,-58,11,-60,23,-49,22,-29,-13,-25,-23,-36,-23,-49]);P(c,'#827456',[-16,-54,10,-56,19,-47,18,-33,-12,-29,-19,-37,-19,-47]);P(c,'#c4b387',[-15,-53,8,-55,10,-47,-16,-43]);P(c,'#494c43',[10,-54,18,-47,17,-34,10,-34]);L(c,'#ddd0a2',[-18,-39,-12,-33,8,-36],3);R(c,'#363b37',-5,-45,6,8);joint(c,0,0,'#a5a291',5);L(c,'#b8ab85',[1,26,5,32,4,38,9,44,8,50],2);P(c,'#b8a075',[8,46,14,51,9,57,3,51]);c.restore();
}

/** Poses are cached in quantized animation frames; composition never changes simulation RNG. */
export function drawActor(c:Ctx,pose:ActorPose):void{
 const p=pose as Pose, phase=Math.floor((p.time%2)*12), attack=p.attack>0?Math.min(11,Math.floor((p.attackProgress??.38)*12)):-1;
 const key=[p.kind,p.moving?1:0,p.grounded?1:0,(p.velocityY??-1)<0?0:1,phase,attack,p.combo??0,p.skill?1:0,p.armorBroken?1:0,p.bossPhase??1,p.flash>0?1:0].join(':');
 let sprite=sprites.get(key);
 if(!sprite){sprite=document.createElement('canvas');sprite.width=216;sprite.height=184;const s=sprite.getContext('2d')!;s.imageSmoothingEnabled=false;s.translate(104,166);
  const q:Pose={...p,time:phase/12,attackProgress:attack<0?undefined:(attack+.5)/12};
  const step=q.moving?Math.round(Math.sin(q.time*Math.PI*4)*6):0,bob=q.moving?Math.round(Math.sin(q.time*Math.PI*8)*1.4):Math.round(Math.sin(q.time*Math.PI));
  switch(q.kind){case'knight':knight(s,q,step,bob);break;case'witch':witch(s,q,step,bob);break;case'ranger':ranger(s,q,step,bob);break;case'skeleton':skeleton(s,q,step,bob);break;case'bat':bat(s,q);break;case'wraith':wraith(s,q,bob);break;case'elite':elite(s,q,step,bob);break;case'boss':boss(s,q,step,bob);break;}
  if(p.flash>0){s.setTransform(1,0,0,1,0,0);s.globalCompositeOperation='source-atop';s.fillStyle='#fff4d6';s.globalAlpha=.88;s.fillRect(0,0,216,184);}
  sprites.set(key,sprite);if(sprites.size>256)sprites.delete(sprites.keys().next().value!);
 }
 c.save();c.translate(Math.round(p.x),Math.round(p.y));c.imageSmoothingEnabled=false;
 if(p.grounded){const r=p.kind==='boss'?37:p.kind==='elite'?25:16;R(c,'#040a1280',-r,-1,r*2,4);R(c,'#03070caf',-r+5,0,r*2-10,3);}
 c.scale(p.facing<0?-1:1,1);c.drawImage(sprite,-104,-166);c.restore();
}
