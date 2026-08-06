import type { MenuData, WeatherData } from './types';

export async function fetchMenu(): Promise<MenuData> {
  const res = await fetch('/api/menu');
  if (!res.ok) throw new Error(`menu fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch('/api/weather');
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`);
  return res.json();
}
