import { useEffect, useRef, useState } from "react";

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const complete = useRef(onComplete);
  useEffect(() => { complete.current = onComplete; }, [onComplete]);
  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1500 : 2200;
    const timers = [
      window.setTimeout(() => setStage(1), duration),
      window.setTimeout(() => setStage(2), duration * 2),
      window.setTimeout(() => complete.current(), duration * 3),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);
  return <div className="boot-screen">
    <div className="boot-splash" key={stage} aria-live="polite">
      {stage === 0 ? <img className="boot-studio-logo" src={`${import.meta.env.BASE_URL}studio-logo.png`} alt="Creator logo" draggable={false} /> : stage === 1 ? <div className="boot-creator"><span>CREATED BY</span><h1>Jinhyeok Jang</h1></div> : <div className="boot-logo"><span>NYC / PORTAL ARCADE</span><h1><b>DRAGON</b><i>VS</i><strong>UNICORN</strong></h1><p>TWO FACTIONS. ONE CITY.</p></div>}
    </div>
    <button type="button" onClick={() => complete.current()}>SKIP INTRO →</button>
  </div>;
}
