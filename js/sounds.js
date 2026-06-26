const SoundEffects = {
  ctx: null,
  enabled: true,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {}
  },

  _ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  play(type) {
    if (!this.enabled) return;
    this._ensureContext();
    if (!this.ctx) return;

    switch (type) {
      case 'correct': this._beep(523.25, 0.15, 'sine', 0.3); setTimeout(() => this._beep(659.25, 0.15, 'sine', 0.3), 120); setTimeout(() => this._beep(783.99, 0.2, 'sine', 0.3), 240); break;
      case 'wrong': this._beep(200, 0.2, 'sawtooth', 0.2); setTimeout(() => this._beep(160, 0.25, 'sawtooth', 0.2), 200); break;
      case 'perfect': this._beep(523.25, 0.1, 'sine', 0.3); setTimeout(() => this._beep(659.25, 0.1, 'sine', 0.3), 100); setTimeout(() => this._beep(783.99, 0.1, 'sine', 0.3), 200); setTimeout(() => this._beep(1046.5, 0.3, 'sine', 0.4), 300); break;
      case 'click': this._beep(800, 0.05, 'sine', 0.15); break;
      case 'levelup': this._beep(392, 0.15, 'sine', 0.3); setTimeout(() => this._beep(523.25, 0.15, 'sine', 0.3), 150); setTimeout(() => this._beep(659.25, 0.15, 'sine', 0.3), 300); setTimeout(() => this._beep(783.99, 0.25, 'sine', 0.4), 450); break;
      case 'star': this._beep(880, 0.08, 'sine', 0.2); setTimeout(() => this._beep(1108.73, 0.08, 'sine', 0.2), 80); break;
      case 'confetti': for (let i = 0; i < 5; i++) { setTimeout(() => this._beep(400 + Math.random() * 600, 0.08, 'sine', 0.15), i * 60); } break;
      case 'bubble': this._beep(300 + Math.random() * 400, 0.06, 'sine', 0.1); break;
    }
  },

  _beep(freq, dur, type, vol) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + dur);
    } catch (_) {}
  }
};
