import { Howl } from 'howler';

/**
 * There is no sound library to license or fetch here. Every effect is
 * synthesized once, client-side, with an OfflineAudioContext, then handed to
 * Howler as a tiny in-memory WAV. Total payload is a few KB of generated PCM
 * instead of hundreds of KB of shipped audio files, and there is nothing to
 * download before the first sound can play.
 */

type SynthResult = { buffer: AudioBuffer; blobUrl: string };

function bufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, length - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length - 44, true);

  let offset = 44;
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channels.push(buffer.getChannelData(ch));
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

async function synth(duration: number, build: (ctx: OfflineAudioContext) => void): Promise<SynthResult> {
  const sampleRate = 44100;
  const ctx = new OfflineAudioContext(1, Math.ceil(sampleRate * duration), sampleRate);
  build(ctx);
  const buffer = await ctx.startRendering();
  const blob = bufferToWav(buffer);
  return { buffer, blobUrl: URL.createObjectURL(blob) };
}

function noiseBuffer(ctx: OfflineAudioContext, duration: number) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

async function synthDoorSlide() {
  return synth(1.4, (ctx) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 1.4);
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(300, 0);
    band.frequency.linearRampToValueAtTime(900, 0.7);
    band.frequency.linearRampToValueAtTime(200, 1.4);
    band.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, 0);
    gain.gain.linearRampToValueAtTime(0.5, 0.15);
    gain.gain.linearRampToValueAtTime(0.35, 1.0);
    gain.gain.exponentialRampToValueAtTime(0.0001, 1.4);
    src.connect(band).connect(gain).connect(ctx.destination);
    src.start(0);
  });
}

async function synthClick() {
  return synth(0.16, (ctx) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, 0);
    osc.frequency.exponentialRampToValueAtTime(600, 0.05);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, 0);
    gain.gain.exponentialRampToValueAtTime(0.0001, 0.09);
    osc.connect(gain).connect(ctx.destination);
    osc.start(0);
    osc.stop(0.1);

    const beep = ctx.createOscillator();
    beep.type = 'sine';
    beep.frequency.value = 1800;
    const beepGain = ctx.createGain();
    beepGain.gain.setValueAtTime(0.0001, 0.03);
    beepGain.gain.linearRampToValueAtTime(0.12, 0.05);
    beepGain.gain.exponentialRampToValueAtTime(0.0001, 0.16);
    beep.connect(beepGain).connect(ctx.destination);
    beep.start(0.03);
    beep.stop(0.16);
  });
}

async function synthHum(duration = 3) {
  return synth(duration, (ctx) => {
    const master = ctx.createGain();
    master.gain.value = 0.06;
    master.connect(ctx.destination);
    [55, 82.4].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = i === 0 ? 1 : 0.4;
      osc.connect(gain).connect(master);
      osc.start(0);
      osc.stop(duration);
    });
  });
}

async function synthRumble(duration = 2.5) {
  return synth(duration, (ctx) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, duration);
    src.loop = false;
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 180;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, 0);
    gain.gain.linearRampToValueAtTime(0.3, 0.3);
    gain.gain.setValueAtTime(0.3, duration - 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, duration);
    src.connect(low).connect(gain).connect(ctx.destination);
    src.start(0);
  });
}

async function synthDing() {
  return synth(1.6, (ctx) => {
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const start = i * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.35);
    });
  });
}

async function synthFootstep() {
  return synth(0.18, (ctx) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 0.18);
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, 0);
    gain.gain.exponentialRampToValueAtTime(0.0001, 0.16);
    src.connect(low).connect(gain).connect(ctx.destination);
    src.start(0);
  });
}

async function synthCreak() {
  return synth(0.9, (ctx) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 0.9);
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(700, 0);
    band.frequency.linearRampToValueAtTime(320, 0.9);
    band.Q.value = 6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, 0);
    gain.gain.linearRampToValueAtTime(0.22, 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, 0.9);
    src.connect(band).connect(gain).connect(ctx.destination);
    src.start(0);
  });
}

type EffectName = 'door' | 'click' | 'hum' | 'rumble' | 'ding' | 'footstep' | 'creak';

export class SoundManager {
  private howls = new Map<EffectName, Howl>();
  private urls: string[] = [];
  private ready: Promise<void> | null = null;
  private enabled = false;
  private humId: number | null = null;

  /** Synthesizes and decodes every effect once. Safe to call multiple times. */
  init() {
    if (this.ready) return this.ready;
    this.ready = (async () => {
      const [door, click, hum, rumble, ding, footstep, creak] = await Promise.all([
        synthDoorSlide(),
        synthClick(),
        synthHum(4),
        synthRumble(2.4),
        synthDing(),
        synthFootstep(),
        synthCreak(),
      ]);
      const register = (name: EffectName, result: SynthResult, loop = false) => {
        this.urls.push(result.blobUrl);
        this.howls.set(
          name,
          new Howl({ src: [result.blobUrl], format: ['wav'], loop, volume: name === 'hum' ? 0.5 : 0.8 }),
        );
      };
      register('door', door);
      register('click', click);
      register('hum', hum, true);
      register('rumble', rumble);
      register('ding', ding);
      register('footstep', footstep);
      register('creak', creak);
    })();
    return this.ready;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      this.init().then(() => {
        if (!this.enabled) return;
        const hum = this.howls.get('hum');
        if (hum && this.humId === null) this.humId = hum.play();
      });
    } else {
      const hum = this.howls.get('hum');
      if (hum && this.humId !== null) {
        hum.stop(this.humId);
        this.humId = null;
      }
    }
  }

  isEnabled() {
    return this.enabled;
  }

  private play(name: EffectName, pan = 0) {
    if (!this.enabled) return;
    const howl = this.howls.get(name);
    if (!howl) return;
    const id = howl.play();
    howl.stereo(pan, id);
  }

  playDoor() {
    this.play('door', 0);
  }
  playClick(pan = 0) {
    this.play('click', pan);
  }
  playRumble() {
    this.play('rumble', 0);
  }
  playDing() {
    this.play('ding', 0);
  }
  playFootstep(pan = 0) {
    this.play('footstep', pan);
  }
  playCreak(pan = 0) {
    this.play('creak', pan);
  }

  dispose() {
    this.setEnabled(false);
    this.howls.forEach((h) => h.unload());
    this.howls.clear();
    this.urls.forEach((u) => URL.revokeObjectURL(u));
    this.urls = [];
    this.ready = null;
  }
}
