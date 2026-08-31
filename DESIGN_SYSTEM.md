# Project Index Design System

이 문서는 페이지를 꾸미는 아이디어 모음이 아니라, 디자인 판단을 일관되게 만드는 작업 기준이다. 기준 레퍼런스는 GitHub Next Projects의 프로젝트 인덱스와 Bakken & Bæck 계열 케이스 스터디의 편집 구조다.

## 1. Product character

- 이력서가 아니라 엔지니어링 프로젝트 아카이브처럼 보여야 한다.
- 첫 화면은 소개보다 프로젝트 탐색을 우선한다.
- 상세 화면은 장식보다 문제, 구축 범위, 시스템 흐름, 결과를 증거 순서로 보여준다.
- 회사별 primary color는 선택 상태와 핵심 노드에만 사용한다.
- 의미 없는 AI 장식, 과도한 glass, glow, gradient, 거대한 자기소개 문구는 사용하지 않는다.

## 2. Foundations

### Color

| Token   | Value         | Use                        |
| ------- | ------------- | -------------------------- |
| Paper   | `#F3F2ED`     | 전체 배경                  |
| Surface | `#FBFAF7`     | 텍스트가 놓이는 표면       |
| Ink     | `#171716`     | 제목과 핵심 정보           |
| Ink 2   | `#4F4E4A`     | 본문                       |
| Ink 3   | `#66645F`     | 메타데이터                 |
| Line    | `#DAD8D1`     | 기본 구분선                |
| Brand   | URL `primary` | 선택·링크·핵심 시스템 노드 |

Brand 색은 페이지 면적의 10%를 넘기지 않는다. 본문 배경, 모든 카드, 긴 텍스트에는 적용하지 않는다.

### Typography

- 한글과 본문: `Noto Sans KR Variable`
- 기간, 인덱스, 시스템 라벨: `SF Mono` 계열
- Caption: 11px 이상
- Metadata: 12px
- Body: 14–16px
- Card title: 24/29px
- Section title: 20/28px
- Detail title: `clamp(36px, 5vw, 64px)`
- 제목은 700을 넘기지 않고, 본문은 400–500을 사용한다.

### Grid and spacing

- Content shell: 1248px
- Desktop: 12 columns
- Gutter: 24px, mobile 14px
- Column gap: 12–20px responsive
- 기본 spacing unit: 4px
- Section gap: 64–128px
- 카드 간격: 16–20px

모든 정렬은 12-column grid 또는 카드 내부 축을 따른다. 눈대중으로 별도 좌표를 만들지 않는다.

### Shape and depth

- Small radius: 8px
- Card/media radius: 14px
- Pill은 내비게이션과 명확한 action에만 사용한다.
- 기본 표면은 1px border로 구분한다.
- 그림자는 hover 또는 부유하는 내비게이션에만 낮게 사용한다.

## 3. Components

### Header

- 88px sticky header
- 왼쪽 wordmark, 중앙 navigation, 오른쪽 contact/PDF
- 현재 섹션만 활성 상태로 표시한다.

### Project card

순서: 기간과 상태 → 시각적 시스템 힌트 → 카테고리 → 제목 → 요약 → 측정 결과 → 회사와 상세 링크.

- 카드 전체가 하나의 버튼이다.
- 선택 상태는 brand border와 focus ring으로만 표시한다.
- hover는 `translateY(-4px)` 이내다.
- 결과 수치가 장식보다 먼저 읽혀야 한다.

### Chronology rail

- 넓은 데스크톱에서 오른쪽에 고정한다.
- 현재 프로젝트만 brand node와 굵은 제목으로 표시한다.
- 연도와 프로젝트명은 실제 탐색 버튼이다.
- 작은 화면에서는 숨기고 프로젝트 목록 자체를 연대기로 사용한다.

### Project detail

순서: 메타데이터와 핵심 문장 → 실제 시스템 맵 → Starting point → What I built → Outcome → Tech stack.

- 같은 무게의 카드 여러 개로 본문을 쪼개지 않는다.
- 시스템 맵은 선택 프로젝트의 실제 데이터 흐름을 설명해야 한다.
- 결과는 가능한 경우 비용, 속도, 정확도, 서버 수처럼 검증 가능한 숫자로 쓴다.

## 4. Interaction and motion

- Micro state: 160ms
- Selection/navigation: 240ms
- Section enter: 최대 560ms
- 기본 easing: `cubic-bezier(0.2, 0.75, 0.2, 1)`
- 한 번의 상호작용에 transform, blur, color를 모두 겹치지 않는다.
- `prefers-reduced-motion`에서는 모든 전환을 사실상 제거한다.

## 5. Responsive rules

- 1280px 이상: 3-column project grid
- 768–1279px: 2 columns, 첫 선택 프로젝트만 확장 가능
- 767px 이하: 1 column
- 고정 chronology rail은 1360px부터 연도·노드와 현재 항목명을, 1540px부터 모든 프로젝트명을 노출한다.
- 모바일 내비게이션은 콘텐츠를 덮지 않는 sticky top 방식이다.
- 11px보다 작은 한글 텍스트를 사용하지 않는다.

## 6. URL theming

지원 예시:

```text
?company=토스&some_signal=카드결제&primary=3182f6
?company=회사명&tags=backend,platform&primary=0055ff
?view=all
```

- URL은 콘텐츠 우선순위와 Brand token만 바꾼다.
- 회사명을 화면의 마케팅 문구로 반복하지 않는다.
- 필터 결과가 1개면 넓은 단일 카드, 2개면 2-column, 3개 이상이면 기본 grid를 사용한다.

## 7. Release checklist

- 1440px, 1920px, 390px 실제 화면 확인
- 회사별 URL 필터와 `view=all` 확인
- 키보드 focus와 reduced motion 확인
- 선택 프로젝트와 chronology 상태 일치 확인
- PDF print에서 navigation과 chronology 제외 확인
- formatter, linter, production build 통과
