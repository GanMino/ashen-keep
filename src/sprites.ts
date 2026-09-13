import type { ActorPose } from './types';

interface Atlas {w:number;h:number;pivotX:number;pivotY:number;bodyHeight:number;clips:Record<string,{file:string;frames:number}>}
// Metadata comes from verified unmodified CC0 source sheets; see ASSET_CREDITS.md.
const ATLAS: Record<string,Atlas> = {
  "knight": {
    "w": 180,
    "h": 180,
    "pivotX": 90,
    "pivotY": 114,
    "bodyHeight": 51,
    "clips": {
      "jump": {
        "file": "knight/jump.png",
        "frames": 3
      },
      "idle": {
        "file": "knight/idle.png",
        "frames": 11
      },
      "fall": {
        "file": "knight/fall.png",
        "frames": 3
      },
      "hit": {
        "file": "knight/hit.png",
        "frames": 4
      },
      "run": {
        "file": "knight/run.png",
        "frames": 8
      },
      "attack2": {
        "file": "knight/attack2.png",
        "frames": 7
      },
      "attack1": {
        "file": "knight/attack1.png",
        "frames": 7
      },
      "death": {
        "file": "knight/death.png",
        "frames": 11
      }
    }
  },
  "witch": {
    "w": 231,
    "h": 190,
    "pivotX": 110,
    "pivotY": 141,
    "bodyHeight": 86,
    "clips": {
      "jump": {
        "file": "witch/jump.png",
        "frames": 2
      },
      "idle": {
        "file": "witch/idle.png",
        "frames": 6
      },
      "fall": {
        "file": "witch/fall.png",
        "frames": 2
      },
      "run": {
        "file": "witch/run.png",
        "frames": 8
      },
      "attack2": {
        "file": "witch/attack2.png",
        "frames": 8
      },
      "hit": {
        "file": "witch/hit.png",
        "frames": 4
      },
      "attack1": {
        "file": "witch/attack1.png",
        "frames": 8
      },
      "death": {
        "file": "witch/death.png",
        "frames": 7
      }
    }
  },
  "ranger": {
    "w": 100,
    "h": 100,
    "pivotX": 50,
    "pivotY": 67,
    "bodyHeight": 36,
    "clips": {
      "jump": {
        "file": "ranger/jump.png",
        "frames": 2
      },
      "idle": {
        "file": "ranger/idle.png",
        "frames": 10
      },
      "fall": {
        "file": "ranger/fall.png",
        "frames": 2
      },
      "run": {
        "file": "ranger/run.png",
        "frames": 8
      },
      "attack": {
        "file": "ranger/attack.png",
        "frames": 6
      },
      "death": {
        "file": "ranger/death.png",
        "frames": 10
      },
      "hit": {
        "file": "ranger/hit.png",
        "frames": 3
      }
    }
  },
  "warden": {
    "w": 135,
    "h": 135,
    "pivotX": 67,
    "pivotY": 86,
    "bodyHeight": 38,
    "clips": {
      "jump": {
        "file": "warden/jump.png",
        "frames": 2
      },
      "idle": {
        "file": "warden/idle.png",
        "frames": 10
      },
      "fall": {
        "file": "warden/fall.png",
        "frames": 2
      },
      "attack3": {
        "file": "warden/attack3.png",
        "frames": 5
      },
      "run": {
        "file": "warden/run.png",
        "frames": 6
      },
      "attack2": {
        "file": "warden/attack2.png",
        "frames": 4
      },
      "attack1": {
        "file": "warden/attack1.png",
        "frames": 4
      },
      "death": {
        "file": "warden/death.png",
        "frames": 9
      },
      "hit": {
        "file": "warden/hit.png",
        "frames": 3
      }
    }
  },
  "lich": {
    "w": 250,
    "h": 250,
    "pivotX": 125,
    "pivotY": 167,
    "bodyHeight": 95,
    "clips": {
      "jump": {
        "file": "lich/jump.png",
        "frames": 2
      },
      "idle": {
        "file": "lich/idle.png",
        "frames": 8
      },
      "fall": {
        "file": "lich/fall.png",
        "frames": 2
      },
      "hit": {
        "file": "lich/hit.png",
        "frames": 3
      },
      "run": {
        "file": "lich/run.png",
        "frames": 8
      },
      "attack2": {
        "file": "lich/attack2.png",
        "frames": 8
      },
      "attack1": {
        "file": "lich/attack1.png",
        "frames": 8
      },
      "death": {
        "file": "lich/death.png",
        "frames": 7
      }
    }
  },
  "king": {
    "w": 160,
    "h": 111,
    "pivotX": 80,
    "pivotY": 105,
    "bodyHeight": 54,
    "clips": {
      "jump": {
        "file": "king/jump.png",
        "frames": 2
      },
      "idle": {
        "file": "king/idle.png",
        "frames": 8
      },
      "fall": {
        "file": "king/fall.png",
        "frames": 2
      },
      "hit": {
        "file": "king/hit.png",
        "frames": 4
      },
      "attack3": {
        "file": "king/attack3.png",
        "frames": 4
      },
      "run": {
        "file": "king/run.png",
        "frames": 8
      },
      "attack2": {
        "file": "king/attack2.png",
        "frames": 4
      },
      "attack1": {
        "file": "king/attack1.png",
        "frames": 4
      },
      "death": {
        "file": "king/death.png",
        "frames": 6
      }
    }
  },
  "worm": {
    "w": 90,
    "h": 90,
    "pivotX": 45,
    "pivotY": 58,
    "bodyHeight": 41,
    "clips": {
      "idle": {
        "file": "worm/idle.png",
        "frames": 9
      },
      "run": {
        "file": "worm/run.png",
        "frames": 9
      },
      "attack": {
        "file": "worm/attack.png",
        "frames": 16
      },
      "death": {
        "file": "worm/death.png",
        "frames": 8
      },
      "hit": {
        "file": "worm/hit.png",
        "frames": 3
      }
    }
  },
  "firemage": {
    "w": 150,
    "h": 150,
    "pivotX": 75,
    "pivotY": 102,
    "bodyHeight": 55,
    "clips": {
      "run": {
        "file": "firemage/run.png",
        "frames": 8
      },
      "idle": {
        "file": "firemage/idle.png",
        "frames": 8
      },
      "hit": {
        "file": "firemage/hit.png",
        "frames": 4
      },
      "attack": {
        "file": "firemage/attack.png",
        "frames": 8
      },
      "death": {
        "file": "firemage/death.png",
        "frames": 5
      }
    }
  },
  "butcher": {
    "w": 184,
    "h": 137,
    "pivotX": 92,
    "pivotY": 125,
    "bodyHeight": 81,
    "clips": {
      "jump": {
        "file": "butcher/jump.png",
        "frames": 2
      },
      "idle": {
        "file": "butcher/idle.png",
        "frames": 6
      },
      "fall": {
        "file": "butcher/fall.png",
        "frames": 2
      },
      "run": {
        "file": "butcher/run.png",
        "frames": 8
      },
      "attack2": {
        "file": "butcher/attack2.png",
        "frames": 4
      },
      "hit": {
        "file": "butcher/hit.png",
        "frames": 3
      },
      "attack1": {
        "file": "butcher/attack1.png",
        "frames": 4
      },
      "death": {
        "file": "butcher/death.png",
        "frames": 9
      },
      "attack3": {
        "file": "butcher/attack3.png",
        "frames": 4
      }
    }
  },
  "skeleton": {
    "w": 150,
    "h": 150,
    "pivotX": 75,
    "pivotY": 101,
    "bodyHeight": 51,
    "clips": {
      "shield": {
        "file": "skeleton/shield.png",
        "frames": 4
      },
      "idle": {
        "file": "skeleton/idle.png",
        "frames": 4
      },
      "hit": {
        "file": "skeleton/hit.png",
        "frames": 4
      },
      "run": {
        "file": "skeleton/run.png",
        "frames": 4
      },
      "attack": {
        "file": "skeleton/attack.png",
        "frames": 8
      },
      "death": {
        "file": "skeleton/death.png",
        "frames": 4
      },
      "attack2": {
        "file": "skeleton/attack2.png",
        "frames": 8
      },
      "attack3": {
        "file": "skeleton/attack3.png",
        "frames": 6
      }
    }
  },
  "goblin": {
    "w": 150,
    "h": 150,
    "pivotX": 75,
    "pivotY": 101,
    "bodyHeight": 36,
    "clips": {
      "idle": {
        "file": "goblin/idle.png",
        "frames": 4
      },
      "hit": {
        "file": "goblin/hit.png",
        "frames": 4
      },
      "run": {
        "file": "goblin/run.png",
        "frames": 8
      },
      "attack": {
        "file": "goblin/attack.png",
        "frames": 8
      },
      "death": {
        "file": "goblin/death.png",
        "frames": 4
      },
      "attack2": {
        "file": "goblin/attack2.png",
        "frames": 8
      },
      "attack3": {
        "file": "goblin/attack3.png",
        "frames": 12
      }
    }
  },
  "mushroom": {
    "w": 150,
    "h": 150,
    "pivotX": 75,
    "pivotY": 101,
    "bodyHeight": 36,
    "clips": {
      "idle": {
        "file": "mushroom/idle.png",
        "frames": 4
      },
      "hit": {
        "file": "mushroom/hit.png",
        "frames": 4
      },
      "run": {
        "file": "mushroom/run.png",
        "frames": 8
      },
      "attack": {
        "file": "mushroom/attack.png",
        "frames": 8
      },
      "death": {
        "file": "mushroom/death.png",
        "frames": 4
      },
      "attack2": {
        "file": "mushroom/attack2.png",
        "frames": 8
      },
      "attack3": {
        "file": "mushroom/attack3.png",
        "frames": 11
      }
    }
  },
  "flying-eye": {
    "w": 150,
    "h": 150,
    "pivotX": 75,
    "pivotY": 88,
    "bodyHeight": 36,
    "clips": {
      "hit": {
        "file": "flying-eye/hit.png",
        "frames": 4
      },
      "idle": {
        "file": "flying-eye/idle.png",
        "frames": 8
      },
      "attack": {
        "file": "flying-eye/attack.png",
        "frames": 8
      },
      "death": {
        "file": "flying-eye/death.png",
        "frames": 4
      },
      "attack2": {
        "file": "flying-eye/attack2.png",
        "frames": 8
      },
      "attack3": {
        "file": "flying-eye/attack3.png",
        "frames": 6
      }
    }
  }
};

