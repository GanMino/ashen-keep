import type {ClassId, UIActions, UIState} from './types';

const classes: Record<ClassId, { name: string; role: string; text: string; weapon:string; color:string; icon:string }> = {
  knight:{name:'灰烬骑士',role:'近战 · 重刃横扫',text:'以钢铁叩响长夜。大范围斩击与坚韧体魄，在敌潮中杀出血路。',weapon:'月刃风暴',color:'#dba876',icon:'M24 3L28 10 27 31 36 36 32 40 26 36 25 48 21 48 20 36 14 40 10 36 19 31 18 10Z'},
  witch:{name:'余火秘法师',role:'法术 · 烈焰群伤',text:'让旧日的余火再次燃烧。穿透魔弹与爆裂火雨，将整片暗影化作灰烬。',weapon:'烬印连爆',color:'#ec9775',icon:'M24 3C35 17 16 17 31 29C37 25 34 19 34 19C47 32 40 47 25 48C7 48 5 31 16 21C12 38 28 37 22 28C16 20 25 17 24 3Z'},
  ranger:{name:'暗夜游侠',role:'远程 · 迅疾箭雨',text:'在月光抵达之前，箭已离弦。灵巧走位与迅疾连射，猎杀每一个破绽。',weapon:'千羽齐射',color:'#a6c7b6',icon:'M12 4Q47 24 12 47L20 25Z M12 4L20 25 12 47 M3 24H43M35 17L44 24 35 31'},
};
const icon=(id:ClassId)=>`<svg viewBox="0 0 52 52" aria-hidden="true"><path d="${classes[id].icon}" fill="${id==='ranger'?'none':'currentColor'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
const esc=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const key=(text:string)=>`<kbd>${text}</kbd>`;

export class GameUI {
  private overlay:HTMLElement;
  private hud:HTMLElement;
  private touch:HTMLElement;
  private overlayKey='';
  private refs:Record<string,HTMLElement>={};
  private values:Record<string,string>={};
  private held=new Map<number,string>();
  private state?:UIState;
  constructor(private root:HTMLElement,private actions:UIActions){
    root.innerHTML=`<div class="hud" hidden>
      <section class="vitals"><div class="vitals-title"><span class="player-emblem" data-ref="emblem"></span><span data-ref="className"></span><span class="level">LV. <b data-ref="level">1</b></span></div><div class="health-meter"><i data-ref="healthBar"></i><span data-ref="health"></span></div><div class="xp-meter"><i data-ref="xpBar"></i></div><div class="run-stats"><span>✧ <b data-ref="gold"></b></span><span>击破 <b data-ref="kills"></b></span><span class="combo" data-ref="combo"></span></div></section>
      <section class="location"><div class="eyebrow" data-ref="floor"></div><div class="room-name" data-ref="room"></div><div class="objectives" data-ref="objectives"></div><div class="journey-goal" data-ref="purpose"></div></section>
      <nav class="hud-nav"><button class="icon-button" data-action="map" aria-label="古堡地图" title="地图 M">⌘<small>M</small></button><button class="icon-button" data-action="mute" aria-label="切换音效" title="切换音效" data-ref="mute">♪</button><button class="icon-button" data-action="pause" aria-label="暂停游戏" title="暂停 Esc">Ⅱ</button></nav>
      <div class="boss-meter" data-ref="bossWrap" hidden><div><b data-ref="bossName"></b> <span data-ref="bossHealth"></span></div><div><i data-ref="bossBar"></i></div></div>
      <div class="notice" data-ref="notice"></div><div class="interact" data-ref="interact"></div>
      <div class="abilities"><div class="ability" data-ref="skill">${key('K')} <span data-ref="skillText"></span></div><div class="ability" data-ref="dash">${key('SHIFT')} <span data-ref="dashText"></span></div><div class="traversal" data-ref="traversal"></div></div>
      <div class="desktop-keys">${key('A D')} 移动 <em>·</em> ${key('SPACE')} 跳跃 <em>·</em> ${key('J')} 攻击 <em>·</em> ${key('E')} 互动</div>
    </div><div class="screen-overlay"></div><div class="touch-controls" hidden><div class="touch-move"><button data-key="ArrowLeft" aria-label="向左移动">◀</button><button data-key="ArrowRight" aria-label="向右移动">▶</button></div><div class="touch-actions"><button class="touch-small" data-key="KeyE">互动</button><button class="touch-small" data-key="ShiftLeft" data-ref="touchDash" aria-label="冲刺">冲刺</button><button class="touch-small" data-key="KeyK" data-ref="touchSkill" aria-label="技能">技能</button><button class="touch-main" data-key="Space">跳跃</button><button class="touch-main attack-touch" data-key="KeyJ">攻击</button></div></div>`;
    this.overlay=root.querySelector('.screen-overlay')!;
    this.hud=root.querySelector('.hud')!;
    this.touch=root.querySelector('.touch-controls')!;
    root.querySelectorAll<HTMLElement>('[data-ref]').forEach(el=>this.refs[el.dataset.ref!]=el);
    root.addEventListener('click',e=>{
      const button=(e.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button)return;
      const {action,class:cls,upgrade,event:choice}=button.dataset;
      if(choice)this.actions.chooseEvent(choice);
      if(cls)this.actions.selectClass(cls as ClassId);
      if(upgrade)this.actions.chooseUpgrade(upgrade);
      if(action){const calls:Record<string,()=>void>={start:actions.start,pause:actions.pause,resume:actions.resume,restart:actions.restart,menu:actions.menu,map:actions.toggleMap,mute:actions.toggleMute,motion:actions.toggleMotion};calls[action]?.();}
    });
    this.touch.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button=>{
      button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);const k=button.dataset.key!;this.held.set(e.pointerId,k);button.classList.add('pressed');actions.input(k,true);});
      const release=(e:PointerEvent)=>{const k=this.held.get(e.pointerId);if(k){this.held.delete(e.pointerId);if(![...this.held.values()].includes(k))actions.input(k,false);}button.classList.remove('pressed');};
      button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
    });
    window.addEventListener('blur',()=>this.releaseInputs());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.releaseInputs();});
  }
  private releaseInputs(){this.held.forEach(k=>this.actions.input(k,false));this.held.clear();this.touch.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));}
  private text(ref:string,value:string|number){const v=String(value);if(this.values[ref]!==v){this.refs[ref].textContent=v;this.values[ref]=v;}}
  private bar(ref:string,value:number){const v=`${Math.max(0,Math.min(100,value*100))}%`;if(this.values[ref]!==v){this.refs[ref].style.width=v;this.values[ref]=v;}}
  update(s:UIState){
    const previous=this.state?.phase;this.state=s;
    this.root.dataset.phase=s.phase;this.root.classList.toggle('reduced-motion',s.reducedMotion);
    this.hud.hidden=s.phase==='menu';this.touch.hidden=s.phase!=='playing';
    if(s.phase!=='playing'&&previous==='playing')this.releaseInputs();
    this.text('className',classes[s.selectedClass].name);this.text('emblem',s.selectedClass==='knight'?'♜':s.selectedClass==='witch'?'✦':'⌁');
    this.text('level',s.level);this.text('health',`${Math.ceil(s.hp)} / ${s.maxHp}`);this.bar('healthBar',s.hp/s.maxHp);this.bar('xpBar',s.xp/s.xpNext);
    this.text('gold',s.gold);this.text('kills',s.kills);this.text('combo',s.combo>1?`${s.combo} 连斩`:'');
    this.text('purpose',`记忆 ${s.memories}/3 · 腐化 ${s.corruption} · ${s.chapterName}`);this.text('bossName',s.bossName);
    this.text('floor',`第 ${String(s.floor).padStart(2,'0')} 层 / ${String(s.totalFloors).padStart(2,'0')} 层`);this.text('room',s.roomName);
    this.text('objectives',`${s.elites>=1?'◆':'◇'} ${s.elites>=2?'◆':'◇'} 精英印记 ${Math.min(2,s.elites)}/2　${s.bossDefeated?'◆ 领主已陨':'◇ 古堡领主'}`);
    this.text('mute',s.muted?'♫̸':'♪');this.refs.mute.setAttribute('aria-label',s.muted?'开启音效':'关闭音效');
    this.text('notice',s.notice);this.refs.notice.hidden=!s.notice;
    this.text('interact',s.interact);this.refs.interact.hidden=!s.interact;
    this.text('skillText',s.skillCooldown>0?`${s.skillCooldown.toFixed(1)}s`:`${classes[s.selectedClass].weapon}`);this.refs.skill.classList.toggle('cooling',s.skillCooldown>0);
    this.text('dashText',s.dashCooldown>0?`${s.dashCooldown.toFixed(1)}s`:'暗影冲刺');this.refs.dash.classList.toggle('cooling',s.dashCooldown>0);
    this.text('touchSkill',s.skillCooldown>0?`${s.skillCooldown.toFixed(1)}s`:'技能');this.text('touchDash',s.dashCooldown>0?`${s.dashCooldown.toFixed(1)}s`:'冲刺');
    this.text('traversal',`${s.doubleJump?'✦ 二段跳':''}${s.breakDash?'　✦ 破障冲刺':''}`);
    this.refs.bossWrap.hidden=!(s.bossMaxHp>0&&s.bossHp>0&&s.roomKind==='boss');this.bar('bossBar',s.bossHp/s.bossMaxHp);this.text('bossHealth',`${Math.ceil(s.bossHp)} / ${s.bossMaxHp}`);
    const signature=JSON.stringify([s.phase,s.selectedClass,s.muted,s.reducedMotion,s.phase==='event'?s.event:null,s.phase==='upgrade'?s.upgrades:null,s.phase==='map'?s.rooms.map(r=>[r.id,r.visited,r.cleared,r.doors.map(d=>d.gate)]):null,s.phase==='map'?[s.roomId,s.memories,s.corruption,s.journal,s.buildSummary]:null,['dead','won'].includes(s.phase)?[s.floor,s.kills,s.gold,s.elapsed,s.best]:null]);
    if(signature===this.overlayKey)return;this.overlayKey=signature;
    this.overlay.innerHTML=this.renderOverlay(s);
  }
  private renderOverlay(s:UIState):string{
    if(s.phase==='event'&&s.event){const e=s.event;return `<div class="modal-shade story-shade"><section class="story-panel ornamental"><div class="eyebrow">${esc(e.eyebrow)}</div><h2>${esc(e.title)}</h2><p class="story-body">${esc(e.body)}</p><div class="story-choices">${e.choices.map((c,i)=>`<button data-event="${esc(c.id)}" class="story-choice" ${c.disabled?'disabled':''}><span class="story-number">0${i+1}</span><span><strong>${esc(c.title)}</strong><small>${esc(c.description)}</small></span><em>↗</em></button>`).join('')}</div><div class="story-foot">记忆 ${s.memories} / 3　·　腐化 ${s.corruption}　·　金币 ${s.gold}</div></section></div>`;}

    if(s.phase==='playing')return '';
    if(s.phase==='menu')return `<main class="menu-screen"><div class="menu-top"><span class="edition">✦ PROCEDURAL CASTLE ROGUELITE</span><button class="icon-button" data-action="mute" aria-label="切换音效">${s.muted?'♫̸':'♪'}</button></div><div class="menu-content"><div class="title-ornament"><span></span> ✧ <span></span></div><p class="english-title">ASHEN KEEP</p><h1>烬夜古堡</h1><p class="menu-tagline">长夜未尽，余烬不息。</p><p class="menu-description">莉娅失踪后，她的灯仍在燃烧。<br>循着记忆穿过古堡，找到王冠之下的真相。</p><div class="choose-heading"><span>01</span> 选择你的行者 <i></i></div><div class="class-options">${(Object.keys(classes) as ClassId[]).map(id=>`<button class="class-choice ${s.selectedClass===id?'selected':''}" data-class="${id}" aria-pressed="${s.selectedClass===id}" style="--class-color:${classes[id].color}"><span class="class-icon">${icon(id)}</span><span class="class-title">${classes[id].name}</span><span class="class-role">${classes[id].role}</span><span class="class-check">${s.selectedClass===id?'◆':'◇'}</span></button>`).join('')}</div><p class="class-description">${classes[s.selectedClass].text}</p><button class="primary start-button" data-action="start"><span>踏 入 古 堡</span><span aria-hidden="true">⟶</span></button><div class="menu-control-hint">${key('A D')} 移动　${key('SPACE')} 跳跃　${key('J')} 攻击　${key('K')} 技能</div></div><div class="menu-side-note"><span>THE NIGHT REMEMBERS</span><i></i><p>分岔远征 · 遗物联动 · 三种结局</p></div><footer class="menu-footer"><span>夺取每层两枚印记，直抵空心王座。<br class="mobile-break"> 找回三段记忆，改变最终结局。</span><span>✦ 随机生成 · 3–5 层长夜</span></footer></main>`;
    if(s.phase==='map')return this.renderMap(s);
    if(s.phase==='paused')return `<div class="modal-shade"><section class="pause-panel ornamental"><div class="eyebrow">A MOMENT BETWEEN SHADOWS</div><h2>长夜暂歇</h2><p>古堡的低语仍在回荡。</p><button class="primary" data-action="resume">继续征途 <span>ESC</span></button><div class="setting-row"><span>游戏音效<small>战斗与交互声音</small></span><button class="toggle" data-action="mute" aria-pressed="${!s.muted}">${s.muted?'关闭':'开启'}</button></div><div class="setting-row"><span>减少动态效果<small>降低镜头震动与闪烁</small></span><button class="toggle" data-action="motion" aria-pressed="${s.reducedMotion}">${s.reducedMotion?'开启':'关闭'}</button></div><button class="text-button" data-action="menu">返回古堡入口</button></section></div>`;
    if(s.phase==='upgrade')return `<div class="modal-shade"><section class="upgrade-panel"><div class="eyebrow">THE EMBERS ANSWER</div><h2>余烬赐福</h2><p>选择一份力量，写下你的命运。 <span class="upgrade-level">等级 ${s.level}</span></p><div class="upgrade-options">${s.upgrades.map((u,i)=>`<button class="upgrade-choice ornamental" data-upgrade="${esc(u.id)}" style="--relic-color:${esc(u.color)}"><span class="upgrade-order">0${i+1} / BLESSING</span><span class="upgrade-icon">${esc(u.icon)}</span><small>${esc(u.subtitle)}</small><h3>${esc(u.name)}</h3><p>${esc(u.description)}</p><span class="upgrade-select">接纳赐福　⟶</span></button>`).join('')}</div></section></div>`;
    const won=s.phase==='won';return `<div class="modal-shade end-shade"><section class="end-panel ornamental"><div class="end-sigil">${won?'☼':'✧'}</div><div class="eyebrow">${won?'THE NIGHT HAS ENDED':'THE KEEP REMEMBERS YOU'}</div><h2>${won?esc(s.endingTitle||'长夜终焉'):'余烬未灭'}</h2><p>${won?esc(s.endingText||'黎明穿过断壁。你的名字留在古堡深处。'):esc(s.notice || '行者倒下了，但古堡的门仍为你敞开。')}</p><div class="end-stats"><div><b>${s.floor}</b><span>抵达层数</span></div><div><b>${s.kills}</b><span>斩灭魔物</span></div><div><b>${Math.floor(s.elapsed/60)}:${String(Math.floor(s.elapsed%60)).padStart(2,'0')}</b><span>征途时长</span></div></div><p class="best-run">最高击破记录 · ${Math.max(s.best,s.kills)}</p><button class="primary" data-action="restart">${won?'开启新的长夜':'再次踏入古堡'} <span>⟶</span></button><button class="text-button" data-action="menu">重选行者</button></section></div>`;
  }
  private renderMap(s:UIState){
    const xs=s.rooms.map(r=>r.mapX),ys=s.rooms.map(r=>r.mapY);const minX=Math.min(...xs),minY=Math.min(...ys),maxX=Math.max(...xs),maxY=Math.max(...ys);
    const width=Math.max(500,(maxX-minX)*100+130),height=Math.max(150,(maxY-minY)*70+80);
    const pos=(id:number)=>{const r=s.rooms.find(r=>r.id===id)!;return{x:(r.mapX-minX)*100+65,y:(r.mapY-minY)*70+35};};
    let edges='';for(const r of s.rooms)for(const d of r.doors)if(d.target>r.id){const a=pos(r.id),b=pos(d.target);const locked=d.gate==='doubleJump'?!s.doubleJump:d.gate==='breakDash'?!s.breakDash:false;edges+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${locked?'map-locked':''}"/>${locked?`<text x="${(a.x+b.x)/2}" y="${(a.y+b.y)/2-8}" class="map-lock-label">⌑</text>`:''}`;}
    const labels:Record<string,string>={entrance:'入口',combat:'战斗',elite:'精英',boss:'领主',treasure:'秘库',sanctuary:'圣所',shop:'商店',event:'记忆',challenge:'挑战'};
    return `<div class="modal-shade"><section class="map-panel ornamental"><div class="map-heading"><div><div class="eyebrow">CARTOGRAPHY OF THE UNKNOWN</div><h2>古堡秘图 <small>第 ${s.floor} 层</small></h2></div><button class="icon-button" data-action="map" aria-label="关闭地图">×</button></div><p>${esc(s.objective)}。两条精英路线均需完成，可自行决定先后。</p><div class="map-pan-hint">← 横向滑动查看完整楼层 →</div><div class="map-scroll"><svg class="castle-map" viewBox="0 0 ${width} ${height}" role="img" aria-label="当前楼层房间路线图">${edges}${s.rooms.map(r=>{const p=pos(r.id);return `<g class="map-room ${r.visited?'visited':''} ${r.id===s.roomId?'current':''} ${r.cleared?'cleared':''}" transform="translate(${p.x},${p.y})"><rect x="-24" y="-17" width="48" height="34" rx="2"/><text class="map-symbol" text-anchor="middle" y="5">${r.kind==='boss'?'♛':r.kind==='elite'?'◆':r.kind==='treasure'?'✧':r.kind==='sanctuary'?'✚':r.kind==='entrance'?'⌂':r.kind==='shop'?'¤':r.kind==='event'?'✎':r.kind==='challenge'?'⚔':'·'}</text><text class="map-label" text-anchor="middle" y="34">${labels[r.kind]}${r.id===s.roomId?' · 当前':''}</text></g>`;}).join('')}</svg></div><details class="journal"><summary>旅途手记 · 记忆 ${s.memories}/3 · 腐化 ${s.corruption}</summary><p>${s.journal.length?s.journal.map(esc).join("<br><br>"):"还没有找到记忆。前往地图上标记为记忆的房间，调查莉娅的遗灯。"}</p><p>构筑：${esc(s.buildSummary||"尚未获得变异遗物")}</p></details><div class="map-legend"><span><i class="current-key"></i>当前位置</span><span><i></i>已探索</span><span>┄ 能力封印</span><span>◆ 精英　♛ 领主</span></div><div class="map-footer"><span>${s.doubleJump?'✦ 已获得二段跳':'◇ 击败首位精英：二段跳'}<br>${s.breakDash?'✦ 已获得破障冲刺':'◇ 击败第二位精英：破障冲刺'}</span><button class="secondary" data-action="map">继续探索 <span>M</span></button></div></section></div>`;
  }
}
