# UtterAI — 아동 언어치료 AI 분석 플랫폼

AI 기반 아동 언어치료 세션 분석 웹 앱. 치료사가 세션을 녹음하면 AI가 **화자 분리 → 전사 → 언어 지표 → SOAP Note → 보호자 리포트**를 자동 생성합니다.

---

## 기술 스택

| 영역 | 라이브러리 |
|---|---|
| 빌드 | Vite 5 |
| UI | React 18 + TypeScript 5 |
| 스타일 | Tailwind CSS 3 + UtterAI 디자인 토큰 |
| 라우팅 | React Router v6 |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand v5 (persist) |
| 폼 | React Hook Form + Zod |
| HTTP | Axios (Bearer 토큰 인터셉터 + 401 refresh) |
| UI 컴포넌트 | Radix UI 프리미티브 |

---

## 시작하기

### 요구 사항

- Node.js 18+
- npm 9+

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 VITE_API_BASE_URL을 백엔드 주소로 수정

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 환경 변수

`.env.example`을 복사해 `.env`를 만든 후 설정합니다.

| 변수 | 설명 | 기본값 |
|---|---|---|
| `VITE_API_BASE_URL` | 백엔드 API base URL | `http://localhost:8000/api/v1` |

> `.env` 파일은 `.gitignore`에 포함되어 있으므로 커밋되지 않습니다.

---

## 프로젝트 구조

```
src/
├── api/                    # Axios API 모듈
│   ├── client.ts           # axios 인스턴스 + 인터셉터
│   ├── auth.ts             # 로그인·회원가입·refresh
│   ├── children.ts         # 아동 관리 API
│   ├── sessions.ts         # 세션 관리 API
│   └── reports.ts          # 리포트 API
├── components/
│   ├── common/
│   │   ├── Icon.tsx        # lucide-react 래퍼
│   │   ├── StatusBadge.tsx # 세션 상태 배지
│   │   └── ToastContainer.tsx
│   └── layout/
│       ├── AppShell.tsx    # Sidebar + Topbar + Outlet
│       └── Sidebar.tsx     # 좌측 네비게이션
├── hooks/
│   ├── useAuth.ts          # useLogin / useSignup / useLogout
│   └── useToast.ts         # 전역 토스트
├── lib/
│   └── utils.ts            # cn() 유틸 (clsx + tailwind-merge)
├── pages/                  # 페이지 컴포넌트
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── ChildrenPage.tsx
│   ├── ChildDetailPage.tsx
│   ├── SessionsPage.tsx
│   ├── SessionDetailPage.tsx
│   ├── NewSessionPage.tsx
│   ├── ReportsPage.tsx
│   ├── TemplatesPage.tsx
│   └── SettingsPage.tsx
├── store/
│   ├── authStore.ts        # Zustand — 인증 상태 (localStorage 영속)
│   └── toastStore.ts       # Zustand — 토스트 큐
├── App.tsx                 # 라우터 정의
├── main.tsx                # 앱 진입점
└── index.css               # Tailwind + CSS 변수

ui_kits/web-app/            # Claude Design 원본 프로토타입 (참고용)
preview/                    # 디자인 시스템 HTML 미리보기
assets/                     # 로고 SVG
colors_and_type.css         # 디자인 토큰 원본 CSS 변수
```

---

## 라우팅

| 경로 | 페이지 | 인증 필요 |
|---|---|---|
| `/login` | 로그인 | ✗ |
| `/signup` | 회원가입 | ✗ |
| `/dashboard` | 대시보드 | ✓ |
| `/children` | 아동 목록 | ✓ |
| `/children/:id` | 아동 상세 | ✓ |
| `/sessions` | 세션 목록 | ✓ |
| `/sessions/new` | 새 세션 생성 | ✓ |
| `/sessions/:id` | 세션 상세 (4단계 워크플로) | ✓ |
| `/reports` | 리포트 목록 | ✓ |
| `/templates` | 템플릿 관리 | ✓ |
| `/settings` | 설정 (프로필 / 비밀번호) | ✓ |

---

## 인증 흐름

```
로그인 → POST /auth/token/ → access + refresh 토큰 수신
  → authStore(Zustand + persist) 에 저장
  → 모든 요청에 Authorization: Bearer {access} 자동 첨부

401 수신 시:
  → POST /auth/token/refresh/ 로 재발급
  → 대기 중인 요청 큐 재시도
  → refresh도 실패하면 로그아웃 후 /login 이동
```

구현 위치: `src/api/client.ts`

---

## API 연동 방법

현재 페이지들은 목 데이터로 동작합니다. 백엔드 준비 후 아래 패턴으로 교체하세요.

```tsx
// Before (목 데이터)
const sessions = MOCK_SESSIONS

// After (TanStack Query)
const { data: sessions } = useQuery({
  queryKey: ['sessions'],
  queryFn: () => sessionsApi.list(),
})
```

각 API 모듈(`src/api/`)은 실제 엔드포인트 경로에 맞춰 수정합니다.

---

## 디자인 시스템

디자인 토큰은 `colors_and_type.css`와 `tailwind.config.js`에 정의되어 있습니다.

### 컬러 팔레트

| 토큰 | 값 | 용도 |
|---|---|---|
| `brand-700` | `#1A3C34` | Primary 버튼, 포커스, 강조 |
| `brand-500` | `#2D6A4F` | 링크, 보조 텍스트 |
| `brand-200` | `#B7DEC8` | 소프트 강조, 아동 화자 칩 |
| `brand-25` | `#F4FAF6` | 앱 배경 |
| `ink-800` | `#1A1A1A` | Primary 텍스트 |
| `ink-500` | `#6B7280` | Secondary 텍스트 |
| `ink-200` | `#E2E6E4` | 보더 |

### 주요 규칙

- 버튼은 항상 **pill (`rounded-full`)** — 사각 버튼 사용 금지
- 카드: `bg-white border border-ink-200 rounded-xl shadow-sm`
- 그림자는 포레스트 그린 틴트 (`rgba(15,42,36,...)`)
- 수치는 `font-mono-num` (JetBrains Mono + tabular-nums)
- 모션: `120ms` / `200ms`, `ease-out-expo`

디자인 컴포넌트 미리보기는 `preview/` 폴더의 HTML 파일을 브라우저에서 열어 확인하세요.

---

## 세션 상태 Enum

```
CREATED → AUDIO_UPLOADED → ANALYSIS_PROCESSING → ANALYSIS_COMPLETED → REPORT_READY
                                     ↓
                                   FAILED
```

백엔드 enum이 다르면 `src/api/sessions.ts`의 `SessionStatus` 타입과 `src/components/common/StatusBadge.tsx`의 `STATUS_MAP`을 수정하세요.

---

## 기여 가이드

```bash
# 새 브랜치 생성
git checkout -b feat/기능명

# 커밋 메시지 형식
feat: 세션 상세 페이지 MLU 차트 추가
fix: 401 refresh 토큰 루프 수정
chore: 의존성 업데이트
```