const loaded = new Map<string, HTMLImageElement>();
const failures: string[] = [];
const base = `${import.meta.env?.BASE_URL ?? '/'}sprites/`;
const files = [...new Set(Object.values(ATLAS).flatMap(a => Object.values(a.clips).map(c => c.file)))];

/** Resolves after all sprite requests settle, including errors so the fallback remains playable. */
export const spritesReady: Promise<void> = typeof Image === 'undefined' ? Promise.resolve() :
  Promise.all(files.map(file => new Promise<void>(resolve => {
    const image = new Image();
    image.onload = () => { loaded.set(file, image); resolve(); };
    image.onerror = () => { failures.push(file); console.error(`Sprite failed to load: ${file}`); resolve(); };
    image.src = base + file;
  }))).then(() => undefined);

export function spriteDiagnostics() { return {families:Object.keys(ATLAS).length, requested:files.length,loaded:loaded.size,failed:[...failures]}; }

const variantFamily: Record<string,string> = {
  'gate-warden':'warden', 'ink-abbot':'lich', 'bone-mother':'worm', 'bell-keeper':'firemage', 'hollow-king':'king',
  butcher:'butcher', lancer:'skeleton', hexer:'firemage', mirror:'ranger', gravekeeper:'mushroom',
  swarm:'flying-eye', duelist:'warden', storm:'witch', royalguard:'knight', oracle:'lich',
  goblin:'goblin', mushroom:'mushroom', 'flying-eye':'flying-eye', skeleton:'skeleton',
};
const defaultFamily:Record<ActorPose['kind'],string>={knight:'knight',witch:'witch',ranger:'ranger',skeleton:'skeleton',bat:'flying-eye',wraith:'firemage',elite:'butcher',boss:'king'};
const contactFrame:Record<string,number>={knight:3,witch:5,ranger:4,warden:2,lich:4,king:2,worm:11,firemage:4,butcher:2,skeleton:4,goblin:4,mushroom:4,'flying-eye':4};

