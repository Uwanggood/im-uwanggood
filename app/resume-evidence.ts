export type ResumeEvidence = {
  date: string;
  title: string;
  detail: string;
  url?: string;
};

// Keep the website and downloaded resume aligned.
export const resumeEvidence: ResumeEvidence[] = [
  {
    date: '2026.06',
    title: '한국정보기술학회 하계종합학술대회',
    detail:
      '혼재된 객체 환경에서 어텐션 기반 철스크랩 분류의 성능 향상 기법 · 제2저자',
    url: 'https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE12900919',
  },
  {
    date: '2024.06',
    title: '철강 스크랩 AI 검수 POC 성과 포상',
    detail: 'POC 설계·개발과 본사업 전환 기여 · 사내 포상',
  },
  {
    date: '2021.10',
    title: '복지로 차세대 ERP 우수개발자상',
    detail: '공통 기능·응답 성능·개발 자동화 기여 · 프로젝트 내부 수상',
  },
];
