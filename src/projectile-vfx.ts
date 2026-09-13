import type {Game} from './game';
export function drawProjectiles(c:CanvasRenderingContext2D,g:Game,camera:number){
 for(const s of g.shots){const x=s.x-camera,y=s.y;if(x<-100||x>1060)continue;c.save();c.translate(x,y);c.rotate(Math.atan2(s.vy,s.vx));
 if(!s.hostile&&g.selectedClass==='ranger'){
  c.fillStyle='#86b7ac';c.globalAlpha=.2;c.beginPath();c.moveTo(-58,0);c.lineTo(6,-3);c.lineTo(6,3);c.closePath();c.fill();c.globalAlpha=.6;c.strokeStyle='#acd7c5';c.lineWidth=1;c.beginPath();c.moveTo(-48,-2);c.lineTo(6,0);c.stroke();c.globalAlpha=1;c.fillStyle='#d8e8cb';c.fillRect(-18,-1,26,2);
  c.beginPath();c.moveTo(16,0);c.lineTo(5,-4);c.lineTo(7,0);c.lineTo(5,4);c.closePath();c.fill();c.fillStyle='#70bcae';c.beginPath();c.moveTo(-20,-5);c.lineTo(-11,-1);c.lineTo(-18,0);c.lineTo(-24,-3);c.fill();c.beginPath();c.moveTo(-20,5);c.lineTo(-11,1);c.lineTo(-18,0);c.lineTo(-24,3);c.fill();
 }else if(!s.hostile){
  c.globalCompositeOperation='lighter';for(let j=0;j<3;j++){c.strokeStyle=j===0?'#ffc477':s.color;c.globalAlpha=.2+j*.17;c.lineWidth=5-j;c.beginPath();c.moveTo(-44,Math.sin(g.time*12+j)*3);c.bezierCurveTo(-25,-10+j*5,-16,10-j*4,4,0);c.stroke();}
  c.fillStyle=s.color;c.globalAlpha=.65;c.beginPath();c.ellipse(1,0,s.radius+3,s.radius,0,0,Math.PI*2);c.fill();c.fillStyle='#fff0bd';c.globalAlpha=.95;c.fillRect(0,-3,7,6);
  for(let j=0;j<3;j++){c.globalAlpha=.45;c.fillStyle='#f8af69';c.fillRect(-16-j*9,Math.sin(j*7+g.time*9)*5,2,2);}
 }else if(/钟|盾/.test(s.cause)){
  c.strokeStyle=s.color;c.globalAlpha=.2;c.lineWidth=6;c.beginPath();c.ellipse(-3,0,s.radius*.8,s.radius*1.4,0,-1.5,1.5);c.stroke();c.globalAlpha=.85;c.lineWidth=2;c.stroke();c.strokeStyle='#def2dc';c.lineWidth=1;c.beginPath();c.ellipse(1,0,s.radius*.45,s.radius,0,-1.5,1.5);c.stroke();
 }else{
  c.strokeStyle=s.color;c.globalAlpha=.35;c.lineWidth=2;c.beginPath();c.moveTo(-25,0);c.quadraticCurveTo(-14,-6,2,0);c.stroke();c.globalAlpha=.9;c.fillStyle=s.color;
  if(/镜/.test(s.cause)){c.beginPath();c.moveTo(-s.radius,0);c.lineTo(0,-s.radius);c.lineTo(s.radius+2,0);c.lineTo(0,s.radius);c.closePath();c.fill();}
  else{c.beginPath();c.arc(0,0,s.radius,0,Math.PI*2);c.fill();c.globalAlpha=.45;c.lineWidth=1;c.beginPath();c.arc(0,0,s.radius+3,0,Math.PI*2);c.stroke();}
  c.globalAlpha=.95;c.fillStyle='#f5dcd1';c.fillRect(-1,-2,4,4);
 }
 c.restore();
 }
}
