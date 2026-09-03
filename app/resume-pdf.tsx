'use client';

import {
  Document,
  Font,
  Image,
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
  signalLabels: string[];
  projects: Project[];
  primaryColor: string;
  portfolioUrl: string;
  assetOrigin: string;
  includeImages: boolean;
};

let fontsRegistered = false;

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingRight: 42,
    paddingBottom: 40,
    paddingLeft: 42,
    backgroundColor: '#ffffff',
    color: '#171717',
    fontFamily: 'Nanum Gothic',
    fontSize: 8.7,
    lineHeight: 1.55,
  },
  accent: {
    height: 4,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 15,
    borderBottomWidth: 0.8,
    borderBottomColor: '#1c1c1c',
  },
  headerIdentity: {
    width: '62%',
    flexDirection: 'row',
    gap: 13,
  },
  portrait: {
    width: 54,
    height: 72,
    objectFit: 'cover',
  },
  identity: {
    flex: 1,
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
  portfolioLink: {
    marginTop: 3,
    color: '#454545',
    fontSize: 7.1,
    textDecoration: 'none',
  },
  intro: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 14,
    paddingBottom: 15,
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
    paddingTop: 8,
    paddingBottom: 6,
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
    gap: 15,
    paddingTop: 9,
    paddingBottom: 10,
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
  projectVisual: {
    marginTop: 6,
    padding: 4,
    borderWidth: 0.5,
    borderColor: '#dedede',
    borderRadius: 2,
    backgroundColor: '#f7f7f5',
  },
  projectImage: {
    width: '100%',
    height: 84,
    objectFit: 'contain',
  },
  projectImageCaption: {
    marginTop: 4,
    color: '#777777',
    fontSize: 6.3,
    lineHeight: 1.4,
  },
  caseNotes: {
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#dedede',
  },
  caseNote: {
    flexDirection: 'row',
    gap: 9,
    paddingTop: 4,
  },
  caseLabel: {
    width: 43,
    color: '#777777',
    fontSize: 6.4,
    fontWeight: 700,
  },
  caseText: {
    flex: 1,
    color: '#3f3f3f',
    fontSize: 7.3,
    lineHeight: 1.55,
  },
  technologyProofs: {
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#dedbd4',
  },
  technologyProof: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 3,
  },
  technologyProofLabel: {
    width: 70,
    color: '#555555',
    fontSize: 6.5,
    fontWeight: 700,
  },
  technologyProofText: {
    flex: 1,
    color: '#3d3d3d',
    fontSize: 7,
    lineHeight: 1.5,
  },
  outcome: {
    marginTop: 5,
    paddingTop: 4,
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
  stackLabel: {
    color: '#454545',
    fontWeight: 700,
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
  skillLine: {
    paddingTop: 5,
    color: '#4d4d4d',
    fontSize: 6.8,
    lineHeight: 1.55,
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

const normalizePdfSignal = (value: string) =>
  value.trim().toLowerCase().replaceAll(' ', '-');

const relatedPdfSignals = (left: string, right: string) =>
  left === right || left.startsWith(`${right}-`) || right.startsWith(`${left}-`);

export function ResumePdfDocument({
  company,
  signals,
  signalLabels,
  projects,
  primaryColor,
  portfolioUrl,
  assetOrigin,
  includeImages,
}: ResumePdfInput) {
  const selectedProjects = projects;
  const skills = [
    ...new Set(selectedProjects.flatMap((project) => project.stack)),
  ].slice(0, 18);
  const portfolioLabel = portfolioUrl
    .replace(/^https?:\/\//, '')
    .replace(/\?.+$/, '');
  const normalizedSignals = signals.map((signal, index) => ({
    key: normalizePdfSignal(signal),
    label: signalLabels[index] ?? signal,
  }));
  const technologyProofs = (project: Project) =>
    project.matchProofs
      .map((proof) => {
        const proofSignals = proof.signals.map(normalizePdfSignal);
        const labels = normalizedSignals
          .filter((signal) =>
            proofSignals.some((proofSignal) =>
              relatedPdfSignals(signal.key, proofSignal),
            ),
          )
          .map((signal) => signal.label);
        return labels.length > 0 ? { labels, text: proof.text } : null;
      })
      .filter((proof): proof is { labels: string[]; text: string } => Boolean(proof))
      .slice(0, 3);
  const mediaSource = (project: Project) => {
    const media = project.media?.[0];
    if (!media) return null;
    const source = media.frames?.[0] ?? media.src;
    return {
      ...media,
      source: /^https?:\/\//.test(source) ? source : `${assetOrigin}${source}`,
    };
  };

  return (
    <Document
      title="송재상 — Backend · Platform · AI Engineer"
      author="송재상"
      subject={
        company ? `${company} 관련 경력` : 'Backend · Platform · AI 경력'
      }
      keywords={[company, ...signalLabels, ...skills].filter(Boolean).join(', ')}
      language="ko-KR"
    >
      <Page size="A4" style={styles.page} wrap>
        <View
          style={[styles.accent, { backgroundColor: primaryColor }]}
          fixed
        />

        <View style={styles.header}>
          <View style={styles.headerIdentity}>
            <Image
              src={`${assetOrigin}/profile-photo.jpg`}
              style={styles.portrait}
            />
            <View style={styles.identity}>
              <Text style={styles.name}>송재상</Text>
              <Text style={styles.title}>Backend · Platform · AI Engineer</Text>
            </View>
          </View>
          <View style={styles.contact}>
            <Link src="mailto:thdwotkd123@gmail.com" style={styles.contactLink}>
              thdwotkd123@gmail.com
            </Link>
            <Link src="tel:+821024082131" style={styles.contactLink}>
              +82 10-2408-2131
            </Link>
            <Text>Seoul · KR</Text>
            <Link src={portfolioUrl} style={styles.portfolioLink}>
              {portfolioLabel} · Portfolio ↗
            </Link>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.introLabel}>PROFILE</Text>
          <View style={styles.introBody}>
            <Text style={styles.introCopy}>
              안녕하십니까 송재상입니다. 코딩을 하나의 예술이라 생각하고 개발을 통해 세상을 바꾸고 싶은 개발자 입니다.
            </Text>
            {(company || signals.length > 0) && (
              <Text style={styles.focus}>
                {signalLabels.length > 0 ? signalLabels.join(' · ') : company}
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

          {selectedProjects.map((project) => {
            const media = includeImages ? mediaSource(project) : null;
            const proofs = technologyProofs(project);
            return (
            <View key={project.id} style={styles.project} minPresenceAhead={90}>
              <View style={styles.projectMeta}>
                <Text style={styles.projectPeriod}>{project.period}</Text>
                <Text style={styles.projectCompany}>{project.company}</Text>
                <Text style={styles.projectRole}>{project.role}</Text>
              </View>
              <View style={styles.projectBody}>
                <Text style={styles.projectCategory}>{project.category}</Text>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectSummary}>{project.summary}</Text>
                <View style={styles.caseNotes}>
                  <View style={styles.caseNote}>
                    <Text style={styles.caseLabel}>문제</Text>
                    <Text style={styles.caseText}>{project.startingPoint}</Text>
                  </View>
                  <View style={styles.caseNote}>
                    <Text style={styles.caseLabel}>판단·구현</Text>
                    <Text style={styles.caseText}>{project.build}</Text>
                  </View>
                </View>
                {proofs.length > 0 ? (
                  <View style={styles.technologyProofs}>
                    {proofs.map((proof) => (
                      <View key={`${proof.labels.join('-')}-${proof.text}`} style={styles.technologyProof}>
                        <Text style={styles.technologyProofLabel}>
                          {proof.labels.join(' · ')}
                        </Text>
                        <Text style={styles.technologyProofText}>{proof.text}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {media ? (
                  <View style={styles.projectVisual}>
                    <Image src={media.source} style={styles.projectImage} />
                    <Text style={styles.projectImageCaption}>{media.caption}</Text>
                  </View>
                ) : null}
                <Text style={styles.outcome}>{project.outcome}</Text>
                <Text style={styles.stack}>
                  <Text style={styles.stackLabel}>사용 기술 · </Text>
                  {project.stack.join(' · ')}
                </Text>
              </View>
            </View>
            );
          })}
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
          <Text style={styles.skillLine}>{skills.join(' · ')}</Text>
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
