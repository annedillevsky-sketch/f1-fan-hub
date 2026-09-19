/**
 * Web Audio API synthesizer for F1 timing chimes, 5-red-lights sequence,
 * engine revs, pneumatic DRS actuation, wheel guns, and team radio transmissions.
 * Safe, low-latency, and runs entirely in-browser without external asset files.
 */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play F1 5-red-lights start sequence chime or lights-out sound
 */
export function playLightsOutChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // 5 progressive beeps followed by the low go tone
  for (let i = 0; i < 5; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now + i * 0.25); // 880 Hz beep
    gain.gain.setValueAtTime(0, now + i * 0.25);
    gain.gain.linearRampToValueAtTime(0.15, now + i * 0.25 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.25);
    osc.stop(now + i * 0.25 + 0.18);
  }

  // Lights out tone
  const endBeep = ctx.createOscillator();
  const endGain = ctx.createGain();
  endBeep.type = 'triangle';
  endBeep.frequency.setValueAtTime(440, now + 1.5);
  endGain.gain.setValueAtTime(0, now + 1.5);
  endGain.gain.linearRampToValueAtTime(0.25, now + 1.52);
  endGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

  endBeep.connect(endGain);
  endGain.connect(ctx.destination);
  endBeep.start(now + 1.5);
  endBeep.stop(now + 1.95);
}

/**
 * Team radio opening chirp tone
 */
export function playTeamRadioChirp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(1900, now + 0.08);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
}

/**
 * High priority alert chime (Safety Car / Podium)
 */
export function playAlertChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [659.25, 880, 1046.5]; // E5, A5, C6 arpeggio

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.1);

    gain.gain.setValueAtTime(0, now + idx * 0.1);
    gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.1);
    osc.stop(now + idx * 0.1 + 0.28);
  });
}

/**
 * DRS Wing pneumatic actuator sound:
 * Realistic high-pressure hydraulic solenoid click followed by airflow whoosh.
 */
export function playDrsToggleSound(isOpen: boolean) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (isOpen) {
    // Solenoid click
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(1800, now);
    click.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    clickGain.gain.setValueAtTime(0.18, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.06);

    // High pressure air release hiss
    const bufferSize = ctx.sampleRate * 0.25;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.25);
    filter.Q.setValueAtTime(3.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now + 0.01);
    whiteNoise.stop(now + 0.26);
  } else {
    // Mechanical slam / lock shut
    const slam = ctx.createOscillator();
    const slamGain = ctx.createGain();
    slam.type = 'triangle';
    slam.frequency.setValueAtTime(350, now);
    slam.frequency.exponentialRampToValueAtTime(80, now + 0.07);
    slamGain.gain.setValueAtTime(0.25, now);
    slamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    slam.connect(slamGain);
    slamGain.connect(ctx.destination);
    slam.start(now);
    slam.stop(now + 0.1);
  }
}

/**
 * 1.6L V6 Turbo-Hybrid Engine Rev sound synthesizer:
 * Generates harmonic pulses with turbocharger spool whistle and throttle revs.
 */
export function playEngineRevSound(style: 'rev' | 'flyby' | 'idle' = 'rev') {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = style === 'rev' ? 1.4 : style === 'flyby' ? 2.0 : 0.8;

  // Master gain
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.01, now);
  master.gain.linearRampToValueAtTime(0.16, now + 0.15);
  master.gain.exponentialRampToValueAtTime(0.001, now + duration);
  master.connect(ctx.destination);

  // V6 Cylinder firing oscillator (3 harmonics)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();

  osc1.type = 'sawtooth';
  osc2.type = 'triangle';
  osc3.type = 'sawtooth';

  if (style === 'rev') {
    // Idle 160Hz -> Rev up to 480Hz -> Overrun blip down
    osc1.frequency.setValueAtTime(160, now);
    osc1.frequency.exponentialRampToValueAtTime(460, now + 0.55);
    osc1.frequency.exponentialRampToValueAtTime(520, now + 0.75);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 1.35);

    osc2.frequency.setValueAtTime(320, now);
    osc2.frequency.exponentialRampToValueAtTime(920, now + 0.55);
    osc2.frequency.exponentialRampToValueAtTime(1040, now + 0.75);
    osc2.frequency.exponentialRampToValueAtTime(440, now + 1.35);

    osc3.frequency.setValueAtTime(80, now);
    osc3.frequency.exponentialRampToValueAtTime(230, now + 0.55);
    osc3.frequency.exponentialRampToValueAtTime(110, now + 1.35);
  } else if (style === 'flyby') {
    // Doppler effect pitch shift
    osc1.frequency.setValueAtTime(620, now);
    osc1.frequency.linearRampToValueAtTime(580, now + 0.8);
    osc1.frequency.exponentialRampToValueAtTime(260, now + 1.4);

    osc2.frequency.setValueAtTime(1240, now);
    osc2.frequency.exponentialRampToValueAtTime(520, now + 1.4);

    osc3.frequency.setValueAtTime(310, now);
    osc3.frequency.exponentialRampToValueAtTime(130, now + 1.4);
  } else {
    // Low idle rumble
    osc1.frequency.setValueAtTime(140, now);
    osc2.frequency.setValueAtTime(280, now);
    osc3.frequency.setValueAtTime(70, now);
  }

  // Low pass filter for engine body
  const engineFilter = ctx.createBiquadFilter();
  engineFilter.type = 'lowpass';
  engineFilter.frequency.setValueAtTime(1800, now);
  engineFilter.frequency.exponentialRampToValueAtTime(3600, now + 0.6);
  engineFilter.frequency.exponentialRampToValueAtTime(1200, now + duration);

  osc1.connect(engineFilter);
  osc2.connect(engineFilter);
  osc3.connect(engineFilter);
  engineFilter.connect(master);

  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  osc1.stop(now + duration + 0.05);
  osc2.stop(now + duration + 0.05);
  osc3.stop(now + duration + 0.05);

  // High pitch turbocharger spool whine (MGU-H)
  const turboOsc = ctx.createOscillator();
  const turboGain = ctx.createGain();
  turboOsc.type = 'sine';
  turboOsc.frequency.setValueAtTime(1800, now);
  turboOsc.frequency.exponentialRampToValueAtTime(3800, now + 0.6);
  turboOsc.frequency.exponentialRampToValueAtTime(1400, now + duration);

  turboGain.gain.setValueAtTime(0.01, now);
  turboGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
  turboGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  turboOsc.connect(turboGain);
  turboGain.connect(master);
  turboOsc.start(now);
  turboOsc.stop(now + duration + 0.05);
}

