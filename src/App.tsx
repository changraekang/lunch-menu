import { useEffect, useState } from 'react';
import './App.css';
import { fetchMenu, fetchVisitors, fetchWeather } from './api';
import type { CaptionMenuItem, MenuData, MenuEntry, VisitorStats, WeatherData } from './types';
import { computeStatus } from './status';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const ALL_ID = '__all__';

function sourceLabel(postUrl: string): string {
  if (postUrl.includes('instagram.com')) return '인스타그램에서 보기';
  if (postUrl.includes('kakao.com')) return '카카오채널에서 보기';
  return '원본 보기';
}

/** 인스타 캡션을 문단으로 정리한다. 한 줄 바꿈은 이어 붙이고, 빈 줄만 문단 구분으로 남긴다. */
function captionParagraphs(caption: string): string[] {
  const lines = caption.split('\n');
  while (lines.length > 0) {
    const last = lines[lines.length - 1].trim();
    if (last === '' || /^(#\S+\s*)+$/.test(last)) {
      lines.pop();
      continue;
    }
    break;
  }

  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      if (current.length > 0) {
        paragraphs.push(current.join(' '));
        current = [];
      }
      continue;
    }
    current.push(line);
  }
  if (current.length > 0) paragraphs.push(current.join(' '));
  return paragraphs;
}

// 문장형 캡션에서 메뉴명만 뽑는다. 긴 접미사(냉채/샐러드)를 먼저 둔다.
const DISH_NAME =
  /(?:[가-힣]{2,12}(?:[·&][가-힣]{2,12})*)?(?:냉채|샐러드|카츠|까스|보쌈|겉절이|장아찌|전골|찌개|커틀릿|볶음|무침|조림|수육|만두|잡채|튀김|구이|찜|탕)|(?:[가-힣]{2,12}(?:[·&][가-힣]{2,12})*)(?:국|전|밥|나물)/g;

function dishesFromCaption(caption: string): CaptionMenuItem[] {
  const text = captionParagraphs(caption).join(' ');
  const names = text.match(DISH_NAME) ?? [];
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  return unique.map((name) => ({ emoji: null, name, desc: null }));
}

function MenuItems({ items }: { items: NonNullable<MenuEntry['items']> }) {
  return (
    <ul className="menu-items">
      {items.map((item, i) => (
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

function MenuBody({ place }: { place: MenuEntry }) {
  // 논현1647처럼 캡션에 메뉴를 글로 적는 매장. 사진(음식 컷)으로 떨어지면 안 된다.
  if (place.displayMode === 'text') {
    if (place.items && place.items.length > 0) {
      return <MenuItems items={place.items} />;
    }
    if (place.caption) {
      const dishes = dishesFromCaption(place.caption);
      if (dishes.length >= 2) {
        const paragraphs = captionParagraphs(place.caption);
        const title =
          paragraphs[0] && /오늘의\s*메뉴|금일.*메뉴|오늘의\s*식단/.test(paragraphs[0])
            ? paragraphs[0]
            : null;
        return (
          <div className="menu-text-block">
            {title && <p className="menu-text-title">{title}</p>}
            <MenuItems items={dishes} />
          </div>
        );
      }
      const paragraphs = captionParagraphs(place.caption);
      if (paragraphs.length > 0) {
        return (
          <div className="menu-text">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        );
      }
    }
    return <div className="menu-empty">오늘의 메뉴 정보가 아직 준비되지 않았어요</div>;
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
  const [visitors, setVisitors] = useState<VisitorStats | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMenu()
      .then((data) => {
        setMenu(data);
        setActiveId((prev) => prev ?? ALL_ID);
        // 방문 기록은 백엔드가 GET /menu에서 남기므로, 그 뒤에 조회해야 이번 방문이 반영된다.
        // 방문자 수는 부가 정보라 실패해도 화면 전체를 에러로 만들지 않는다.
        fetchVisitors()
          .then(setVisitors)
          .catch(() => setVisitors(null));
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
            <div className="eyebrow-row">
              <span className="eyebrow">TODAY&apos;S LUNCH</span>
              {visitors && (
                <span
                  className="visitor-chip"
                  title={`${visitors.days}일 동안 누적 ${visitors.total.toLocaleString('ko-KR')}회 조회됐어요`}
                >
                  <span className="visitor-dot" />
                  오늘 {visitors.today.toLocaleString('ko-KR')}
                  <span className="visitor-total">· 누적 {visitors.total.toLocaleString('ko-KR')}</span>
                </span>
              )}
            </div>
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
