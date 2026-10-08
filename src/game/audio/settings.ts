export interface AudioSettings { muted: boolean; music: number; effects: number }
export const DEFAULT_AUDIO: AudioSettings = { muted: false, music: .35, effects: .65 };
export function readAudioSettings(raw: string | null): AudioSettings {
  try {
    const value = JSON.parse(raw ?? '{}');
    const volume = (key: 'music' | 'effects') => typeof value?.[key] === 'number' && Number.isFinite(value[key]) ? Math.max(0, Math.min(1, value[key])) : DEFAULT_AUDIO[key];
    return { muted: typeof value?.muted === 'boolean' ? value.muted : false, music: volume('music'), effects: volume('effects') };
  } catch { return { ...DEFAULT_AUDIO }; }
}
