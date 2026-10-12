import { useEffect, useRef, useState } from "react";
import { getAudioSettings, updateAudioSettings } from "./audio";
export default function SoundSettings({ ko }: { ko: boolean }) {
  const [settings, setSettings] = useState(getAudioSettings);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const refresh = () => setSettings(getAudioSettings());
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && open) { setOpen(false); root.current?.querySelector("button")?.focus(); } };
    window.addEventListener("game-audio-settings", refresh); document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { window.removeEventListener("game-audio-settings", refresh); document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="sound-settings" ref={root}>
    <button type="button" className="sound-toggle" aria-label={ko ? "사운드 설정" : "Sound settings"} aria-expanded={open} onClick={() => setOpen(value => !value)}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/>{settings.muted ? <path d="m17 9 5 6m0-6-5 6"/> : <><path d="M16 8q5 4 0 8"/><path d="M19 5q7 7 0 14"/></>}</svg></button>
    {open && <div className="sound-panel"><strong>{ko ? "사운드" : "SOUND"}</strong><button type="button" aria-pressed={settings.muted} onClick={() => updateAudioSettings({ muted: !settings.muted })}>{settings.muted ? (ko ? "소리 켜기" : "UNMUTE") : (ko ? "음소거" : "MUTE")}</button><label>{ko ? "배경 음악" : "BGM"}<span>{Math.round(settings.music * 100)}%</span><input type="range" min="0" max="100" value={Math.round(settings.music * 100)} onChange={e => updateAudioSettings({ music: Number(e.target.value) / 100 })}/></label><label>{ko ? "효과음" : "EFFECTS"}<span>{Math.round(settings.effects * 100)}%</span><input type="range" min="0" max="100" value={Math.round(settings.effects * 100)} onChange={e => updateAudioSettings({ effects: Number(e.target.value) / 100 })}/></label><small>{ko ? "설정은 이 기기에 저장됩니다" : "Settings saved on this device"}</small></div>}
  </div>;
}
