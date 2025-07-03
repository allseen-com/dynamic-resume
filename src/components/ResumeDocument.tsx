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
    padding: 28,
    fontFamily: 'Lato',
    fontSize: 12,
    lineHeight: 1.4,
    color: '#000',
  },
  header: {
    borderBottom: '3px solid #1f2937',
    paddingBottom: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  contactInfo: {
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'center',
    marginTop: 0,
    color: '#333',
  },
  titleBar: {
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  titleBarMain: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 3,
    lineHeight: 1.2,
    textAlign: 'center',
  },
  titleBarSub: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#333',
    lineHeight: 1.2,
    textAlign: 'center',
  },
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#1e3a8a',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 8,
    borderRadius: 1,
  },
  sectionContent: {
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  competenciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 12,
  },
  competencyItem: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#000',
    marginTop: 4,
    marginRight: 5,
    flexShrink: 0,
  },
  competencyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.4,
  },
  experienceItem: {
    marginBottom: 16,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    textDecoration: 'underline',
    textDecorationStyle: 'solid',
    flex: 1,
  },
  dateRange: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 1,
    marginBottom: 3,
    color: '#1e3a8a',
    lineHeight: 1.2,
    flexWrap: 'wrap',
  },
  experienceDescription: {
    fontSize: 12,
    lineHeight: 1.5,
    marginTop: 4,
    textAlign: 'justify',
  },
  educationItem: {
    marginBottom: 6,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  educationSchool: {
    flex: 1,
  },
  educationDateRange: {
    marginLeft: 8,
    color: '#333',
  },
  educationDegree: {
    fontSize: 12,
    lineHeight: 1.4,
    color: '#333',
  },
  certificationsList: {
    marginLeft: 12,
  },
  certificationItem: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  certificationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.4,
  },
  technicalSkills: {
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 1.5,
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
        {resumeConfig.sections.showCoreCompetencies && data.coreCompetencies.length > 0 && (
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
        )}

        {/* Technical Proficiency */}
        {resumeConfig.sections.showTechnicalProficiency && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Technical Proficiency</Text>
            <Text style={styles.technicalSkills}>
              SQL; MySQL Database; AWS; Looker Data Studio; AI Automation, Google Tag Manager; PHP; HTML; CSS; WordPress Development; Google Search Console; Google Analytics; Adobe Analytics; Google AdWords; Google Optimize; A/B Testing; Similar Web; Zapier; HubSpot; Adobe CC.
            </Text>
          </View>
        )}

        {/* Professional Experience */}
        {resumeConfig.sections.showProfessionalExperience && data.professionalExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Experience</Text>
            {data.professionalExperience.map((role, i) => {
              const hasDescription = role.description && role.description.trim();
              const itemStyle = hasDescription 
                ? styles.experienceItem 
                : [styles.experienceItem, { marginBottom: 8 }];
              return (
                <View key={i} style={itemStyle}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.companyName}>{role.company}</Text>
                    <Text style={styles.dateRange}>{role.dateRange}</Text>
                  </View>
                  <Text style={styles.experienceTitle}>{role.title}</Text>
                  {hasDescription && (
                    <Text style={styles.experienceDescription}>
                      {role.description}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Education */}
        {resumeConfig.sections.showEducation && data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            {data.education.map((edu, i) => (
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
        {resumeConfig.sections.showCertifications && data.certifications.length > 0 && (
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
        )}
      </Page>
    </Document>
  );
} 