/**
 * High-speed pneumatic pit stop wheel gun impact chatter & torque lock
 */
export function playWheelGunSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // 6 rapid pulses of pneumatic impact
  for (let i = 0; i < 7; i++) {
    const pulseTime = now + i * 0.035;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900 + (i % 2) * 200, pulseTime);
    osc.frequency.exponentialRampToValueAtTime(150, pulseTime + 0.025);

    gain.gain.setValueAtTime(0.12, pulseTime);
    gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.028);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(pulseTime);
    osc.stop(pulseTime + 0.03);
  }

  // Final torque clack
  const finalClack = ctx.createOscillator();
  const clackGain = ctx.createGain();
  finalClack.type = 'triangle';
  finalClack.frequency.setValueAtTime(450, now + 0.28);
  finalClack.frequency.exponentialRampToValueAtTime(80, now + 0.35);
  clackGain.gain.setValueAtTime(0.2, now + 0.28);
  clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
  finalClack.connect(clackGain);
  clackGain.connect(ctx.destination);
  finalClack.start(now + 0.28);
  finalClack.stop(now + 0.38);
}

/**
 * Pit Stop Complete: Car Jack Drop sound
 */
export function playJackDropSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const thud = ctx.createOscillator();
  const gain = ctx.createGain();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(120, now);
  thud.frequency.exponentialRampToValueAtTime(35, now + 0.15);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  thud.connect(gain);
  gain.connect(ctx.destination);
  thud.start(now);
  thud.stop(now + 0.2);
}

/**
 * Play authentic F1 Team Radio transmission:
 * Preamble dual-beep + radio squelch static + spoken transmission (or simulated voice modulation) + tail beep.
 */
export function playTeamRadioTransmission(quote: string, driverName?: string) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Dual-tone radio activation beep
  const tone1 = ctx.createOscillator();
  const tone2 = ctx.createOscillator();
  const beepGain = ctx.createGain();

  tone1.type = 'sine';
  tone2.type = 'sine';
  tone1.frequency.setValueAtTime(1209, now);
  tone2.frequency.setValueAtTime(1633, now);

  beepGain.gain.setValueAtTime(0, now);
  beepGain.gain.linearRampToValueAtTime(0.12, now + 0.01);
  beepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  tone1.connect(beepGain);
  tone2.connect(beepGain);
  beepGain.connect(ctx.destination);

  tone1.start(now);
  tone2.start(now);
  tone1.stop(now + 0.13);
  tone2.stop(now + 0.13);

  // 2. Radio squelch static burst
  const bufferSize = Math.floor(ctx.sampleRate * 0.18);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const staticSource = ctx.createBufferSource();
  staticSource.buffer = noiseBuffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(1600, now + 0.1);
  bandpass.Q.setValueAtTime(4.0, now + 0.1);

  const staticGain = ctx.createGain();
  staticGain.gain.setValueAtTime(0.06, now + 0.1);
  staticGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  staticSource.connect(bandpass);
  bandpass.connect(staticGain);
  staticGain.connect(ctx.destination);
  staticSource.start(now + 0.1);
  staticSource.stop(now + 0.29);

  // 3. Web Speech Synthesis if available
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel(); // Stop any pending utterances
      setTimeout(() => {
        const cleanQuote = quote.replace(/["“”]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanQuote);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.volume = 0.85;

        // Try to pick an English voice
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Guy')));
        if (enVoice) {
          utterance.voice = enVoice;
        }

        utterance.onend = () => {
          // Play tail squelch chirp
          playTeamRadioChirp();
        };

        window.speechSynthesis.speak(utterance);
      }, 160);
    } catch {
      // Audio speech fallback
    }
  }
}

