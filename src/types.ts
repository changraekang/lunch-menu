export type DisplayMode = 'image' | 'text';

export interface CaptionMenuItem {
  emoji: string | null;
  name: string;
  desc: string | null;
}

export interface MenuEntry {
  id: string;
  name: string;
  hours: string | null;
  displayMode: DisplayMode;
  imageUrl: string;
  caption: string | null;
  items: CaptionMenuItem[] | null;
  postUrl: string;
  updatedAt: string;
  stale: boolean;
}

export interface MenuData {
  generatedAt: string;
  places: MenuEntry[];
}

export interface WeatherData {
  temp: number;
  sky: string;
  stale?: boolean;
}

export interface VisitorStats {
  /** 오늘(KST) 유니크 방문자 수 */
  today: number;
  /** 집계 시작 이후 누적 유니크 방문자 수 */
  total: number;
  /** 집계된 날짜 수 */
  days: number;
}
