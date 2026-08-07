import type { MenuData, VisitorStats, WeatherData } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.sparkling-rae.com';

export async function fetchMenu(): Promise<MenuData> {
  const res = await fetch(`${API_BASE}/menu`);
  if (!res.ok) throw new Error(`menu fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch(`${API_BASE}/menu/weather`);
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`);
  return res.json();
}

// 방문 기록 자체는 백엔드가 GET /menu 요청에서 IP 해시로 처리하므로 따로 보낼 게 없다.
export async function fetchVisitors(): Promise<VisitorStats> {
  const res = await fetch(`${API_BASE}/menu/visitors`);
  if (!res.ok) throw new Error(`visitors fetch failed: ${res.status}`);
  return res.json();
}
