# 회사별 이력서 다운로드 JSON 작성 기준

## 목적

채용공고와 실제 경력에 맞는 이력서 설정을 만들되, 회사 색상을 임의로 정하거나 증빙 이미지를 일괄 제외하는 일을 반복하지 않는다. 결과 파일은 `output/resume-presets/`에 저장한다.

## 회사 색상 확인

1. 공식 브랜드 가이드 또는 디자인 시스템에서 색상 토큰을 먼저 찾는다.
2. 가이드가 없으면 공식 회사 홈페이지의 실제 적용 CSS에서 primary, 주요 버튼, 로고 색상을 확인한다. 다른 회사의 동명 브랜드, 제품별 브랜드, 기본 프레임워크 색상과 구분한다.
3. CSS에는 여러 선언이 있을 수 있다. Bootstrap 등의 기본 `.btn-primary` 값만 보고 결정하지 말고 뒤의 재정의와 실제 적용 맥락을 확인한다. 불명확하면 브라우저의 적용 스타일을 확인한다.
4. 회사명, 정확한 HEX, 공식 출처 URL, 확인일, 근거의 종류를 아래 기록에 남긴다. 홈페이지 CSS에서 확인한 색은 '홈페이지 primary'라고 설명하고 공식 CI 지정색이라고 단정하지 않는다.
5. 기존 기록은 재사용 단서다. 새 지원용 JSON을 만들 때 공식 출처가 유지되는지 확인한다.
6. 공식 secondary 또는 accent가 확인되지 않으면 새 브랜드 팔레트를 만들지 않는다. accent는 확인한 primary를 재사용하고 secondary는 가독성을 위한 중립색을 사용한다. 중립색은 회사 브랜드 색상으로 설명하지 않는다.
7. 공식 색상을 확인하지 못했다면 확인 불가라고 알린다. 기존 색상을 다른 회사 JSON에서 그대로 가져오거나 추측한 색을 공식 색상처럼 넣지 않는다. 필요한 임시값은 중립색으로 두고 임시값임을 명시한다.

## 이미지와 경력 선택

- `includeImages`는 **true**가 기본이다. 구현 화면과 비용 증빙은 이 포트폴리오의 중요한 근거다.
- 분량 절약이나 채용 담당자의 취향을 추측해서 false로 변경하지 않는다. 사용자가 이미지 제외를 요청한 경우에만 false로 설정한다.
- 공고에 맞는 프로젝트를 선택하되, 역할·수치·팀 규모는 현재 포트폴리오와 사용자가 확인한 사실에 근거한다.
- 이력서·공개 포트폴리오에는 FOFE·FOMO 같은 사내 저장소명이나 내부 약어를 나열하지 않는다. 철강 스크랩 AI 재구축의 프론트엔드 기술은 스킬 목록에만 남긴다. 요약·구현 본문·기술별 설명에 화면 개발 설명이나 'React·TypeScript·Ant Design을 사용했습니다' 같은 기술 나열 문장을 다시 넣지 않는다. 내부 조사 기록의 저장소명은 추적 근거로 유지한다.
- 프로젝트 리드 경험을 인사평가·채용·팀원 육성 등 조직 관리 경험으로 확대해서 쓰지 않는다.
- JSON 설정으로 바뀌는 것은 회사명, 기술 선택, 프로젝트 선택, 범위, 색상, 이미지 포함 여부다. 소개 문구나 프로젝트 본문까지 다시 작성한 것처럼 설명하지 않는다.

## 현재 입력 형식과 검증

`app/page.tsx`의 `PdfSettingsDialog` / `applyAiPreset`과 `ResumePdfSettings`를 기준으로 실제 지원 필드를 확인한다. PDF 반영 범위는 `app/resume-pdf.tsx`에서 확인한다.

- `company`: 회사명
- `scope`: `work`, `personal`, `all`
- `technologies`: 실제 지원되는 태그 또는 기술명 배열
- `projects`: 현재 존재하고 scope에 맞는 프로젝트 ID 배열
- `colors`: `primary`, `secondary`, `accent`의 6자리 HEX 값
- `includeImages`: 기본 true

JSON 구문, 프로젝트 ID, 기술 태그, 색상 형식을 검증한다. 현재 PDF 생성기는 프로젝트를 최신순으로 정렬하므로 JSON 배열 순서가 출력 순서라고 보장하지 않는다. 실제 PDF 생성·열람을 하지 않았다면 검증했다고 말하지 않는다.

## 확인한 회사 색상

### 셀렉트스타 / SelectStar

- 확인일: 2026-09-06
- 출처: https://selectstar.ai/
- 근거: 공식 홈페이지 CSS의 `.bg-primary`, `.text-primary`, `.btn-primary`에 적용된 재정의 값 `#0c5fdb`.
- 홈페이지 primary: **`#0C5FDB`**
- 주의: 같은 HTML에 포함된 Bootstrap 기본값 `#007BFF`와 구분한다. 별도의 공식 CI 가이드를 확인한 것은 아니다.
- 이력서 설정: primary `#0C5FDB`, accent `#0C5FDB`, secondary `#475569`.
- secondary는 이력서 가독성을 위한 중립색이며 셀렉트스타 공식 secondary 색상으로 확인된 값이 아니다.
- 적용 파일: `output/resume-presets/selectstar-senior-ai-engineer.json`
- 이전 임의 색상 primary `#183153`, accent `#0F766E`는 셀렉트스타 브랜드 색상으로 재사용하지 않는다.

### 링크알파 / LinqAlpha

- 확인일: 2026-09-06
- 출처: https://linqalpha.com/
- 근거: 공식 홈페이지 `Request a Demo` 링크의 `data-framer-name="PC/Primary"`에 지정된 배경색 토큰 `--token-88f9d5fb-40f4-4b9e-ad3d-d33203afd9ae`의 값 `#0f0f10`을 확인했다. 해당 링크는 `./contact-sales`로 연결된다.
- 홈페이지 primary 버튼 색상: **`#0F0F10`**. 별도의 공식 CI 지정색으로 확인한 것은 아니다.
- 이력서 설정: primary `#0F0F10`, accent `#0F0F10`, secondary `#475569`.
- secondary는 가독성을 위한 중립색이며 링크알파 공식 secondary 색상으로 확인된 값이 아니다.
- 적용 파일: `output/resume-presets/linqalpha-backend-engineer.json`
- 경력 표현 주의: Venus의 학습 실행 Agent는 LLM 도구 호출 루프를 운영하는 에이전트와 다르다. 현재 포트폴리오의 AI 추론·큐·클라우드 운영 경험을 LLM 에이전트의 실사용자 트래픽, MCP 운영, 토큰 최적화 경험으로 바꾸어 표현하지 않는다.
