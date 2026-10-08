import { readAudioSettings, type AudioSettings } from './settings.ts';
import { SAMPLE_RATE, synthesizeEffect, synthesizeMusic, type Effect, type Track } from './synthesis.ts';

const STORAGE_KEY = 'reef-audio-v1';
export class ReefAudio {
  settings: AudioSettings = readAudioSettings(null);
  private context?: AudioContext;
  private music?: GainNode;
  private effects?: GainNode;
  private buffers = new Map<string, AudioBuffer>();
  private loop?: { source: AudioBufferSourceNode; gain: GainNode; track: Track };
  private track: Track = 'map-0';
  private voices = 0;
  private last = new Map<Effect, number>();
  private unlocked = false;
  private unavailable = false;
  onChange = (): void => {};
  get enabled(): boolean { return this.context?.state === 'running'; }

  get status(): string {
    if (this.unavailable) return 'Audio unavailable in this browser.';
    if (!this.unlocked) return 'Select Enable audio to start.';
    if (this.settings.muted) return 'Sound muted.';
    return this.context?.state === 'running' ? 'Sound on.' : 'Sound paused.';
  }
  load(): void { try { this.settings = readAudioSettings(localStorage.getItem(STORAGE_KEY)); } catch { /* Session defaults when storage is blocked. */ } }
  update(settings: AudioSettings): void {
    this.settings = readAudioSettings(JSON.stringify(settings));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings)); } catch { /* Controls still work for this session. */ }
    this.applyVolumes(); this.onChange();
  }
  async unlock(): Promise<void> {
    if (this.enabled) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.music = this.context.createGain(); this.effects = this.context.createGain();
        this.music.gain.setValueAtTime(0, this.context.currentTime); this.effects.gain.setValueAtTime(0, this.context.currentTime);
        this.music.connect(this.context.destination); this.effects.connect(this.context.destination);
        this.context.onstatechange = () => this.onChange();
        this.applyVolumes();
      }
      await this.context.resume();
      this.unlocked = this.context.state === 'running';
      this.unavailable = false;
      if (this.unlocked) this.startTrack();
    } catch { this.unavailable = true; }
    this.onChange();
  }
  visibility(hidden: boolean): void {
    if (!this.context || !this.unlocked) return;
    if (hidden) void this.context.suspend().catch(() => {});
    else void this.unlock();
  }
  setTrack(track: Track): void { this.track = track; if (this.unlocked) this.startTrack(); }
  play(effect: Effect): void {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running' || this.settings.muted || this.settings.effects === 0 || document.hidden || this.voices >= 6) return;
    if (ctx.currentTime - (this.last.get(effect) ?? -1) < .08) return;
    this.last.set(effect, ctx.currentTime);
    const source = ctx.createBufferSource(); source.buffer = this.buffer(effect, () => synthesizeEffect(effect));
    source.connect(this.effects!); this.voices++;
    source.onended = () => { source.disconnect(); this.voices--; };
    source.start();
  }
  private applyVolumes(): void {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.music!.gain.setTargetAtTime(this.settings.muted ? 0 : this.settings.music, now, .025);
    this.effects!.gain.setTargetAtTime(this.settings.muted ? 0 : this.settings.effects, now, .025);
  }
  private buffer(key: string, generate: () => Float32Array): AudioBuffer {
    let buffer = this.buffers.get(key);
    if (!buffer) {
      const samples = generate(); buffer = this.context!.createBuffer(1, samples.length, SAMPLE_RATE);
      buffer.getChannelData(0).set(samples); this.buffers.set(key, buffer);
    }
    return buffer;
  }
  private startTrack(): void {
    if (!this.context || this.loop?.track === this.track) return;
    const ctx = this.context, now = ctx.currentTime;
    if (this.loop) {
      const old = this.loop;
      old.gain.gain.cancelAndHoldAtTime(now); old.gain.gain.linearRampToValueAtTime(0, now + .6);
      old.source.stop(now + .65);
      old.source.onended = () => { old.source.disconnect(); old.gain.disconnect(); };
    }
    const source = ctx.createBufferSource(), gain = ctx.createGain();
    source.buffer = this.buffer(this.track, () => synthesizeMusic(this.track)); source.loop = true;
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(1, now + .6);
    source.connect(gain); gain.connect(this.music!); source.start();
    this.loop = { source, gain, track: this.track };
  }
}
export const reefAudio = new ReefAudio();

export function mountAudioControls(): void {
  reefAudio.load();
  const panel = document.createElement('details'); panel.className = 'audio-settings';
  panel.innerHTML = `<summary>Sound</summary><div class="audio-controls"><p role="status"></p><button type="button" data-enable>Enable audio</button><label><input type="checkbox" data-mute> Mute all sound</label><label>Music <input type="range" min="0" max="100" step="1" data-music><output></output></label><label>Effects <input type="range" min="0" max="100" step="1" data-effects><output></output></label><button type="button" data-test>Test sound</button></div>`;
  document.querySelector('.app-shell')!.prepend(panel);
  const mute = panel.querySelector<HTMLInputElement>('[data-mute]')!;
  const sliders = (['music', 'effects'] as const).map(key => ({ key, input: panel.querySelector<HTMLInputElement>(`[data-${key}]`)! }));
  const refresh = () => {
    panel.querySelector('p')!.textContent = reefAudio.status;
    panel.querySelector<HTMLButtonElement>('[data-enable]')!.hidden = reefAudio.enabled;
    mute.checked = reefAudio.settings.muted;
    for (const { key, input } of sliders) { input.value = String(Math.round(reefAudio.settings[key] * 100)); input.nextElementSibling!.textContent = input.value + '%'; }
  };
  reefAudio.onChange = refresh; refresh();
  mute.onchange = () => reefAudio.update({ ...reefAudio.settings, muted: mute.checked });
  for (const { key, input } of sliders) input.oninput = () => reefAudio.update({ ...reefAudio.settings, [key]: Number(input.value) / 100 });
  panel.querySelector<HTMLButtonElement>('[data-enable]')!.onclick = () => { void reefAudio.unlock(); };
  panel.querySelector<HTMLButtonElement>('[data-test]')!.onclick = async () => { await reefAudio.unlock(); reefAudio.play('reward'); };
  document.addEventListener('pointerdown', () => { if (!document.hidden) void reefAudio.unlock(); }, { capture: true });
  document.addEventListener('keydown', event => { if (!event.repeat && ['Enter', ' ', 'ArrowLeft', 'ArrowRight'].includes(event.key)) void reefAudio.unlock(); }, { capture: true });
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('button:not(:disabled), a') : null;
    if (target && !panel.contains(target)) reefAudio.play('select');
  });
  document.addEventListener('visibilitychange', () => reefAudio.visibility(document.hidden));
}
