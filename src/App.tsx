import ArchiveText from "./game/ArchiveText";
import BootScreen from "./game/BootScreen";
import Leaderboard, { RecordEntry } from "./game/Leaderboard";
import { fetchBoards, submitRecord, type Boards } from "./game/rankings";
import GamePreview from "./game/GamePreview";
import landmark0 from "./imports/landmark-central-park.png";
import landmark1 from "./imports/landmark-times-square.png";
import landmark2 from "./imports/landmark-empire-state.png";
import landmark3 from "./imports/landmark-washington-square.png";
import landmark4 from "./imports/landmark-soho.png";
import landmark5 from "./imports/landmark-wall-street.png";
import landmark6 from "./imports/landmark-dumbo.png";
import landmark7 from "./imports/landmark-liberty.png";
import { useEffect, useMemo, useRef, useState } from "react";
import ArcadeGame from "./game/ArcadeGame";
import { rpsResult } from "./game/engine";
import { readProgress, PROGRESS_KEY } from "./game/progress";
import dragonStage1 from "./imports/black-pixel-dragon-stage-1.png";
import dragonStage2 from "./imports/black-pixel-dragon-stage-2.png";
import dragonStage3 from "./imports/black-pixel-dragon-v2.png";
import unicornPixelArt from "./imports/white-pixel-unicorn.png";
import unicornStage1 from "./imports/white-pixel-unicorn-stage-1.png";
import unicornStage2 from "./imports/white-pixel-unicorn-stage-2.png";
import nycTacticalMap from "./imports/nyc-tactical-map-reference.png";
import classifiedCover from "./imports/classified-report-cover.png";
import classifiedNycStreet from "./imports/classified-nyc-street.png";
import closedManhole from "./imports/manhole-closed-v2.png";
import openManhole from "./imports/manhole-open-portal.png";
import unicornManhole from "./imports/manhole-unicorn.png";
import dragonManhole from "./imports/manhole-dragon.png";

type Locale = "ko" | "en";
type Team = "unicorn" | "dragon";
type EvolutionLevel = 1 | 2 | 3;
type Rps = "rock" | "paper" | "scissors";
type GameMode = "rps" | "runner" | "snake" | "breakout" | "memory" | "invader";

const copy = {
  ko: {
    tagline: "맨해튼 아래, 두 전설이 충돌한다",
    choose: "당신의 진영을 선택하세요",
    chooseBody: "선택한 진영은 첫 번째 수호자와 전투 기술을 결정합니다.",
    unicornTeam: "유니콘 연맹",
    unicornDesc: "별빛 마법과 회복 능력으로 포탈을 정화하는 빛의 수호자들.",
    dragonTeam: "드래곤 군단",
    dragonDesc: "불꽃과 강철 비늘로 지하 왕국을 지배하는 고대의 전사들.",
    select: "이 진영 선택",
    continue: "계속",
    start: "뉴욕으로 진입",
    howTitle: "맨홀을 열고 전설을 깨워라",
    howBody: "뉴욕 곳곳의 맨홀은 마법 세계로 이어지는 포탈입니다. 포탈을 발견하고, 상대 진영을 물리쳐 도시의 구역을 점령하세요.",
    rule1: "지도에서 빛나는 맨홀 포탈을 선택하세요.",
    rule2: "공격과 특수 기술을 조합해 상대를 제압하세요.",
    rule3: "스타 샤드를 모아 새로운 구역을 해제하세요.",
    chapter: "챕터 1 · 맨해튼 균열",
    mission: "맨홀 포탈을 확보하라",
    missionBody: "브로드웨이 아래에서 강력한 마력이 감지되었습니다. 포탈을 열고 적 수호자에게 도전하세요.",
    portal: "맨홀 포탈",
    online: "활성",
    locked: "잠김",
    selected: "선택한 포탈",
    enter: "전투 시작",
    yourTeam: "나의 진영",
    enemy: "상대 진영",
    attack: "기본 공격",
    special: "특수 기술",
    heal: "회복",
    victory: "승리!",
    defeated: "상대 수호자를 물리쳤습니다",
    reset: "다시 싸우기",
    changeTeam: "진영 변경",
    shards: "스타 샤드",
    round: "라운드",
    versus: "결투",
    portalHint: "맨홀 문양을 확인하고 도전할 구역을 선택하세요",
    cityWar: "뉴욕 진영 현황",
    leading: "현재 우세",
    occupied: "점령",
    neutral: "중립",
    rpsTitle: "포탈 가위바위보",
    rpsBody: "상대가 무작위로 패를 냅니다. 먼저 2승을 달성하세요.",
    rock: "바위",
    paper: "보",
    scissors: "가위",
    win: "승리",
    lose: "패배",
    draw: "무승부",
    pick: "패를 선택하세요",
  },
  en: {
    tagline: "Two legends collide beneath Manhattan",
    choose: "Choose your allegiance",
    chooseBody: "Your allegiance determines your first guardian and battle abilities.",
    unicornTeam: "Unicorn Alliance",
    unicornDesc: "Guardians of light who cleanse portals with starlight magic and healing.",
    dragonTeam: "Dragon Legion",
    dragonDesc: "Ancient warriors who rule the undercity with flame and iron scales.",
    select: "Choose this team",
    continue: "Continue",
    start: "Enter New York",
    howTitle: "Open the manholes. Awaken the legends.",
    howBody: "New York's manholes are portals to a magical realm. Find them, defeat the rival faction, and claim the city district by district.",
    rule1: "Select a glowing manhole portal on the map.",
    rule2: "Combine attacks and special abilities to defeat your rival.",
    rule3: "Collect Star Shards to unlock new districts.",
    chapter: "Chapter 1 · Manhattan Rift",
    mission: "Secure the manhole portal",
    missionBody: "Powerful magic is rising beneath Broadway. Open the portal and challenge its rival guardian.",
    portal: "Manhole Portal",
    online: "Active",
    locked: "Locked",
    selected: "Selected Portal",
    enter: "Start Battle",
    yourTeam: "Your Team",
    enemy: "Rival Team",
    attack: "Basic Attack",
    special: "Special",
    heal: "Recover",
    victory: "Victory!",
    defeated: "The rival guardian has been defeated",
    reset: "Battle Again",
    changeTeam: "Change Team",
    shards: "Star Shards",
    round: "Round",
    versus: "Versus",
    portalHint: "Select a glowing manhole cover to open its portal",
    cityWar: "NYC Faction Control",
    leading: "Currently leading",
    occupied: "Occupied",
    neutral: "Neutral",
    rpsTitle: "Portal Rock Paper Scissors",
    rpsBody: "Your rival plays randomly. Be the first to win two rounds.",
    rock: "Rock",
    paper: "Paper",
    scissors: "Scissors",
    win: "Win",
    lose: "Loss",
    draw: "Draw",
    pick: "Choose your move",
  },
};

const landmarkBackgrounds = [landmark0, landmark1, landmark2, landmark3, landmark4, landmark5, landmark6, landmark7];

