import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
const out='artifacts/redesign-1';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:out+'/video',size:{width:1280,height:720}}});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
try{
await page.goto('http://127.0.0.1:5190/?test=1');await page.evaluate(()=>window.__THREE_GAME_TEST_HOOKS__.setState('story'));
await page.locator('[data-event="frost"]').click();await page.waitForFunction(()=>window.__ASHEN_GAME__.phase==='playing');assert.equal(await page.evaluate(()=>window.__ASHEN_GAME__.mutations.frost),1);
// Actual keyboard combat: all classes, complete locomotion/attack/recovery cycles.
const classes=[];
for(const cls of ['knight','witch','ranger']){
 await page.evaluate(cls=>{const g=window.__ASHEN_GAME__;g.selectedClass=cls;g.start(42);g.player.invuln=8;},cls);
 await page.keyboard.down('d');await page.keyboard.down('j');await page.waitForTimeout(650);await page.keyboard.up('d');await page.keyboard.press('Space');await page.keyboard.press('k');await page.waitForTimeout(1800);await page.keyboard.up('j');await page.waitForTimeout(350);
 classes.push(await page.evaluate(()=>{const g=window.__ASHEN_GAME__;return {class:g.selectedClass,kills:g.kills,attack:g.player.attack,shots:g.shots.length,x:g.player.x,hp:g.player.hp,sprites:window.__THREE_GAME_DIAGNOSTICS__.state.sprites}}));
}
assert(classes.every(c=>c.kills>0&&c.sprites.failed.length===0));
// Merchant affordability and selection through the real event UI.
await page.evaluate(()=>window.__THREE_GAME_TEST_HOOKS__.setState('shop'));await page.locator('[data-event^="buy-"]').first().click();await page.waitForFunction(()=>window.__ASHEN_GAME__.phase==='playing');assert.equal(await page.evaluate(()=>window.__ASHEN_GAME__.gold),35);
// A staged full run validates chapter transitions, one memory per chapter and the final choice.
// Combat health is cleared by fixture here; this does not measure full-run difficulty.
await page.evaluate(()=>window.__ASHEN_GAME__.start(42));let route=[];
for(let f=0;f<5;f++){
 const info=await page.evaluate(()=>{const g=window.__ASHEN_GAME__;g.phase='playing';g.travel(g.rooms.find(r=>r.kind==='event').id);g.player.x=g.room.props[0].x;return {floor:g.floor,total:g.totalFloors,chapter:g.room.chapter};});route.push(info);
 await page.keyboard.press('e');await page.locator('[data-event="remember"]').click();await page.locator('[data-event="continue"]').click();
 await page.evaluate(()=>{const g=window.__ASHEN_GAME__;g.phase='playing';g.travel(g.rooms.find(r=>r.kind==='boss').id);for(const e of g.room.enemies)g.hurtEnemy(e,100000);g.phase='playing';g.xp=0;g.elites=2;g.room.cleared=true;g.player.x=g.room.props[0].x;});
 await page.keyboard.press('e');
 if(info.floor===info.total){await page.locator('[data-event="release"]').click();break;}
 await page.locator('[data-event="continue"]').click();
}
await page.waitForFunction(()=>window.__ASHEN_GAME__.phase==='won');const ending=await page.evaluate(()=>({title:window.__ASHEN_GAME__.endingTitle,memories:window.__ASHEN_GAME__.memories}));assert.match(ending.title,/记得/);assert(ending.memories>=3);await page.screenshot({path:out+'/true-ending.png'});
await page.locator('[data-action="restart"]').click();await page.locator('[data-event="echo"]').click();await page.waitForFunction(()=>window.__ASHEN_GAME__.phase==='playing');assert.equal(await page.evaluate(()=>window.__ASHEN_GAME__.memories),0);
// Difficulty signals: two actual-key policies, same knight/seed/duration, no invulnerability fixture.
const policies=[];
for(const adaptive of [false,true]){
 await page.evaluate(()=>{const g=window.__ASHEN_GAME__;g.selectedClass='knight';g.start(17);});
 for(let i=0;i<24;i++){
  const s=await page.evaluate(()=>{const g=window.__ASHEN_GAME__;return {phase:g.phase,x:g.player.x,target:g.room.enemies.filter(e=>!e.dead).sort((a,b)=>Math.abs(a.x-g.player.x)-Math.abs(b.x-g.player.x))[0]?.x};});
  if(s.phase==='upgrade'){await page.locator('[data-upgrade]').first().click();continue;}if(s.phase!=='playing')break;
  await page.keyboard.up('a');await page.keyboard.up('d');await page.keyboard.down('j');
  if(adaptive&&s.target!==undefined){await page.keyboard.down(s.target>s.x?'d':'a');if(i%8===0)await page.keyboard.press('k');if(i%7===0)await page.keyboard.press('Shift');}else await page.keyboard.down('d');
  await page.waitForTimeout(160);
 }
 for(const key of ['a','d','j'])await page.keyboard.up(key);
 policies.push(await page.evaluate(adaptive=>{const g=window.__ASHEN_GAME__;return {policy:adaptive?'target+skill+dash':'right+attack',hp:g.player.hp,kills:g.kills,cleared:g.room.cleared,elapsed:g.elapsed,phase:g.phase};},adaptive));
}
const report={classes,route,ending,policies,errors};await writeFile(out+'/journey-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert.equal(errors.length,0);
}finally{const video=page.video();await context.close();await copyFile(await video.path(),out+'/journey-motion.webm');await browser.close();}
