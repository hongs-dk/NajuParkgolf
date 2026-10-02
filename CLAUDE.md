# 나주 파크골프 클럽 앱 — 작업 메모 (다음 수정 때 먼저 읽기)

## 개요
- 파크골프 클럽 회원·대회 기록 관리 웹앱(PWA). 핸드폰 홈 화면에 설치해서 사용.
- 소유자: GitHub `hongs-dk` / 저장소 `hongs-dk/NajuParkgolf` (Public)
- 서버 없음. 정적 파일 + 데이터는 이 저장소의 `data.json` 하나에 저장.

## 주소
- 회원용(현재 사용 중): https://raw.githack.com/hongs-dk/NajuParkgolf/main/index.html
  - raw.githack.com 이 GitHub 파일을 웹페이지로 중계. 반영까지 몇 분 캐시.
- GitHub Pages(https://hongs-dk.github.io/NajuParkgolf/)는 설정이 안 켜져 있음(사용자가 켜기 실패).
  켜지면 주소를 그쪽으로 바꾸는 게 더 안정적. 앱 코드는 `APP=location.origin+location.pathname` 이라 주소 무관하게 동작.

## 파일
- `index.html` — 앱 전체(HTML/CSS/JS 한 파일). QR은 cdnjs qrcodejs 사용.
- `data.json` — 공유 데이터 `{members:[], games:[], admins:[]}`
  - member: `{id, name, birth:'YYYY-MM-DD', sex:'남'|'여'}`
  - game: `{id, date, name, scores:{memberId: 타수}}`
  - admins: `{id, name, main?, s, i, c}` — 저장 열쇠(GitHub 토큰)를 관리자 패스워드로 암호화한 값
- `manifest.json`, `sw.js`(network-first 캐시, 버전 문자열 `pg-vN` 올려서 갱신), `icon-192.png`, `icon-512.png`

## 동작 방식
- 읽기: 누구나 로그인 없이 GitHub API `repos/.../contents/data.json` 조회(ETag 사용), 실패 시 상대경로 `data.json`.
  보기 전용 90초, 관리자 30초마다 새로고침 + 화면 복귀 시 새로고침.
- 쓰기: 관리자만. GitHub contents API PUT(sha 사용, 충돌 시 1회 재시도). 커밋 메시지 "기록 업데이트 …".
- 관리자 로그인: 패스워드 입력 → `admins` 항목들을 PBKDF2(SHA-256, 150000회)+AES-GCM으로 복호화 시도 →
  성공하면 토큰을 localStorage `pg_tk`, 본인 항목 id를 `pg_me`에 저장.
  - 대표 관리자 항목 id `main`(삭제 불가), 초기 패스워드 188900 (사용자가 바꿨을 수 있음)
  - 관리자 추가/삭제, 내 패스워드 변경은 앱 ⚙️관리 탭에서.
  - 예전 방식 `#k=토큰` 링크도 여전히 동작.
- 토큰은 저장소에 절대 평문으로 커밋하지 말 것(GitHub가 감지하면 토큰이 폐기됨).
  토큰을 새로 발급하면 `admins`의 모든 항목을 새 토큰으로 다시 암호화해야 함.

## 기능
- 회원: 이름/생년월일(6자리 YYMMDD 입력, 현재연도 뒤 두자리보다 크면 19xx)/성별, 만 나이 표시. 회원 목록 성별 글자색 .sxm #5b80a8 / .sxf #b9748c, 생년월일 글자 .mb 15.5px
- 대회: 날짜·대회명·참가자 타수 입력 → 자동 순위. 동점이면 생년월일 빠른 사람 우선(공동순위 없음)
- 순위·성장 통계 모두 전체/남자/여자 필터
- 성장률 = (최근 5경기 중 첫 경기 타수 − 마지막 경기 타수) / 첫 경기 타수 ×100 (5경기 미만이면 전체, 타수 줄면 +). 성장률 순위도 이 기준
- 최저타·평균타 TOP3, 대회별 전체/성별 순위 (대회 상세의 성별 순위 칩: 녹색 배경 + 글자 남 #5b80a8 / 여 #b9748c)
- 개인 화면 그래프: 최근 5경기 타수 꺾은선(SVG, 위가 높은 타수), 5경기 전 대비 증감 문구
- 성장 탭 "내 기록 찾기": 이름(부분일치)·연생(2자리 55, 4자리 1955)·생년월일 6자리로 검색, 결과·개인화면은 "55년생" 표시 → 개인 추이. "내 기록으로 저장" 시 localStorage pg_my 로 바로가기 버튼
- 대회 상세의 "📥 사진 저장"(안드로이드: 다운로드→갤러리 다운로드 앨범, 아이폰: 공유창의 이미지 저장) / "💬 공유하기"(navigator.share, 불가 시 다운로드) 두 버튼: canvas로 PNG 생성(어르신용 큰 글씨: 행 120px·글자 64px, 순위·이름·(성별 N위, 남 #5578a0 / 여 #b0687f 차분한 색)·타수, 동명이인은 이름(출생연도))
- 글자 크기: 사용자별(localStorage `pg_fs`, 100~160% 10% 단위, 기본 120%) → body.style.zoom. ⚙️설정 탭 맨 위 가－/가＋ 버튼. (하단 탭 이름 "관리"→"설정") 헤더 제목 "⛳ 나주 파크골프"
- 백업 저장/불러오기(불러올 때 admins는 유지)
- 카카오톡 인앱브라우저 감지 시 `kakaotalk://web/openExternal?url=` 로 기본 브라우저로 이동
- 설치 배너: 안드로이드 beforeinstallprompt 버튼, 아이폰은 "홈 화면에 추가" 안내

## 수정 후 배포
1. `index.html` 등 수정 → 필요 시 `sw.js`의 `pg-vN` 올리기
2. 커밋 전 `git fetch origin main` 으로 원격의 data.json(앱이 직접 커밋함) 변경 확인 후 rebase
3. push → githack 반영까지 수 분

## 사용자 메모
- 사용자는 컴퓨터 없이 핸드폰만 사용. 비개발자, 한국어로 쉽게 설명할 것.
