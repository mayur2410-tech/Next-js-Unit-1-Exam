import dayjs from "dayjs";
import { TTLCache } from "./cache";

export type SchemeListItem = { schemeCode: string; schemeName: string };

type MfApiSchemeMeta = {
  scheme_name: string;
  scheme_code: string;
  fund_house?: string;
  scheme_type?: string;
  scheme_category?: string;
  isin_growth?: string;
  isin_div_reinvestment?: string;
};

type MfApiNav = { date: string; nav: string }; // date: DD-MM-YYYY

export type SchemeDetails = {
  meta: MfApiSchemeMeta;
  navHistory: { date: string; nav: number }[]; // ISO date, numeric NAV
};

export type ReturnsResponse = {
  startDate: string;
  endDate: string;
  startNAV: number;
  endNAV: number;
  simpleReturn: number;
  annualizedReturn: number | null;
  needs_review?: boolean;
};

export const cacheTTL = {
  mfList: 60 * 60 * 12, // 12h
  scheme: 60 * 60 * 12, // 12h
  groups: 60 * 60 * 24 // 24h
};

const mfListCache = new TTLCache<string, SchemeListItem[]>(cacheTTL.mfList * 1000);
const schemeCache = new TTLCache<string, SchemeDetails>(cacheTTL.scheme * 1000);
const groupsCache = new TTLCache<string, any>(cacheTTL.groups * 1000);

const MF_LIST_URL = "https://api.mfapi.in/mf";
const MF_SCHEME_URL = (code: string) => `https://api.mfapi.in/mf/${code}`;

/**
  Fetch and cache the full schemes list
*/
export async function getAllSchemes(): Promise<SchemeListItem[]> {
  const key = "list";
  const cached = mfListCache.get(key);
  if (cached) return cached;

  const res = await fetch(MF_LIST_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch schemes list");
  const json = (await res.json()) as { schemeCode: string; schemeName: string }[];
  mfListCache.set(key, json);
  return json;
}

/**
  Fetch and cache scheme details (meta + nav history)
*/
export async function getSchemeDetails(code: string): Promise<SchemeDetails> {
  const cached = schemeCache.get(code);
  if (cached) return cached;

  const res = await fetch(MF_SCHEME_URL(code), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch scheme");
  const json = (await res.json()) as { meta: MfApiSchemeMeta; data: MfApiNav[] };

  const navHistory = json.data
    .map((d) => ({
      date: parseMfDateToISO(d.date), // ISO
      nav: Number(d.nav)
    }))
    .filter((d) => isFinite(d.nav) && d.nav > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // ascending

  const details: SchemeDetails = {
    meta: json.meta,
    navHistory
  };

  schemeCache.set(code, details);
  return details;
}

/**
  Returns calculator
*/
export function calcReturns(
  navHistory: SchemeDetails["navHistory"],
  opts: { period?: "1m" | "3m" | "6m" | "1y" | null; from?: string | null; to?: string | null }
): ReturnsResponse {
  if (!navHistory.length) {
    return {
      startDate: "",
      endDate: "",
      startNAV: 0,
      endNAV: 0,
      simpleReturn: 0,
      annualizedReturn: null,
      needs_review: true
    };
  }

  const end = opts.to ? dayjs(opts.to) : dayjs(navHistory[navHistory.length - 1].date);
  const start = opts.period
    ? startForPeriod(end, opts.period)
    : opts.from
      ? dayjs(opts.from)
      : dayjs(navHistory[0].date);

  const startPoint = findOnOrBefore(navHistory, start.toDate());
  const endPoint = findOnOrBefore(navHistory, end.toDate()) ?? navHistory[navHistory.length - 1];

  if (!startPoint || !endPoint) {
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      startNAV: 0,
      endNAV: 0,
      simpleReturn: 0,
      annualizedReturn: null,
      needs_review: true
    };
  }

  const days = dayjs(endPoint.date).diff(dayjs(startPoint.date), "day");
  const simpleReturn = ((endPoint.nav - startPoint.nav) / startPoint.nav) * 100;
  const annualizedReturn = days >= 30 ? (Math.pow(endPoint.nav / startPoint.nav, 365 / Math.max(days, 1)) - 1) * 100 : null;

  return {
    startDate: startPoint.date,
    endDate: endPoint.date,
    startNAV: startPoint.nav,
    endNAV: endPoint.nav,
    simpleReturn,
    annualizedReturn
  };
}

/**
  SIP calculator
*/
export function calcSIP(
  navHistory: SchemeDetails["navHistory"],
  opts: { amount: number; frequency: "monthly"; from: string; to?: string }
) {
  const { amount, from, to } = opts;
  if (!navHistory.length) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalUnits: 0,
      absoluteReturn: 0,
      annualizedReturn: null,
      needs_review: true,
      points: [] as { date: string; investedSoFar: number; unitsSoFar: number; valueAtDate: number }[]
    };
  }

  const start = dayjs(from);
  const end = to ? dayjs(to) : dayjs(navHistory[navHistory.length - 1].date);

  const sipDates = generateMonthlyDates(start, end);
  let totalInvested = 0;
  let totalUnits = 0;

  const points: { date: string; investedSoFar: number; unitsSoFar: number; valueAtDate: number }[] = [];

  for (const d of sipDates) {
    const point = findOnOrBefore(navHistory, d.toDate());
    if (!point || point.nav <= 0) {
      // skip invalid
      continue;
    }
    const units = amount / point.nav;
    totalUnits += units;
    totalInvested += amount;

    // Value at SIP date using that date's NAV
    const valueAtDate = totalUnits * point.nav;
    points.push({
      date: point.date,
      investedSoFar: round2(totalInvested),
      unitsSoFar: round6(totalUnits),
      valueAtDate: round2(valueAtDate)
    });
  }

  const endPoint = findOnOrBefore(navHistory, end.toDate()) ?? navHistory[navHistory.length - 1];

  const currentValue = totalUnits * endPoint.nav;
  const absoluteReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  const years = Math.max(dayjs(endPoint.date).diff(start, "day") / 365.25, 0.0001);
  const annualizedReturn =
    totalInvested > 0 && years >= 0.08
      ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100
      : null;

  const needs_review = points.length < 2;

  return {
    totalInvested: round2(totalInvested),
    currentValue: round2(currentValue),
    totalUnits: round6(totalUnits),
    absoluteReturn: round2(absoluteReturn),
    annualizedReturn: annualizedReturn != null ? round2(annualizedReturn) : null,
    needs_review,
    points
  };
}

