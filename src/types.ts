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
