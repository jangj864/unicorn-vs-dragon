import { useEffect, useState } from "react";

/** Preserve the final text layout while revealing characters, including Korean. */
export default function ArchiveText({ text, delay = 0, instant = false }: { text: string; delay?: number; instant?: boolean }) {
  const [count, setCount] = useState(0);
  const characters = Array.from(text);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number;
    const start = () => {
      window.clearTimeout(timer);
      setCount(0);
      if (instant || motion.matches) { setCount(Array.from(text).length); return; }
      let index = 0;
      const tick = () => {
        setCount(++index);
        if (index < Array.from(text).length) timer = window.setTimeout(tick, /[.,!?。]/.test(Array.from(text)[index - 1]) ? 150 : 24);
      };
      timer = window.setTimeout(tick, delay + 100);
    };
    start();
    motion.addEventListener("change", start);
    return () => { window.clearTimeout(timer); motion.removeEventListener("change", start); };
  }, [text, delay, instant]);
  const complete = instant || count >= characters.length;
  return <span className={`archive-type ${complete ? "is-complete" : "is-typing"}`}>
    <span className="archive-accessible">{text}</span>
    <span aria-hidden="true"><span>{characters.slice(0, complete ? characters.length : count).join("")}</span><span className="type-unrevealed">{complete ? "" : characters.slice(count).join("")}</span></span>
  </span>;
}
