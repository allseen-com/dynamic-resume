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
    padding: 32,
    fontFamily: 'Lato',
    fontSize: 11,
    lineHeight: 1.4,
    color: '#000',
  },
  header: {
    borderBottom: '4px solid #1f2937', // gray-800
    paddingBottom: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'center',
    marginTop: 4,
  },
  titleBar: {
    textAlign: 'center',
    marginBottom: 16,
  },
  titleBarMain: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a', // blue-900
    marginBottom: 4,
  },
  titleBarSub: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#000',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#1e3a8a', // blue-900
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    borderRadius: 2,
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  competenciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 16,
  },
  competencyItem: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#000',
    marginTop: 5,
    marginRight: 6,
    flexShrink: 0,
  },
  competencyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.4,
  },
  experienceItem: {
    marginBottom: 24, // Increased spacing between work experiences
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    textDecoration: 'underline',
    textDecorationStyle: 'solid',
  },
  dateRange: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 11,
    lineHeight: 1.5,
    marginTop: 8,
    textAlign: 'justify',
  },
  educationItem: {
    marginBottom: 8,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  educationDegree: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  certificationsList: {
    marginLeft: 16,
  },
  certificationItem: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-start',
  },
  certificationText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.4,
  },
  technicalSkills: {
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 1.4,
  },
});

export default function ResumeDocument({ resumeData, config }: ResumeDocumentProps) {
  // If no resume data is provided, use default data
  const data: ResumeData = resumeData || defaultResumeData;

  // Use provided config or default config
  const resumeConfig = config || defaultResumeConfig;

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
            {data.summary}
          </Text>
        </View>

        {/* Core Competencies */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Core Competencies</Text>
          <View style={styles.competenciesGrid}>
            {data.coreCompetencies.map((item, i) => (
              <View key={i} style={styles.competencyItem}>
                <View style={styles.bullet} />
                <Text style={styles.competencyText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Technical Proficiency */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Technical Proficiency</Text>
          <Text style={styles.technicalSkills}>
            SQL; MySQL Database; AWS; Looker Data Studio; AI Automation, Google Tag Manager; PHP; HTML; CSS; WordPress Development; Google Search Console; Google Analytics; Adobe Analytics; Google AdWords; Google Optimize; A/B Testing; Similar Web; Zapier; HubSpot; Adobe CC.
          </Text>
        </View>

        {/* Professional Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Professional Experience</Text>
          {data.professionalExperience.map((role, i) => (
            <View key={i} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <Text style={styles.companyName}>{role.company}</Text>
                <Text style={styles.dateRange}>{role.dateRange}</Text>
              </View>
              <Text style={styles.experienceTitle}>{role.title}</Text>
              {role.description && (
                <Text style={styles.experienceDescription}>
                  {role.description}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Education</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={styles.educationItem}>
              <View style={styles.educationHeader}>
                <Text>{edu.school}</Text>
                <Text>{edu.dateRange}</Text>
              </View>
              <Text style={styles.educationDegree}>{edu.degree}</Text>
            </View>
          ))}
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Certifications</Text>
          <View style={styles.certificationsList}>
            {data.certifications.map((cert, i) => (
              <View key={i} style={styles.certificationItem}>
                <View style={styles.bullet} />
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
} 