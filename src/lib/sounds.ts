/**
 * Sound Effects for CodeVerse
 * ---------------------------
 * Uses Web Audio API to generate sounds programmatically.
 * No external audio files needed!
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// Check if sounds are enabled (persisted)
export function areSoundsEnabled(): boolean {
  return localStorage.getItem("cv.sounds") !== "0";
}

export function toggleSounds(): boolean {
  const current = areSoundsEnabled();
  localStorage.setItem("cv.sounds", current ? "0" : "1");
  return !current;
}

// Granular sound controls
export function isTypingSoundEnabled(): boolean {
  return areSoundsEnabled() && localStorage.getItem("cv.sounds.typing") !== "0";
}

export function isRunSoundEnabled(): boolean {
  return areSoundsEnabled() && localStorage.getItem("cv.sounds.run") !== "0";
}

export function isResultSoundEnabled(): boolean {
  return areSoundsEnabled() && localStorage.getItem("cv.sounds.result") !== "0";
}

/* ================= TYPING SOUND ================= */
// Mechanical keyboard "thock" sound

export function playTypeSound() {
  if (!isTypingSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Main "thock" oscillator - lower frequency for mechanical feel
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    // Lower frequency (800-1200Hz) for that mechanical keyboard "thock"
    const baseFreq = 900 + Math.random() * 200;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.05);

    // Louder envelope with quick attack and decay
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(0.18, now + 0.005); // Quick attack
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06); // Quick decay

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);

    // Secondary "click" oscillator for the initial impact
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();

    clickOsc.type = "square";
    clickOsc.frequency.setValueAtTime(1200 + Math.random() * 300, now);
    clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

    clickGain.gain.setValueAtTime(0.12, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.025);

    // Noise burst for the "clack" texture - LOUDER
    const bufferSize = ctx.sampleRate * 0.03;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // More aggressive noise profile
      const t = i / bufferSize;
      noiseData[i] = (Math.random() * 2 - 1) * (1 - t * 0.7);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1500;
    noiseFilter.Q.value = 0.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.03);

    // Add subtle bass resonance for depth
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();

    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(150 + Math.random() * 50, now);

    bassGain.gain.setValueAtTime(0.08, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.08);
  } catch {
    // Silently fail - audio is non-critical
  }
}

/* ================= ENTER KEY SOUND ================= */
// Deeper mechanical "thock" for Enter key

export function playEnterSound() {
  if (!isTypingSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Main thock - deeper than regular typing
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(700 + Math.random() * 100, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    // Louder noise burst for the bigger key
    const bufferSize = ctx.sampleRate * 0.04;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      noiseData[i] = (Math.random() * 2 - 1) * (1 - t * 0.6);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value = 0.7;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.04);

    // Extra bass for the spacebar/enter feel
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();

    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(120, now);

    bassGain.gain.setValueAtTime(0.12, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.12);
  } catch {
    // Silently fail
  }
}

/* ================= RUN BUTTON TENSION SOUND ================= */
// Rising pitch + drumroll effect for dramatic tension - LOUDER

export function playRunSound() {
  if (!isRunSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const duration = 0.6;

    // 1. Rising pitch sweep (tension builder) - LOUDER
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.type = "sawtooth";
    sweep.frequency.setValueAtTime(200, now);
    sweep.frequency.exponentialRampToValueAtTime(1200, now + duration);
    sweepGain.gain.setValueAtTime(0, now);
    sweepGain.gain.linearRampToValueAtTime(0.12, now + 0.1); // Doubled
    sweepGain.gain.linearRampToValueAtTime(0.2, now + duration * 0.8); // Doubled
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    sweep.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    sweep.start(now);
    sweep.stop(now + duration);

    // 2. Drumroll - rapid clicks getting faster - LOUDER
    const clickCount = 12;
    for (let i = 0; i < clickCount; i++) {
      const t = now + (i / clickCount) * duration * 0.85;
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = "square";
      clickOsc.frequency.value = 150 + i * 30;
      const vol = 0.08 + (i / clickCount) * 0.12; // Doubled
      clickGain.gain.setValueAtTime(vol, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(t);
      clickOsc.stop(t + 0.03);
    }

    // 3. Final "launch" impact - LOUDER
    const impactTime = now + duration;
    const impact = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impact.type = "sine";
    impact.frequency.setValueAtTime(800, impactTime);
    impact.frequency.exponentialRampToValueAtTime(100, impactTime + 0.15);
    impactGain.gain.setValueAtTime(0.3, impactTime); // Increased
    impactGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.2);
    impact.connect(impactGain);
    impactGain.connect(ctx.destination);
    impact.start(impactTime);
    impact.stop(impactTime + 0.2);

    // 4. Noise burst for "whoosh" - LOUDER
    const noiseLen = ctx.sampleRate * 0.15;
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, impactTime); // Doubled
    noiseGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.15);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1000;
    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSrc.start(impactTime);
    noiseSrc.stop(impactTime + 0.15);
  } catch {
    // Silently fail
  }
}

/* ================= SUCCESS SOUND ================= */
// Pleasant chime when code runs successfully - LOUDER

export function playSuccessSound() {
  if (!isResultSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.08;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02); // Much louder
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch {
    // Silently fail
  }
}

/* ================= ERROR SOUND ================= */
// Low buzz for errors - LOUDER

export function playErrorSound() {
  if (!isResultSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.3);
    gain.gain.setValueAtTime(0.15, now); // Much louder
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Silently fail
  }
}
