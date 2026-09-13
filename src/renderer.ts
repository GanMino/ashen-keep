import {drawProjectiles} from './projectile-vfx';
import * as THREE from 'three';
import {drawProp} from './art';
import {drawBackground,drawForeground,assetsReady} from './environment';
import {drawActor as fallbackActor} from './actors';
import {drawSpriteActor,spritesReady} from './sprites';
import {drawHazards,drawJourneyProp,drawBuild} from './scene-feedback';
import {encounterFor} from './encounters';
import type {ActorPose} from './types';
const drawActor=(c:CanvasRenderingContext2D,p:ActorPose)=>{if(!drawSpriteActor(c,p))fallbackActor(c,p);};
import {drawEffects,drawDebris} from './effects';
import {Game,W,H,strikeRadius} from './game';
export class GameRenderer {
 ready=Promise.all([assetsReady,spritesReady]);renderer:THREE.WebGLRenderer;scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 surface=document.createElement('canvas');ctx:CanvasRenderingContext2D;texture:THREE.CanvasTexture;material:THREE.ShaderMaterial;
 constructor(canvas:HTMLCanvasElement){
  this.surface.width=W;this.surface.height=H;this.ctx=this.surface.getContext('2d')!;this.ctx.imageSmoothingEnabled=false;
  this.texture=new THREE.CanvasTexture(this.surface);this.texture.minFilter=THREE.NearestFilter;this.texture.magFilter=THREE.NearestFilter;this.texture.generateMipmaps=false;
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
  this.renderer.setPixelRatio(1);this.renderer.setSize(W,H,false);this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.material=new THREE.ShaderMaterial({uniforms:{tScene:{value:this.texture},uTime:{value:0},uHero:{value:new THREE.Vector2(.45,.23)},uHurt:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:`
   uniform sampler2D tScene;uniform float uTime;uniform vec2 uHero;uniform float uHurt;varying vec2 vUv;
   void main(){vec2 uv=(floor(vUv*vec2(960.,540.))+.5)/vec2(960.,540.);vec3 c=texture2D(tScene,uv).rgb;
    vec3 glow=vec3(0.);for(int i=0;i<4;i++){float a=float(i)*1.570796;vec2 off=vec2(cos(a),sin(a))*vec2(.003,.005);glow+=max(texture2D(tScene,uv+off).rgb-vec3(.67),vec3(0.));}
    c+=glow*.13;float vignette=1.-.23*pow(length((uv-.5)*vec2(1.,.85)),1.7);c*=vignette;
    float d=length((uv-uHero)*vec2(1.77,1.));c+=vec3(.015,.023,.019)*exp(-d*8.);
    c=mix(c,vec3(.46,.06,.035),uHurt*pow(length(uv-.5)*1.45,3.)*.35);
    gl_FragColor=vec4(c,1.);
   }`});
  this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material));
 }
 render(g:Game){const c=this.ctx,t=g.time,p=g.player;const camera=Math.round(g.cameraX);c.save();c.clearRect(0,0,W,H);
  if(!g.reducedMotion&&g.shake>0)c.translate(Math.round(Math.sin(t*130)*g.shake*12*g.shakeDirection),Math.round(Math.cos(t*150)*g.shake*7));
  drawBackground(c,g.room,camera,g.reducedMotion?8:t,g.floor);
  for(const prop of g.room.props){if(prop.kind==='exit'&&!g.bossDefeated)continue;if(!drawJourneyProp(c,{...prop,x:prop.x-camera},t))drawProp(c,{...prop,x:prop.x-camera},t);}
  for(const door of g.room.doors){const x=door.x-camera;if(x<-90||x>W+90)continue;
   c.font='11px monospace';c.textAlign='center';const locked=door.gate==='doubleJump'&&!g.doubleJump||door.gate==='breakDash'&&!g.breakDash||g.rooms[door.target].kind==='boss'&&g.elites<2;c.fillStyle=locked?'#c8a788':'#b2c9bc';c.fillText(locked?'◇ 封印':'◇ '+(door.x<110?'返回':g.rooms[door.target].kind==='boss'?'领主之门':'通道'),x,door.y-87);
  }
  drawHazards(c,g,camera);
  for(const e of g.room.enemies){if(e.dead||e.x-camera<-100||e.x-camera>W+100)continue;
   if(e.attack>0&&e.kind!=='boss'&&e.kind!=='elite'){c.save();c.globalAlpha=.3+Math.sin(t*20)*.1;c.fillStyle='#cf6551';const width=strikeRadius(e.kind)*2;c.fillRect(e.x-camera-width/2,436,width,4);c.fillRect(e.x-camera-width/2,431,3,9);c.fillRect(e.x-camera+width/2,431,3,9);c.restore();c.fillStyle='#f4cd9a';c.font='bold 16px serif';c.textAlign='center';c.fillText('!',e.x-camera,e.y-75);}
   const special=e.kind==='boss'||e.kind==='elite';const duration=special?(e.variant==='storm'?1.15:e.variant==='hollow-king'?1:.9):.45;const recovery=special?(e.kind==='boss'?1.05:1.15):.18;
   const enemyProgress=e.attack>0?(e.attack>.12?.2*(1-e.attack/duration):.2+(1-e.attack/.12)*.25):(e.recovery??0)>0?.45+(1-(e.recovery??0)/recovery)*.55:undefined;
   drawActor(c,{kind:e.kind,variant:e.variant,telegraph:e.telegraph,combo:(e.visualMove??e.move??0)%2+1,x:e.x-camera,y:e.y,facing:e.facing,moving:e.attack<=0&&!(e.recovery??0),grounded:e.kind!=='bat'&&e.kind!=='wraith',attack:Math.max(e.attack,e.recovery??0),flash:e.flash,time:t+e.id*.31,armorBroken:e.armorBroken,bossPhase:e.bossPhase??1,attackProgress:enemyProgress});
   if(special){c.textAlign='center';c.font='11px serif';c.fillStyle=encounterFor(e).color;c.fillText(e.attack>0?(e.telegraph??''):encounterFor(e).name,e.x-camera,e.y-(e.kind==='boss'?158:116));}
   if((e.burn??0)>0){c.fillStyle='#ffa75f';c.font='15px serif';c.textAlign='center';c.fillText('♨',e.x-camera,e.y-79);c.fillStyle='#cf7048';for(let i=0;i<3;i++){const k=(t*1.3+i*.3)%1;c.globalAlpha=1-k;c.fillRect(e.x-camera+Math.sin(i*3+t)*10,e.y-20-k*48,2,5);}c.globalAlpha=1;}
   if(e.hp<e.maxHp||e.kind==='elite'){const width=e.kind==='boss'?80:e.kind==='elite'?55:28,y=e.y-(e.kind==='boss'?145:e.kind==='elite'?108:71);c.fillStyle='#182225';c.fillRect(e.x-camera-width/2,y,width,3);c.fillStyle=e.kind==='elite'?'#dcb878':'#c58c85';c.fillRect(e.x-camera-width/2,y,width*Math.max(0,e.hp/e.maxHp),3);}
  }
  for(const item of g.pickups){const x=Math.round(item.x-camera),y=Math.round(item.y+Math.sin(t*4+item.x)*2);c.fillStyle=item.kind==='xp'?'#a1ddc4':item.kind==='gold'?'#e7be71':'#dc838b';c.save();c.translate(x,y);c.rotate(Math.PI/4);c.fillRect(-3,-3,6,6);c.fillStyle='#f7e6c5';c.fillRect(-2,-2,2,2);c.restore();}
  // Dash afterimages are drawn before the solid, continuously visible hero.
  if(p.dash>0&&!g.reducedMotion){for(let i=3;i>=1;i--){c.save();c.globalAlpha=.07*(4-i);drawActor(c,{kind:g.selectedClass,x:p.x-camera-p.facing*i*19,y:p.y,facing:p.facing,moving:true,grounded:p.grounded,attack:0,flash:0,time:t-i*.03});c.restore();}}
  const invulnAlpha=p.invuln>0&&!g.reducedMotion?.68+Math.sin(t*35)*.22:1;c.save();c.globalAlpha=invulnAlpha;
  drawActor(c,{kind:g.selectedClass,x:p.x-camera,y:p.y,facing:p.attack>0?g.attackFacing:p.facing,moving:Math.abs(p.vx)>0,grounded:p.grounded,attack:p.attack,flash:0,time:t,attackProgress:p.attack>0?1-p.attack/g.attackDuration:undefined,combo:g.attackCombo,skill:g.attackIsSkill,velocityY:p.vy});c.restore();
  drawBuild(c,g,camera);
  drawProjectiles(c,g,camera);
  drawEffects(c,g.effects,camera,g.reducedMotion);drawDebris(c,g.debris,camera);
  for(const part of g.particles){c.globalAlpha=Math.min(1,part.life*3);c.fillStyle=part.color;c.fillRect(Math.round(part.x-camera),Math.round(part.y),part.size,part.size);}c.globalAlpha=1;
  c.textAlign='center';for(const f of g.floaters){c.globalAlpha=Math.min(1,f.life*3);c.font=f.text.length>4?'bold 14px serif':'bold 17px monospace';c.strokeStyle='#11191b';c.lineWidth=3;c.strokeText(f.text,f.x-camera,f.y);c.fillStyle=f.color;c.fillText(f.text,f.x-camera,f.y);}c.globalAlpha=1;
  drawForeground(c,g.room,camera,g.reducedMotion?8:t,g.floor);
  if(g.phase==='menu'){const grad=c.createLinearGradient(0,0,W,0);grad.addColorStop(0,'rgba(8,16,19,.84)');grad.addColorStop(.54,'rgba(8,16,19,.4)');grad.addColorStop(1,'rgba(8,16,19,.02)');c.fillStyle=grad;c.fillRect(0,0,W,H);}
  c.restore();this.texture.needsUpdate=true;this.material.uniforms.uTime.value=t;this.material.uniforms.uHero.value.set((p.x-camera)/W,1-(p.y-25)/H);this.material.uniforms.uHurt.value=p.invuln>.45&&p.invuln<.86&&p.hp<p.maxHp?1:0;this.renderer.render(this.scene,this.camera);
 }
}
