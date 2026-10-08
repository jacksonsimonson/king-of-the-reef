import test from 'node:test';
import assert from 'node:assert/strict';
import { synthesizeMusic, synthesizeEffect, EFFECTS, SAMPLE_RATE } from '../src/game/audio/synthesis.ts';
import { readAudioSettings } from '../src/game/audio/settings.ts';
import { combatCue } from '../src/game/audio/cues.ts';
import { ReefAudio } from '../src/game/audio/audio.ts';

test('all original loops and effects have headroom, silence at seams, and deterministic audible samples', () => {
  for (const key of [...EFFECTS, 'map-0', 'map-1', 'map-2', 'battle-0', 'battle-1', 'battle-2']) {
    const generate = EFFECTS.includes(key) ? synthesizeEffect : synthesizeMusic;
    const samples = generate(key); let peak = 0, energy = 0;
    for (const sample of samples) { assert.ok(Number.isFinite(sample)); peak = Math.max(peak, Math.abs(sample)); energy += sample * sample; }
    assert.ok(peak < .8 && peak > .05, key + ' peak');
    assert.ok(energy / samples.length > .00001, key + ' audible');
    assert.equal(samples[0], 0); assert.ok(Math.abs(samples.at(-1)) < .00001, key + ' seam');
    assert.deepEqual(generate(key), samples);
  }
  assert.ok(synthesizeMusic('battle-2').length < synthesizeMusic('battle-0').length);
  assert.ok(synthesizeMusic('map-0').length > SAMPLE_RATE * 20);
});

test('settings tolerate corrupt, obsolete, missing, and out-of-range preferences', () => {
  for (const value of [null, 'null', '{}', 'bad']) assert.deepEqual(readAudioSettings(value), { muted: false, music: .35, effects: .65 });
  assert.deepEqual(readAudioSettings('{"muted":"yes","music":-2,"effects":4}'), { muted: false, music: 0, effects: 1 });
  assert.deepEqual(readAudioSettings('{"muted":true,"music":0,"effects":0.2}'), { muted: true, music: 0, effects: .2 });
});

test('combat sounds follow observed changes, including silent no-op frames', () => {
  const a = { id: 'a', edges: [] }, before = [a, null];
  const frame = (board, label = 'edge', shocked = new Set(), notes = []) => ({ board, label, shocked, notes });
  assert.equal(combatCue([null, null], new Set(), frame(before)), 'place');
  assert.equal(combatCue(before, new Set(), frame([null, a], 'Whirlpool')), 'whirlpool');
  assert.equal(combatCue(before, new Set(), frame([null, a])), 'move');
  assert.equal(combatCue(before, new Set(), frame([null, null])), 'remove');
  assert.equal(combatCue(before, new Set(), frame(before, 'Storm', new Set(['a']))), 'shock');
  assert.equal(combatCue(before, new Set(), frame(before, 'edge', new Set(), ['Blocked'])), 'block');
  assert.equal(combatCue(before, new Set(), frame(before)), undefined);
});

test('audio lifecycle shares context, crossfades once, bounds voices, and honors mute/background', async () => {
  const sources = [], params = [];
  class Param {
    setValueAtTime(value) { params.push(value); }
    setTargetAtTime(value) { params.push(value); }
    linearRampToValueAtTime(value) { params.push(value); }
    cancelAndHoldAtTime() {}
  }
  let contexts = 0;
  class Context {
    currentTime = 1; state = 'suspended'; destination = {};
    constructor() { contexts++; }
    async resume() { this.state = 'running'; }
    async suspend() { this.state = 'suspended'; }
    createGain() { return { gain: new Param(), connect() {}, disconnect() {} }; }
    createBuffer(_channels, length) { return { getChannelData: () => new Float32Array(length) }; }
    createBufferSource() { const source = { connect() {}, disconnect() {}, start() {}, stop() { this.stopped = true; } }; sources.push(source); return source; }
  }
  const original = { AudioContext: globalThis.AudioContext, document: globalThis.document, localStorage: globalThis.localStorage };
  try {
    globalThis.AudioContext = Context; globalThis.document = { hidden: false };
    globalThis.localStorage = { setItem() { throw Error('blocked'); } };
    const audio = new ReefAudio(); audio.play('place'); assert.equal(sources.length, 0);
    audio.setTrack('map-1'); await audio.unlock(); await audio.unlock(); assert.equal(contexts, 1); assert.equal(sources.length, 1);
    audio.setTrack('map-1'); assert.equal(sources.length, 1);
    audio.setTrack('battle-2'); assert.equal(sources.length, 2); assert.equal(sources[0].stopped, true);
    audio.play('place'); audio.play('place'); assert.equal(sources.length, 3);
    audio.update({ muted: true, music: .2, effects: .4 }); audio.play('reward'); assert.equal(sources.length, 3); assert.equal(params.at(-1), 0);
    audio.update({ muted: false, music: .2, effects: .4 });
    globalThis.document.hidden = true; audio.play('reward'); assert.equal(sources.length, 3);
    audio.visibility(true); assert.match(audio.status, /paused/);
    globalThis.document.hidden = false; await audio.unlock();
    for (const effect of EFFECTS) audio.play(effect);
    assert.equal(sources.length, 8); // Two music sources plus at most six concurrent effects.
  } finally { for (const [key, value] of Object.entries(original)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } }
});
