import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFloor,floorCount,populate} from '../src/world';
import {Game} from '../src/game';

test('1000 seeds: variable connected floors, 2 elites and 1 boss on every floor',()=>{
 const counts=new Set<number>(),layouts=new Set<number>();
 for(let seed=0;seed<1000;seed++){counts.add(floorCount(seed));for(let f=1;f<=floorCount(seed);f++){
 const rooms=createFloor(seed,f);layouts.add(rooms.length);assert.equal(rooms.filter(r=>r.kind==='elite').length,2);assert.equal(rooms.filter(r=>r.kind==='boss').length,1);
 const seen=new Set([0]),q=[0];while(q.length){const room=rooms[q.shift()!];for(const d of room.doors){assert(rooms[d.target]);assert(rooms[d.target].doors.some(back=>back.target===room.id));if(!seen.has(d.target)){seen.add(d.target);q.push(d.target);}}}assert.equal(seen.size,rooms.length);
 for(const r of rooms){if(r.kind==='elite')assert.equal(populate(r,f).filter(e=>e.kind==='elite').length,1);if(r.kind==='boss')assert.equal(populate(r,f).filter(e=>e.kind==='boss').length,1);for(const p of r.platforms)assert(p.y>=245&&p.y<=350);}
 }}assert.equal(counts.size,3);assert(layouts.size>=3);
});
test('seed determinism changes with floor',()=>{assert.deepEqual(createFloor(42,1),createFloor(42,1));assert.notDeepEqual(createFloor(42,1),createFloor(42,2));});
test('jump lands on elevated one-way platform without tunneling; no double jump before unlock',()=>{const g=new Game();g.start(42);g.room.enemies=[];g.player.x=300;g.room.platforms=[{x:250,y:345,w:200}];g.input('Space',true);for(let i=0;i<15;i++)g.tick(1/60);g.input('Space',false);g.input('Space',true);const jumps=g.player.jumps;g.tick(1/60);assert.equal(g.player.jumps,jumps);for(let i=0;i<50;i++)g.tick(1/60);assert.equal(g.player.y,345);assert.equal(g.player.grounded,true);});
test('elite seals unlock traversal, persist visited room kills, boss gate enforces seals',()=>{const g=new Game();g.start(42);const eliteRooms=g.rooms.filter(r=>r.kind==='elite');g.travel(eliteRooms[0].id);const e=g.room.enemies.find(e=>e.kind==='elite')!;g.hurtEnemy(e,9999);assert(g.doubleJump);assert.equal(g.elites,1);g.travel(0);g.travel(eliteRooms[0].id);assert(g.room.enemies.find(a=>a.id===e.id)!.dead);
 g.travel(eliteRooms[1].id);const door=g.room.doors.find(d=>g.rooms[d.target].kind==='boss')!;g.player.x=door.x;g.player.y=door.y;g.interactWithWorld();assert.equal(g.room.id,eliteRooms[1].id);g.hurtEnemy(g.room.enemies.find(e=>e.kind==='elite')!,9999);assert(g.breakDash);assert.equal(g.elites,2);g.phase='playing';g.interactWithWorld();assert.equal(g.room.kind,'boss');});
test('all classes can kill and upgrades change build',()=>{for(const id of ['knight','witch','ranger'] as const){const g=new Game();g.selectedClass=id;g.start(17);g.room.enemies=g.room.enemies.slice(0,1);const e=g.room.enemies[0];e.kind='skeleton';e.x=g.player.x+50;e.y=440;e.hp=15;g.input('KeyJ',true);for(let i=0;i<60;i++)g.tick(1/60);assert(g.kills>0,id);const before=g.damage;g.applyUpgrade('power');assert(g.damage>before);}});
test('death stops simulation and restart clears run state',()=>{const g=new Game();g.start(7);g.player.invuln=0;g.hurtPlayer(999,'test');assert.equal(g.phase,'dead');const t=g.elapsed;g.tick(1);assert.equal(g.elapsed,t);g.start(8);assert.equal(g.phase,'playing');assert.equal(g.kills,0);assert.equal(g.player.hp,g.player.maxHp);});
test('boss exit advances floor and final exit wins',()=>{const g=new Game();g.start(42);g.travel(g.rooms.find(r=>r.kind==='boss')!.id);g.hurtEnemy(g.room.enemies.find(e=>e.kind==='boss')!,9999);g.phase='playing';const exit=g.room.props.find(p=>p.kind==='exit')!;g.player.x=exit.x;g.interactWithWorld();assert.equal(g.floor,2);assert.equal(g.elites,0);assert(g.doubleJump===false);
 g.floor=g.totalFloors;g.loadFloor();g.travel(g.rooms.find(r=>r.kind==='boss')!.id);g.hurtEnemy(g.room.enemies.find(e=>e.kind==='boss')!,9999);g.phase='playing';g.player.x=g.room.props.find(p=>p.kind==='exit')!.x;g.interactWithWorld();assert.equal(g.phase,'won');});
test('pause and screenshot freeze stop all simulation',()=>{const g=new Game();g.start(4);g.pause();const x=g.player.x,t=g.time;g.input('ArrowRight',true);g.tick(1);assert.equal(g.player.x,x);assert.equal(g.time,t);g.resume();g.frozen=true;g.tick(1);assert.equal(g.time,t);});

test('flying monsters stay inside reachable room bounds',()=>{const g=new Game();g.start(42);g.player.x=28;const e=g.room.enemies[0];e.kind='wraith';e.x=35;e.y=330;for(let i=0;i<900;i++)g.updateEnemy(e,1/60);assert(e.x>=35);e.kind='bat';e.x=5;g.updateEnemy(e,1/60);assert(e.x>=35);});
test('hostile projectiles apply their configured damage and cause',()=>{const g=new Game();g.start(42);g.room.enemies=[];g.player.invuln=0;const hp=g.player.hp;g.shoot(g.player.x,g.player.y-26,0,0,31,true,'#fff',5,1,'test bolt');g.tick(1/60);assert.equal(g.player.hp,hp-31);});
