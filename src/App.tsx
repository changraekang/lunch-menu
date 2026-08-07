import { useEffect, useState } from 'react';
import './App.css';
import { fetchMenu, fetchWeather } from './api';
import type { MenuData, MenuEntry, WeatherData } from './types';
import { computeStatus } from './status';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const ALL_ID = '__all__';

function sourceLabel(postUrl: string): string {
  if (postUrl.includes('instagram.com')) return '인스타그램에서 보기';
  if (postUrl.includes('kakao.com')) return '카카오채널에서 보기';
  return '원본 보기';
}

function MenuBody({ place }: { place: MenuEntry }) {
  if (place.displayMode === 'text' && place.items && place.items.length > 0) {
    return (
      <ul className="menu-items">
        {place.items.map((item, i) => (
          <li className="menu-item-row" key={i}>
            {item.emoji && <span className="menu-item-emoji">{item.emoji}</span>}
            <span className="menu-item-body">
              <span className="menu-item-name">{item.name}</span>
              {item.desc && <span className="menu-item-desc">{item.desc}</span>}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (place.imageUrl) {
    return (
      <a className="menu-image-link" href={place.postUrl} target="_blank" rel="noreferrer">
        <img className="menu-image" src={place.imageUrl} alt={`${place.name} 오늘의 메뉴`} />
      </a>
    );
  }

  return <div className="menu-empty">오늘의 메뉴 정보가 아직 준비되지 않았어요</div>;
}

function GridCard({ place, onSelect }: { place: MenuEntry; onSelect: () => void }) {
  const status = computeStatus(place.hours);
  return (
    <button type="button" className="grid-card" onClick={onSelect}>
      <div className="grid-card-head">
        <span className="grid-card-name">{place.name}</span>
        <span className="grid-card-status" style={{ color: status.color, background: status.bg }}>
          {status.text}
        </span>
      </div>
      <div className="grid-card-body">
        <MenuBody place={place} />
      </div>
    </button>
  );
}

function App() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMenu()
      .then((data) => {
        setMenu(data);
        setActiveId((prev) => prev ?? ALL_ID);
      })
      .catch(() => setError(true));
    fetchWeather()
      .then(setWeather)
      .catch(() => setWeather(null));
  }, []);

  if (error) {
    return (
      <div className="page">
        <div className="shell">
          <div className="state-message">메뉴 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</div>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="page">
        <div className="shell">
          <div className="state-message">불러오는 중...</div>
        </div>
      </div>
    );
  }

  const isAllView = activeId === ALL_ID;
  const place = isAllView ? undefined : menu.places.find((p) => p.id === activeId) ?? menu.places[0];
  const status = computeStatus(place?.hours ?? null);
  const now = new Date();
  const dateMain = `${now.getMonth() + 1}월 ${now.getDate()}일 ${DAYS[now.getDay()]}요일`;
  const dateSub = `${now.getFullYear()}년 · ${isAllView ? '전체보기' : place?.name ?? ''}`;

  return (
    <div className="page">
      <div className="shell">
        <header className="header">
          <div className="header-left">
            <span className="eyebrow">TODAY&apos;S LUNCH</span>
            <span className="date-main">{dateMain}</span>
            <span className="date-sub">{dateSub}</span>
          </div>
          <div className="weather-chip">
            <span className="weather-dot" />
            <span className="weather-text">
              <span className="weather-temp">{weather ? `${weather.temp}°` : '--°'}</span>
              <span className="weather-sky">{weather ? weather.sky : '신사동'}</span>
            </span>
          </div>
        </header>

        <nav className="place-tabs">
          <button
            type="button"
            className="place-tab"
            data-active={isAllView}
            onClick={() => setActiveId(ALL_ID)}
          >
            <span>전체보기</span>
            <span className="place-tab-bar" />
          </button>
          {menu.places.map((p) => (
            <button
              key={p.id}
              type="button"
              className="place-tab"
              data-active={p.id === place?.id}
              onClick={() => setActiveId(p.id)}
            >
              <span>{p.name}</span>
              <span className="place-tab-bar" />
            </button>
          ))}
        </nav>

        {!isAllView && (
          <div className="hours-row">
            <span className="hours-text">{place?.hours ? place.hours : '영업시간 정보 없음'}</span>
            <span className="status-badge" style={{ color: status.color, background: status.bg }}>
              {status.text}
            </span>
          </div>
        )}

        {isAllView ? (
          <div className="menu-card-wrap">
            <div className="grid-2x2">
              {menu.places.map((p) => (
                <GridCard key={p.id} place={p} onSelect={() => setActiveId(p.id)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="menu-card-wrap">
            <div className="menu-card">
              <div className="menu-card-head">
                <span className="menu-label">오늘의 메뉴</span>
                {place && (
                  <span className="menu-updated">
                    {new Date(place.updatedAt).toLocaleString('ko-KR', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}{' '}
                    기준
                  </span>
                )}
              </div>

              {place?.stale && <span className="stale-badge">최신 정보가 아닐 수 있어요</span>}

              {place && <MenuBody place={place} />}

              {place?.displayMode !== 'text' && place?.caption && <p className="menu-caption">{place.caption}</p>}

              {place?.postUrl && (
                <a className="menu-source-link" href={place.postUrl} target="_blank" rel="noreferrer">
                  {sourceLabel(place.postUrl)} ›
                </a>
              )}
            </div>
          </div>
        )}

        <footer className="footer-note">메뉴는 매장 사정에 따라 변경될 수 있습니다</footer>
      </div>
    </div>
  );
}

export default App;