function animation(a:Atlas,p:ActorPose,family:string):[string,number] {
  if(p.attack>0){
    if(family==='witch')return [p.skill?'attack1':'attack2',-1];
    const attacks=p.skill?['attack3','attack2','attack1','attack']:(p.combo===3?['attack3','attack2','attack1','attack']:p.combo===2?['attack2','attack1','attack']:['attack1','attack','attack2']);
    return [attacks.find(k=>a.clips[k])??'idle',-1];
  }
  if(p.flash>0&&a.clips.hit)return ['hit',1];
  if(!p.grounded&&a.clips.jump)return [(p.velocityY??0)<0?'jump':'fall',Math.floor(p.time*8)];
  return [p.moving&&a.clips.run?'run':'idle',Math.floor(p.time*(p.moving?12:8))];
}

/** Artist-authored, frame-based characters. Source atlas pivot is feet; gameplay collision stays independent. */
export function drawSpriteActor(c:CanvasRenderingContext2D,pose:ActorPose):boolean {
  const p=pose as ActorPose & {variant?:string;telegraph?:string};
  const family=(p.variant&&variantFamily[p.variant])||defaultFamily[p.kind];
  const a=ATLAS[family];if(!a)return false;
  const [action,loopFrame]=animation(a,p,family),clip=a.clips[action]??a.clips.idle;
  if(!clip)return false;
  const img=loaded.get(clip.file);if(!img)return false;
  let frame=loopFrame;
  if(frame<0){
    const q=Math.max(0,Math.min(1,p.attackProgress??.45));
    const contact=Math.min(clip.frames-2,contactFrame[family]??Math.floor(clip.frames*.5));
    frame=q<.45?Math.floor(q/.45*contact):contact+Math.floor((q-.45)/.55*(clip.frames-contact));
  }
  frame=p.attack>0?Math.max(0,Math.min(clip.frames-1,frame)):Math.max(0,frame%clip.frames);
  // Distinct boss bodies use their own authored anatomy, never a tint of one shared boss.
  const height=p.kind==='boss'?(family==='worm'?118:family==='lich'?143:135):p.kind==='elite'?(family==='flying-eye'?78:100):p.kind==='knight'?71:p.kind==='witch'?73:p.kind==='ranger'?72:p.kind==='bat'?40:p.kind==='wraith'?65:family==='skeleton'?61:52;
  const scale=height/a.bodyHeight;
  c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(p.x),Math.round(p.y));
  if(p.grounded){c.fillStyle='#02071099';c.fillRect(-height*.23,-1,height*.46,4);}
  c.scale(p.facing<0?-1:1,1);
  if(p.flash>0)c.filter='brightness(2.4)';
  c.drawImage(img,frame*a.w,0,a.w,a.h,Math.round(-a.pivotX*scale),Math.round(-a.pivotY*scale),Math.round(a.w*scale),Math.round(a.h*scale));
  c.restore();return true;
}
