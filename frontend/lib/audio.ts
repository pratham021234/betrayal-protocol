/**
 * Procedural Web Audio API Sound Synthesizer & Haptic Engine
 * Inspired by Squid Game, Black Mirror, and Tron aesthetics.
 * Zero external audio assets required.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public triggerHaptic(pattern: number | number[] = 40) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore devices that block vibrate without interaction
      }
    }
  }

  public playClick() {
    if (!this.enabled) return;
    this.triggerHaptic(15);
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  public playShieldSelect() {
    if (!this.enabled) return;
    this.triggerHaptic([20, 30, 20]);
    const ctx = this.getContext();
    if (!ctx) return;

    // Harmonic Squid Game ethereal chime
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    });
  }

  public playBreachSelect() {
    if (!this.enabled) return;
    this.triggerHaptic(60);
    const ctx = this.getContext();
    if (!ctx) return;

    // Aggressive Tron laser saw + sub bass
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    sub.type = "triangle";

    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25);

    sub.frequency.setValueAtTime(110, ctx.currentTime);
    sub.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    sub.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    sub.start();
    osc.stop(ctx.currentTime + 0.25);
    sub.stop(ctx.currentTime + 0.25);
  }

  public playLockIn() {
    if (!this.enabled) return;
    this.triggerHaptic([40, 50, 70]);
    const ctx = this.getContext();
    if (!ctx) return;

    // Heavy mechanical solenoid punch + confirmation ping
    const punch = ctx.createOscillator();
    const ping = ctx.createOscillator();
    const gainPunch = ctx.createGain();
    const gainPing = ctx.createGain();

    punch.type = "square";
    punch.frequency.setValueAtTime(150, ctx.currentTime);
    punch.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);

    gainPunch.gain.setValueAtTime(0.25, ctx.currentTime);
    gainPunch.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    ping.type = "sine";
    ping.frequency.setValueAtTime(880, ctx.currentTime);
    gainPing.gain.setValueAtTime(0.15, ctx.currentTime + 0.05);
    gainPing.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    punch.connect(gainPunch);
    gainPunch.connect(ctx.destination);
    ping.connect(gainPing);
    gainPing.connect(ctx.destination);

    punch.start();
    punch.stop(ctx.currentTime + 0.12);
    ping.start(ctx.currentTime + 0.05);
    ping.stop(ctx.currentTime + 0.3);
  }

  public playHeartbeat() {
    if (!this.enabled) return;
    this.triggerHaptic([50, 60, 40]);
    const ctx = this.getContext();
    if (!ctx) return;

    // Dual-tone ominous heartbeat
    [0, 0.12].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(idx === 0 ? 80 : 65, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + delay + 0.1);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.1);
    });
  }

  public playTick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  }

  public playRoundSting() {
    if (!this.enabled) return;
    this.triggerHaptic([30, 40, 80]);
    const ctx = this.getContext();
    if (!ctx) return;

    // Dramatic cinematic riser into sub impact
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  }

  public playCoinShower() {
    if (!this.enabled) return;
    this.triggerHaptic([30, 30, 30, 30]);
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.enabled) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      }, idx * 55);
    });
  }

  public playAlarm() {
    if (!this.enabled) return;
    this.triggerHaptic([80, 50, 80, 50, 120]);
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  public playVictoryFanfare() {
    if (!this.enabled) return;
    this.triggerHaptic([50, 50, 100, 150]);
    const ctx = this.getContext();
    if (!ctx) return;

    const arpeggio = [440, 554.37, 659.25, 880, 1108.73];
    arpeggio.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.enabled) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }, idx * 110);
    });
  }
}

export const sound = new SoundEngine();
