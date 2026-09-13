export type SoundEvent='hit'|'kill'|'jump'|'dash'|'hurt'|'loot'|'skill'|'door'|'level'|'swing'|'heavy'|'armor'|'bell'|'land'|'arrow'|'fire';

/** Locally synthesized fallback: layered material transients, never game RNG. */
export class Sound {
 ctx:AudioContext|null=null;muted=false;
 private master:GainNode|null=null;
 private noise:AudioBuffer|null=null;
 private played=new Map<SoundEvent,number>();
 private serial=0;
 private ambienceWanted=false;
 private ambience:AudioBufferSourceNode|null=null;
 private ambienceGain:GainNode|null=null;
 private visibilityBound=false;
 unlock(){
  if(!this.ctx){try{this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:.25;const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-14;compressor.ratio.value=5;this.master.connect(compressor).connect(this.ctx.destination);this.noise=this.makeNoise(3);}catch{return;}}
  if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{});
  if(!this.visibilityBound){document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stopAmbience();else if(this.ambienceWanted)this.startAmbience();});this.visibilityBound=true;}
  if(this.ambienceWanted)this.startAmbience();
 }
 setMuted(value:boolean){this.muted=value;if(this.ctx&&this.master)this.master.gain.setTargetAtTime(value?0:.25,this.ctx.currentTime,.025);if(value)this.stopAmbience();else if(this.ambienceWanted)this.startAmbience();}
 setAmbience(active:boolean){this.ambienceWanted=active;if(active)this.startAmbience();else this.stopAmbience();}
 private makeNoise(seconds:number){const c=this.ctx!,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*seconds),c.sampleRate),data=buffer.getChannelData(0);let seed=0x472fa;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;data[i]=((seed>>>0)/4294967296)*2-1;}return buffer;}
 private startAmbience(){const c=this.ctx;if(!c||!this.master||this.muted||document.hidden||this.ambience)return;const source=c.createBufferSource(),gain=c.createGain(),filter=c.createBiquadFilter();source.buffer=this.noise;source.loop=true;filter.type='lowpass';filter.frequency.value=380;filter.Q.value=.3;gain.gain.setValueAtTime(0,c.currentTime);gain.gain.linearRampToValueAtTime(.085,c.currentTime+1.5);source.connect(filter).connect(gain).connect(this.master);source.start();this.ambience=source;this.ambienceGain=gain;source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}
 private stopAmbience(){const source=this.ambience,gain=this.ambienceGain,c=this.ctx;if(!source||!c)return;this.ambience=null;this.ambienceGain=null;if(gain){gain.gain.cancelScheduledValues(c.currentTime);gain.gain.setTargetAtTime(0,c.currentTime,.035);}source.stop(c.currentTime+.16);}
 private tone(freq:number,end:number,duration:number,volume:number,delay=0,type:OscillatorType='sine'){
  const c=this.ctx!,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(15,end),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,volume),t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(this.master!);o.start(t);o.stop(t+duration+.015);o.onended=()=>{o.disconnect();g.disconnect();};
 }
 private burst(duration:number,volume:number,freq:number,end:number,q=.5,delay=0){
  const c=this.ctx!,t=c.currentTime+delay,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=this.noise;filter.type='bandpass';filter.Q.value=q;filter.frequency.setValueAtTime(freq,t);filter.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+duration);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),t+.006);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);source.connect(filter).connect(gain).connect(this.master!);source.start(t,(this.serial*.173)%2);source.stop(t+duration+.02);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
 }
 private clang(base:number,duration:number,volume:number){for(const [ratio,amp]of [[1,1],[2.76,.38],[4.12,.2],[5.4,.12]])this.tone(base*ratio,base*ratio*.98,duration/Math.sqrt(ratio),volume*amp);}
 play(kind:SoundEvent,intensity=1){
  const c=this.ctx;if(!c||!this.master||this.muted||document.hidden)return;
  const gap=kind==='hit'?.045:kind==='kill'?.065:kind==='bell'?1.1:.028;if(c.currentTime-(this.played.get(kind)??-10)<gap)return;this.played.set(kind,c.currentTime);this.serial++;
  const v=Math.max(.2,Math.min(1.6,intensity)),pitch=1+((this.serial%5)-2)*.025;
  switch(kind){
   case'swing':this.burst(.15,.47*v,1700*pitch,420,.65);this.tone(155,55,.11,.065*v,0,'triangle');break;
   case'hit':this.burst(.075,.7*v,2500*pitch,650,.7);this.tone(135*pitch,48,.115,.32*v);this.clang(530*pitch,.095,.045*v);break;
   case'heavy':this.burst(.16,.92*v,2400,210,.45);this.tone(115,30,.24,.53*v);this.clang(285,.25,.11*v);break;
   case'armor':this.burst(.11,.6*v,4800,1200,1.2);this.clang(720*pitch,.48,.19*v);this.tone(125,51,.13,.2*v);break;
   case'kill':this.burst(.16,.64*v,1700,180,.5);this.tone(95,31,.19,.32*v);this.burst(.08,.28*v,3400,1600,.8,.07);break;
   case'jump':this.burst(.1,.3*v,400,1200,.55);this.tone(110,175,.095,.055*v,0,'triangle');break;
   case'land':this.burst(.09,.5*v,320,100,.65);this.tone(80,30,.12,.16*v);break;
   case'dash':this.burst(.23,.48*v,2600,380,.45);this.burst(.1,.2*v,700,2400,.8);break;
   case'hurt':this.tone(87,28,.24,.4*v,0,'triangle');this.burst(.12,.43*v,700,140,.5);break;
   case'arrow':this.burst(.065,.33*v,4100,1700,1);this.tone(430,180,.075,.035*v,0,'triangle');break;
   case'fire':this.burst(.29,.65*v,1900,190,.6);this.tone(170,38,.27,.15*v);this.burst(.15,.24*v,3500,1100,1,.09);break;
   case'skill':this.burst(.34,.55*v,650,2600,.75);this.clang(230,.38,.12*v);this.tone(75,32,.3,.27*v,.07);break;
   case'bell':this.clang(138,1.6,.32*v);this.clang(207,1.05,.075*v);this.burst(.1,.25*v,450,130,.7);break;
   case'loot':this.clang(1180*pitch,.2,.09*v);this.tone(1760,1760,.24,.055*v,.045);break;
   case'door':this.burst(.25,.22*v,380,95,.7);this.clang(340,.32,.075*v);break;
   case'level':for(let i=0;i<3;i++)this.tone([440,554,660][i],[440,554,660][i],.5,.075*v,i*.1);this.burst(.32,.12*v,2300,4200,1,.12);break;
  }
 }
}
