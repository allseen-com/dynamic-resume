import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import path from 'path';
import { ResumeData, ResumeConfig, defaultResumeConfig } from '../types/resume';
import defaultResumeData from '../../data/resume.json';

interface ResumeDocumentProps {
  resumeData?: ResumeData;
  config?: ResumeConfig;
}

// Register Lato fonts with absolute paths
const fontPath = path.resolve(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'Lato',
  fonts: [
    { src: path.join(fontPath, 'Lato-Regular.ttf'), fontWeight: 'normal' },
    { src: path.join(fontPath, 'Lato-Bold.ttf'), fontWeight: 'bold' },
    { src: path.join(fontPath, 'Lato-Italic.ttf'), fontStyle: 'italic' },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 18,
    paddingLeft: 28,
    paddingRight: 28,
    fontFamily: 'Lato',
    fontSize: 11.3,
    lineHeight: 1.5,
    color: '#000',
  },
  header: {
    borderBottom: '2px solid #1f2937',
    paddingBottom: 3,
    marginBottom: 8,
    textAlign: 'center',
  },
  name: {
    fontSize: 17.5,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  contactInfo: {
    fontSize: 10.2,
    fontWeight: 'normal',
    textAlign: 'center',
    marginTop: 0,
    color: '#333',
  },
  titleBar: {
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  titleBarMain: {
    fontSize: 12.2,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 2,
    lineHeight: 1.12,
    textAlign: 'center',
  },
  titleBarSub: {
    fontSize: 10.2,
    fontWeight: 'normal',
    color: '#333',
    lineHeight: 1.12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 12.2,
    fontWeight: 'bold',
    backgroundColor: '#1e3a8a',
    color: 'white',
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginBottom: 4,
    borderRadius: 1,
  },
  sectionContent: {
    fontSize: 11.2,
    lineHeight: 1.32,
    textAlign: 'justify',
  },
  competenciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 6,
  },
  competencyItem: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-start',
    paddingRight: 32,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
    marginTop: 2,
    marginRight: 6,
    flexShrink: 0,
  },
  competencyText: {
    flex: 1,
    fontSize: 11.2,
    lineHeight: 1.32,
  },
  experienceItem: {
    marginBottom: 8,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    textDecoration: 'underline',
    textDecorationStyle: 'solid',
    flex: 1,
  },
  dateRange: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 1,
    marginBottom: 2,
    color: '#1e3a8a',
    lineHeight: 1.1,
    flexWrap: 'wrap',
  },
  experienceDescription: {
    fontSize: 11.2,
    lineHeight: 1.32,
    marginTop: 2,
    textAlign: 'justify',
  },
  educationItem: {
    marginBottom: 3,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  educationSchool: {
    flex: 1,
  },
  educationDateRange: {
    marginLeft: 6,
    color: '#333',
  },
  educationDegree: {
    fontSize: 11.2,
    lineHeight: 1.32,
    color: '#333',
  },
  certificationsList: {
    marginLeft: 6,
  },
  certificationItem: {
    flexDirection: 'row',
    marginBottom: 1,
    alignItems: 'flex-start',
  },
  certificationText: {
    flex: 1,
    fontSize: 11.2,
    lineHeight: 1.32,
  },
  technicalSkills: {
    fontSize: 11.2,
    fontWeight: 'normal',
    lineHeight: 1.32,
  },
});

export default function ResumeDocument({ resumeData, config }: ResumeDocumentProps) {
  // If no resume data is provided, use default data
  const data: ResumeData = resumeData || defaultResumeData;

  // Use provided config or default config
  const resumeConfig = config || defaultResumeConfig;

  // --- Core Competencies: Always 2 columns x 5 rows, no wrapping ---
  const coreItems = (data.coreCompetencies.value || []).slice(0, 10);
  while (coreItems.length < 10) coreItems.push('');
  const leftCol = coreItems.slice(0, 5);
  const rightCol = coreItems.slice(5, 10);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.header.name}</Text>
          <Text style={styles.contactInfo}>
            {data.header.address} | {data.header.email} | {data.header.phone}
          </Text>
        </View>

        {/* Title Bar */}
        <View style={styles.titleBar}>
          <Text style={styles.titleBarMain}>
            {resumeConfig.titleBar.main}
          </Text>
          <Text style={styles.titleBarSub}>
            {resumeConfig.titleBar.sub}
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Career Summary</Text>
          <Text style={styles.sectionContent}>
            {data.summary.value}
          </Text>
        </View>

        {/* Core Competencies */}
        {resumeConfig.sections.showCoreCompetencies && coreItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Core Competencies</Text>
            <View style={{ flexDirection: 'row', marginLeft: 6 }}>
              <View style={{ flex: 1 }}>
                {leftCol.map((item, i) => item && (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 1 }}>
                    <View style={styles.bullet} />
                    <Text style={styles.competencyText}>{item}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, marginLeft: 32 }}>
                {rightCol.map((item, i) => item && (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 1 }}>
                    <View style={styles.bullet} />
                    <Text style={styles.competencyText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Technical Proficiency */}
        {resumeConfig.sections.showTechnicalProficiency && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Technical Proficiency</Text>
            {/* Use normal font, comma separator, not bold */}
            <Text style={{ fontSize: 11, fontWeight: 'normal', lineHeight: 1.2 }}>
              {`SQL, MySQL Database, AWS, Looker Data Studio, AI Automation, Google Tag Manager, PHP, HTML, CSS, WordPress Development, Google Search Console, Google Analytics, Adobe Analytics, Google AdWords, Google Optimize, A/B Testing, Similar Web, Zapier, HubSpot, Adobe CC.`}
            </Text>
          </View>
        )}

        {/* Professional Experience */}
        {resumeConfig.sections.showProfessionalExperience && data.professionalExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Experience</Text>
            {data.professionalExperience.map((role, i) => {
              const hasDescription = role.description.value && role.description.value.trim();
              const itemStyle = hasDescription 
                ? styles.experienceItem 
                : [styles.experienceItem, { marginBottom: 6 }];
              return (
                <View key={i} style={itemStyle}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.companyName}>{role.company}</Text>
                    <Text style={styles.dateRange}>{role.dateRange}</Text>
                  </View>
                  <Text style={styles.experienceTitle}>{role.title}</Text>
                  {hasDescription && (
                    <Text style={styles.experienceDescription}>
                      {role.description.value}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Education */}
        {resumeConfig.sections.showEducation && data.education.value.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            {data.education.value.map((edu, i) => (
              <View key={i} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.educationSchool}>{edu.school}</Text>
                  <Text style={styles.educationDateRange}>{edu.dateRange}</Text>
                </View>
                <Text style={styles.educationDegree}>{edu.degree}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {resumeConfig.sections.showCertifications && data.certifications.value.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Certifications</Text>
            <View style={styles.certificationsList}>
              {data.certifications.value.map((cert, i) => (
                <View key={i} style={styles.certificationItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.certificationText}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
} 