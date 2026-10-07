import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePlacement } from '../src/game/combat.ts';
import { battleTerrain, placementDestination } from '../src/game/terrain.ts';

const fish = (id, effect, direction = 'right') => ({ id, name: id, owner: id === 'target' ? 'rival' : 'player', edges: effect ? [{ effect, direction }] : [] });
const state = (entries = {}, rocks = [8], whirlpools = [6, 19]) => ({ board: Object.assign(Array(25).fill(null), entries), shocked: new Set(), terrain: { rocks: new Set(rocks), whirlpools } });

test('regional terrain avoids reefs, overlaps, and board boundaries', () => {
  for (const region of ['shoreline', 'ocean', 'bermuda']) {
    const terrain = battleTerrain(region), cells = [...terrain.rocks, ...terrain.whirlpools, ...terrain.features.keys()];
    assert.equal(new Set(cells).size, 6);
    assert.ok(cells.every(i => i >= 0 && i < 25 && ![2, 11, 18].includes(i)));
    assert.deepEqual(battleTerrain(region), terrain);
  }
});

test('kelp anchors forced movement but allows shock and predation', () => {
  for (const effect of ['standard', 'double', 'follow-current', 'ram', 'wave', 'swap', 'hook']) {
    const target = fish('target'), input = state({ 12: target }, [], [0, 24]);
    input.terrain.features = new Map([[12, 'kelp']]);
    const result = resolvePlacement(input, effect === 'hook' ? 10 : 11, fish('placed', effect));
    assert.equal(result.board[12], target, effect);
  }
  const input = state({ 12: fish('target') }, [], [0, 24]);
  input.terrain.features = new Map([[12, 'kelp']]);
  assert.ok(resolvePlacement(input, 11, fish('placed', 'shock')).shocked.has('target'));
  assert.deepEqual(resolvePlacement(input, 11, fish('placed', 'bigger-fish')).killedIds, ['target']);
});
test('tide channel carries direct placement toward a reef, but cannot overwrite a card', () => {
  const input = state({}, [], [0, 24]), placed = fish('placed');
  input.terrain.features = new Map([[10, 'channel']]);
  assert.equal(resolvePlacement(input, 10, placed).board[11], placed);
  input.board[11] = fish('target');
  assert.equal(resolvePlacement(input, 10, placed).board[10], placed);
});
test('trench prevents direct play and records displaced casualties immediately', () => {
  const input = state({ 11: fish('target') }, [], [0, 24]);
  input.terrain.features = new Map([[12, 'trench']]);
  assert.throws(() => resolvePlacement(input, 12, fish('placed')));
  const result = resolvePlacement(input, 10, fish('placed', 'standard'));
  assert.equal(result.board[12], null);
  assert.deepEqual(result.killedIds, ['target']);
  assert.deepEqual(result.pushedEnemyIds, ['target']);
  const dive = resolvePlacement(input, 10, fish('placed', 'dive'));
  assert.deepEqual(dive.killedIds, ['placed']);
});
test('vent moves allies onto reefs and ejects guarded rivals without mutating input', () => {
  const ally = fish('ally'), rival = fish('target', 'weak', 'down');
  const input = state({ 13: ally, 3: rival }, [7], [5, 19]);
  input.terrain.features = new Map([[8, 'vent']]);
  const result = resolvePlacement(input, 8, fish('placed'));
  assert.equal(result.board[18], ally);
  assert.deepEqual(result.killedIds, ['target']);
  assert.deepEqual(result.pushedEnemyIds, ['target']);
  assert.equal(input.board[3], rival);
  input.board[18] = fish('blocker');
  assert.equal(resolvePlacement(input, 8, fish('placed')).board[13], ally);
});
test('mirror reverses attacking and defending edges without mutating the school card', () => {
  const input = state({ 11: fish('target') }, [], [0, 24]), placed = fish('placed', 'standard');
  input.terrain.features = new Map([[12, 'mirror']]);
  const result = resolvePlacement(input, 12, placed);
  assert.equal(result.board[10].id, 'target');
  assert.equal(result.board[12].edges[0].direction, 'left');
  assert.equal(placed.edges[0].direction, 'right');
});
test('storm disables adjacent friend and rival defenses before the placed card attacks', () => {
  const input = state({ 11: fish('ally'), 13: fish('target', 'standard', 'left'), 6: fish('diagonal') }, [], [0, 24]);
  input.terrain.features = new Map([[12, 'storm']]);
  const result = resolvePlacement(input, 12, fish('placed', 'standard'));
  assert.deepEqual(new Set(result.shocked), new Set(['ally', 'target']));
  assert.equal(result.board[14].id, 'target');
});
test('rocks and invalid indices reject placement without mutating state', () => {
  const input = state();
  for (const index of [8, -1, 25, 1.5]) assert.throws(() => resolvePlacement(input, index, fish('placed')));
  assert.ok(input.board.every(card => card === null));
});
test('teleport resolves edges at the exit and does not count travel as a casualty', () => {
  const target = fish('target'), placed = fish('placed', 'standard', 'left');
  const input = state({ 18: target });
  const result = resolvePlacement(input, 6, placed);
  assert.equal(result.board[19], placed);
  assert.equal(result.board[17], target);
  assert.equal(result.board[6], null);
  assert.deepEqual(result.killedIds, []);
  assert.equal(input.board[18], target);
  assert.equal(placementDestination(input.board, 6, input.terrain), 19);
});
test('occupied exit keeps placement at entrance; reverse travel works once', () => {
  const input = state({ 19: fish('target') }), placed = fish('placed');
  assert.equal(resolvePlacement(input, 6, placed).board[6], placed);
  assert.equal(resolvePlacement(state(), 19, placed).board[6], placed);
});
test('rocks block all pushes, hook paths, dives, bounce landings, and wave rays', () => {
  for (const effect of ['standard', 'double', 'follow-current', 'ram', 'wave']) {
    const target = fish('target');
    const result = resolvePlacement(state({ 7: target }, [8], [0, 24]), 6, fish('placed', effect));
    assert.equal(result.board[7], target, effect);
    assert.equal(result.board[8], null, effect);
    assert.deepEqual(result.killedIds, [], effect);
  }
  const placed = fish('placed', 'dive');
  assert.equal(resolvePlacement(state({ 7: fish('target') }, [8], [0, 24]), 6, placed).board[6], placed);
  const hookTarget = fish('target');
  assert.equal(resolvePlacement(state({ 8: hookTarget }, [7], [0, 24]), 6, fish('placed', 'hook')).board[8], hookTarget);
  const bounce = fish('placed', 'bounce');
  assert.equal(resolvePlacement(state({}, [5], [0, 24]), 6, bounce).board[6], bounce);
  const far = fish('target');
  assert.equal(resolvePlacement(state({ 8: far }, [7], [0, 24]), 6, fish('placed', 'wave')).board[8], far);
});
test('pushing onto a whirlpool does not trigger travel', () => {
  const target = fish('target');
  const result = resolvePlacement(state({ 7: target }, [], [8, 19]), 6, fish('placed', 'standard'));
  assert.equal(result.board[8], target);
  assert.equal(result.board[19], null);
});
