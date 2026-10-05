type Team = "dragon" | "unicorn";
export type Progress = { shards: number; levels: Record<Team, 1 | 2 | 3>; owners: (Team | null)[]; scores: Record<Team, number> };
export const PROGRESS_KEY = "portal-war-progress-v1";
export function parseProgress(raw: string | null): Progress | null {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || !Number.isSafeInteger(value.shards) || value.shards < 0) return null;
    if (!["dragon", "unicorn"].every(team => [1,2,3].includes(value.levels?.[team]))) return null;
    if (!Array.isArray(value.owners) || ![6, 8].includes(value.owners.length) || !value.owners.every((owner: unknown) => owner === null || owner === "dragon" || owner === "unicorn")) return null;
    if (!["dragon", "unicorn"].every(team => Number.isInteger(value.scores?.[team]) && value.scores[team] >= 1 && value.scores[team] <= 99)) return null;
    if (value.scores.dragon + value.scores.unicorn !== 100) return null;
    return { ...value, owners: value.owners.length === 6 ? [...value.owners, null, null] : value.owners };
  } catch { return null; }
}
export function readProgress(): Progress | null {
  try { return parseProgress(localStorage.getItem(PROGRESS_KEY)); } catch { return null; }
}
