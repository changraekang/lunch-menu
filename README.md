# 신사 주변 식당 오늘의 점심 — 프론트엔드

서울 강남구 신사동·논현동 주변 식당의 오늘 점심 메뉴를 한 화면에서 보여주는 모바일 우선 웹앱입니다.
백엔드가 매일 아침 각 매장 인스타그램·카카오채널에서 긁어온 메뉴를 받아서 렌더링하는 역할만 합니다.

React 19 + TypeScript + Vite로 만들어졌고, 상태 관리 라이브러리나 라우터 없이 단일 화면으로 동작합니다.

## 실행

```bash
npm ci
npm run dev      # 개발 서버 (기본 http://localhost:5173)
npm run build    # tsc -b && vite build → dist/ 생성
npm run preview  # 빌드 결과 미리보기
npm run lint     # oxlint
```

## API 연결

데이터는 백엔드 두 엔드포인트에서 가져옵니다 (`src/api.ts`).

| 엔드포인트 | 용도 |
| --- | --- |
| `GET {API_BASE}/menu` | 매장별 오늘의 메뉴 (`MenuData`) |
| `GET {API_BASE}/menu/weather` | 신사동 현재 기온·날씨 (`WeatherData`) |

`API_BASE`는 기본값이 `https://api.sparkling-rae.com`이고, 로컬 백엔드로 붙이려면
`.env.local`을 만들어 덮어씁니다.

```bash
cp .env.example .env.local
# VITE_API_BASE_URL=http://localhost:4000
```

## 구조

```
src/
  App.tsx      화면 전체 — 헤더(날짜·날씨) / 매장 탭 / 메뉴 카드
  api.ts       백엔드 fetch
  types.ts     MenuData, MenuEntry, WeatherData 등 응답 타입
  status.ts    영업시간 문자열을 파싱해 "지금 운영 중 / 운영 전 / 운영 종료" 뱃지 계산
  App.css      화면 스타일 (max-width 430px 모바일 레이아웃)
  index.css    리셋 + 전역 색상
  assets/fonts GriunX 한글 폰트
public/        favicon·PWA 아이콘·OG 이미지·robots.txt·sitemap.xml
```

### 화면 동작

- **전체보기**: 모든 매장을 2×2 그리드 카드로. 카드를 누르면 해당 매장 탭으로 이동합니다.
- **매장별 탭**: 영업시간과 실시간 영업 상태 뱃지, 오늘의 메뉴, 원본 게시글 링크를 보여줍니다.
- **메뉴 표시 방식**은 매장마다 다릅니다 (백엔드 `displayMode`).
  - `image` — 매장이 올린 메뉴판 사진을 그대로 표시 (도톤보리 뷔페, 속초 뷔페, 국민연금 강남사옥)
  - `text` — 캡션에 텍스트로 적는 매장이라, 백엔드가 파싱한 메뉴 목록을 표시 (논현1647)
- 메뉴가 오늘 갱신되지 않았으면 `stale` 플래그로 "최신 정보가 아닐 수 있어요" 뱃지가 붙습니다.

## SEO / 아이콘

`index.html`에 title·description·canonical·OG·트위터 카드와 `FoodEstablishment` JSON-LD가
들어 있고, 도메인은 `https://menu.sparkling-rae.com` 기준입니다. **배포 도메인이 바뀌면**
`index.html`, `public/robots.txt`, `public/sitemap.xml`의 URL을 함께 고쳐야 합니다.

SPA라서 자바스크립트를 실행하지 않는 크롤러에겐 `#root`가 비어 보이는 문제가 있어,
`index.html`의 `#root` 안에 페이지 요약 마크업을 넣어뒀습니다. React가 마운트되면 교체됩니다.

`public/`의 아이콘들(`favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`,
`og-image.jpg`)은 저장소 루트의 `앱아이콘2.png`에서 생성했습니다. 로고를 바꾸면 이 파일들도
같은 크기로 다시 만들어야 합니다.

## 배포

```bash
npm ci && npm run build   # dist/ 생성 → nginx가 정적 서빙
```

백엔드는 이 저장소의 `../sparkling-api`이고, EC2에서 pm2 프로세스 `app`으로 떠 있습니다
(`api.sparkling-rae.com`). 백엔드 코드를 고쳤다면 `pm2 restart app`, `.env`를 고쳤다면
`pm2 restart app --update-env`가 필요합니다.

메뉴 데이터는 매일 아침 스케줄러가 갱신하지만, 수동으로 다시 긁으려면:

```bash
curl -X POST https://api.sparkling-rae.com/menu/refresh \
  -H "x-refresh-token: <sparkling-api/.env의 REFRESH_TOKEN>"
```
