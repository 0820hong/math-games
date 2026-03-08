// BGM - Procedural background music using Web Audio API (copyright-free)

var bgmState = {
  ctx: null,
  masterGain: null,
  playing: false,
  muted: false,
  volume: 0.5,
  intervalId: null,
  beatIndex: 0,
};

function initBGM() {
  if (bgmState.ctx) return;
  bgmState.ctx = new (window.AudioContext || window.webkitAudioContext)();
  bgmState.masterGain = bgmState.ctx.createGain();
  bgmState.masterGain.gain.value = bgmState.volume;
  bgmState.masterGain.connect(bgmState.ctx.destination);
}

function playNote(freq, startTime, duration, type, gain) {
  var ctx = bgmState.ctx;
  var osc = ctx.createOscillator();
  var gainNode = ctx.createGain();

  osc.type = type || "square";
  osc.frequency.value = freq;

  gainNode.gain.setValueAtTime(gain || 0.08, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(bgmState.masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// C minor pentatonic scale
var bgmMelody = [
  261.6, 311.1, 349.2, 392.0, 466.2, // C4 Eb4 F4 G4 Bb4
  523.3, 622.3, 698.5,               // C5 Eb5 F5
];

var bgmBassline = [130.8, 155.6, 174.6, 196.0]; // C3 Eb3 F3 G3

var melodyPattern = [0, 2, 4, 5, 4, 2, 3, 1, 0, 4, 6, 7, 6, 4, 5, 3];
var bassPattern   = [0, 0, 1, 1, 2, 2, 3, 3, 0, 0, 2, 2, 3, 3, 1, 1];

function startBGM() {
  initBGM();
  // 이미 재생 중이면 먼저 정지 후 재시작
  if (bgmState.playing) {
    stopBGM();
  }
  bgmState.playing = true;
  bgmState.beatIndex = 0;

  if (bgmState.ctx.state === "suspended") {
    bgmState.ctx.resume();
  }

  var bpm = 140;
  var beatMs = (60 / bpm) * 1000;

  // Play first beat immediately
  playBeat(bpm);

  bgmState.intervalId = setInterval(function () {
    if (bgmState.muted) return;
    playBeat(bpm);
  }, beatMs);
}

function playBeat(bpm) {
  var ctx = bgmState.ctx;
  var now = ctx.currentTime;
  var beatDur = 60 / bpm;

  var mIdx = bgmState.beatIndex % melodyPattern.length;
  var bIdx = bgmState.beatIndex % bassPattern.length;

  // Melody
  playNote(bgmMelody[melodyPattern[mIdx]], now, beatDur * 0.8, "square", 0.07);

  // Bass
  playNote(bgmBassline[bassPattern[bIdx]], now, beatDur * 0.9, "triangle", 0.12);

  // Hi-hat on every beat
  playPercussion(now, beatDur * 0.1);

  // Kick on beats 0, 4, 8, 12
  if (bgmState.beatIndex % 4 === 0) {
    playKick(now);
  }

  // Snare on beats 2, 6, 10, 14
  if (bgmState.beatIndex % 4 === 2) {
    playSnare(now);
  }

  bgmState.beatIndex++;
}

function playPercussion(startTime, duration) {
  var ctx = bgmState.ctx;
  var bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  var src = ctx.createBufferSource();
  src.buffer = buffer;
  var gain = ctx.createGain();
  gain.gain.setValueAtTime(0.04, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  var filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 8000;

  src.connect(filter);
  filter.connect(gain);
  gain.connect(bgmState.masterGain);
  src.start(startTime);
  src.stop(startTime + duration);
}

function playKick(startTime) {
  var ctx = bgmState.ctx;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, startTime);
  osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.15);
  gain.gain.setValueAtTime(0.2, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
  osc.connect(gain);
  gain.connect(bgmState.masterGain);
  osc.start(startTime);
  osc.stop(startTime + 0.15);
}

function playSnare(startTime) {
  var ctx = bgmState.ctx;
  var bufferSize = Math.max(1, Math.floor(ctx.sampleRate * 0.1));
  var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  var src = ctx.createBufferSource();
  src.buffer = buffer;
  var gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
  src.connect(gain);
  gain.connect(bgmState.masterGain);
  src.start(startTime);
  src.stop(startTime + 0.1);

  var osc = ctx.createOscillator();
  var oscGain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 200;
  oscGain.gain.setValueAtTime(0.08, startTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
  osc.connect(oscGain);
  oscGain.connect(bgmState.masterGain);
  osc.start(startTime);
  osc.stop(startTime + 0.08);
}

function stopBGM() {
  bgmState.playing = false;
  if (bgmState.intervalId) {
    clearInterval(bgmState.intervalId);
    bgmState.intervalId = null;
  }
}

function toggleBGM() {
  bgmState.muted = !bgmState.muted;
  var btn = document.getElementById("btn-bgm");
  if (btn) {
    btn.textContent = bgmState.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
    btn.classList.toggle("muted", bgmState.muted);
  }
  if (bgmState.masterGain) {
    bgmState.masterGain.gain.value = bgmState.muted ? 0 : bgmState.volume;
  }
}

function setBGMVolume(val) {
  bgmState.volume = val;
  if (!bgmState.muted && bgmState.masterGain) {
    bgmState.masterGain.gain.value = val;
  }
}
