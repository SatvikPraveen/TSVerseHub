// File: src/assets/sounds/index.ts

/**
 * Sound System for TSVerseHub
 * Manages audio feedback for user interactions
 */

export interface SoundConfig {
  volume: number;
  enabled: boolean;
  preload: boolean;
}

export interface SoundAsset {
  name: string;
  url: string;
  audio?: HTMLAudioElement;
  loaded: boolean;
}

class SoundManager {
  private sounds: Map<string, SoundAsset> = new Map();
  private config: SoundConfig = {
    volume: 0.5,
    enabled: true,
    preload: true
  };

  constructor() {
    this.initializeSounds();
    this.loadUserPreferences();
  }

  private initializeSounds(): void {
    const soundAssets: Omit<SoundAsset, 'loaded' | 'audio'>[] = [
      { name: 'click', url: '/src/assets/sounds/click.wav' },
      { name: 'success', url: '/src/assets/sounds/success.mp3' },
      { name: 'error', url: '/src/assets/sounds/error.mp3' },
      { name: 'notification', url: '/src/assets/sounds/notification.mp3' },
      { name: 'completion', url: '/src/assets/sounds/completion.mp3' },
      { name: 'typing', url: '/src/assets/sounds/typing.wav' },
      { name: 'unlock', url: '/src/assets/sounds/unlock.mp3' }
    ];

    soundAssets.forEach(sound => {
      this.sounds.set(sound.name, { ...sound, loaded: false });
    });

    if (this.config.preload) {
      this.preloadSounds();
    }
  }

  private async preloadSounds(): Promise<void> {
    const loadPromises = Array.from(this.sounds.values()).map(sound => 
      this.loadSound(sound.name)
    );

    try {
      await Promise.all(loadPromises);
      console.log('All sounds preloaded successfully');
    } catch (error) {
      console.warn('Some sounds failed to preload:', error);
    }
  }

  private async loadSound(name: string): Promise<void> {
    const sound = this.sounds.get(name);
    if (!sound || sound.loaded) return;

    return new Promise((resolve, reject) => {
      const audio = new Audio(sound.url);
      audio.volume = this.config.volume;
      
      audio.addEventListener('canplaythrough', () => {
        sound.audio = audio;
        sound.loaded = true;
        resolve();
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.warn(`Failed to load sound: ${name}`, e);
        reject(e);
      }, { once: true });

      audio.load();
    });
  }

  private loadUserPreferences(): void {
    try {
      const stored = localStorage.getItem('tsversehub-sound-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load sound preferences:', error);
    }
  }

  private saveUserPreferences(): void {
    try {
      localStorage.setItem('tsversehub-sound-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save sound preferences:', error);
    }
  }

  public async play(soundName: string, options?: { volume?: number; loop?: boolean }): Promise<void> {
    if (!this.config.enabled) return;

    const sound = this.sounds.get(soundName);
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    if (!sound.loaded) {
      await this.loadSound(soundName);
    }

    if (!sound.audio) {
      console.warn(`Audio element not available for: ${soundName}`);
      return;
    }

    try {
      // Reset audio to beginning
      sound.audio.currentTime = 0;
      
      // Apply options
      if (options?.volume !== undefined) {
        sound.audio.volume = Math.max(0, Math.min(1, options.volume));
      } else {
        sound.audio.volume = this.config.volume;
      }
      
      if (options?.loop !== undefined) {
        sound.audio.loop = options.loop;
      }

      // Play with user gesture handling
      const playPromise = sound.audio.play();
      if (playPromise) {
        await playPromise;
      }
    } catch (error) {
      // Handle autoplay restrictions gracefully
      if ((error as Error).name === 'NotAllowedError') {
        console.log('Audio play blocked by browser policy');
      } else {
        console.warn(`Failed to play sound: ${soundName}`, error);
      }
    }
  }

  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    
    // Update all loaded audio elements
    this.sounds.forEach(sound => {
      if (sound.audio) {
        sound.audio.volume = this.config.volume;
      }
    });
    
    this.saveUserPreferences();
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveUserPreferences();
  }

  public getConfig(): SoundConfig {
    return { ...this.config };
  }

  public isLoaded(soundName: string): boolean {
    const sound = this.sounds.get(soundName);
    return sound ? sound.loaded : false;
  }

  public getLoadedSounds(): string[] {
    return Array.from(this.sounds.entries())
      .filter(([, sound]) => sound.loaded)
      .map(([name]) => name);
  }

  // Convenience methods for common sounds
  public playClick(): Promise<void> {
    return this.play('click', { volume: 0.3 });
  }

  public playSuccess(): Promise<void> {
    return this.play('success', { volume: 0.6 });
  }

  public playError(): Promise<void> {
    return this.play('error', { volume: 0.5 });
  }

  public playNotification(): Promise<void> {
    return this.play('notification', { volume: 0.4 });
  }

  public playCompletion(): Promise<void> {
    return this.play('completion', { volume: 0.7 });
  }

  public playTyping(): Promise<void> {
    return this.play('typing', { volume: 0.2 });
  }

  public playUnlock(): Promise<void> {
    return this.play('unlock', { volume: 0.8 });
  }
}

// Create and export singleton instance
export const soundManager = new SoundManager();

// React hook for sound management
import { useState, useEffect } from 'react';

export const useSound = () => {
  const [config, setConfig] = useState<SoundConfig>(soundManager.getConfig());

  useEffect(() => {
    // Update local state when config changes
    setConfig(soundManager.getConfig());
  }, []);

  const updateVolume = (volume: number) => {
    soundManager.setVolume(volume);
    setConfig(soundManager.getConfig());
  };

  const updateEnabled = (enabled: boolean) => {
    soundManager.setEnabled(enabled);
    setConfig(soundManager.getConfig());
  };

  return {
    config,
    play: soundManager.play.bind(soundManager),
    playClick: soundManager.playClick.bind(soundManager),
    playSuccess: soundManager.playSuccess.bind(soundManager),
    playError: soundManager.playError.bind(soundManager),
    playNotification: soundManager.playNotification.bind(soundManager),
    playCompletion: soundManager.playCompletion.bind(soundManager),
    playTyping: soundManager.playTyping.bind(soundManager),
    playUnlock: soundManager.playUnlock.bind(soundManager),
    setVolume: updateVolume,
    setEnabled: updateEnabled,
    isLoaded: soundManager.isLoaded.bind(soundManager),
    getLoadedSounds: soundManager.getLoadedSounds.bind(soundManager)
  };
};

export default soundManager;