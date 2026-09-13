# Asset credits

## Character and creature animation

Pixel artist: **[LuizMelo](https://luizmelo.itch.io/)**. These assets are hand-authored sprite animations, used with gratitude. All packs below are explicitly released as **[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)** on the creator's official pages, checked 2026-09-13. CC0 permits copying, modification and distribution, including commercial use. Their inclusion in this public source repository is permitted.

Only the animation PNGs used by this game are included in `public/sprites/`. They retain their original pixels; filenames were normalized. Each family has a source/license note. The original archives, screenshots and account download links are not included.

| Runtime family | Creator's original pack | Used for |
| --- | --- | --- |
| knight | [Hero Knight](https://luizmelo.itch.io/hero-knight) | Player knight, royal guard |
| witch | [Wizard Pack](https://luizmelo.itch.io/wizard-pack) | Player spellcaster, storm elite |
| ranger | [Huntress 2](https://luizmelo.itch.io/huntress-2) | Player archer, mirror hunter |
| skeleton, goblin, mushroom, flying-eye | [Monsters Creatures Fantasy](https://luizmelo.itch.io/monsters-creatures-fantasy) | Four ordinary monster anatomies and specialized elites |
| butcher | [Medieval Warrior Pack](https://luizmelo.itch.io/medieval-warrior-pack) | Butcher elite |
| warden | [Medieval Warrior Pack 3](https://luizmelo.itch.io/medieval-warrior-pack-3) | Gate warden, duelist |
| lich | [Evil Wizard 2](https://luizmelo.itch.io/evil-wizard-2) | Ink abbot, oracle |
| worm | [Fire Worm](https://luizmelo.itch.io/fire-worm) | Bone nest mother |
| firemage | [Evil Wizard](https://luizmelo.itch.io/evil-wizard) | Bell keeper, hexer |
| king | [Medieval King Pack 2](https://luizmelo.itch.io/medieval-king-pack-2) | Hollow king |

The game applies source-sheet crops, nearest-neighbor scale and horizontal mirroring at runtime. Animation timing, entity names, combat design and chapter identities belong to this game; the pixel art is credited to its creator. A few families serve both an elite and a boss; each chapter boss uses a different source family.

## Background illustration

`public/art/banquet-moon-v2.png` was generated for this project with OpenAI image generation in September 2026. It is separate from LuizMelo's CC0 work. No third-party commercial game sprites or illustrations were extracted.

`public/art/chapter-atlas-v1.png` was also generated with OpenAI image generation in September 2026: four original panels for the forbidden library, ossuary, storm clocktower and eclipse throne. Runtime crops these panels and adds chapter-specific scenery.

## Original soundtrack

`public/audio/lanterns-in-the-keep.mp3` — “古堡遗灯”, 78 BPM, 24 bars, approximately 74 seconds. Bell melody, harpsichord, pipe-organ harmony and a restrained string bed for exploration.

`public/audio/crown-of-cinders.mp3` — “烬冠之战”, 132 BPM, 32 bars, approximately 58 seconds. Organ lead, string ostinato, bass and synthesized battle percussion for boss fights.

Both are original scores synthesized for Ashen Keep, with no external samples, recordings or copied game melodies. The reproducible composition/renderer is `scripts/compose_soundtrack.py` (NumPy + ffmpeg); exact loop lengths are in `public/audio/manifest.json`. Audio-service credentials were unavailable; these are authored procedural music, not provider-generated or recorded orchestral performances.

At runtime, large connected pure-white slash overlays are suppressed in selected sword-animation frames so that the game's timed ribbons own the attack effect. Clean caster poses avoid baked fireballs on lightning/curse enemies. Source PNGs stay unchanged; weapon/body details and artist credit are retained.
