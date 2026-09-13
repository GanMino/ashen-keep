import type {Upgrade} from './types';
export const CHAPTERS=[
 {name:'灰烬门庭',boss:'gate-warden',elites:['butcher','lancer'],goal:'夺取守门人的钥匙',text:'城门在你身后合拢。失踪少女莉娅的灯仍亮着，灯芯里却传来陌生人的呼吸。',memory:'门卫名册：每年被带入城堡的孩子，从未离开；他们的名字被刻进了门锁。',color:'#c68d64'},
 {name:'禁书回廊',boss:'ink-abbot',elites:['hexer','mirror'],goal:'从墨典中找出王的契约',text:'书页自行翻动，改写着你的名字。这里的修士用记忆喂养墨水。',memory:'契约残页：永生需要不断替换容器。所谓的王，已经换过一百张脸。',color:'#a6a2df'},
 {name:'圣骨地窖',boss:'bone-mother',elites:['gravekeeper','swarm'],goal:'释放埋在圣骨下的证人',text:'礼拜堂的歌声来自脚下。那些被称为圣徒的人，仍在棺木里等待醒来。',memory:'骨匣留言：莉娅不是祭品。她主动进入炉心，阻止城堡吞噬城外的人。',color:'#c7c798'},
 {name:'暴雨钟塔',boss:'bell-keeper',elites:['duelist','storm'],goal:'令献祭之钟停止鸣响',text:'每一次钟响，都有一段往事被抹去。登上钟塔前，你将手中的名字又念了一遍。',memory:'停钟记录：王冠与炉心相连。只有记得自己名字的灵魂，才能拒绝成为下一任王。',color:'#91becd'},
 {name:'无名王座',boss:'hollow-king',elites:['royalguard','oracle'],goal:'击败空心王，决定古堡的命运',text:'王座上没有国王，只有一顶等待主人的冠。莉娅的灯开始照出你从未见过的影子。',memory:'最后的记忆：黎明从来没有消失。是戴冠的人，不愿打开窗。',color:'#dfb578'}
];
export function chapterRoute(seed:number,total:number){const middle=[1,2,3];let n=seed>>>0;for(let i=2;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[middle[i],middle[j]]=[middle[j],middle[i]];}return [0,...middle.slice(0,total-2).sort(),4];}
export const RUN_INTRO='三十年前，古堡以永夜换取了永生。如今，少女莉娅的灯出现在城门外。你必须穿越随机重组的楼层，夺取每层两枚印记，击败空心王。寻找至少三段记忆，或许能找到摧毁王冠以外的答案。';
export const MUTATIONS:Upgrade[]=[
 {id:'ember',name:'余火种子',subtitle:'烈焰 · 改变命中',description:'所有攻击附加燃烧；燃烧敌人死亡时向附近传火。与霜痕组合触发蒸汽爆裂。',icon:'♨',color:'#e7a16a'},
 {id:'frost',name:'霜痕指环',subtitle:'寒霜 · 控制',description:'命中令敌人减速 45%，持续 2 秒；同时拥有余火种子时，每次攻击可引爆一次冰火反应。',icon:'❄',color:'#9ad8e8'},
 {id:'echo',name:'回声刃',subtitle:'兵器 · 远程斩击',description:'每第三次普通攻击向前发出一道穿透剑气，三种职业都可使用。',icon:'≋',color:'#b7caeb'},
 {id:'orbit',name:'守墓星',subtitle:'护卫 · 环绕',description:'获得一枚绕身飞行的魂火，周期性灼伤靠近的敌人。可叠加扩大守护圈。',icon:'✺',color:'#c1e1bf'},
 {id:'ricochet',name:'镜面弹匣',subtitle:'弹道 · 反弹',description:'友方弹丸碰到房间边界后反弹一次，保留贯穿与命中效果。',icon:'↔',color:'#d8bbe8'},
 {id:'nova',name:'殉道火药',subtitle:'死亡 · 爆发',description:'击杀时留下短暂爆裂，伤害附近敌人；引爆伤害不会递归触发爆裂。',icon:'✹',color:'#e3b778'},
 {id:'bloodprice',name:'血债契约',subtitle:'代价 · 强攻',description:'生命上限降低 20，攻击伤害提高 45%。生命上限至少保留 35。',icon:'♦',color:'#d88891'},
 {id:'ward',name:'避难烛芯',subtitle:'生存 · 房间护盾',description:'进入新房间时获得一次伤害抵挡；重复获得提高击杀回复。',icon:'♧',color:'#d6dca6'}
];
export const ROOM_NAMES=['断桥守望','交错回廊','高台伏击','低顶密道','断壁祭庭'];
