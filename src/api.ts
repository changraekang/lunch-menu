import type { MenuData, VisitorStats, WeatherData } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.sparkling-rae.com';
const VISITOR_KEY = 'lunch-visitor-id';

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export async function fetchMenu(): Promise<MenuData> {
  const res = await fetch(`${API_BASE}/menu`, {
    headers: { 'X-Visitor-Id': getVisitorId() }
  });
  if (!res.ok) throw new Error(`menu fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch(`${API_BASE}/menu/weather`);
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`);
  return res.json();
}

// 방문 기록은 GET /menu의 X-Visitor-Id 헤더로 남긴다. 이 호출은 통계만 읽는다.
export async function fetchVisitors(): Promise<VisitorStats> {
  const res = await fetch(`${API_BASE}/menu/visitors`);
  if (!res.ok) throw new Error(`visitors fetch failed: ${res.status}`);
  return res.json();
}
