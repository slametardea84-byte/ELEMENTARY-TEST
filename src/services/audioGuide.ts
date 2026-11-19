export const WELCOME_VOICE_TEXT =
  'Selamat datang di EduCity 3D Bahasa Inggris SMP! Jelajahi kota belajar interaktif, taklukkan 5 gedung bab materi, kumpulkan objek 3D di setiap ruangan, dan uji ketangkasanmu di Arena Duel 1 lawan 1!';

class AudioGuideEngine {
  private ctx: AudioContext | null = null;
  private bgmTimer: number | null = null;
  private bgmEnabled = true;
  private voiceEnabled = true;
  private stepIdx = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlockAndStartMusic(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (this.bgmEnabled && this.bgmTimer === null) {
      this.startAmbientAdventureLoop();
    }
  }

  public setMusicEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    if (enabled) {
      this.ensureContext();
      if (this.bgmTimer === null) {
        this.startAmbientAdventureLoop();
      }
    } else if (this.bgmTimer !== null) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isMusicEnabled(): boolean {
    return this.bgmEnabled;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  private playTone(freq: number, duration: number, type: OscillatorType, volume: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private startAmbientAdventureLoop(): void {
    // Cheerful, gentle pentatonic educational adventure progression (C major / A minor)
    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 440.0, 523.25];
    const bass = [261.63, 261.63, 196.0, 196.0, 220.0, 220.0, 174.61, 196.0];
    this.bgmTimer = window.setInterval(() => {
      if (!this.bgmEnabled || !this.ctx || this.ctx.state !== 'running') return;
      const idx = this.stepIdx % melody.length;
      this.playTone(melody[idx], 0.45, 'triangle', 0.028);
      if (idx % 2 === 0) {
        this.playTone(bass[idx], 0.85, 'sine', 0.025);
      }
      this.stepIdx += 1;
    }, 520);
  }

  public playJumpSfx(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.14);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playCorrectSfx(): void {
    this.playTone(523.25, 0.14, 'triangle', 0.08);
    window.setTimeout(() => this.playTone(659.25, 0.16, 'triangle', 0.08), 90);
    window.setTimeout(() => this.playTone(783.99, 0.25, 'triangle', 0.09), 180);
  }

  public playWrongSfx(): void {
    this.playTone(220, 0.18, 'sawtooth', 0.05);
    window.setTimeout(() => this.playTone(175, 0.24, 'sawtooth', 0.05), 140);
  }

  public playPortalSfx(): void {
    this.playTone(392, 0.15, 'sine', 0.07);
    window.setTimeout(() => this.playTone(587.33, 0.22, 'sine', 0.07), 90);
  }

  public speak(text: string, lang: 'id-ID' | 'en-US' = 'id-ID'): void {
    if (!this.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = 1.02;
      utter.pitch = 1.03;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
      if (preferred) {
        utter.voice = preferred;
      }
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore browser autoplay restrictions silently
    }
  }
}

export const audioGuide = new AudioGuideEngine();
