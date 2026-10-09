import { useEffect } from "react";
export default function BootScreen({onComplete}:{onComplete:()=>void}){
  useEffect(()=>{const timer=window.setTimeout(onComplete,window.matchMedia("(prefers-reduced-motion: reduce)").matches?250:2400);return()=>window.clearTimeout(timer);},[onComplete]);
  return <div className="boot-screen"><div className="boot-logo"><span>NYC / PORTAL ARCADE</span><h1><b>DRAGON</b><i>VS</i><strong>UNICORN</strong></h1><p>TWO FACTIONS. ONE CITY.</p></div><button onClick={onComplete}>SKIP INTRO →</button></div>;
}
