import type {Game} from './game';
import type {Prop} from './types';
import {CHAPTERS,RUN_INTRO,MUTATIONS} from './content';
export function beginJourney(g:Game,seed?:number){
 g.start(seed);g.event={id:'intro',eyebrow:'序章 · 莉娅的灯',title:'带一份力量，去寻找答案',body:RUN_INTRO,choices:MUTATIONS.slice(0,3).map(u=>({id:u.id,title:u.name,description:u.description}))};g.phase='event';g.clearInput();
}
export function chapterEvent(g:Game){const c=CHAPTERS[g.room.chapter??0];g.event={id:'chapter',eyebrow:`第 ${g.floor} / ${g.totalFloors} 章`,title:c.name,body:c.text+'\n本章目标：'+c.goal+'。',choices:[{id:'continue',title:'继续追寻',description:'本层两条精英路线均可先走；地图 M 显示商店、遗灯与秘库。'}]};g.phase='event';g.clearInput();}
export function openRoomEvent(g:Game,prop:Prop){
 const index=g.room.props.indexOf(prop),c=CHAPTERS[g.room.chapter??0],id=prop.kind+':'+index;
 if(prop.kind==='memory')g.event={id,eyebrow:'遗灯 · 记忆与力量',title:'有人在灯里呼唤你',body:c.text+'\n你可以阅读灯中的记忆，也可以将它燃烧成能量。',choices:[{id:'remember',title:'保留这段记忆',description:'记忆 +1，恢复 15 生命。收集三段记忆能揭开终局真相。'},{id:'burn',title:'将记忆换成力量',description:'获得随机遗物与 25 金币；腐化 +1，这段记忆将永久失去。'}]};
 if(prop.kind==='pact')g.event={id,eyebrow:'献祭 · 自愿的代价',title:'镜中的人伸出了手',body:'“留下一点你的生命，我会让它变成锋刃。” 镜面映出一顶与你头颅同样大小的王冠。',choices:[{id:'sacrifice',title:'献出 20 生命上限',description:'伤害 +45%，腐化 +1。生命上限至少保留 35。',disabled:g.player.maxHp<=55},{id:'leave',title:'拒绝契约',description:'保留生命与自我。'}]};
 if(prop.kind==='shop'){
 const options=g.shopStock();g.event={id,eyebrow:'拾骨商人 · 每次停留仅能购买一件',title:'钱币比誓言可靠',body:'“这些东西都曾救过一个人。至于第二次，你自己决定。”',choices:[...options.map(u=>({id:'buy-'+u.id,title:u.name+' · 35 金币',description:u.description,disabled:g.gold<35})),{id:'heal',title:'温热药剂 · 20 金币',description:'恢复 45 生命。',disabled:g.gold<20||g.player.hp>=g.player.maxHp},{id:'leave',title:'离开商人',description:'继续探索，之后仍可回来。'}]};
 }
 if(prop.kind==='trial')g.event={id,eyebrow:'挑战 · 可选择离开',title:'贪欲要求一场证明',body:'触碰金色烛台后，房门将封锁。清除伏兵，即可从三件改变攻击方式的遗物中选择一件。',choices:[{id:'fight',title:'点燃试炼',description:'迎战 12 名混合敌人，获胜得到遗物与 30 金币。'},{id:'leave',title:'暂且离开',description:'无代价返回探索。'}]};
 if(prop.kind==='exit'&&g.floor===g.totalFloors)g.event={id,eyebrow:'终章 · 王冠的回答',title:'空心王倒下了。王座仍在等待。',body:g.memories>=3?'记忆拼成了真相：莉娅守住了炉心，但必须有人从外面打开它。王冠试图以永生诱惑你。':'你已走到长夜的尽头，却还不知道炉心里是谁。王冠就在脚边，似乎从未属于过刚才的敌人。',choices:[{id:'break',title:'摧毁王冠',description:'结束这场远征，让黎明重新照进古堡。'},{id:'release',title:'呼唤莉娅，释放炉心',description:'真结局：需要 3 段记忆，且腐化不超过 1。',disabled:g.memories<3||g.corruption>1},{id:'crown',title:'戴上王冠',description:'接受永生，成为古堡新的主人。'}]};
 if(g.event){g.phase='event';g.clearInput();}
}
export function chooseStory(g:Game,choice:string){
 const event=g.event;if(g.phase!=='event'||!event)return;const option=event.choices.find(c=>c.id===choice);if(!option||option.disabled)return;
 const kind=event.id.split(':')[0],prop=g.room.props[Number(event.id.split(':')[1])];
 g.phase='playing';g.event=null;g.clearInput();
 if(kind==='intro'){g.applyUpgrade(choice);g.journal.push('目标：寻找莉娅，夺取印记，抵达空心王的王座。');g.say(CHAPTERS[0].text);return;}
 if(kind==='chapter')return;
 if(choice==='leave')return;
 if(!prop||prop.used)return;
 if(kind==='shop'){
  const price=choice==='heal'?20:35;if(g.gold<price)return;
  if(choice==='heal'){g.gold-=price;g.player.hp=Math.min(g.player.maxHp,g.player.hp+45);g.say('药剂温热 · 恢复生命');}
  else{const id=choice.slice(4);if(!g.shopStock().some(u=>u.id===id))return;g.gold-=price;g.applyUpgrade(id);}prop.used=true;
 }else if(kind==='memory'){
  prop.used=true;if(choice==='remember'){g.memories++;g.player.hp=Math.min(g.player.maxHp,g.player.hp+15);const memory=CHAPTERS[g.room.chapter??0].memory;g.journal.push(memory);g.event={id:'chapter',eyebrow:`已找回 ${g.memories} / 3 段记忆`,title:'灯中的证词',body:memory,choices:[{id:'continue',title:'记住这个名字',description:'已记入地图中的旅途手记。'}]};g.phase='event';}
  else{g.corruption++;g.gold+=25;g.offerRelics(true);g.journal.push(CHAPTERS[g.room.chapter??0].name+'：你烧掉了一段记忆。');}
 }else if(kind==='pact'){prop.used=true;g.applyUpgrade('bloodprice');g.corruption++;g.journal.push('你接受了镜中人的血债，王冠离你更近了。');}
 else if(kind==='trial'){prop.used=true;g.room.trialStarted=true;g.room.cleared=false;g.spawnTrial();g.say('贪欲试炼 · 击败所有伏兵');}
 else if(kind==='exit'){
  prop.used=true;g.phase='won';g.saveBest();
  const endings={break:['结局 I · 裂冠黎明','你将王冠掷入炉火。城门终于打开，幸存者走向清晨。莉娅的灯熄灭了，但那段未被找回的故事，仍藏在灰烬之下。'],release:['结局 II · 记得你的人','你念出莉娅和所有失踪者的名字。炉心从内部打开，囚禁的灵魂化作晨光。古堡第一次不再需要一个国王。你带着那盏普通的灯回了家。'],crown:['结局 III · 下一位无名者','王冠完美地贴合了你的头颅。你终于听懂古堡的低语，也忘记了自己为何而来。城外，又有一位旅人拾到了莉娅的灯。']};
  const ending=endings[choice as keyof typeof endings];if(!ending)return;[g.endingTitle,g.endingText]=ending;try{const saved=JSON.parse(localStorage.getItem('ashen-endings')||'[]');localStorage.setItem('ashen-endings',JSON.stringify([...new Set([...saved,choice])]));}catch{}
 }
 if(g.phase==='playing')g.checkLevel();
}
