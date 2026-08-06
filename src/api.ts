import type { MenuData, WeatherData } from './types';

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
