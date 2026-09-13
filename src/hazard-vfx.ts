import type {Game} from './game';
import type {Hazard} from './encounters';
const TAU=Math.PI*2;
/** Ground ornaments carry timing; the faint fill and end brackets retain the exact collision extent. */
function ring(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,progress:number,color:string){
 c.strokeStyle=color;c.lineWidth=1;c.globalAlpha=.55;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.stroke();c.lineWidth=2;c.globalAlpha=.9;c.beginPath();c.ellipse(x,y,rx*.78,ry*.78,0,-Math.PI/2,-Math.PI/2+TAU*progress);c.stroke();
 for(let i=0;i<6;i++){const a=i*TAU/6,px=x+Math.cos(a)*rx,py=y+Math.sin(a)*ry;c.beginPath();c.moveTo(px-3,py);c.lineTo(px,py-4);c.lineTo(px+3,py);c.lineTo(px,py+4);c.closePath();c.stroke();}
}
function bolt(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,seed:number,color:string){
 c.beginPath();c.moveTo(x+w*.5,y);for(let i=1;i<=9;i++)c.lineTo(x+w*(.5+Math.sin(i*17+seed)*.31),y+h*i/9);
 c.strokeStyle=color;c.lineWidth=7;c.globalAlpha=.28;c.stroke();c.lineWidth=3;c.globalAlpha=.9;c.stroke();c.strokeStyle='#fff6dc';c.lineWidth=1;c.stroke();
 for(let i=2;i<8;i+=2){const px=x+w*(.5+Math.sin(i*17+seed)*.31),py=y+h*i/9;c.beginPath();c.moveTo(px,py);c.lineTo(px+Math.sin(i)*w*.22,py+h*.09);c.lineTo(px+Math.sin(i)*w*.3,py+h*.17);c.strokeStyle=color;c.globalAlpha=.6;c.stroke();}
}
function type(h:Hazard){const id=h.style??'';
 if(id==='storm')return 'lightning';if(['gravekeeper','bone-mother'].includes(id))return 'bone';
 if(['hexer','ink-abbot','oracle'].includes(id))return 'curse';if(['bell-keeper','royalguard'].includes(id))return 'bell';
 if(h.kind==='rain')return 'royal';if(['lancer','gate-warden','hollow-king'].includes(id)&&h.kind==='line')return 'thrust';
 return ['butcher','duelist','gate-warden','hollow-king'].includes(id)?'blade':'poison';
}
export function drawHazards(c:CanvasRenderingContext2D,g:Game,camera:number){
 for(const h of g.hazards){const x=Math.round(h.x-camera);if(x+h.w<0||x>960)continue;const bottom=h.y+h.h,cx=x+h.w/2,mode=type(h),warn=h.delay>0;
 const q=warn?Math.max(0,Math.min(1,1-h.delay/(h.windup??.9))):Math.max(0,Math.min(1,1-h.life/(h.duration??.22)));
 c.save();c.fillStyle=h.color;c.strokeStyle=h.color;
 // Keep the danger footprint visible without opaque rectangles obscuring actors.
 c.globalAlpha=warn?.055+.055*q:.13*(1-q);c.fillRect(x,h.y,h.w,h.h);
 c.globalAlpha=warn?.65:.9;c.lineWidth=1;
 for(const edge of [x,x+h.w]){const dir=edge===x?1:-1;c.beginPath();c.moveTo(edge,bottom-11);c.lineTo(edge,bottom-1);c.lineTo(edge+dir*9,bottom-1);c.stroke();if(h.h>150){c.beginPath();c.moveTo(edge,h.y+9);c.lineTo(edge,h.y);c.lineTo(edge+dir*8,h.y);c.stroke();}}
 if(warn){
  c.globalAlpha=.2+q*.45;c.fillRect(x,bottom-3,h.w,2);
  if(mode==='blade'||mode==='thrust'){
   const dir=h.facing??1;c.lineWidth=1.5;
   for(let i=0;i<Math.floor(h.w/40);i++){const xx=x+20+i*40;c.globalAlpha=.18+q*.5;c.beginPath();c.moveTo(xx-dir*5,bottom-17);c.lineTo(xx+dir*5,bottom-12);c.lineTo(xx-dir*5,bottom-7);c.stroke();}
   c.globalAlpha=.8;c.fillStyle='#ffe6b6';c.fillRect(dir>0?x+h.w*q:x+h.w*(1-q),bottom-6,3,7);
  }else{
   ring(c,cx,bottom-8,Math.max(12,h.w*.43),Math.min(13,h.h*.12),q,h.color);
   if(h.h>150){c.setLineDash([2,12]);c.globalAlpha=.3;c.beginPath();c.moveTo(cx,h.y+8);c.lineTo(cx,bottom-22);c.stroke();c.setLineDash([]);}
   for(let i=0;i<3;i++){const yy=bottom-20-i*12;c.globalAlpha=q*.4;c.fillRect(cx+Math.sin(i*4)*9,yy,2,3);}
  }
 }else{
  // Active shapes stay within the already telegraphed box, including their brightest cores.
  c.beginPath();c.rect(x,h.y,h.w,h.h);c.clip();c.globalCompositeOperation='lighter';
  if(mode==='lightning')bolt(c,x,h.y,h.w,h.h,g.reducedMotion?1:Math.floor(-h.delay*24),h.color);
  else if(mode==='blade'){
   c.save();c.translate(cx,bottom-h.h*.48);c.scale(h.facing??1,1);c.strokeStyle=h.color;
   for(let i=0;i<3;i++){c.globalAlpha=(1-q)*(.8-i*.2);c.lineWidth=8-i*2;c.beginPath();c.ellipse(0,0,h.w*(.46-i*.055),h.h*(.45-i*.05),-.12,-2.7+q*.7,.25+q*.7);c.stroke();}
   c.strokeStyle='#fff2c7';c.globalAlpha=1-q;c.lineWidth=2;c.stroke();c.restore();
  }else if(mode==='thrust'){
   const dir=h.facing??1,tip=dir>0?x+h.w-5:x+5,tail=dir>0?x+4:x+h.w-4,yy=bottom-h.h*.45;
   c.fillStyle=h.color;c.globalAlpha=.6*(1-q);c.beginPath();c.moveTo(tail,yy);c.lineTo(tip-dir*18,yy-12);c.lineTo(tip,yy);c.lineTo(tip-dir*18,yy+12);c.closePath();c.fill();c.strokeStyle='#fff1ca';c.lineWidth=2;c.beginPath();c.moveTo(tail,yy);c.lineTo(tip,yy);c.stroke();
   for(let i=0;i<8;i++){c.globalAlpha=.5*(1-q);c.fillRect(x+h.w*i/8,yy+Math.sin(i*3)*16,12,1);}
  }else if(mode==='bone'){
   for(let i=0;i<Math.max(2,Math.floor(h.w/19));i++){const xx=x+9+i*19,hh=h.h*(.7+Math.sin(i*2)*.15)*Math.min(1,q*8+.3),yy=bottom-hh;
    c.globalAlpha=.85*(1-q*.4);c.fillStyle='#bbbba0';c.fillRect(xx-4,yy+9,8,hh-9);c.fillStyle='#fff0cf';c.fillRect(xx-2,yy+9,2,hh-12);
    c.beginPath();c.moveTo(xx-6,yy+12);c.lineTo(xx-3,yy);c.lineTo(xx+2,yy-2);c.lineTo(xx+5,yy+12);c.fill();
    c.fillStyle='#536567';for(let j=1;j<4;j++)c.fillRect(xx-5,yy+hh*j/4,10,2);
   }
  }else if(mode==='curse'||mode==='royal'){
   ring(c,cx,bottom-8,h.w*.44,12,1,h.color);
   for(let i=0;i<5;i++){const xx=x+h.w*(i+1)/6,hh=h.h*(.65+Math.sin(i*3)*.2);c.strokeStyle=h.color;c.lineWidth=i===2?5:2;c.globalAlpha=.65*(1-q);c.beginPath();c.moveTo(xx,bottom);c.bezierCurveTo(xx-16,bottom-hh*.4,xx+15,bottom-hh*.7,xx,bottom-hh);c.stroke();c.fillStyle='#f1dceb';c.fillRect(xx-1,bottom-hh,3,9);}
  }else if(mode==='bell'){
   for(let i=0;i<3;i++){c.globalAlpha=(1-q)*(.7-i*.17);c.lineWidth=3-i*.7;c.beginPath();c.ellipse(cx,bottom-6,h.w*(.15+q*.32+i*.07),h.h*(.15+q*.5),0,Math.PI,TAU);c.stroke();}
  }else{
   for(let i=0;i<7;i++){c.globalAlpha=(1-q)*.55;const xx=x+(i+.5)*h.w/7;c.beginPath();c.arc(xx,bottom-6-Math.sin(q*Math.PI)*h.h*.65,(3+i%3)*(1-q)+2,0,TAU);c.fill();}
  }
  // Material fragments, deterministic and bounded: no gameplay RNG consumption.
  for(let i=0;i<8;i++){c.globalAlpha=(1-q)*.6;c.fillStyle=i%3?'#e6c99e':h.color;const xx=x+(i+.5)*h.w/8,yy=bottom-4-Math.sin(q*Math.PI)*(10+(i%3)*12);c.fillRect(Math.round(xx),Math.round(yy),i%2?2:3,2);}
 }
 c.restore();
 }
}