const zones = [
  { id: 0, x: 63, y: 23, ko: "센트럴파크", en: "Central Park", danger: 1, owner: "unicorn" as Team, locked: false, game: "snake" as GameMode },
  { id: 1, x: 56, y: 42, ko: "타임스퀘어", en: "Times Square", danger: 2, owner: "dragon" as Team, locked: false, game: "rps" as GameMode },
  { id: 2, x: 56, y: 50, ko: "엠파이어스테이트 빌딩", en: "Empire State Building", danger: 2, owner: null, locked: false, game: "breakout" as GameMode },
  { id: 3, x: 51, y: 61, ko: "워싱턴 스퀘어 파크", en: "Washington Square Park", danger: 3, owner: "unicorn" as Team, locked: false, game: "runner" as GameMode },
  { id: 4, x: 50, y: 68, ko: "소호", en: "SoHo", danger: 3, owner: null, locked: false, game: "memory" as GameMode },
  { id: 5, x: 46, y: 78, ko: "월스트리트", en: "Wall Street", danger: 4, owner: "dragon" as Team, locked: false, game: "invader" as GameMode },
  { id: 6, x: 57, y: 79, ko: "브루클린 덤보", en: "Brooklyn DUMBO", danger: 3, owner: null, locked: false, game: "runner" as GameMode },
  { id: 7, x: 17, y: 93, ko: "자유의 여신상", en: "Statue of Liberty", danger: 4, owner: null, locked: false, game: "invader" as GameMode },
];

function RpsIcon({ type }: { type: Rps }) {
  return (
    <svg className="rps-icon" viewBox="0 0 48 48" shapeRendering="crispEdges" aria-hidden="true">
      {type === "rock" && <><rect x="10" y="18" width="28" height="20" /><rect x="14" y="12" width="20" height="6" /><rect x="6" y="24" width="4" height="10" /><rect x="38" y="22" width="4" height="12" /><rect className="shade" x="14" y="30" width="24" height="8" /></>}
      {type === "paper" && <><rect x="10" y="10" width="28" height="30" /><rect className="shade" x="32" y="16" width="6" height="24" /><rect className="line" x="16" y="18" width="14" height="3" /><rect className="line" x="16" y="25" width="14" height="3" /><rect className="line" x="16" y="32" width="10" height="3" /></>}
      {type === "scissors" && <><rect x="21" y="19" width="6" height="21" /><rect x="12" y="8" width="7" height="18" transform="rotate(-28 15 17)" /><rect x="29" y="8" width="7" height="18" transform="rotate(28 32 17)" /><rect className="shade" x="10" y="34" width="12" height="8" /><rect className="shade" x="26" y="34" width="12" height="8" /></>}
    </svg>
  );
}

const dragonArt: Record<EvolutionLevel, string> = { 1: dragonStage1, 2: dragonStage2, 3: dragonStage3 };
const unicornArt: Record<EvolutionLevel, string> = { 1: unicornStage1, 2: unicornStage2, 3: unicornPixelArt };

function PixelDragon({ flipped = false, level = 3 }: { flipped?: boolean; level?: EvolutionLevel }) {
  return (
    <img
      className={`pixel-creature dragon dragon-image dragon-level-${level} ${flipped ? "flipped" : ""}`}
      src={dragonArt[level]}
      alt={`Black armored pixel dragon level ${level}`}
      draggable={false}
    />
  );
}

function PixelUnicorn({ flipped = false, level = 3 }: { flipped?: boolean; level?: EvolutionLevel }) {
  return (
    <img
      className={`pixel-creature unicorn unicorn-image unicorn-level-${level} ${flipped ? "flipped" : ""}`}
      src={unicornArt[level]}
      alt={`White armored pixel unicorn level ${level}`}
      draggable={false}
    />
  );
}

function LanguageToggle({ locale, onChange }: { locale: Locale; onChange: (value: Locale) => void }) {
  return (
    <div className="language-toggle" aria-label="Language">
      <button className={locale === "ko" ? "active" : ""} onClick={() => onChange("ko")}>한국어</button>
      <span>/</span>
      <button className={locale === "en" ? "active" : ""} onClick={() => onChange("en")}>EN</button>
    </div>
  );
}

function PixelChest() {
  return <svg className="loot-sprite" viewBox="0 0 32 28" role="img" aria-label="Star shard treasure chest" shapeRendering="crispEdges"><path fill="#07111f" d="M2 8h28v18H2zM5 3h22v8H5z"/><path fill="#98622e" d="M4 10h24v14H4zM7 5h18v6H7z"/><path fill="#dbad4c" d="M4 10h24v4H4zM6 5h4v19H6zM22 5h4v19h-4z"/><path fill="#603c26" d="M10 15h12v7H10z"/><path fill="#ffde7f" d="M13 11h6v7h-6zM15 0h2v4h-2zM0 4h3v3H0zM29 2h3v3h-3z"/><path fill="#151d2b" d="M15 13h2v3h-2z"/></svg>;
}

