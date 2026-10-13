import { useEffect, useMemo, useState } from "react";

/** Preserve the final text layout while revealing characters, including Korean. */
export default function ArchiveText({ text, delay = 0, instant = false }: { text: string; delay?: number; instant?: boolean }) {
  const [count, setCount] = useState(0);
  const characters = useMemo(() => Array.from(text), [text]);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number;
    const start = () => {
      window.clearTimeout(timer);
      setCount(0);
      if (instant || motion.matches) { setCount(characters.length); return; }
      let index = 0;
      const tick = () => {
        setCount(++index);
        if (index < characters.length) timer = window.setTimeout(tick, /[.,!?。]/.test(characters[index - 1]) ? 150 : 24);
      };
      timer = window.setTimeout(tick, delay + 100);
    };
    start();
    motion.addEventListener("change", start);
    return () => { window.clearTimeout(timer); motion.removeEventListener("change", start); };
  }, [characters, delay, instant]);
  const complete = instant || count >= characters.length;
  return <span className={`archive-type ${complete ? "is-complete" : "is-typing"}`}>
    <span className="archive-accessible">{text}</span>
    <span aria-hidden="true"><span>{characters.slice(0, complete ? characters.length : count).join("")}</span><span className="type-unrevealed">{complete ? "" : characters.slice(count).join("")}</span></span>
  </span>;
}
