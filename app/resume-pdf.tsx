'use client';

import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer';
import type { Project } from './page';

type ResumePdfInput = {
  company: string;
  signals: string[];
  projects: Project[];
  primaryColor: string;
};

let fontsRegistered = false;

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingRight: 46,
    paddingBottom: 48,
    paddingLeft: 46,
    backgroundColor: '#ffffff',
    color: '#171717',
    fontFamily: 'Nanum Gothic',
    fontSize: 8.7,
    lineHeight: 1.55,
  },
  accent: {
    height: 5,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 20,
    borderBottomWidth: 0.8,
    borderBottomColor: '#1c1c1c',
  },
  identity: {
    width: '62%',
  },
  name: {
    fontSize: 27,
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: -0.7,
  },
  title: {
    marginTop: 7,
    color: '#555555',
    fontSize: 9.5,
    letterSpacing: 0.15,
  },
  contact: {
    alignItems: 'flex-end',
    gap: 3,
    color: '#454545',
    fontSize: 8,
  },
  contactLink: {
    color: '#454545',
    textDecoration: 'none',
  },
  intro: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 19,
    paddingBottom: 20,
  },
  introLabel: {
    width: 92,
    color: '#777777',
    fontSize: 7.2,
    fontWeight: 700,
    letterSpacing: 1.2,
  },
  introBody: {
    flex: 1,
  },
  introCopy: {
    fontSize: 10.4,
    lineHeight: 1.62,
  },
  focus: {
    marginTop: 10,
    color: '#666666',
    fontSize: 7.5,
  },
  section: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1.2,
    borderTopColor: '#1c1c1c',
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  sectionMeta: {
    color: '#777777',
    fontSize: 7.1,
  },
  project: {
    flexDirection: 'row',
    gap: 18,
    paddingTop: 12,
    paddingBottom: 13,
    borderTopWidth: 0.55,
    borderTopColor: '#d2d2d2',
  },
  projectMeta: {
    width: 98,
  },
  projectPeriod: {
    fontSize: 7.4,
    fontWeight: 700,
  },
  projectCompany: {
    marginTop: 4,
    color: '#666666',
    fontSize: 7.1,
  },
  projectRole: {
    marginTop: 7,
    color: '#777777',
    fontSize: 6.8,
    lineHeight: 1.45,
  },
  projectBody: {
    flex: 1,
  },
  projectCategory: {
    marginBottom: 4,
    color: '#767676',
    fontSize: 6.6,
    fontWeight: 700,
    letterSpacing: 0.75,
    textTransform: 'uppercase',
  },
  projectTitle: {
    fontSize: 12.5,
    lineHeight: 1.3,
    fontWeight: 700,
    letterSpacing: -0.25,
  },
  projectSummary: {
    marginTop: 5,
    color: '#3d3d3d',
    fontSize: 8.2,
    lineHeight: 1.55,
  },
  outcome: {
    marginTop: 7,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#e4e4e4',
    fontSize: 8,
    fontWeight: 700,
  },
  stack: {
    marginTop: 6,
    color: '#6d6d6d',
    fontSize: 6.8,
  },
  careerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 5,
    paddingBottom: 10,
  },
  careerItem: {
    width: '50%',
    paddingTop: 7,
    paddingRight: 14,
  },
  careerCompany: {
    fontSize: 8.2,
    fontWeight: 700,
  },
  careerPeriod: {
    marginTop: 2,
    color: '#777777',
    fontSize: 6.8,
  },
  skillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    paddingTop: 5,
  },
  skill: {
    paddingTop: 4,
    paddingRight: 7,
    paddingBottom: 4,
    paddingLeft: 7,
    borderWidth: 0.5,
    borderColor: '#bfbfbf',
    borderRadius: 2,
    color: '#4d4d4d',
    fontSize: 6.8,
  },
  footer: {
    position: 'absolute',
    right: 46,
    bottom: 21,
    left: 46,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#858585',
    fontSize: 6.5,
  },
});

const career = [
  ['AIMOS', 'Senior Fullstack / AI Engineer · 2025—Current'],
  ['지앤비아이텍', 'Fullstack Engineer · 2022—2024'],
  ['아침소프트', 'Freelance Engineer · 2021'],
  ['DBVISION', 'Backend Engineer · 2018—2020'],
];

