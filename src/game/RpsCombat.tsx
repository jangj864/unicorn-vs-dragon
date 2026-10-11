import { useEffect, type CSSProperties, type ReactNode } from "react";
import u1 from "../imports/arcade-props/attack-unicorn-1.png";
import u2 from "../imports/arcade-props/attack-unicorn-2.png";
import u3 from "../imports/arcade-props/attack-unicorn-3.png";
import d1 from "../imports/arcade-props/attack-dragon-1.png";
import d2 from "../imports/arcade-props/attack-dragon-2.png";
import d3 from "../imports/arcade-props/attack-dragon-3.png";
import "./rpsCombat.css";

const attacks = { dragon: [d1, d2, d3], unicorn: [u1, u2, u3] };
export const ROUND_DURATION = 1600;

export default function RpsCombat({ team, level, result, active, round, streak, locale, dragon, unicorn }: {
  team: "dragon" | "unicorn"; level: number; result: "win" | "lose" | "draw" | null;
  active: boolean; round: number; streak: number; locale: "ko" | "en"; dragon: ReactNode; unicorn: ReactNode;
}) {
  useEffect(() => { Object.values(attacks).flat().forEach(src => { const image = new Image(); image.src = src; }); }, []);
  const winner = result === "draw" || !result ? null : result === "win" ? team : team === "dragon" ? "unicorn" : "dragon";
  return <div key={round} className={`rps-combat ${active ? "is-active" : ""} outcome-${result ?? "ready"}`}>
    <div className="fighters combat-fighters">
      {(["dragon", "unicorn"] as const).map(faction => {
        const attacking = active && winner === faction;
        return <div key={faction} className={`fighter combat-fighter side-${faction} ${active ? winner ? attacking ? "is-attacking" : "is-hit" : "is-guarding" : ""}`}>
          <div className="combat-idle" style={{ visibility: attacking ? "hidden" : "visible" }}>{faction === "dragon" ? dragon : unicorn}</div>
          {attacking && <img className="combat-attack" src={attacks[faction][(faction === team ? level : 3) - 1]} alt={locale === "ko" ? "마법 공격" : "Magic attack"} draggable={false} />}
          {active && winner !== faction && <span className="combat-impact" aria-hidden="true">{winner ? "✦" : "◇"}</span>}
        </div>;
      })}
    </div>
    {active && <>
      <div className="combat-announcement" role="status"><b>{result === "win" ? (locale === "ko" ? "공격 성공!" : "DIRECT HIT!") : result === "lose" ? (locale === "ko" ? "피격!" : "HIT TAKEN!") : (locale === "ko" ? "공격 상쇄!" : "CLASH!")}</b><small>{result === "win" ? `${streak} ${locale === "ko" ? "연승" : "WIN STREAK"}` : result === "draw" ? (locale === "ko" ? "연승 유지 · 다시 도전" : "STREAK SAFE · TRY AGAIN") : (locale === "ko" ? "다시 도전할 수 있어요" : "READY FOR A REMATCH?")}</small></div>
      <div className="combat-particles" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ "--i": i, "--x": `${(i * 37) % 100}%`, "--drift": `${i % 2 ? 65 : -65}px` } as CSSProperties} />)}</div>
    </>}
  </div>;
}
