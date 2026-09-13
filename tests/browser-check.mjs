import {chromium} from '@playwright/test';
import {writeFile,mkdir,copyFile} from 'node:fs/promises';
const targetUrl=process.env.GAME_URL||'http://127.0.0.1:5190/';
const testUrl=new URL(targetUrl);testUrl.searchParams.set('test','1');
const out=process.env.EVIDENCE_DIR||'artifacts/browser-check';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:out+'/video',size:{width:1280,height:720}}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
await page.goto(testUrl.href);await page.waitForFunction(()=>window.__ASHEN_GAME__);await page.screenshot({path:out+'/menu.png'});
await page.locator('[data-class="ranger"]').click();await page.locator('[data-action="start"]').click();
await page.locator('[data-event="ember"]').click();
// Isolate input/navigation regression from difficulty; policy tests run without this fixture.
await page.evaluate(()=>{window.__ASHEN_GAME__.start(42);window.__ASHEN_GAME__.player.invuln=30;});
const initial=await page.evaluate(()=>({x:window.__ASHEN_GAME__.player.x,class:window.__ASHEN_GAME__.selectedClass,frames:window.__THREE_GAME_DIAGNOSTICS__.state.frames}));
await page.keyboard.down('d');await page.keyboard.down('j');await page.waitForTimeout(1400);await page.keyboard.up('d');await page.keyboard.up('j');
const moved=await page.evaluate(()=>window.__ASHEN_GAME__.player.x);
await page.keyboard.press('Space');await page.waitForTimeout(180);const jumpY=await page.evaluate(()=>window.__ASHEN_GAME__.player.y);await page.keyboard.press('Shift');const dashSample=await page.waitForFunction(()=>window.__ASHEN_GAME__.dashCd>0?window.__ASHEN_GAME__.dashCd:false);const dashCooldown=await dashSample.jsonValue();await page.waitForTimeout(600);
// Drive through the opening horde using actual keys, adapting direction and upgrade choices.
let upgradeChosen=false;
for(let i=0;i<100;i++){
 const s=await page.evaluate(()=>{const g=window.__ASHEN_GAME__,e=g.room.enemies.filter(e=>!e.dead).sort((a,b)=>Math.abs(a.x-g.player.x)-Math.abs(b.x-g.player.x))[0];return {phase:g.phase,x:g.player.x,target:e?.x,y:e?.y,skill:g.skillCd,kills:g.kills};});
 if(s.phase==='upgrade'){await page.keyboard.up('j');await page.keyboard.up('d');await page.keyboard.up('a');await page.locator('[data-upgrade]').first().click();upgradeChosen=true;continue;}
 if(s.phase!=='playing')break;
 if(s.target===undefined)break;
 const delta=s.target-s.x;
 for(const key of ['a','d'])await page.keyboard.up(key);
 if(Math.abs(delta)>100)await page.keyboard.down(delta>0?'d':'a');else{await page.keyboard.down(delta>0?'d':'a');await page.waitForTimeout(30);await page.keyboard.up(delta>0?'d':'a');}
 await page.keyboard.down('j');if(s.skill<=0)await page.keyboard.press('k');if(s.y<400&&i%6===0)await page.keyboard.press('Space');
 await page.waitForTimeout(140);
}
for(const key of ['a','d','j'])await page.keyboard.up(key);
let progression=await page.evaluate(()=>{const g=window.__ASHEN_GAME__;return {phase:g.phase,kills:g.kills,hp:g.player.hp,level:g.level,cleared:g.room.cleared,elapsed:g.elapsed,frames:window.__THREE_GAME_DIAGNOSTICS__.state.frames,sound:g.sound.ctx?.state};});
if(progression.phase==='upgrade'){await page.locator('[data-upgrade]').first().click();upgradeChosen=true;}
await page.keyboard.press('Escape');const paused=await page.evaluate(()=>window.__ASHEN_GAME__.elapsed);await page.waitForTimeout(250);const pauseStable=await page.evaluate(()=>window.__ASHEN_GAME__.elapsed)===paused;await page.locator('[data-action="resume"]').click();
await page.keyboard.press('m');await page.locator('.map-panel').waitFor();const mapVisible=await page.locator('.map-panel').isVisible();await page.screenshot({path:out+'/map.png'});await page.keyboard.press('m');await page.locator('.map-panel').waitFor({state:'detached'});
// Validate progression into next room with real movement and E interaction.
const travelBefore=await page.evaluate(()=>window.__ASHEN_GAME__.room.id);
for(let i=0;i<80;i++){const d=await page.evaluate(()=>{const g=window.__ASHEN_GAME__;return g.room.width-85-g.player.x;});if(Math.abs(d)<40)break;await page.keyboard.down(d>0?'d':'a');await page.waitForTimeout(90);await page.keyboard.up('d');await page.keyboard.up('a');}
await page.keyboard.press('e');await page.waitForFunction(()=>window.__ASHEN_GAME__.room.id>0);
const travelAfter=await page.evaluate(()=>window.__ASHEN_GAME__.room.id);
// Named upgrade state exercises the actual choice UI; XP threshold also covered by simulation tests.
await page.evaluate(()=>window.__THREE_GAME_TEST_HOOKS__.setState('upgrade'));const damageBefore=await page.evaluate(()=>window.__ASHEN_GAME__.relics.length);await page.locator('[data-upgrade]').first().click();await page.waitForFunction(()=>window.__ASHEN_GAME__.phase==='playing');upgradeChosen=await page.evaluate(()=>window.__ASHEN_GAME__.relics.length)>damageBefore;
// Set up a vulnerable state, then let an actual enemy attack produce failure.
await page.evaluate(()=>{const g=window.__ASHEN_GAME__;g.start(77);g.player.hp=1;g.player.invuln=0;const e=g.room.enemies.find(e=>e.kind==='skeleton');e.x=g.player.x+25;e.y=440;e.timer=0;});
await page.waitForFunction(()=>window.__ASHEN_GAME__.phase==='dead',{timeout:6000});await page.screenshot({path:out+'/dead.png'});await page.locator('[data-action="restart"]').click();
await page.locator('[data-event="ember"]').click();
const restarted=await page.evaluate(()=>({phase:window.__ASHEN_GAME__.phase,hp:window.__ASHEN_GAME__.player.hp,kills:window.__ASHEN_GAME__.kills}));
await page.locator('[data-action="mute"]').click();const muted=await page.evaluate(()=>window.__ASHEN_GAME__.sound.muted);await page.locator('[data-action="mute"]').click();
const result={initial,moved,jumpY,dashCooldown,progression,upgradeChosen,travelBefore,travelAfter,pauseStable,mapVisible,restarted,muted,errors};
await writeFile(out+'/input-results.json',JSON.stringify(result,null,2));
const video=page.video();await context.close();await copyFile(await video.path(),out+'/motion.webm');
// Portrait touch real pointer input, stable release, and state capture.
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mp=await mobile.newPage();await mp.goto(testUrl.href);await mp.locator('[data-action="start"]').tap();await mp.locator('[data-event="ember"]').tap();
const right=mp.locator('[data-key="ArrowRight"]');await right.waitFor({state:'visible'});const box=await right.boundingBox();await mp.mouse.move(box.x+box.width/2,box.y+box.height/2);await mp.mouse.down();await mp.waitForTimeout(400);await mp.mouse.up();const touch=await mp.evaluate(()=>({x:window.__ASHEN_GAME__.player.x,keys:[...window.__ASHEN_GAME__.keys]}));
await mp.screenshot({path:out+'/touch-play.png'});await writeFile(out+'/touch-results.json',JSON.stringify(touch,null,2));await mobile.close();await browser.close();
console.log(JSON.stringify({...result,touch},null,2));
if(moved<=initial.x+100||jumpY>=435||dashCooldown<=0||progression.kills===0||!pauseStable||!mapVisible||restarted.phase!=='playing'||errors.length||touch.x<=200||touch.keys.length)process.exitCode=1;
