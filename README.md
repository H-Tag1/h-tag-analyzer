# H-Tag Analyzer

AI 비전 기반 GA4 태그 누락 자동 탐지 도구.
URL을 입력하면 Playwright로 페이지를 캡처하고, Azure OpenAI(GPT-4o)가 스크린샷을 분석해 누락된 GA4 이벤트를 시각적으로 표시합니다.

## 주요 기능

- **기능 1** — URL 입력 → Playwright DOM 수집 + 스크린샷 캡처
- **기능 2** — AI가 누락 GA 태그를 탐지 → 스크린샷 위 빨간 박스 오버레이
- **기능 3** — GA 스펙 수정/확정 → `dataLayer.push()` 코드 자동 생성 + Copy
- **기능 4** — 전체 온라인몰 체크 토글 → 동일 도메인 depth 2 배치 스캔

## 기술 스택

| 역할 | 기술 |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python 3.9+) + uvicorn |
| Crawler | Playwright Python |
| AI | Azure OpenAI (GPT-4o Vision) |

---

## 로컬 실행 방법

### 사전 준비

- Python 3.9 이상
- Node.js 18 이상
- Azure OpenAI 리소스 (GPT-4o 배포 완료)

---

### 1. 저장소 클론

```bash
git clone https://github.com/shinmirim/h-tag-analyzer.git
cd h-tag-analyzer
```

---

### 2. 백엔드 설정

```bash
cd backend

# 패키지 설치
pip3 install -r requirements.txt

# Playwright 브라우저 설치
playwright install chromium
# ※ macOS에서 명령어를 찾지 못하면 아래로 실행
# python3 -m playwright install chromium

# 환경변수 설정
cp .env.example .env
```

`.env` 파일을 열어 Azure OpenAI 정보를 입력합니다.

```env
AZURE_OPENAI_KEY=your-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-01
```

백엔드 실행:

```bash
uvicorn main:app --reload --port 8000
```

---

### 3. 프론트엔드 설정

새 터미널에서:

```bash
cd frontend
npm install
npm run dev
```

---

### 4. 접속

브라우저에서 [http://localhost:5173](http://localhost:5173) 열기

---

## 디렉토리 구조

```
h-tag-poc/
├── backend/
│   ├── main.py                  # FastAPI 앱 진입점
│   ├── config.py                # 환경변수 설정
│   ├── requirements.txt
│   ├── .env.example             # 환경변수 템플릿 (키 없음)
│   ├── routers/                 # API 엔드포인트
│   ├── services/                # 비즈니스 로직
│   └── models/                  # Pydantic 모델
└── frontend/
    ├── src/
    │   ├── pages/               # InputPage, ScanningPage, AnalysisPage
    │   ├── components/          # ScreenshotOverlay, IssuePanel, CodeViewer 등
    │   ├── hooks/               # useScan (SSE)
    │   └── types/               # TypeScript 타입 정의
    └── vite.config.ts           # /api → localhost:8000 프록시
```

## API 엔드포인트

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/scan?url=...&fullScan=false` | SSE 스캔 스트림 |
| GET | `/api/screenshots/{id}` | 스크린샷 이미지 |
| POST | `/api/generate-code` | GA 스펙 → 코드 생성 |
