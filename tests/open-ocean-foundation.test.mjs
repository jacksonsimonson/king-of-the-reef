import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { OPEN_OCEAN_CARDS } from "../src/game/data/openOceanCards.ts";
import { STARTERS } from "../src/game/data/starterFish.ts";
import { OCEAN_POOL, LEGACY_OCEAN_POOL, drawOceanCard, oceanRarity } from "../src/game/data/oceanPool.ts";
import { movementFor } from "../src/game/fishing/model.ts";
import { resolvePlacement } from "../src/game/combat.ts";
import { random } from "../src/game/run/maps.ts";
import { createRun, offers, saveRun, loadRun, shopOffers, rivalDeckFor } from "../src/game/run/state.ts";
import { generateShop } from "../src/game/run/shop.ts";

const edge = (direction,effect) => ({direction,effect});
const fish = (id,edges=[],owner="rival") => ({id,texture:id,name:id,species:"",edges,owner,condition:"healthy"});
const state = (...entries) => ({board:Object.assign(Array(25).fill(null),Object.fromEntries(entries)),shocked:new Set()});
const actor = effect => fish("actor",[edge("right",effect)],"player");
function storage(){const m=new Map();globalThis.localStorage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};}

test("43 ocean cards have art, gameplay, fishing and blank sides; no placeholders",()=>{
  assert.equal(OPEN_OCEAN_CARDS.length,43);
  for(const data of OPEN_OCEAN_CARDS){
    const c=STARTERS.find(c=>c.texture===data.texture);
    assert.ok(c.edges.length>0&&c.edges.length<=3,data.name);
    assert.ok(!c.ability);
    assert.ok(existsSync(new URL("../public/assets/fish/"+data.texture+".png",import.meta.url)));
    assert.ok(movementFor(data.texture));assert.ok(OCEAN_POOL.includes(data.texture));
  }
  assert.ok(!STARTERS.some(c=>c.texture==="arctic-cod"));
});
test("Ram resolves a contiguous line farthest first; respects gaps, defenses, blockers and off-board deaths",()=>{
  const s=state([12,fish("a")],[13,fish("b")],[14,fish("c")]);
  const r=resolvePlacement(s,11,actor("ram"));
  assert.equal(r.board[13].id,"a");assert.equal(r.board[14].id,"b");assert.deepEqual(r.killedIds,["c"]);
  assert.equal(s.board[12].id,"a");
  const gap=resolvePlacement(state([12,fish("a")],[14,fish("c")]),11,actor("ram"));
  assert.equal(gap.board[13].id,"a");assert.equal(gap.board[14].id,"c");
  const blocked=resolvePlacement(state([12,fish("a")],[13,fish("b",[edge("left","weak")])],[14,fish("c")]),11,actor("ram"));
  assert.equal(blocked.board[12].id,"a");assert.equal(blocked.board[13].id,"b");assert.deepEqual(blocked.killedIds,["c"]);
});
test("Follow Current beats Standard and follows off-board pushes; Double and Shield stop it",()=>{
  const r=resolvePlacement(state([12,fish("a",[edge("left","standard")])]),11,actor("follow-current"));
  assert.equal(r.board[12].id,"actor");assert.equal(r.board[13].id,"a");
  const k=resolvePlacement(state([14,fish("a")]),13,actor("follow-current"));
  assert.equal(k.board[14].id,"actor");assert.deepEqual(k.killedIds,["a"]);
  for(const d of ["double","weak","follow-current"])
    assert.equal(resolvePlacement(state([12,fish("a",[edge("left",d)])]),11,actor("follow-current")).board[11].id,"actor");
});
test("Bounce retreats after successful, blocked and empty attempts, never off-board or into cards",()=>{
  for(const entries of [[],[[12,fish("a")]],[[12,fish("a",[edge("left","standard")])]],[[12,fish("a")],[13,fish("b")]]])
    assert.equal(resolvePlacement(state(...entries),11,actor("bounce")).board[10].id,"actor");
  assert.equal(resolvePlacement(state(),10,actor("bounce")).board[10].id,"actor");
  assert.equal(resolvePlacement(state([10,fish("wall")]),11,actor("bounce")).board[11].id,"actor");
});
test("Dive needs an adjacent creature and open landing, ignores defenses without retaliation",()=>{
  for(const owner of ["player","rival"])for(const d of ["standard","double","weak","spines","shock","ram","bounce","dive","follow-current"]){
    const r=resolvePlacement(state([12,fish("a",[edge("left",d)],owner)]),11,actor("dive"));
    assert.equal(r.board[13].id,"actor");assert.equal(r.board[12].id,"a");assert.deepEqual(r.killedIds,[]);
  }
  for(const [i,entries] of [[11,[]],[11,[[12,fish("a")],[13,fish("b")]]],[13,[[14,fish("a")]]]])
    assert.equal(resolvePlacement(state(...entries),i,actor("dive")).board[i].id,"actor");
});
test("Spines kills new direct pushers before self movement; Shock disables effects; movement never repeats edges",()=>{
  for(const e of ["ram","bounce","follow-current"])
    assert.ok(resolvePlacement(state([12,fish("urchin",[edge("left","spines")])]),11,actor(e)).killedIds.includes("actor"));
  for(const e of ["ram","bounce","follow-current","dive"]){
    const s=state([12,fish("a")]);s.shocked.add("actor");
    assert.equal(resolvePlacement(s,11,actor(e)).board[11].id,"actor");
  }
  const c=fish("actor",[edge("up","dive"),edge("right","standard")],"player");
  const r=resolvePlacement(state([7,fish("jump")],[3,fish("push")]),12,c);
  assert.equal(r.board[2].id,"actor");assert.equal(r.board[4].id,"push");
});
test("rarity draws honor budgets and exclusions",()=>{
  const counts={Common:0,Uncommon:0,Rare:0,"Extremely Rare":0},rng=random("ocean-weight");
  for(let i=0;i<30000;i++)counts[oceanRarity(drawOceanCard(rng,OCEAN_POOL,[],7))]++;
  for(const [rarity,p] of Object.entries({Common:.45,Uncommon:.35,Rare:.18,"Extremely Rare":.02}))
    assert.ok(Math.abs(counts[rarity]/30000-p)<.015,rarity);
  assert.equal(drawOceanCard(rng,["lanternfish","orca"],["orca"],10),"lanternfish");
});
test("new catches and rivals honor roster; old saved ocean offers and shop prices persist",()=>{
  storage();
  const run=createRun("ocean-save");run.region=1;run.current=run.maps[1].nodes[0].id;
  run.pending=run.maps[1].nodes.find(n=>n.column===1).id;
  run.roster=["lanternfish","orca","viperfish","minnow","anchovy"];
  assert.deepEqual(new Set(offers(run)),new Set(["lanternfish","orca","viperfish"]));
  assert.ok(rivalDeckFor(run).every(c=>run.roster.includes(c.texture)));
  saveRun(run);assert.deepEqual(offers(loadRun()),offers(run));
  const old=createRun("old-ocean");delete old.oceanPoolVersion;
  old.region=1;old.current=old.maps[1].nodes[0].id;old.pending=old.maps[1].nodes.find(n=>n.column===1).id;
  const pool=[...LEGACY_OCEAN_POOL],rng=random(old.seed+":"+old.pending+":offers");
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  assert.deepEqual(offers(old),pool.slice(0,3));
  old.current=old.maps[1].nodes.find(n=>n.column===5).id;
  old.pending=old.maps[1].nodes.find(n=>n.id===old.current).next[0];
  assert.deepEqual(shopOffers(old),generateShop(old.seed,old.pending,1,offers(old),3,false));
  saveRun(old);assert.deepEqual(shopOffers(loadRun()),shopOffers(old));
});

test("all new effects preserve identities, board bounds and death accounting in randomized placements",()=>{
  const rng=random("ocean-board-invariants");
  for(let trial=0;trial<1000;trial++){
    const s=state(), index=Math.floor(rng()*25);
    for(let i=0;i<25;i++)if(i!==index&&rng()<.65){
      const sample=STARTERS[Math.floor(rng()*STARTERS.length)];
      s.board[i]={...sample,id:"target-"+i,owner:rng()<.5?"player":"rival",condition:"healthy"};
    }
    const sample=STARTERS[81+Math.floor(rng()*43)], c={...sample,id:"placed",owner:"player",condition:"healthy"};
    const before=JSON.stringify(s.board), ids=[...s.board.filter(Boolean),c].map(c=>c.id);
    const r=resolvePlacement(s,index,c), survivors=r.board.filter(Boolean).map(c=>c.id);
    assert.equal(r.board.length,25);assert.equal(new Set(survivors).size,survivors.length);
    assert.equal(JSON.stringify(s.board),before);
    assert.deepEqual(new Set(r.killedIds),new Set(ids.filter(id=>!survivors.includes(id))));
  }
});
