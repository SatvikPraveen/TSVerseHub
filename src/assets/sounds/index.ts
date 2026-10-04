// File: src/assets/sounds/index.ts

/**
 * Sound system for TSVerseHub.
 *
 * Audio feedback is synthesised with the Web Audio API instead of shipped as
 * binary assets: the cues are short, the synthesis is deterministic, and the
 * bundle stays free of opaque media files. Every public method is safe to call
 * in environments without `AudioContext` (SSR, jsdom), where it is a no-op.
 */

import { useCallback, useEffect, useState } from 'react';

export interface SoundConfig {
  volume: number;
  enabled: boolean;
}

export type SoundName = 'click' | 'success' | 'error' | 'notification' | 'completion' | 'typing' | 'unlock';

interface Tone {
  /** Frequency in Hz. */
  frequency: number;
  /** Duration in seconds. */
  duration: number;
  /** Offset from the start of the cue in seconds. */
  at?: number;
  type?: OscillatorType;
}

/** Each cue is a small additive sequence of tones. */
const CUES: Readonly<Record<SoundName, readonly Tone[]>> = {
  click: [{ frequency: 880, duration: 0.03, type: 'square' }],
  typing: [{ frequency: 660, duration: 0.02, type: 'square' }],
  success: [
    { frequency: 523.25, duration: 0.09 },
    { frequency: 659.25, duration: 0.09, at: 0.09 },
    { frequency: 783.99, duration: 0.14, at: 0.18 },
  ],
  completion: [
    { frequency: 523.25, duration: 0.1 },
    { frequency: 659.25, duration: 0.1, at: 0.1 },
    { frequency: 783.99, duration: 0.1, at: 0.2 },
    { frequency: 1046.5, duration: 0.22, at: 0.3 },
  ],
  unlock: [
    { frequency: 392, duration: 0.08, type: 'triangle' },
    { frequency: 587.33, duration: 0.08, at: 0.08, type: 'triangle' },
    { frequency: 880, duration: 0.18, at: 0.16, type: 'triangle' },
  ],
  notification: [
    { frequency: 740, duration: 0.07 },
    { frequency: 988, duration: 0.12, at: 0.08 },
  ],
  error: [
    { frequency: 220, duration: 0.12, type: 'sawtooth' },
    { frequency: 174.61, duration: 0.18, at: 0.12, type: 'sawtooth' },
  ],
};

const STORAGE_KEY = 'tsversehub-sound-config';
const DEFAULT_CONFIG: SoundConfig = { volume: 0.4, enabled: true };

type AudioContextCtor = new () => AudioContext;

const resolveAudioContext = (): AudioContextCtor | undefined => {
  if (typeof window === 'undefined') return undefined;
  if (typeof AudioContext !== 'undefined') return AudioContext;
  const w = window as Window & { webkitAudioContext?: AudioContextCtor };
  return w.webkitAudioContext;
};

class SoundManager {
  private config: SoundConfig = { ...DEFAULT_CONFIG };
  private context: AudioContext | undefined;
  private readonly listeners = new Set<(config: SoundConfig) => void>();

  constructor() {
    this.loadUserPreferences();
  }

  /** Available cue names, useful for settings UIs. */
  public getSoundNames(): readonly SoundName[] {
    return Object.keys(CUES) as SoundName[];
  }

  public isSupported(): boolean {
    return resolveAudioContext() !== undefined;
  }

  public getConfig(): SoundConfig {
    return { ...this.config };
  }

  public setVolume(volume: number): void {
    this.update({ volume: Math.min(1, Math.max(0, volume)) });
  }

  public setEnabled(enabled: boolean): void {
    this.update({ enabled });
  }

  public toggle(): void {
    this.update({ enabled: !this.config.enabled });
  }

  public subscribe(listener: (config: SoundConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Play a named cue. Resolves when scheduling is done (not when audio ends). */
  public async play(name: SoundName): Promise<void> {
    if (!this.config.enabled) return;
    const context = this.getContext();
    if (!context) return;
    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch {
        return;
      }
    }
    const start = context.currentTime;
    for (const tone of CUES[name]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = tone.type ?? 'sine';
      oscillator.frequency.setValueAtTime(tone.frequency, start + (tone.at ?? 0));
      const t0 = start + (tone.at ?? 0);
      const t1 = t0 + tone.duration;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(this.config.volume, t0 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t1);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(t0);
      oscillator.stop(t1 + 0.01);
    }
  }

  public playClick(): Promise<void> {
    return this.play('click');
  }
  public playSuccess(): Promise<void> {
    return this.play('success');
  }
  public playError(): Promise<void> {
    return this.play('error');
  }
  public playNotification(): Promise<void> {
    return this.play('notification');
  }
  public playCompletion(): Promise<void> {
    return this.play('completion');
  }
  public playTyping(): Promise<void> {
    return this.play('typing');
  }
  public playUnlock(): Promise<void> {
    return this.play('unlock');
  }

  private getContext(): AudioContext | undefined {
    if (this.context) return this.context;
    const Ctor = resolveAudioContext();
    if (!Ctor) return undefined;
    try {
      this.context = new Ctor();
    } catch {
      return undefined;
    }
    return this.context;
  }

  private update(patch: Partial<SoundConfig>): void {
    this.config = { ...this.config, ...patch };
    this.saveUserPreferences();
    for (const listener of this.listeners) listener(this.getConfig());
  }

  private loadUserPreferences(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        const candidate = parsed as Partial<Record<keyof SoundConfig, unknown>>;
        this.config = {
          volume: typeof candidate.volume === 'number' ? Math.min(1, Math.max(0, candidate.volume)) : DEFAULT_CONFIG.volume,
          enabled: typeof candidate.enabled === 'boolean' ? candidate.enabled : DEFAULT_CONFIG.enabled,
        };
      }
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
  }

  private saveUserPreferences(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // Storage may be unavailable (private mode, quota); preferences are then session-only.
    }
  }
}

export const soundManager = new SoundManager();

/** React binding: current config plus stable setters. */
export const useSound = () => {
  const [config, setConfig] = useState<SoundConfig>(() => soundManager.getConfig());

  useEffect(() => soundManager.subscribe(setConfig), []);

  const setVolume = useCallback((volume: number) => soundManager.setVolume(volume), []);
  const setEnabled = useCallback((enabled: boolean) => soundManager.setEnabled(enabled), []);
  const toggle = useCallback(() => soundManager.toggle(), []);
  const play = useCallback((name: SoundName) => soundManager.play(name), []);

  return { config, setVolume, setEnabled, toggle, play, isSupported: soundManager.isSupported() };
};

export default soundManager;
