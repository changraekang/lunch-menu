export interface StatusInfo {
  text: string;
  color: string;
  bg: string;
}

function parseTimeRangeMinutes(hours: string | null): [number, number] | null {
  if (!hours) return null;
  const matches = hours.match(/(\d{1,2}):(\d{2})/g);
  if (!matches || matches.length < 2) return null;
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return [toMinutes(matches[0]), toMinutes(matches[1])];
}

export function computeStatus(hours: string | null): StatusInfo {
  const range = parseTimeRangeMinutes(hours);
  if (!range) {
    return { text: '영업시간 정보 없음', color: '#8C8880', bg: '#E7E5E1' };
  }
  const [start, end] = range;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin < start) return { text: '운영 전', color: '#6E6A65', bg: '#E7E5E1' };
  if (nowMin <= end) return { text: '지금 운영 중', color: '#0C6B33', bg: '#DCF3E4' };
  return { text: '운영 종료', color: '#8C8880', bg: '#E7E5E1' };
}
