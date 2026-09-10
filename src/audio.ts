export class Sound {
 ctx:AudioContext|null=null; muted=false; private master:GainNode|null=null;private last=0;
 unlock(){if(!this.ctx){try{this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=.12;this.master.connect(this.ctx.destination);}catch{return;}}if(this.ctx.state==='suspended')void this.ctx.resume();}
 setMuted(v:boolean){this.muted=v;if(this.master)this.master.gain.value=v?0:.12;}
 play(kind:'hit'|'kill'|'jump'|'dash'|'hurt'|'loot'|'skill'|'door'|'level'){
  const c=this.ctx;if(!c||!this.master||this.muted)return;
  if(kind==='hit'&&c.currentTime-this.last<.045)return;this.last=c.currentTime;
  const spec={hit:[180,55,.08],kill:[260,48,.18],jump:[190,460,.12],dash:[530,110,.16],hurt:[95,32,.24],loot:[720,1080,.12],skill:[110,850,.36],door:[260,520,.25],level:[440,880,.5]}[kind];
  const o=c.createOscillator(),g=c.createGain();o.type=['loot','level','door'].includes(kind)?'sine':'triangle';o.frequency.setValueAtTime(spec[0],c.currentTime);o.frequency.exponentialRampToValueAtTime(spec[1],c.currentTime+spec[2]);g.gain.setValueAtTime(.001,c.currentTime);g.gain.exponentialRampToValueAtTime(.5,c.currentTime+.007);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+spec[2]);o.connect(g).connect(this.master);o.start();o.stop(c.currentTime+spec[2]+.02);
 }
}
