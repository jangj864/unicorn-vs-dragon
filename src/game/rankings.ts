export type Faction = "dragon" | "unicorn";
export type RankEntry = { nickname: string; team: Faction; value: number; player_id: string; created_at: string };
export type Boards = Record<number, RankEntry[]>;
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const onlineRanking = Boolean(url && key);
const storageKey = "portal-survival-ranks-v1";
let session: { access_token: string; refresh_token: string; expires_at: number } | undefined;
export const formatRecord = (value: number, rps: boolean) => rps ? `${value} W` : `${Math.floor(value/60000)}:${String(Math.floor(value/1000)%60).padStart(2,"0")}.${Math.floor(value%1000/100)}`;
export function rankEntries(entries: RankEntry[]): RankEntry[] { return [...entries].sort((a,b)=>b.value-a.value || a.created_at.localeCompare(b.created_at) || a.player_id.localeCompare(b.player_id)).slice(0,10); }
function readLocal(): Boards { try { const raw=JSON.parse(localStorage.getItem(storageKey)??"{}"); const boards:Boards={};for(let id=0;id<8;id++)boards[id]=rankEntries((Array.isArray(raw[id])?raw[id]:[]).filter((r:RankEntry)=>typeof r.nickname==="string"&&r.nickname.length<=20&&["dragon","unicorn"].includes(r.team)&&Number.isSafeInteger(r.value)&&r.value>0&&typeof r.player_id==="string"&&typeof r.created_at==="string"));return boards;}catch{return {};} }
async function api(path:string, body:unknown, token?:string) {
  const response=await fetch(`${url}${path}`,{method:"POST",headers:{apikey:key!,...(token?{Authorization:`Bearer ${token}`} : {}),"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!response.ok)throw new Error("Ranking service unavailable. Please retry.");
  const bodyText = await response.text();
  return bodyText ? JSON.parse(bodyText) : null;
}
async function authToken(){
  if(!session){try{session=JSON.parse(localStorage.getItem("portal-ranking-session")??"null")??undefined;}catch{session=undefined;}}
  if(session&&session.expires_at>Date.now()/1000+60)return session.access_token;
  const data=await api(session?"/auth/v1/token?grant_type=refresh_token":"/auth/v1/signup",session?{refresh_token:session.refresh_token}:{});
  session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()/1000+data.expires_in};
  localStorage.setItem("portal-ranking-session",JSON.stringify(session));return session.access_token;
}
export async function fetchBoards():Promise<Boards>{
  if(!onlineRanking)return readLocal();
  const rows=await api("/rest/v1/rpc/portal_top_ten",{});const result:Boards={};for(const row of rows)(result[row.zone_id]??=[]).push(row);return result;
}
export async function submitRecord(zone:number, nickname:string, team:Faction, value:number):Promise<Boards>{
  const name=nickname.trim();if(!name||name.length>20||!Number.isSafeInteger(value)||value<=0)throw new Error("Enter a nickname (1–20 characters).");
  if(onlineRanking){await api("/rest/v1/rpc/portal_submit_record",{p_zone:zone,p_nickname:name,p_team:team,p_value:value},await authToken());return fetchBoards();}
  const boards=readLocal();const player_id=name.toLocaleLowerCase();const rows=boards[zone]??[];const previous=rows.find(r=>r.player_id===player_id);
  if(!previous||value>previous.value)boards[zone]=rankEntries([...rows.filter(r=>r.player_id!==player_id),{nickname:name,team,value,player_id,created_at:new Date().toISOString()}]);
  localStorage.setItem(storageKey,JSON.stringify(boards));return boards;
}
