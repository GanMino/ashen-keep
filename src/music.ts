export type MusicCue='explore'|'boss'|null;
const TRACKS={explore:'lanterns-in-the-keep.mp3',boss:'crown-of-cinders.mp3'};
interface Voice {started:number;offset:number;source:AudioBufferSourceNode;gain:GainNode;cue:Exclude<MusicCue,null>}
/** Two original looping scores, crossfaded on the same gesture-unlocked context as SFX. */
export class Music {
 private ctx:AudioContext|null=null;private bus:GainNode|null=null;
 private buffers=new Map<string,AudioBuffer>();private loading=false;
 private positions=new Map<string,number>();
 private voices=new Set<Voice>();private current:Voice|null=null;
 wanted:MusicCue=null;active:MusicCue=null;volume=.48;muted=false;error='';
 constructor(){try{const n=Number(localStorage.getItem('ashen-music-volume')??'.48');if(Number.isFinite(n))this.volume=Math.max(0,Math.min(1,n));}catch{}}
 attach(ctx:AudioContext,output:AudioNode){if(this.ctx)return;this.ctx=ctx;this.bus=ctx.createGain();this.bus.gain.value=this.volume*1.6;this.bus.connect(output);void this.load();}
 private async load(){if(this.loading||!this.ctx)return;this.loading=true;
  await Promise.all(Object.entries(TRACKS).map(async([cue,file])=>{try{const r=await fetch(`${import.meta.env.BASE_URL}audio/${file}`);if(!r.ok)throw new Error(`HTTP ${r.status}`);const b=await this.ctx!.decodeAudioData(await r.arrayBuffer());this.buffers.set(cue,b);this.sync();}catch(e){this.error=`Music ${cue}: ${String(e)}`;console.error(this.error);}}));
 }
 setVolume(value:number){this.volume=Math.max(0,Math.min(1,value));try{localStorage.setItem('ashen-music-volume',String(this.volume));}catch{}if(this.ctx&&this.bus)this.bus.gain.setTargetAtTime(this.volume*1.6,this.ctx.currentTime,.06);}
 setCue(cue:MusicCue,muted:boolean){this.wanted=cue;this.muted=muted;this.sync();}
 private retire(v:Voice,seconds:number){const ctx=this.ctx!,t=ctx.currentTime;v.gain.gain.cancelAndHoldAtTime(t);v.gain.gain.linearRampToValueAtTime(0,t+seconds);try{v.source.stop(t+seconds+.02);}catch{}}
 private sync(){const c=this.ctx;if(!c||!this.bus)return;const cue=this.muted||document.hidden?null:this.wanted;
  if(cue===this.active)return;
  // Wait for the destination buffer rather than leaving a quiet gap during loading.
  if(cue&&!this.buffers.has(cue))return;
  if(this.current){const v=this.current;this.positions.set(v.cue,(v.offset+c.currentTime-v.started)%v.source.buffer!.duration);this.retire(v,cue?1.1:.12);this.current=null;}
  this.active=cue;if(!cue){for(const v of this.voices)this.retire(v,.12);return;}
  const source=c.createBufferSource(),gain=c.createGain();source.buffer=this.buffers.get(cue)!;source.loop=true;gain.gain.setValueAtTime(0,c.currentTime);gain.gain.linearRampToValueAtTime(1,c.currentTime+1.15);source.connect(gain).connect(this.bus);const offset=this.positions.get(cue)??0,voice={source,gain,cue,started:c.currentTime,offset};this.current=voice;this.voices.add(voice);source.onended=()=>{source.disconnect();gain.disconnect();this.voices.delete(voice);};source.start(0,offset);
  // Rapid room changes cannot accumulate unbounded fading music voices.
  for(const v of [...this.voices].slice(0,-2))this.retire(v,.03);
 }
 reset(){this.positions.clear();if(this.current){this.retire(this.current,.08);this.current=null;}this.active=null;this.wanted=null;}
 refresh(){this.sync();}
 diagnostics(){return {wanted:this.wanted,active:this.active,voices:this.voices.size,loaded:[...this.buffers.keys()],volume:this.volume,error:this.error};}
}
