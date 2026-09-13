import type {Game} from './game';
import type {Prop} from './types';
export function drawHazards(c:CanvasRenderingContext2D,g:Game,camera:number){
 for(const h of g.hazards){const x=Math.round(h.x-camera);if(x+h.w<0||x>960)continue;c.save();c.fillStyle=h.color;c.strokeStyle=h.color;
  if(h.delay>0){c.globalAlpha=.12;c.fillRect(x,h.y,h.w,h.h);c.globalAlpha=.75;c.lineWidth=2;c.setLineDash([5,5]);c.strokeRect(x,h.y,h.w,h.h);c.setLineDash([]);c.globalAlpha=.55;c.fillRect(x,438,h.w,3);c.fillStyle='#f5dfb3';c.font='10px serif';c.textAlign='center';c.fillText(h.label,x+h.w/2,Math.max(130,h.y-7));}
  else{c.globalAlpha=.7;c.fillRect(x,h.y,h.w,h.h);c.globalAlpha=.9;c.fillStyle='#fff0c8';if(h.kind==='rain')c.fillRect(x+h.w*.45,h.y,h.w*.1,h.h);else for(let i=0;i<h.w;i+=16){c.beginPath();c.moveTo(x+i,440);c.lineTo(x+i+8,h.y+8);c.lineTo(x+i+16,440);c.fill();}}
  c.restore();
 }
}
export function drawJourneyProp(c:CanvasRenderingContext2D,p:Prop,t:number):boolean{
 if(!['shop','memory','trial','pact'].includes(p.kind))return false;
 c.save();c.translate(Math.round(p.x),Math.round(p.y));c.globalAlpha=p.used?.45:1;
 const r=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 if(p.kind==='shop'){
  r('#101a20',-44,-33,88,33);r('#765948',-44,-31,88,5);r('#bc9462',-42,-32,84,2);r('#463a39',-35,-26,6,25);r('#463a39',30,-26,6,25);
  for(let i=0;i<4;i++){r(['#9cbaa0','#b285ba','#c99c63','#739aa9'][i],-32+i*20,-46,11,14);r('#ead5a1',-30+i*20,-48,7,3);}
  r('#1a2332',-14,-78,29,40);r('#525267',-11,-72,23,32);r('#202636',-8,-66,16,16);r('#e3c593',-5,-61,10,5);r('#dac898',-3,-60,2,2);r('#dac898',3,-60,2,2);
 }else if(p.kind==='memory'){
  r('#394c55',-16,-10,32,10);r('#9f976c',-12,-14,24,4);r('#687c79',-4,-55,8,41);r('#dbbc70',-13,-61,26,7);r('#355768',-11,-85,22,24);r('#c5d7b5',-9,-83,18,20);r('#e9efd0',-4,-79,8,15);r('#bca267',-13,-89,26,5);r('#ead8a3',-3,-102,6,12);
  if(!p.used){c.globalAlpha=.2;c.fillStyle='#c1e4bd';c.beginPath();c.arc(0,-73,33+Math.sin(t*2)*3,0,Math.PI*2);c.fill();c.globalAlpha=1;}
 }else if(p.kind==='trial'){
  r('#333b45',-30,-8,60,8);r('#c4a76b',-25,-14,50,6);r('#5a5045',-14,-62,28,48);r('#a78858',-12,-60,8,44);r('#dec181',-22,-69,44,8);
  c.strokeStyle='#ead699';c.lineWidth=4;c.beginPath();c.moveTo(-13,-102);c.lineTo(14,-77);c.moveTo(13,-102);c.lineTo(-14,-77);c.stroke();
 }else{
  r('#7c5864',-25,-91,50,91);r('#c8a282',-21,-87,42,83);r('#1c2438',-16,-82,32,74);r('#425367',-12,-77,24,63);r('#c7c5b1',-4,-64,8,7);r('#8c546c',-7,-50,14,28);r('#c8a282',-31,-4,62,4);
 }
 c.fillStyle=p.used?'#889084':'#e2c592';c.font='11px serif';c.textAlign='center';c.fillText(p.used?'已取用':p.kind==='shop'?'商店':p.kind==='memory'?'记忆':p.kind==='trial'?'可选挑战':'血债契约',0,-116);c.restore();return true;
}
export function drawBuild(c:CanvasRenderingContext2D,g:Game,camera:number){const p=g.player;
 if(g.shield){c.save();c.strokeStyle='#d2ddae';c.globalAlpha=.35;c.lineWidth=2;c.beginPath();c.ellipse(p.x-camera,p.y-34,31,43,0,0,Math.PI*2);c.stroke();c.restore();}
 for(let i=0;i<Math.min(4,g.mutations.orbit??0);i++){const a=g.time*3+i*2.4,x=Math.round(p.x-camera+Math.cos(a)*62),y=Math.round(p.y-32+Math.sin(a)*35);c.fillStyle='#86b6bc';c.fillRect(x-5,y-5,10,10);c.fillStyle='#e3f0bd';c.fillRect(x-2,y-4,4,7);}
}