export function ResumePdfDocument({
  company,
  signals,
  projects,
  primaryColor,
}: ResumePdfInput) {
  const selectedProjects = (
    company || signals.length
      ? projects
      : projects.filter((project) => project.company !== 'Independent')
  ).slice(0, company || signals.length ? 6 : 10);
  const skills = [
    ...new Set(selectedProjects.flatMap((project) => project.stack)),
  ].slice(0, 18);

  return (
    <Document
      title="송재상 — Backend · Platform · AI Engineer"
      author="송재상"
      subject={
        company ? `${company} 관련 경력` : 'Backend · Platform · AI 경력'
      }
      keywords={[company, ...signals, ...skills].filter(Boolean).join(', ')}
      language="ko-KR"
    >
      <Page size="A4" style={styles.page} wrap>
        <View
          style={[styles.accent, { backgroundColor: primaryColor }]}
          fixed
        />

        <View style={styles.header}>
          <View style={styles.identity}>
            <Text style={styles.name}>송재상</Text>
            <Text style={styles.title}>Backend · Platform · AI Engineer</Text>
          </View>
          <View style={styles.contact}>
            <Link src="mailto:thdwotkd123@gmail.com" style={styles.contactLink}>
              thdwotkd123@gmail.com
            </Link>
            <Link src="tel:+821024082131" style={styles.contactLink}>
              +82 10-2408-2131
            </Link>
            <Text>Seoul · KR</Text>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.introLabel}>PROFILE</Text>
          <View style={styles.introBody}>
            <Text style={styles.introCopy}>
              8년 동안 백엔드와 플랫폼, AI 제품을 만들었습니다. 설계와 구현에서
              멈추지 않고 배포 이후의 비용, 장애, 현장 운영까지 하나의 문제로
              다룹니다.
            </Text>
            {(company || signals.length > 0) && (
              <Text style={styles.focus}>
                {signals.length > 0 ? signals.join(' · ') : company}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Selected Experience</Text>
            <Text style={styles.sectionMeta}>
              {String(selectedProjects.length).padStart(2, '0')} PROJECTS
            </Text>
          </View>

          {selectedProjects.map((project) => (
            <View key={project.id} style={styles.project} wrap={false}>
              <View style={styles.projectMeta}>
                <Text style={styles.projectPeriod}>{project.period}</Text>
                <Text style={styles.projectCompany}>{project.company}</Text>
                <Text style={styles.projectRole}>{project.role}</Text>
              </View>
              <View style={styles.projectBody}>
                <Text style={styles.projectCategory}>{project.category}</Text>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectSummary}>{project.summary}</Text>
                <Text style={styles.outcome}>{project.outcome}</Text>
                <Text style={styles.stack}>{project.stack.join(' · ')}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Career</Text>
            <Text style={styles.sectionMeta}>2018—2026</Text>
          </View>
          <View style={styles.careerGrid}>
            {career.map(([careerCompany, period]) => (
              <View key={careerCompany} style={styles.careerItem}>
                <Text style={styles.careerCompany}>{careerCompany}</Text>
                <Text style={styles.careerPeriod}>{period}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Technical Range</Text>
            <Text style={styles.sectionMeta}>FROM SELECTED WORK</Text>
          </View>
          <View style={styles.skillList}>
            {skills.map((skill) => (
              <Text key={skill} style={styles.skill}>
                {skill}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>송재상 · Backend · Platform · AI Engineer</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${String(pageNumber).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

const safeFilenamePart = (value: string) =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '_');

export async function downloadResumePdf(input: ResumePdfInput) {
  if (!fontsRegistered) {
    const origin = window.location.origin;
    registerResumePdfFonts(
      `${origin}/fonts/NanumGothic-Regular.ttf`,
      `${origin}/fonts/NanumGothic-Bold.ttf`,
    );
  }

  const blob = await pdf(<ResumePdfDocument {...input} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const company = safeFilenamePart(input.company);

  link.href = url;
  link.download = company
    ? `송재상_${company}_이력서.pdf`
    : '송재상_이력서.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function registerResumePdfFonts(regularSrc: string, boldSrc: string) {
  if (fontsRegistered) return;
  Font.register({
    family: 'Nanum Gothic',
    fonts: [
      { src: regularSrc, fontWeight: 400 },
      { src: boldSrc, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}
