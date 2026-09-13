export type ClassId = 'knight' | 'witch' | 'ranger';
export type Phase = 'menu'|'playing'|'paused'|'upgrade'|'dead'|'won'|'map'|'event';
export type RoomKind = 'entrance'|'combat'|'elite'|'boss'|'treasure'|'sanctuary'|'shop'|'event'|'challenge';
export interface Platform {x:number;y:number;w:number}
export interface Door {x:number;y:number;target:number;gate?:'doubleJump'|'breakDash';label:string}
export interface Prop {x:number;y:number;kind:'chest'|'altar'|'exit'|'shop'|'memory'|'trial'|'pact';used:boolean}
export interface Room {chapter?:number;layout?:number;encounter?:string;trialStarted?:boolean;rewarded?:boolean;id:number;name:string;kind:RoomKind;width:number;seed:number;platforms:Platform[];doors:Door[];props:Prop[];visited:boolean;cleared:boolean;mapX:number;mapY:number;enemies:Enemy[];initialized:boolean}
export interface Enemy {variant?:string;telegraph?:string;move?:number;actionTime?:number;targetX?:number;targetY?:number;charge?:number;slow?:number;id:number;kind:'skeleton'|'bat'|'wraith'|'elite'|'boss';x:number;y:number;vx:number;vy:number;hp:number;maxHp:number;facing:number;timer:number;attack:number;flash:number;dead:boolean;homeY:number;armorBroken?:boolean;stagger?:number;burn?:number;burnTick?:number;bossPhase?:number;recovery?:number}
export interface ActorPose {variant?:string;telegraph?:string;kind:ClassId|Enemy['kind'];x:number;y:number;facing:number;moving:boolean;grounded:boolean;attack:number;flash:number;time:number;elite?:boolean;attackProgress?:number;combo?:number;skill?:boolean;armorBroken?:boolean;bossPhase?:number;velocityY?:number}
export interface Upgrade {id:string;name:string;subtitle:string;description:string;icon:string;color:string}
export interface UIState {event:StoryEvent|null;chapterName:string;objective:string;memories:number;corruption:number;journal:string[];bossName:string;bossTip:string;endingTitle:string;endingText:string;buildSummary:string;phase:Phase;selectedClass:ClassId;hp:number;maxHp:number;xp:number;xpNext:number;level:number;floor:number;totalFloors:number;roomName:string;roomKind:RoomKind;roomId:number;rooms:Room[];kills:number;gold:number;elites:number;bossDefeated:boolean;skillCooldown:number;dashCooldown:number;combo:number;elapsed:number;seed:number;notice:string;interact:string;upgrades:Upgrade[];relics:string[];doubleJump:boolean;breakDash:boolean;bossHp:number;bossMaxHp:number;muted:boolean;reducedMotion:boolean;best:number}
export interface UIActions {chooseEvent:(id:string)=>void;selectClass:(id:ClassId)=>void;start:()=>void;pause:()=>void;resume:()=>void;restart:()=>void;menu:()=>void;toggleMap:()=>void;toggleMute:()=>void;toggleMotion:()=>void;chooseUpgrade:(id:string)=>void;input:(key:string,pressed:boolean)=>void}

export interface EventChoice {id:string;title:string;description:string;disabled?:boolean}
export interface StoryEvent {id:string;eyebrow:string;title:string;body:string;choices:EventChoice[]}