/**
  Groups: fund_house -> category -> schemes
  Warning: Heavy on first call. Cached for 24h.
*/
export async function getFundGroups() {
  const cached = groupsCache.get("groups");
  if (cached) return cached;

  const list = await getAllSchemes();

  // Limit concurrency
  const limit = pLimit(10);

  const details = await Promise.all(
    list.map((s) =>
      limit(async () => {
        try {
          const d = await getSchemeDetails(s.schemeCode);
          return d;
        } catch {
          return null;
        }
      })
    )
  );

  const groups: Record<string, Record<string, SchemeListItem[]>> = {};
  for (const d of details) {
    if (!d) continue;
    const house = d.meta.fund_house || "Unknown";
    const cat = d.meta.scheme_category || "Uncategorized";
    groups[house] ??= {};
    groups[house][cat] ??= [];
    groups[house][cat].push({ schemeCode: d.meta.scheme_code, schemeName: d.meta.scheme_name });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    ttlHours: cacheTTL.groups / 3600,
    groups
  };

  groupsCache.set("groups", payload);
  return payload;
}

/* ============ Helpers ============ */

function parseMfDateToISO(d: string): string {
  // MFAPI date format: DD-MM-YYYY
  const [DD, MM, YYYY] = d.split("-").map((x) => Number(x));
  const iso = dayjs(new Date(YYYY, MM - 1, DD)).format("YYYY-MM-DD");
  return iso;
}

function startForPeriod(end: dayjs.Dayjs, period: "1m" | "3m" | "6m" | "1y") {
  switch (period) {
    case "1m":
      return end.subtract(1, "month");
    case "3m":
      return end.subtract(3, "month");
    case "6m":
      return end.subtract(6, "month");
    case "1y":
      return end.subtract(1, "year");
  }
}

function findOnOrBefore(history: { date: string; nav: number }[], target: Date) {
  // binary search on ascending dates
  const t = target.getTime();
  let lo = 0;
  let hi = history.length - 1;
  let ans: { date: string; nav: number } | null = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const tm = new Date(history[mid].date).getTime();
    if (tm <= t) {
      ans = history[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans ?? null;
}

function* monthlyDateIterator(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  let d = start.startOf("day");
  while (d.isBefore(end) || d.isSame(end, "day")) {
    yield d;
    d = d.add(1, "month");
  }
}

function generateMonthlyDates(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  const dates: dayjs.Dayjs[] = [];
  for (const d of monthlyDateIterator(start, end)) dates.push(d);
  return dates;
}

function round2(x: number) {
  return Math.round(x * 100) / 100;
}

function round6(x: number) {
  return Math.round(x * 1e6) / 1e6;
}

function pLimit(concurrency: number) {
  let activeCount = 0;
  const queue: { fn: () => Promise<any>; resolve: (v: any) => void; reject: (e: any) => void }[] = [];

  const next = () => {
    if (activeCount >= concurrency) return;
    const item = queue.shift();
    if (!item) return;
    activeCount++;
    item
      .fn()
      .then((v) => item.resolve(v))
      .catch((e) => item.reject(e))
      .finally(() => {
        activeCount--;
        next();
      });
  };

  return function <T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
}