function PixelButton({ children, onClick, secondary = false, disabled = false }: { children: React.ReactNode; onClick?: () => void; secondary?: boolean; disabled?: boolean }) {
  return <button className={`pixel-button ${secondary ? "secondary" : ""}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function TeamCard({ team, locale, selected, onClick }: { team: Team; locale: Locale; selected: boolean; onClick: () => void }) {
  const t = copy[locale];
  return (
    <button className={`team-card ${team} ${selected ? "selected" : ""}`} onClick={onClick} aria-pressed={selected}>
      <span className="team-check" aria-hidden="true">{selected && <svg viewBox="0 0 16 16" shapeRendering="crispEdges"><path d="M2 7h3v3h2V8h2V6h2V4h3v4h-2v2h-2v2H8v2H5v-2H3v-2H2z" /></svg>}</span>
      <div className="team-sprite">{team === "unicorn" ? <PixelUnicorn flipped level={3} /> : <PixelDragon level={3} />}</div>
      <span className="team-type">{locale === "ko" ? (team === "unicorn" ? "빛의 수호자" : "불꽃의 정복자") : (team === "unicorn" ? "GUARDIANS OF LIGHT" : "CONQUERORS OF FLAME")}</span>
      <strong>{team === "unicorn" ? t.unicornTeam : t.dragonTeam}</strong>
      <p>{team === "unicorn" ? t.unicornDesc : t.dragonDesc}</p>
      <span className="select-label">{selected ? (locale === "ko" ? "선택됨" : "SELECTED") : t.select}</span>
    </button>
  );
}

function Onboarding({ locale, setLocale, onComplete }: { locale: Locale; setLocale: (value: Locale) => void; onComplete: (team: Team) => void }) {
  const [step, setStep] = useState(0);
  const [team, setTeam] = useState<Team | null>(null);
  const [isTurning, setIsTurning] = useState(false);
  const [turnTarget, setTurnTarget] = useState<number | null>(null);
  const [turnDirection, setTurnDirection] = useState<"next" | "back">("next");
  const turnTimers = useRef<number[]>([]);
  const t = copy[locale];
  const story = locale === "ko" ? [
    { code: "FILE 00–X", title: "기밀문서", lead: "과거, 이 도시에는 유니콘과 드래곤이 존재했다.", body: "인류가 기억을 지우기 전까지 그들은 맨해튼의 하늘과 지하를 나누어 지배했다. 이 기록은 2091년까지 봉인되었다.", stamp: "CLASSIFIED" },
    { code: "ARCHIVE 01", title: "지워진 두 종족", lead: "대전쟁 이후, 생존자들은 인간의 눈을 피해 숨어들었다.", body: "드래곤은 폐쇄된 지하철 터널로, 유니콘은 버려진 고층 건물로 사라졌다. 그들의 존재는 도시 전설이 되었다.", stamp: "EYES ONLY" },
    { code: "INCIDENT 77", title: "맨홀 아래의 균열", lead: "그러나 맨해튼의 맨홀들이 다시 빛나기 시작했다.", body: "모든 맨홀은 잃어버린 왕국으로 이어지는 포탈이다. 두 진영은 도시를 되찾기 위해 포탈 하나씩을 두고 결투를 시작했다.", stamp: "ACTIVE THREAT" },
  ] : [
    { code: "FILE 00–X", title: "CLASSIFIED DOCUMENT", lead: "Once, unicorns and dragons lived in this city.", body: "Before humanity erased the evidence, they divided Manhattan's sky and undercity. This record was sealed until 2091.", stamp: "CLASSIFIED" },
    { code: "ARCHIVE 01", title: "THE ERASED SPECIES", lead: "After the Great War, the survivors vanished from human sight.", body: "Dragons descended into abandoned subway tunnels. Unicorns occupied hollow towers. Their existence became an urban myth.", stamp: "EYES ONLY" },
    { code: "INCIDENT 77", title: "THE RIFT BELOW", lead: "Now Manhattan's manholes are glowing again.", body: "Each manhole is a portal to the lost realm. Hidden factions battle one portal at a time to reclaim the city.", stamp: "ACTIVE THREAT" },
  ];

  useEffect(() => () => turnTimers.current.forEach(window.clearTimeout), []);

  const navigateFile = (target: number) => {
    if (isTurning || target < 0 || target > 4) return;
    turnTimers.current.forEach(window.clearTimeout);
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
    setTurnDirection(target > step ? "next" : "back");
    setTurnTarget(target);
    setIsTurning(true);
    turnTimers.current = [window.setTimeout(() => {
      setStep(target);
      setTurnTarget(null);
      setIsTurning(false);
    }, duration)];
  };
  const turnPage = () => navigateFile(step + 1);
  const turnBack = () => navigateFile(step - 1);

  const renderFile = (page: number, preview = false) => (page === 0 ? (
              <article className="classified-cover" key="cover">
                <div className="cover-identity"><span>NYC / OCCULT DEFENSE BUREAU</span><h1><ArchiveText text={locale === "ko" ? "기밀 조사 보고서" : "CLASSIFIED REPORT"} instant={preview} /></h1><p>{locale === "ko" ? "맨해튼 비인간 활동 기록" : "MANHATTAN NON-HUMAN ACTIVITY"}</p><div className="cover-rule" /><b>CASE FILE / 00–X</b><small>AUTHORIZED PERSONNEL ONLY<br />ARCHIVE RELEASE / 2091</small></div><img src={classifiedCover} alt={locale === "ko" ? "기밀 조사 보고서 표지" : "Classified investigation report cover"} draggable={false} />
              </article>
            ) : <article className="classified-file" key={page}>
              <div className="file-edge" />
              <div className="file-meta"><span>{story[page - 1].code}</span><span>09.28.2091</span></div>
              <div className="redaction">██████ █████ ███</div>
              <p className="file-kicker">NYC // NON-HUMAN ACTIVITY</p>
              <h1><ArchiveText text={story[page - 1].title} instant={preview} /></h1>
              <p className="file-lead"><ArchiveText text={story[page - 1].lead} delay={650} instant={preview} /></p>
              <div className={`evidence evidence-${page - 1}`}>
                {page === 1 && <><img className="old-skyline" src={classifiedNycStreet} alt="" draggable={false} /><PixelUnicorn /><PixelDragon flipped /></>}
                {page === 2 && <><div className="archive-species unicorn-record"><span>01 / UNICORN</span><PixelUnicorn /><b>{locale === "ko" ? "버려진 고층 건물" : "ABANDONED TOWERS"}</b></div><div className="archive-species dragon-record"><span>02 / DRAGON</span><PixelDragon flipped /><b>{locale === "ko" ? "폐쇄된 지하철 터널" : "SEALED SUBWAY TUNNELS"}</b></div></>}
                {page === 3 && <><div className="rift-location">MANHATTAN / BELOW STREET LEVEL</div><div className="rift-platform"><ManholePortal active /></div><div className="rift-caption"><span>PORTAL 001</span><b>{locale === "ko" ? "봉인 해제 · 진입 가능" : "SEAL BROKEN · ENTRY OPEN"}</b></div></>}
              </div>
              <p className="file-body"><ArchiveText text={story[page - 1].body} delay={2100} instant={preview} /></p>
              <div className="file-footer"><span>PAGE 0{page} / 03</span><strong>{story[page - 1].stamp}</strong></div>
            </article>);

  return (
    <main className="onboarding">
      <div className="pixel-skyline onboarding-skyline" />
      <header className="onboarding-top">
        <button className="mini-logo home-logo" onClick={() => { turnTimers.current.forEach(window.clearTimeout); setIsTurning(false); setTurnTarget(null); setStep(0); setTeam(null); }} aria-label={locale === "ko" ? "메인 화면으로" : "Go to home"}>
          <span>DRAGON</span><i>VS</i><span>UNICORN</span>
        </button>
        <div className="onboarding-tools"><LanguageToggle locale={locale} onChange={setLocale} /></div>
      </header>
      <section className="onboarding-content">
        {step < 4 ? (
          <div className={`classified-scene archive-reader ${isTurning ? `page-turning ${turnDirection === "back" ? "page-turning-back" : ""}` : ""}`}>
            {step > 0 && <div className="archive-status"><span>NYC OCCULT DEFENSE BUREAU</span><b>SECURITY LEVEL // 08</b></div>}
            <div className="file-stack">
            <div className={`book-sheet current-sheet ${isTurning && turnDirection === "next" ? "sheet-outgoing" : ""}`}>{renderFile(step)}</div>
            {turnTarget !== null && turnTarget < 4 && <div className={`book-sheet destination-sheet ${turnDirection === "back" ? "sheet-incoming" : ""}`} aria-hidden="true">{renderFile(turnTarget, true)}</div>}
            <div className="page-underlay" aria-hidden="true" />
            </div>
            <div className="story-controls">
              {step > 0 ? <PixelButton secondary onClick={turnBack} disabled={isTurning}><span>◀</span> {locale === "ko" ? "이전 문서" : "PREVIOUS FILE"}</PixelButton> : <span className="story-nav-spacer" />}
              <div className="onboarding-next"><PixelButton onClick={turnPage} disabled={isTurning}>{step === 0 ? (locale === "ko" ? "문서 열기" : "OPEN REPORT") : step === 3 ? (locale === "ko" ? "진영 파일 열기" : "OPEN FACTION FILES") : (locale === "ko" ? "다음 문서" : "NEXT FILE")} <span>▶</span></PixelButton><button className="skip-briefing" disabled={isTurning} onClick={() => setStep(4)}>{locale === "ko" ? "스토리 건너뛰기" : "Skip story"}</button></div>
            </div>
          </div>
        ) : <><div className="game-title">
          <span className="title-kicker">NEW YORK PORTAL BATTLE</span>
          <h1><b>DRAGON</b><i>VS</i><b>UNICORN</b></h1>
          <p>드래곤 <span>VS</span> 유니콘</p>
          <small>{t.tagline}</small>
        </div>
        {step === 4 ? (
          <div className="choose-section">
            <div className="section-heading"><span>04</span><div><h2>{t.choose}</h2><p>{t.chooseBody}</p></div></div>
            <div className="team-grid">
              <TeamCard team="dragon" locale={locale} selected={team === "dragon"} onClick={() => setTeam("dragon")} />
              <div className="versus-badge" aria-label="versus">
                <i />
                <span>VS</span>
                <small>RIVALRY</small>
              </div>
              <TeamCard team="unicorn" locale={locale} selected={team === "unicorn"} onClick={() => setTeam("unicorn")} />
            </div>
            <div className="onboarding-next faction-next"><PixelButton onClick={() => setStep(5)} disabled={!team}>{t.continue} <span>▶</span></PixelButton><button className="skip-briefing" disabled={!team} onClick={()=>team&&onComplete(team)}>{locale === "ko" ? "설명 건너뛰고 시작" : "Skip briefing & play"}</button></div>
          </div>
        ) : team && (
          <StoryboardTutorial
            locale={locale}
            team={team}
            scene={step - 5}
            onSkip={() => onComplete(team)}
            onPrevious={() => setStep((current) => Math.max(4, current - 1))}
            onNext={() => step < 5 + storyboardText[locale].length - 1 ? setStep((current) => current + 1) : onComplete(team)}
          />
        )}</>}
      </section>
      {step < 5 && <div className="step-indicator">{Array.from({ length: 5 }).map((_, index) => <span key={index} className={index <= step ? "active" : ""} />)}</div>}
    </main>
  );
}

function ManholePortal({ active = false, owner = null }: { active?: boolean; owner?: Team | null }) {
  return (
    <span className={`manhole ${active ? "active" : ""}`}>
      <img
        className="manhole-image"
        src={owner === "unicorn" ? unicornManhole : owner === "dragon" ? dragonManhole : active ? openManhole : closedManhole}
        alt={owner === "unicorn" ? "Unicorn-controlled manhole" : owner === "dragon" ? "Dragon-controlled manhole" : active ? "Open NYC manhole portal" : "Neutral NYC manhole"}
        draggable={false}
      />
    </span>
  );
}

const storyboardText = {
  ko: [
    ["01 · 조우", "맨해튼의 밤, 두 종족이 같은 맨홀 신호를 감지합니다."],
    ["02 · 포탈 개방", "봉인된 맨홀을 열면 지하 왕국으로 이어지는 균열이 깨어납니다."],
    ["03 · 수호자 진화", "등록 기록으로 수호자가 진화합니다. 3/8연승 또는 30/90초 생존으로 LV.2/3에 도달하세요."],
    ["04 · 라이벌 대결", "드래곤 군단과 유니콘 연맹의 수호자가 포탈의 소유권을 두고 맞섭니다."],
    ["05 · 도시 탐색", "상세 지도에서 점령 현황을 확인하고 다음 작전 구역을 선택하세요."],
    ["06 · 포탈 결투", "가장 긴 연승을 기록하세요. 무승부는 연승을 유지하고, 한 번 지면 기록이 종료됩니다."],
    ["07 · 포탈 러너", "빨라지는 장애물을 뛰어넘으며 최대한 오래 버티세요. 생존 시간이 기록됩니다."],
    ["08 · 서펀트 스네이크", "방향키 / WASD로 샤드를 계속 모으며 오래 버티세요. 14초 안에 샤드를 먹고 벽과 꼬리를 피하세요."],
    ["09 · 브릭 브레이커", "좌우 키 또는 드래그로 공을 받으세요. 자동 발사되며 벽돌을 모두 깨면 다음 라운드가 이어집니다."],
    ["10 · 룬 메모리", "같은 룬을 빠르게 찾으며 생존하세요. 한 쌍마다 약 9초 안에 선택하고, 모두 맞히면 다음 라운드로 이어집니다."],
    ["11 · 스카이 인베이더", "좌우 이동과 SPACE 발사로 계속 몰려오는 적을 물리치며 오래 버티세요."],
    ["12 · 점령과 보상", "닉네임으로 기록을 등록하세요. 상위 10위가 표시되며, 1위의 진영이 이 포탈을 점령합니다."],
  ],
  en: [
    ["01 · ENCOUNTER", "Two hidden species detect the same manhole signal beneath Manhattan."],
    ["02 · PORTAL OPEN", "Break the seal and awaken a rift leading into the lost undercity."],
    ["03 · GUARDIAN EVOLUTION", "Submit 3/8 consecutive wins or 30/90 survival seconds to unlock guardian levels 2/3."],
    ["04 · RIVAL DUEL", "Dragon Legion and Unicorn Alliance face off for ownership of the portal."],
    ["05 · CITY SEARCH", "Read the tactical map, check control, and choose the next operation zone."],
    ["06 · PORTAL DUEL", "Build the longest win streak. Draws preserve it; one loss ends your run."],
    ["07 · PORTAL RUNNER", "Jump over obstacles as the pace rises. Your survival time is your record."],
    ["08 · SERPENT SNAKE", "Use arrows / WASD to survive. Collect a shard within 14 seconds; avoid walls and your tail."],
    ["09 · BRICK BREAKER", "Move with arrows or drag. The ball auto-launches; clearing bricks starts another wave."],
    ["10 · RUNE MEMORY", "Match pairs to survive. Inactivity or mismatches cost lives. Complete a board for the next wave."],
    ["11 · SKY INVADERS", "Move and hold SPACE to fire. Defeat endless waves and survive as long as possible."],
    ["12 · CLAIM & REWARD", "Submit a nickname and record. The top 10 are ranked; the #1 player’s faction owns the portal."],
  ],
};

function ArcadeBriefing({ index, locale }: { index: number; locale: Locale }) {
  const goals = locale === "ko" ? ["끝없이 생존", "연속 라운드", "룬 생존 도전", "무한 웨이브"] : ["SURVIVE & GROW", "ENDLESS BRICKS", "RUNE SURVIVAL", "ENDLESS WAVES"];
  const controls = ["↑ ↓ ← → / WASD", "← → / DRAG + SPACE", "CLICK / TAP", "← → + SPACE"];
  return <div className="arcade-briefing"><div className="arcade-briefing-header"><span>ARCADE / 0{index + 3}</span><b>{goals[index]}</b></div>
    {index === 2 ? <div className="brief-memory-board" style={{backgroundImage: `linear-gradient(#08162450, #08162450), url("${landmarkBackgrounds[4]}")`}}>{Array.from({length:12},(_,i)=><div className={i===1||i===6?"preview-rune paired":"preview-rune"} key={i}><span>{i===1||i===6?"✦":"◇"}</span><small>{String(i+1).padStart(2,"0")}</small></div>)}</div> : <GamePreview mode={(["snake","breakout","memory","invader"] as const)[index]} background={landmarkBackgrounds[[0,2,4,5][index]]} label={goals[index]} />}<div className="arcade-briefing-controls"><span>{locale === "ko" ? "조작 방법" : "CONTROLS"}</span><b>{controls[index]}</b></div><p>{locale === "ko" ? "모바일에서는 화면의 조작 버튼을 사용하세요" : "ON MOBILE, USE THE ON-SCREEN CONTROLS"}</p></div>;
}

function StoryboardTutorial({ locale, team, scene, onPrevious, onNext, onSkip }: { locale: Locale; team: Team; scene: number; onPrevious: () => void; onNext: () => void; onSkip: () => void }) {
  const safeScene = Math.min(storyboardText[locale].length - 1, Math.max(0, scene));
  const [title, body] = storyboardText[locale][safeScene];
  const guardian = team === "dragon" ? <PixelDragon level={3} /> : <PixelUnicorn level={3} />;
  const evolutionGuardian = (level: number) => team === "dragon"
    ? <PixelDragon level={(level + 1) as EvolutionLevel} />
    : <PixelUnicorn level={(level + 1) as EvolutionLevel} />;

  return (
    <section className="storyboard-tutorial" key={safeScene}>
      <div className={`storyboard-stage scene-${safeScene}`}>
        {safeScene === 0 && <><div className="brief-city" /><PixelUnicorn /><PixelDragon flipped /></>}
        {safeScene === 1 && <><div className="portal-sigil" aria-hidden="true"><i /><i /><i /><i /></div><ManholePortal active /></>}
        {safeScene === 2 && <div className="evolution-line">{[0, 1, 2].map((level) => <div className={`evolution-form level-${level}`} key={level}><b className="evolution-badge">LV. {level + 1}</b><div className="evolution-platform" aria-hidden="true" />{evolutionGuardian(level)}<div className="evolution-caption"><strong>{(locale === "ko" ? ["정찰형", "전투형", "각성형"] : ["SCOUT", "BATTLE", "AWAKENED"])[level]}</strong><span aria-hidden="true">{[0, 1, 2].map((pip) => <i className={pip <= level ? "on" : ""} key={pip} />)}</span></div></div>)}</div>}
        {safeScene === 3 && <><div className="brief-city" aria-hidden="true" /><div className="brief-versus"><PixelDragon /><b>VS</b><PixelUnicorn flipped /></div></>}
        {safeScene === 4 && <div className="brief-map pixel-map"><div className="map-canvas"><img className="nyc-road-atlas" src={nycTacticalMap} alt="" draggable={false} />{zones.map((item) => <div key={item.id} className="zone-node owner-guide" style={{ left: `${item.x}%`, top: `${item.y}%` }}><ManholePortal /><span className="zone-name owner-guide"><b>{locale === "ko" ? item.ko : item.en}</b></span></div>)}</div></div>}
        {safeScene === 5 && <><div className="brief-city" aria-hidden="true" /><div className="brief-rps">{(["rock", "paper", "scissors"] as Rps[]).map((move) => <div className="brief-rps-card" key={move}><RpsIcon type={move} /><b>{copy[locale][move]}</b></div>)}</div><div className="brief-guardian">{guardian}</div><span className="brief-rule">{locale === "ko" ? "최장 연승 1위가 포탈 점령" : "LONGEST STREAK · #1 CLAIMS THE PORTAL"}</span></>}
        {safeScene === 6 && <div className="brief-run"><div className="run-guardian">{guardian}</div><span className="brief-coin">✦</span><i className="brief-pipe" /><ManholePortal active /></div>}
        {safeScene >= 7 && safeScene <= 10 && <ArcadeBriefing index={safeScene - 7} locale={locale} />}
        {safeScene === 11 && <div className={`reward-scene reward-${team}`}><div className="brief-city" aria-hidden="true" /><div className="reward-heading"><span>MISSION COMPLETE</span><h3>{locale === "ko" ? "새로운 구역을 확보했습니다" : "DISTRICT SECURED"}</h3><p>{locale === "ko" ? "당신의 진영이 뉴욕에 한 걸음 더 가까워졌습니다" : "One more district. One step closer to New York."}</p></div><div className="reward-display"><div className="reward-pedestal">{guardian}</div><div className="reward-loot"><ManholePortal owner={team} /><PixelChest /></div></div><div className="reward-summary"><div><small>LEADERBOARD</small><strong>TOP 10</strong></div><div><small>PORTAL OWNER</small><strong>RANK #1</strong></div></div><span className="reward-note">{locale === "ko" ? "기록 등록 → 순위 결정 → 1위 진영 점령" : "SUBMIT → RANK → #1 CONTROLS THE PORTAL"}</span></div>}
      </div>
      <div className="storyboard-copy">
        <span className="pixel-label">FIELD BRIEFING // {String(safeScene + 1).padStart(2, "0")}</span>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="storyboard-progress">{Array.from({ length: storyboardText[locale].length }).map((_, index) => <i key={index} className={index <= safeScene ? "on" : ""} />)}</div>
        <div className="storyboard-actions">
          <PixelButton secondary onClick={onPrevious}>◀ {locale === "ko" ? "이전" : "BACK"}</PixelButton>
          <div className="onboarding-next"><PixelButton onClick={onNext}>{safeScene === storyboardText[locale].length - 1 ? (locale === "ko" ? "작전 시작" : "START MISSION") : (locale === "ko" ? "다음 장면" : "NEXT SCENE")} ▶</PixelButton><button className="skip-briefing" onClick={onSkip}>{locale === "ko" ? "설명 건너뛰기" : "Skip briefing"}</button></div>
        </div>
      </div>
    </section>
  );
}

const gameInfo: Record<GameMode, { ko: string; en: string; code: string }> = {
  rps: { ko: "가위바위보 결투", en: "RPS Duel", code: "RPS–02" },
  runner: { ko: "포탈 러너", en: "Portal Runner", code: "RUN–04" },
  snake: { ko: "서펀트 스네이크", en: "Serpent Snake", code: "SNK–01" },
  breakout: { ko: "브릭 브레이커", en: "Brick Breaker", code: "BRK–03" },
  memory: { ko: "룬 메모리", en: "Rune Memory", code: "MEM–05" },
  invader: { ko: "스카이 인베이더", en: "Sky Invader", code: "INV–06" },
};

function mapPanBounds(viewport: HTMLDivElement, zoom: number) {
  const canvas = viewport.querySelector<HTMLElement>(".map-canvas");
  return {
    maxX: Math.max(0, ((canvas?.offsetWidth ?? viewport.clientWidth) * zoom - viewport.clientWidth) / 2),
    maxY: Math.max(0, ((canvas?.offsetHeight ?? viewport.clientHeight) * zoom - viewport.clientHeight) / 2),
  };
}

export default function App() {
  const [locale, setLocale] = useState<Locale>("en");
  const [booting,setBooting]=useState(true);
  const [boards,setBoards]=useState<Boards>({});
  const [rankError,setRankError]=useState(false);
  const [pendingRecord,setPendingRecord]=useState<number|null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [savedProgress] = useState(readProgress);
  const [levels,setLevels] = useState<Record<Team, EvolutionLevel>>(savedProgress?.levels ?? { dragon: 1, unicorn: 1 });
  const guardianLevel = levels[team ?? "dragon"];
  const [zoneId, setZoneId] = useState(1);
  const [shards] = useState(savedProgress?.shards ?? 0);
  const roundBusy = useRef(false);
  const roundTimer = useRef<number | undefined>(undefined);
  const [roundPending, setRoundPending] = useState(false);
  useEffect(() => () => window.clearTimeout(roundTimer.current), []);
  const [inBattle, setInBattle] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("rps");
  const owners = zones.map(zone=>boards[zone.id]?.[0]?.team??null);
  const scores = {dragon:Math.round(owners.filter(x=>x==="dragon").length/8*100),unicorn:Math.round(owners.filter(x=>x==="unicorn").length/8*100)};
  const [playerWins, setPlayerWins] = useState(0);
  const [enemyWins, setEnemyWins] = useState(0);
  const [playerMove, setPlayerMove] = useState<Rps | null>(null);
  const [enemyMove, setEnemyMove] = useState<Rps | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [mapView, setMapView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isMapDragging, setIsMapDragging] = useState(false);
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const mapDrag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const t = copy[locale];
  const zone = useMemo(() => zones.find((item) => item.id === zoneId) ?? zones[0], [zoneId]);
  const dragonWins = team === "dragon" ? playerWins : enemyWins;
  const unicornWins = team === "unicorn" ? playerWins : enemyWins;
  const dragonMove = team === "dragon" ? playerMove : enemyMove;
  const unicornMove = team === "unicorn" ? playerMove : enemyMove;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const containMap = () => {
      const viewport = mapViewportRef.current;
      if (!viewport) return;
      setMapView((current) => {
        const { maxX, maxY } = mapPanBounds(viewport, current.zoom);
        return { ...current, x: Math.min(maxX, Math.max(-maxX, current.x)), y: Math.min(maxY, Math.max(-maxY, current.y)) };
      });
    };
    const observer = new ResizeObserver(containMap);
    if (mapViewportRef.current) observer.observe(mapViewportRef.current);
    containMap();
    return () => observer.disconnect();
  }, [team, inBattle]);

  useEffect(()=>{
    let active=true;let loading=false;
    const refresh=async()=>{if(loading)return;loading=true;try{const next=await fetchBoards();if(active){setBoards(next);setRankError(false);}}catch{if(active)setRankError(true);}finally{loading=false;}};
    void refresh();const timer=window.setInterval(refresh,30000);window.addEventListener("focus",refresh);
    return()=>{active=false;window.clearInterval(timer);window.removeEventListener("focus",refresh);};
  },[]);
  useEffect(()=>{try{localStorage.setItem(PROGRESS_KEY,JSON.stringify({shards,levels,owners:savedProgress?.owners??zones.map(()=>null),scores:savedProgress?.scores??{dragon:50,unicorn:50}}));}catch{}},[shards,levels]);
  if(booting)return <BootScreen onComplete={()=>setBooting(false)} />;
  if (!team) return <Onboarding locale={locale} setLocale={setLocale} onComplete={(selectedTeam) => { setTeam(selectedTeam); }} />;
  const saveRecord=async(name:string)=>{if(pendingRecord===null)return;const next=await submitRecord(zoneId,name,team,pendingRecord);setBoards(next);setRankError(false);const achieved = (gameMode==="rps" ? (pendingRecord>=8?3:pendingRecord>=3?2:1) : (pendingRecord>=90000?3:pendingRecord>=30000?2:1)) as EvolutionLevel;setLevels(old=>({...old,[team]:Math.max(old[team],achieved) as EvolutionLevel}));setPendingRecord(null);setInBattle(false);};

  const play = (move: Rps) => {
    if (enemyWins > 0 || pendingRecord !== null || roundBusy.current) return;
    roundBusy.current = true; setRoundPending(true);
    roundTimer.current = window.setTimeout(() => { roundBusy.current = false; setRoundPending(false); }, 650);
    const moves: Rps[] = ["rock", "paper", "scissors"];
    const rival = moves[Math.floor(Math.random() * moves.length)];
    const didWin = rpsResult(move, rival) === "win";
    const didLose = rpsResult(move, rival) === "lose";
    setPlayerMove(move);
    setEnemyMove(rival);
    setResult(didWin ? "win" : didLose ? "lose" : "draw");
    if (didWin) {
      const nextWins = playerWins + 1;
      setPlayerWins(nextWins);

    } else if (didLose) {
      setEnemyWins(1);
      if(playerWins>0)setPendingRecord(playerWins);
    }
  };

  const restart = () => {
    window.clearTimeout(roundTimer.current); roundBusy.current = false; setRoundPending(false);
    setPlayerWins(0);
    setEnemyWins(0);
    setPlayerMove(null);
    setEnemyMove(null);
    setResult(null);
  };

  const changeMapZoom = (amount: number) => {
    setMapView((current) => {
      const zoom = Math.min(2.4, Math.max(1, current.zoom + amount));
      const viewport = mapViewportRef.current;
      if (!viewport) return { ...current, zoom };
      const { maxX, maxY } = mapPanBounds(viewport, zoom);
      return { zoom, x: Math.min(maxX, Math.max(-maxX, current.x)), y: Math.min(maxY, Math.max(-maxY, current.y)) };
    });
  };

  const startMapDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    mapDrag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: mapView.x, originY: mapView.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsMapDragging(true);
  };

  const moveMap = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!mapDrag.current || mapDrag.current.pointerId !== event.pointerId) return;
    const viewport = mapViewportRef.current;
    if (!viewport) return;
    const nextX = mapDrag.current.originX + event.clientX - mapDrag.current.startX;
    const nextY = mapDrag.current.originY + event.clientY - mapDrag.current.startY;
    setMapView((current) => {
      const { maxX, maxY } = mapPanBounds(viewport, current.zoom);
      return { ...current, x: Math.min(maxX, Math.max(-maxX, nextX)), y: Math.min(maxY, Math.max(-maxY, nextY)) };
    });
  };

  const stopMapDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (mapDrag.current?.pointerId !== event.pointerId) return;
    mapDrag.current = null;
    setIsMapDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const resetMapView = () => setMapView({ x: 0, y: 0, zoom: 1 });

  return (
    <main className="game">
      <header className="game-header">
        <button className="game-logo home-logo" onClick={() => { setInBattle(false); setTeam(null); }} aria-label={locale === "ko" ? "메인 화면으로" : "Go to home"}>
          <b>DRAGON</b><i>VS</i><b>UNICORN</b>
        </button>
        <div className="war-score">
          <div className="dragon-score"><span>DRAGON</span><b>{scores.dragon}</b></div>
          <div className="score-track ranked-control-track"><i style={{ width: `${scores.dragon}%` }} /><span style={{ width: `${scores.unicorn}%` }} /><b>{scores.dragon === scores.unicorn ? (locale === "ko" ? "동률 · 미점령 구역을 공략하세요" : "TIED · CHALLENGE A PORTAL") : `${scores.dragon > scores.unicorn ? "DRAGON" : "UNICORN"} · ${t.leading}`}</b></div>
          <div className="unicorn-score"><b>{scores.unicorn}</b><span>UNICORN</span></div>
        </div>
        <div className="header-tools">
          <LanguageToggle locale={locale} onChange={setLocale} />
        </div>
      </header>

      <section className="game-layout">
        <aside className="mission-rail">
          <span className="pixel-label">{t.chapter}</span>
          <h1>{t.mission}</h1>
          <p>{t.missionBody}</p>
          <div className="city-control">
            <span>{t.cityWar}</span>
            <div><i className="dragon-fill" style={{ width: `${scores.dragon}%` }} /><i className="unicorn-fill" style={{ width: `${scores.unicorn}%` }} /></div>
            <p><b>DRAGON {scores.dragon}%</b><b>UNICORN {scores.unicorn}%</b></p>
          </div>
          <div className="team-status">
            <span>{t.yourTeam}</span><div className="shard-wallet">✦ {shards.toLocaleString()} <small>{t.shards}</small></div>
            <div>{team === "dragon" ? <PixelDragon level={guardianLevel} /> : <PixelUnicorn level={guardianLevel} />}<strong>{team === "dragon" ? `${t.dragonTeam} · LV.${guardianLevel}` : `${t.unicornTeam} · LV.${guardianLevel}`}</strong></div>
          </div>
          <button className="change-team" onClick={() => setTeam(null)}>↺ {t.changeTeam}</button>
        </aside>

        <section className={`map-panel ${inBattle ? "battle-mode" : ""}`}>
          {!inBattle ? (
            <>
              <div className="map-top"><div><span className="pixel-label">NYC // MANHATTAN</span><h2>{locale === "ko" ? "포탈 네트워크" : "Portal Network"}</h2></div><p><span className="pulse-dot" />{t.portalHint}</p></div>
              <div
                ref={mapViewportRef}
                className={`pixel-map ${isMapDragging ? "dragging" : ""}`}
                onPointerDown={startMapDrag}
                onPointerMove={moveMap}
                onPointerUp={stopMapDrag}
                onPointerCancel={stopMapDrag}
                onWheel={(event) => {
                  event.preventDefault();
                  changeMapZoom(event.deltaY > 0 ? -.12 : .12);
                }}
              >
                <div className="map-coordinates"><span>40.7831° N</span><span>73.9712° W</span></div>
                <div className="map-controls" aria-label={locale === "ko" ? "지도 조작" : "Map controls"}>
                  <button onClick={() => changeMapZoom(.2)} aria-label={locale === "ko" ? "확대" : "Zoom in"}>+</button>
                  <span>{Math.round(mapView.zoom * 100)}%</span>
                  <button onClick={() => changeMapZoom(-.2)} aria-label={locale === "ko" ? "축소" : "Zoom out"}>−</button>
                  <button className="map-reset" onClick={resetMapView} aria-label={locale === "ko" ? "지도 초기화" : "Reset map"}>⌂</button>
                </div>
                <div className="map-drag-hint">{locale === "ko" ? "드래그하여 이동 · 휠로 확대" : "DRAG TO PAN · SCROLL TO ZOOM"}</div>
                <div className="map-crosshair" aria-hidden="true"><i /><i /></div><div className="map-legend" aria-label={locale === "ko" ? "지도 범례" : "Map legend"}><span><img src={unicornManhole} alt="" />{locale === "ko" ? "유니콘" : "Unicorn"}</span><span><img src={dragonManhole} alt="" />{locale === "ko" ? "드래곤" : "Dragon"}</span><span><img src={closedManhole} alt="" />{locale === "ko" ? "중립" : "Neutral"}</span></div>
                <div
                  className="map-canvas"
                  style={{ transform: `translate3d(${mapView.x}px, ${mapView.y}px, 0) scale(${mapView.zoom})` }}
                >
                <img className="nyc-road-atlas" src={nycTacticalMap} alt="" draggable={false} />
                {zones.map((item) => (
                  <button key={item.id} className={`zone-node owner-${owners[item.id] ?? "neutral"} ${zoneId === item.id ? "selected" : ""} ${item.locked ? "locked" : ""}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-label={`${locale === "ko" ? item.ko : item.en} · ${locale === "ko" ? gameInfo[item.game].ko : gameInfo[item.game].en}`} aria-pressed={zoneId === item.id} onClick={() => !item.locked && setZoneId(item.id)}>
                    <ManholePortal owner={owners[item.id]} />
                    <span className={`zone-name owner-${owners[item.id] ?? "neutral"}`}><b>{locale === "ko" ? item.ko : item.en}</b><small>{item.locked ? t.locked : owners[item.id] ? `${owners[item.id] === "unicorn" ? t.unicornTeam : t.dragonTeam}` : `${t.neutral} · LV.${item.danger}`}</small>{zoneId === item.id && <em className="zone-selected-label">✓ {locale === "ko" ? "선택됨" : "SELECTED"}</em>}</span>
                  </button>
                ))}
                </div>
              </div>
            </>
          ) : gameMode !== "rps" ? (
            <ArcadeGame
              key={`${zoneId}-${gameMode}`}
              mode={gameMode}
              background={landmarkBackgrounds[zone.id]}
              locale={locale}
              guardian={team === "dragon" ? dragonArt[guardianLevel] : unicornArt[guardianLevel]}
              onFinish={(milliseconds) => setPendingRecord(milliseconds)}
              onExit={() => setInBattle(false)}
            />
          ) : (
            <div className="battle-arena landmark-battle" style={{ backgroundImage: `linear-gradient(#08132140, #08132155), url("${landmarkBackgrounds[zone.id]}")` }}>
              <div className="battle-sky"><div className="pixel-moon" /><div className="skyline-far" /></div>
              <div className="battle-hud">
                <div className="dragon-hud"><span>{t.dragonTeam}</span><b>{team === "dragon" ? `${dragonWins} STREAK` : "RIVAL"}</b></div>
                <strong><small>RPS</small>VS</strong>
                <div className="unicorn-hud"><span>{t.unicornTeam}</span><b>{team === "unicorn" ? `${unicornWins} STREAK` : "RIVAL"}</b></div>
              </div>
              <div className="rps-reveal">
                <div className="dragon-move">{dragonMove ? <RpsIcon type={dragonMove} /> : <b>?</b>}</div>
                <span>{result ? t[result] : t.pick}</span>
                <div className="unicorn-move">{unicornMove ? <RpsIcon type={unicornMove} /> : <b>?</b>}</div>
              </div>
              <div className="fighters">
                <div className={team === "dragon" ? "player fighter" : "enemy fighter"}><PixelDragon level={team === "dragon" ? guardianLevel : 3} /></div>
                <div className={team === "unicorn" ? "player fighter" : "enemy fighter"}><PixelUnicorn flipped level={team === "unicorn" ? guardianLevel : 3} /></div>
              </div>
              <div className="battle-ground"><div className="duel-portal"><ManholePortal active /><div className="duel-portal-caption"><span>NYC / TIMES SQUARE</span><b>{locale === "ko" ? "포탈 쟁탈전" : "PORTAL CONTEST"}</b><i aria-hidden="true" /></div></div></div>
              {enemyWins > 0 && <div className="victory-banner"><span>STREAK COMPLETE</span><h2>{playerWins} {locale === "ko" ? "연승" : "WIN STREAK"}</h2><p>{locale === "ko" ? "무승부는 연승 유지 · 패배하면 기록 종료":"DRAWS KEEP YOUR STREAK · A LOSS ENDS YOUR RUN"}</p>{playerWins>0&&<PixelButton onClick={()=>setPendingRecord(playerWins)}>{locale === "ko" ? "기록 등록" : "REGISTER RECORD"}</PixelButton>}<PixelButton secondary onClick={restart}>{t.reset}</PixelButton></div>}
            </div>
          )}
        </section>

        <aside className={`action-rail ${inBattle ? `battle-actions-rail ${gameMode === "runner" ? "runner-actions-rail" : ""}` : "map-actions-rail"}`}>
          {!inBattle ? (
            <>
              <span className="pixel-label">{t.selected}</span>
              <h2>{locale === "ko" ? zone.ko : zone.en}</h2>
              <div className="portal-inspector" style={{ backgroundImage: `linear-gradient(#08132150, #08132180), url("${landmarkBackgrounds[zone.id]}")`, backgroundSize: "cover", backgroundPosition: "center" }}><ManholePortal owner={owners[zone.id]} /><div className="street-lines" /></div>
              <div className={`portal-meta owner-${owners[zone.id] ?? "neutral"}`}><span>{t.portal}</span><b>NYC–0{zone.id + 1}</b><small>{owners[zone.id] ? `${t.occupied} // ${owners[zone.id]?.toUpperCase()}` : `${t.neutral} // ${zone.danger * 240} PX DEPTH`}</small></div>
              <div className="portal-game game-preview-row"><div className="game-preview-thumbnail" aria-hidden="true">{zone.game === "rps" ? <RpsIcon type="scissors" /> : zone.game === "runner" ? <PixelDragon level={3} /> : <ArcadeBriefing index={["snake", "breakout", "memory", "invader"].indexOf(zone.game)} locale={locale} />}</div><div><span>ARCADE // {gameInfo[zone.game].code}</span><b>{locale === "ko" ? gameInfo[zone.game].ko : gameInfo[zone.game].en}</b></div></div>
              <PixelButton onClick={() => { restart(); setGameMode(zone.game); setInBattle(true); }}>{locale === "ko" ? "게임 시작" : "START GAME"} <span>▶</span></PixelButton>
            </>
          ) : gameMode === "runner" ? (
            <>
              <span className="pixel-label">ARCADE // {zone.en.toUpperCase()}</span>
              <h2>{locale === "ko" ? "포탈 러너" : "Portal Runner"}</h2>
              <p className="rps-help">{locale === "ko" ? "점프로 장애물을 넘으며 최대한 오래 버티세요." : "Jump over obstacles and survive as long as possible."}</p>
              <div className="runner-keys"><b>SPACE</b><span>{locale === "ko" ? "점프" : "JUMP"}</span><b>↑</b></div>
              <PixelButton secondary onClick={() => setInBattle(false)}>◀ {locale === "ko" ? "지도로" : "Back to map"}</PixelButton>
            </>
          ) : gameMode !== "rps" ? (
            <>
              <span className="pixel-label">ARCADE // {gameInfo[gameMode].code}</span>
              <h2>{locale === "ko" ? gameInfo[gameMode].ko : gameInfo[gameMode].en}</h2>
              <p className="rps-help">{locale === "ko" ? "최대한 오래 버티세요. 1위 기록의 진영이 포탈을 점령합니다." : "Survive as long as possible. The #1 record controls this portal."}</p>
              <PixelButton secondary onClick={() => setInBattle(false)}>◀ {locale === "ko" ? "지도로" : "Back to map"}</PixelButton>
            </>
          ) : (
            <>
              <span className="pixel-label">{t.versus} // {zone.en.toUpperCase()}</span>
              <h2>{t.rpsTitle}</h2>
              <p className="rps-help">{locale === "ko" ? "연승을 쌓으세요. 무승부는 유지, 패배하면 종료됩니다. 가장 높은 연승 기록이 포탈을 점령합니다." : "Build your win streak. Draws keep it; a loss ends it. The longest streak controls the portal."}</p>
              <div className="streak-counter"><small>WIN STREAK</small><b>{playerWins}</b></div>
              {playerWins>0&&enemyWins===0&&<PixelButton secondary disabled={roundPending} onClick={()=>{setEnemyWins(1);setPendingRecord(playerWins);}}>{locale === "ko" ? "도전 종료 · 기록 등록" : "END RUN · REGISTER"}</PixelButton>}
              <div className="ability-list">
                {(["rock", "paper", "scissors"] as Rps[]).map((move, index) => (
                  <button key={move} onClick={() => play(move)} disabled={roundPending || enemyWins > 0 || pendingRecord !== null} className={playerMove === move ? "chosen" : ""}>
                    <b>0{index + 1}</b><RpsIcon type={move} /><span>{t[move]}<small>{move.toUpperCase()}</small></span>
                  </button>
                ))}
              </div>
              <PixelButton secondary onClick={() => setInBattle(false)}>◀ {locale === "ko" ? "지도로" : "Back to map"}</PixelButton>
            </>
          )}
          <Leaderboard entries={boards[zoneId]??[]} rps={zone.game==="rps"} ko={locale==="ko"} error={rankError}/ >
        </aside>
      </section>
      {pendingRecord!==null&&<RecordEntry value={pendingRecord} rps={gameMode==="rps"} ko={locale==="ko"} onSave={saveRecord} onClose={()=>{setPendingRecord(null);setInBattle(false);}}/>}
    </main>
  );
}
