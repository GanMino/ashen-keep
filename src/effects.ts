/** Readable short-lived effects; all positions are world pixels. */
export type EffectKind='slash'|'impact'|'shockwave'|'fire'|'lightning'|'soul'|'dash'|'armor'|'spawn'|'sigil'|'plume'|'crescent';
export interface Effect {kind:EffectKind;x:number;y:number;life:number;duration:number;facing:number;radius:number;color:string;variant:number;targetX?:number;targetY?:number;}
export interface Debris {x:number;y:number;vx:number;vy:number;angle:number;spin:number;life:number;duration:number;size:number;color:string;kind:'bone'|'metal'|'ember'|'cloth';bounces:number;}
export function drawEffects(c:CanvasRenderingContext2D,effects:Effect[],camera:number,reduced:boolean){
 for(const e of effects){const k=1-e.life/e.duration,x=e.x-camera,y=e.y;
  if(x<-e.radius-100||x>1060+e.radius)continue;
  c.save();c.translate(x,y);c.globalAlpha=Math.min(1,e.life*7);c.strokeStyle=e.color;c.fillStyle=e.color;c.lineCap='round';
  if(e.kind==='crescent'){
   const r=e.radius*(.8+k*.2);c.scale(e.facing,1);
   for(let i=0;i<3;i++){const a=i*2.1+k*.8;c.strokeStyle=i===1?'#d2ede3':e.color;c.globalAlpha=(1-k)*(.65-i*.1);c.lineWidth=7-i*1.5;c.beginPath();c.ellipse(0,0,r*(1-i*.08),r*(.3+i*.06),-.25+i*.3,a,a+1.65);c.stroke();c.strokeStyle='#fff5d5';c.lineWidth=1;c.stroke();}
   for(let i=0;i<18;i++){const a=i*2.4,rr=r*(.45+k*.5),xx=Math.cos(a)*rr,yy=Math.sin(a)*rr*.44;c.globalAlpha=(1-k)*.65;c.fillStyle=i%3?'#c3e8de':'#ffe7b1';c.fillRect(Math.round(xx),Math.round(yy),i%2?2:4,2);}
  }else if(e.kind==='sigil'){
   const r=e.radius*(.8+k*.3);c.rotate(reduced?0:k*.6);c.lineWidth=1;c.globalAlpha=(1-k)*.7;
   for(const size of [1,.75]){c.beginPath();c.arc(0,0,r*size,0,Math.PI*2);c.stroke();}
   for(let i=0;i<6;i++){const a=i*Math.PI/3,xx=Math.cos(a)*r*.87,yy=Math.sin(a)*r*.87;c.save();c.translate(xx,yy);c.rotate(a);c.strokeRect(-3,-3,6,6);c.restore();}
   c.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI*2/3;const xx=Math.cos(a)*r*.6,yy=Math.sin(a)*r*.6;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();
  }else if(e.kind==='plume'){
   c.scale(e.facing,1);for(let i=-5;i<=5;i++){const a=i*.16,r=e.radius*(.35+k*.6),xx=Math.cos(a)*r,yy=Math.sin(a)*r;c.globalAlpha=(1-k)*.7;c.save();c.translate(xx,yy);c.rotate(a);c.fillStyle=e.color;c.beginPath();c.moveTo(-20,0);c.quadraticCurveTo(-8,-8,9,0);c.quadraticCurveTo(-8,6,-20,0);c.fill();c.strokeStyle='#f2ffde';c.lineWidth=1;c.beginPath();c.moveTo(-23,0);c.lineTo(9,0);c.stroke();c.restore();}
  }else if(e.kind==='slash'){
   c.scale(e.facing,1);const flip=e.variant%2===0?-1:1;c.scale(1,flip);
   const start=-1.7+k*.55,end=start+Math.max(.2,2.5*(1-k*.4)),r=e.radius;
   c.beginPath();c.ellipse(0,0,r,r*.52,-.22,start,end);c.ellipse(0,0,r*.75,r*.35,-.22,end,start,true);c.closePath();c.globalAlpha*=.35;c.fill();
   c.globalAlpha=Math.min(.95,e.life*7);c.lineWidth=e.variant===3?5:3;c.beginPath();c.ellipse(0,0,r,r*.52,-.22,start+.1,end);c.stroke();
   c.strokeStyle='#fff6d8';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,r*.93,r*.47,-.22,start+.2,end-.05);c.stroke();
   c.strokeStyle=e.color;for(let i=0;i<3;i++){c.globalAlpha=(1-k)*(.2-i*.04);c.lineWidth=1;c.beginPath();c.ellipse(-5-i*3,4+i*3,r*(.94-i*.045),r*(.48-i*.02),-.22,start+.2+i*.2,end-.1);c.stroke();}
   for(let i=0;i<(reduced?4:9);i++){const a=start+(end-start)*i/9,rr=r*(.86+k*.13);c.globalAlpha=(1-k)*.8;c.fillStyle=i%3?e.color:'#fff5d0';c.fillRect(Math.round(Math.cos(a)*rr),Math.round(Math.sin(a)*rr*.52),i%3===0?4:2,2);}
  }else if(e.kind==='impact'||e.kind==='armor'){
   const r=e.radius*(.4+k);c.rotate(e.variant*.7);c.lineWidth=2;
   for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(Math.cos(a)*r*.3,Math.sin(a)*r*.3);c.lineTo(Math.cos(a)*r,Math.sin(a)*r*.55);c.stroke();}
   if(k<.35){c.fillStyle='#fff3d8';c.beginPath();c.moveTo(-r*.5,0);c.lineTo(-2,-r);c.lineTo(r*.5,0);c.lineTo(2,r);c.closePath();c.fill();}
   c.globalAlpha*=.3;c.lineWidth=1;c.beginPath();c.arc(0,0,r*.6,0,Math.PI*2);c.stroke();
  }else if(e.kind==='shockwave'){
   c.globalAlpha*=1-k;c.lineWidth=4*(1-k)+1;c.beginPath();c.ellipse(0,0,e.radius*k,Math.max(3,e.radius*k*.27),0,0,Math.PI*2);c.stroke();
   c.lineWidth=1;c.beginPath();c.ellipse(0,0,e.radius*k*.8,e.radius*k*.19,0,0,Math.PI*2);c.stroke();
  }else if(e.kind==='fire'){
   c.globalCompositeOperation='lighter';const radius=e.radius*(.2+Math.sin(k*Math.PI*.75)*.8),count=reduced?8:14;
   for(let i=0;i<count;i++){const a=i*Math.PI*2/count,xx=Math.cos(a)*radius,yy=Math.sin(a)*radius*.36,hh=(12+e.radius*.15)*(1-k)*(1+(i%3)*.3);
    c.fillStyle=i%2?'#d96a42':e.color;c.globalAlpha=(1-k)*.42;c.beginPath();c.moveTo(xx-6,yy);c.bezierCurveTo(xx-12,yy-hh*.4,xx+9,yy-hh*.8,xx+Math.sin(i)*8,yy-hh);c.bezierCurveTo(xx+16,yy-hh*.5,xx+14,yy-6,xx-6,yy);c.fill();
    c.fillStyle='#ffe5a0';c.globalAlpha=(1-k)*.55;c.fillRect(Math.round(xx),Math.round(yy-hh*.25),2,Math.max(2,hh*.2));
   }
   if(e.radius>80){c.globalAlpha=(1-k)*.5;c.lineWidth=2;c.beginPath();c.ellipse(0,0,radius,radius*.3,0,0,Math.PI*2);c.stroke();}
  }else if(e.kind==='lightning'){
   const dx=(e.targetX??e.x)-e.x,dy=(e.targetY??e.y)-e.y;
   c.globalAlpha*=.8;c.lineWidth=5;c.strokeStyle='#7aaaba';c.beginPath();c.moveTo(0,0);for(let i=1;i<=8;i++)c.lineTo(dx*i/8+(i<8?Math.sin(i*13+e.variant)*7:0),dy*i/8+(i<8?Math.cos(i*11)*7:0));c.stroke();c.lineWidth=1.4;c.strokeStyle='#f0fff0';c.stroke();
  }else if(e.kind==='soul'){
   const dx=(e.targetX??e.x)-e.x,dy=(e.targetY??e.y)-e.y;c.fillStyle=e.color;c.beginPath();c.arc(dx*k,dy*k-Math.sin(k*Math.PI)*36,3*(1-k)+1,0,Math.PI*2);c.fill();c.lineWidth=1;c.beginPath();c.moveTo(dx*Math.max(0,k-.14),dy*Math.max(0,k-.14)-Math.sin(Math.max(0,k-.14)*Math.PI)*36);c.lineTo(dx*k,dy*k-Math.sin(k*Math.PI)*36);c.stroke();
  }else if(e.kind==='dash'){
   c.globalAlpha*=.22;c.scale(e.facing,1);c.beginPath();c.moveTo(8,-26);c.lineTo(-55*(1-k),-42);c.lineTo(-42*(1-k),-8);c.lineTo(6,0);c.closePath();c.fill();
   c.lineWidth=1;c.beginPath();c.moveTo(-68*(1-k),-20);c.lineTo(-4,-20);c.stroke();
  }else if(e.kind==='spawn'){
   c.lineWidth=1;c.beginPath();c.ellipse(0,0,e.radius*(1-k),e.radius*.3*(1-k),0,0,Math.PI*2);c.stroke();
  }
  c.restore();
 }
}
export function drawDebris(c:CanvasRenderingContext2D,items:Debris[],camera:number){for(const d of items){c.save();c.translate(Math.round(d.x-camera),Math.round(d.y));c.rotate(d.angle);c.globalAlpha=Math.min(1,d.life*2);c.fillStyle=d.color;
 if(d.kind==='bone'){c.fillRect(-d.size/2,-1,d.size,3);c.fillRect(-d.size/2-1,-2,3,5);c.fillRect(d.size/2-2,-2,3,5);}
 else if(d.kind==='metal'){c.beginPath();c.moveTo(-d.size/2,-d.size*.3);c.lineTo(d.size/2,-d.size*.45);c.lineTo(d.size*.3,d.size*.4);c.lineTo(-d.size*.4,d.size*.3);c.closePath();c.fill();c.strokeStyle='#dad1a1';c.lineWidth=1;c.stroke();}
 else{c.fillRect(-d.size/2,-d.size/2,d.size,d.size*.5);}
 c.restore();}}
