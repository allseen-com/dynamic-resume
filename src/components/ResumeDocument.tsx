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
import { ResumeConfig, defaultResumeConfig } from '../types/resume';
import defaultResumeData from '../../data/resume.json';

type FlexibleField = string | { value: string; fixed?: boolean; editable?: boolean };

type FlexibleResumeData = {
  header: {
    name: FlexibleField;
    address: FlexibleField;
    email: FlexibleField;
    phone: FlexibleField;
  };
  summary: FlexibleField;
  coreCompetencies: FlexibleField[] | { value: FlexibleField[] };
  technicalProficiency: {
    programming: FlexibleField[];
    cloudData: FlexibleField[];
    analytics: FlexibleField[];
    mlAi: FlexibleField[];
    productivity: FlexibleField[];
    marketingAds: FlexibleField[];
  };
  professionalExperience: {
    company: FlexibleField;
    title: FlexibleField;
    dateRange: FlexibleField;
    description: FlexibleField;
  }[];
  education: {
    school: FlexibleField;
    dateRange: FlexibleField;
    degree: FlexibleField;
  }[] | { value: {
    school: FlexibleField;
    dateRange: FlexibleField;
    degree: FlexibleField;
  }[] };
  certifications: FlexibleField[] | { value: FlexibleField[] };
};

interface ResumeDocumentProps {
  resumeData?: FlexibleResumeData;
  config?: ResumeConfig;
  template?: string;
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
    // Prevent wrapping and add ellipsis for overflow
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '95%',
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

// Utility function to get value from either string or { value, ... }
function getFieldValue(field: FlexibleField | string): string {
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return field.value;
  }
  return field as string;
}

// Utility function to get array from either direct array or { value: array }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getArrayValue(field: FlexibleField[] | { value: FlexibleField[] } | { value: any[] }): any[] {
  if (Array.isArray(field)) {
    return field;
  }
  if (typeof field === 'object' && field !== null && 'value' in field && Array.isArray(field.value)) {
    return field.value;
  }
  return [];
}

// Utility function specifically for education arrays
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEducationArray(field: any): any[] {
  if (Array.isArray(field)) {
    return field;
  }
  if (typeof field === 'object' && field !== null && 'value' in field && Array.isArray(field.value)) {
    return field.value;
  }
  return [];
}

export default function ResumeDocument({ resumeData, config, template }: ResumeDocumentProps) {
  // If no resume data is provided, use default data
  const data: FlexibleResumeData = resumeData || defaultResumeData;

  // Use provided config or default config
  const resumeConfig = config || defaultResumeConfig;

  // --- Core Competencies: Always 2 columns x 5 rows, no wrapping ---
  const coreCompetenciesArray = getArrayValue(data.coreCompetencies);
  const coreItems = coreCompetenciesArray.slice(0, 10);
  while (coreItems.length < 10) coreItems.push('');

  // Get education and certifications arrays properly
  const educationArray = getEducationArray(data.education);
  const certificationsArray = getArrayValue(data.certifications);

  // Generate dynamic technical proficiency text
  const generateTechnicalProficiencyText = () => {
    const tech = data.technicalProficiency;
    const allSkills = [
      ...tech.programming.map(getFieldValue),
      ...tech.cloudData.map(getFieldValue),
      ...tech.analytics.map(getFieldValue),
      ...tech.mlAi.map(getFieldValue),
      ...tech.productivity.map(getFieldValue),
      ...tech.marketingAds.map(getFieldValue)
    ];
    return allSkills.join(', ') + '.';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{getFieldValue(data.header.name)}</Text>
          <Text style={styles.contactInfo}>
            {getFieldValue(data.header.address)} | {getFieldValue(data.header.email)} | {getFieldValue(data.header.phone)}
          </Text>
        </View>

        {/* Title Bar */}
        <View style={styles.titleBar}>
          <Text style={styles.titleBarMain}>
            {getFieldValue(resumeConfig.titleBar.main)}
          </Text>
          <Text style={styles.titleBarSub}>
            {getFieldValue(resumeConfig.titleBar.sub)}
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Career Summary</Text>
          <Text style={styles.sectionContent}>
            {getFieldValue(data.summary)}
          </Text>
        </View>

        {/* Core Competencies */}
        {resumeConfig.sections.showCoreCompetencies && coreCompetenciesArray.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Core Competencies</Text>
            <View style={styles.competenciesGrid}>
              {coreCompetenciesArray.map((item: string, i: number) => (
                <View key={i} style={styles.competencyItem}>
                  <View style={styles.bullet} />
                  {/* Force single-line bullet for PDF, no truncation */}
                  <Text style={styles.competencyText}>{getFieldValue(item)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Technical Proficiency - Now Dynamic */}
        {resumeConfig.sections.showTechnicalProficiency && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Technical Proficiency</Text>
            <Text style={{ fontSize: 11, fontWeight: 'normal', lineHeight: 1.2 }}>
              {generateTechnicalProficiencyText()}
            </Text>
          </View>
        )}

        {/* Professional Experience */}
        {resumeConfig.sections.showProfessionalExperience && data.professionalExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Experience</Text>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.professionalExperience.map((role: any, i: number) => {
              const hasDescription = getFieldValue(role.description) && getFieldValue(role.description).trim();
              const itemStyle = hasDescription 
                ? styles.experienceItem 
                : [styles.experienceItem, { marginBottom: 6 }];
              return (
                <View key={i} style={itemStyle}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.companyName}>{getFieldValue(role.company)}</Text>
                    <Text style={styles.dateRange}>{getFieldValue(role.dateRange)}</Text>
                  </View>
                  <Text style={styles.experienceTitle}>{getFieldValue(role.title)}</Text>
                  {hasDescription && (
                    <Text style={styles.experienceDescription}>
                      {getFieldValue(role.description)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Education - Fixed to handle both array and object structures */}
        {resumeConfig.sections.showEducation && educationArray.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            {educationArray.map((edu: { school: string; dateRange: string; degree: string }, i: number) => (
              <View key={i} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.educationSchool}>{getFieldValue(edu.school)}</Text>
                  <Text style={styles.educationDateRange}>{getFieldValue(edu.dateRange)}</Text>
                </View>
                <Text style={styles.educationDegree}>{getFieldValue(edu.degree)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications - Fixed to handle both array and object structures */}
        {resumeConfig.sections.showCertifications && certificationsArray.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Certifications</Text>
            <View style={styles.certificationsList}>
              {certificationsArray.map((cert: string, i: number) => (
                <View key={i} style={styles.certificationItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.certificationText}>{getFieldValue(cert)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
} 