// Original procedural chip music and effects; no downloaded audio assets.
export type Sound = "click" | "page" | "portal" | "attack" | "hit" | "collect" | "win" | "lose" | "jump";
export type Scene = "story" | "map" | "game";
export type AudioSettings = { muted: boolean; music: number; effects: number };
const key = "dragon-unicorn-audio-v1";
let settings: AudioSettings = { muted: false, music: .25, effects: .5 };
try {
  const saved = JSON.parse(localStorage.getItem(key) ?? "null");
  if (saved) settings = { muted: saved.muted === true, music: typeof saved.music === "number" && Number.isFinite(saved.music) ? Math.max(0, Math.min(1, saved.music)) : .25, effects: typeof saved.effects === "number" && Number.isFinite(saved.effects) ? Math.max(0, Math.min(1, saved.effects)) : .5 };
} catch { /* Storage may be unavailable. */ }
let context: AudioContext | undefined;
let musicBus: GainNode;
let effectsBus: GainNode;
let scene: Scene = "story";
let paused = false;
let interval: number | undefined;
let nextNote = 0;
let beat = 0;
const melodies: Record<Scene, number[]> = {
  story: [69,0,72,0,76,0,74,0,69,0,67,0,64,0,67,0,72,0,76,0,79,0,76,0,74,0,72,0,67,0,64,0],
  map: [72,76,79,76,74,0,76,79,81,79,76,74,72,0,67,0,69,72,76,72,67,0,71,74,76,74,71,67,72,0,0,0],
  game: [69,69,76,0,79,76,74,72,69,0,72,74,76,0,74,0,65,69,72,0,76,72,69,67,64,67,71,74,76,74,72,71],
};
const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
function tone(midi: number, time: number, duration: number, bus: GainNode, volume = .08, type: OscillatorType = "square") {
  if (!context || !midi) return;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency(midi);
  envelope.gain.setValueAtTime(0, time);
  envelope.gain.linearRampToValueAtTime(volume, time + .006);
  envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
  oscillator.connect(envelope).connect(bus);
  oscillator.start(time);
  oscillator.stop(time + duration + .01);
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
}
function applyVolume() {
  if (!context) return;
  const silent = settings.muted || document.hidden;
  musicBus.gain.setTargetAtTime(silent || paused ? 0 : settings.music, context.currentTime, .03);
  effectsBus.gain.setTargetAtTime(silent ? 0 : settings.effects, context.currentTime, .01);
}
function scheduleMusic() {
  if (!context || context.state !== "running" || document.hidden || paused || settings.muted || !settings.music) { nextNote = 0; return; }
  const tempo = scene === "story" ? .28 : scene === "map" ? .21 : .15;
  if (nextNote < context.currentTime) nextNote = context.currentTime + .02;
  while (nextNote < context.currentTime + .16) {
    tone(melodies[scene][beat % 32], nextNote, tempo * .8, musicBus, .045, scene === "story" ? "triangle" : "square");
    if (beat % 4 === 0) tone([45,41,48,43][Math.floor(beat / 8) % 4], nextNote, tempo * 2.5, musicBus, .1, "triangle");
    if (scene === "game" && beat % 2 === 0) tone(33, nextNote, .055, musicBus, .08, "triangle");
    nextNote += tempo;
    beat++;
  }
}
async function unlock() {
  try {
    if (!context) {
      const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) return;
      context = new Audio();
      musicBus = context.createGain(); effectsBus = context.createGain();
      musicBus.connect(context.destination); effectsBus.connect(context.destination);
      applyVolume();
      interval = window.setInterval(scheduleMusic, 80);
    }
    if (!document.hidden && context.state === "suspended") await context.resume();
    scheduleMusic();
  } catch { /* Gameplay remains usable when audio is unavailable. */ }
}
export function getAudioSettings() { return { ...settings }; }
export function updateAudioSettings(patch: Partial<AudioSettings>) {
  settings = { ...settings, ...patch };
  try { localStorage.setItem(key, JSON.stringify(settings)); } catch { /* Optional persistence. */ }
  applyVolume();
  window.dispatchEvent(new Event("game-audio-settings"));
  void unlock();
}
export function setAudioScene(value: Scene) { if (scene !== value) { scene = value; beat = 0; nextNote = 0; paused = false; applyVolume(); } }
export function pauseMusic(value: boolean) { paused = value; nextNote = 0; applyVolume(); }
export function playSound(sound: Sound) {
  if (!context || context.state !== "running" || settings.muted || document.hidden) return;
  const patterns: Record<Sound, number[]> = { click: [84], page: [62,69], portal: [48,60,67,72,79], attack: [57,69,81], hit: [43,38,31], collect: [76,83,88], win: [72,76,79,84], lose: [64,60,55,48], jump: [60,72] };
  patterns[sound].forEach((note, i) => tone(note, context!.currentTime + i * .065, sound === "win" || sound === "lose" ? .22 : .09, effectsBus, .13, sound === "hit" ? "sawtooth" : "square"));
}
export function initializeAudio() {
  const gesture = () => { void unlock(); };
  const click = (event: MouseEvent) => { if ((event.target as Element).closest?.("button") && !(event.target as Element).closest?.(".sound-settings")) playSound("click"); };
  const visibility = () => {
    applyVolume(); nextNote = 0;
    if (document.hidden) void context?.suspend().catch(() => {});
    else if (context) void unlock();
  };
  document.addEventListener("pointerdown", gesture, true);
  document.addEventListener("keydown", gesture, true);
  document.addEventListener("click", click, true);
  document.addEventListener("visibilitychange", visibility);
  return () => {
    document.removeEventListener("pointerdown", gesture, true); document.removeEventListener("keydown", gesture, true);
    document.removeEventListener("click", click, true); document.removeEventListener("visibilitychange", visibility);
    window.clearInterval(interval); interval = undefined;
    const old = context; context = undefined; void old?.close().catch(() => {});
  };
}
