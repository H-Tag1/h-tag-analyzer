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

### 사전 준비 (설치 필요)

- [Python 3.9 이상](https://www.python.org/downloads/) — 백엔드 실행에 필요
- [Node.js 18 이상](https://nodejs.org/) — 프론트엔드 실행에 필요
- Azure OpenAI 리소스 (GPT-4o 배포 완료 상태)

---

### 1. 저장소 클론

```bash
git clone https://github.com/shinmirim/h-tag-analyzer.git
cd h-tag-analyzer
```

> `git clone` : GitHub에서 소스코드를 내 컴퓨터로 복사하는 명령어
> `cd h-tag-analyzer` : 복사된 폴더 안으로 이동

---

### 2. 백엔드 설정

```bash
cd backend
```
> `cd backend` : backend 폴더로 이동

```bash
pip3 install -r requirements.txt
```
> Python 패키지 일괄 설치. `requirements.txt`에 적힌 라이브러리(FastAPI, Playwright 등)를 자동으로 모두 설치

```bash
python3 -m playwright install chromium
```
> Playwright가 웹 페이지를 열고 스크린샷을 찍을 때 사용하는 **Chromium 브라우저(헤드리스)** 를 설치
> ※ 브라우저가 없으면 크롤링이 동작하지 않으므로 반드시 실행

```bash
cp .env.example .env
```
> `.env.example` 파일을 복사해서 `.env` 파일 생성
> `.env` 파일에 실제 Azure OpenAI 키를 입력해야 AI 분석이 작동

`.env` 파일을 열어 Azure OpenAI 정보를 입력합니다.

```env
AZURE_OPENAI_KEY=your-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-01
```

```bash
uvicorn main:app --reload --port 8000
```
> 백엔드 서버 실행
> - `uvicorn` : Python 웹 서버 실행 도구
> - `main:app` : `main.py` 파일 안의 `app` 을 실행
> - `--reload` : 코드 수정 시 서버 자동 재시작 (개발용)
> - `--port 8000` : 8000번 포트로 실행

---

### 3. 프론트엔드 설정

**새 터미널을 열고** 실행합니다. (백엔드 터미널은 그대로 유지)

```bash
cd frontend
```
> frontend 폴더로 이동

```bash
npm install
```
> React 프로젝트에 필요한 패키지를 일괄 설치
> `package.json`에 정의된 라이브러리를 모두 자동 다운로드 (최초 1회만 실행)

```bash
npm run dev
```
> 프론트엔드 개발 서버 실행
> 실행 후 `http://localhost:5173` 주소로 화면 접속 가능

---

### 4. 접속

두 서버가 모두 켜진 상태에서 브라우저로 접속:

**[http://localhost:5173](http://localhost:5173)**

> 백엔드(8000)와 프론트엔드(5173) **두 서버가 동시에 켜져 있어야** 정상 동작합니다.

---

## 디렉토리 구조

```
h-tag-analyzer/
├── backend/
│   ├── main.py                  # FastAPI 앱 진입점
│   ├── config.py                # 환경변수 설정
│   ├── requirements.txt         # Python 패키지 목록
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
