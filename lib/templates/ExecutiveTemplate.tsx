import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredResume } from "@/types";
import { COLORS } from "./shared";

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.black,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 8,
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.black,
  },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  contactItem: {
    fontSize: 9,
    color: COLORS.mediumGray,
  },
  summarySection: {
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f8f8f8",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.black,
  },
  summaryText: {
    fontSize: 10,
    color: COLORS.darkGray,
    lineHeight: 1.6,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.black,
  },
  jobContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  dates: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.mediumGray,
  },
  company: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique",
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    marginLeft: 14,
    marginBottom: 2,
  },
  eduContainer: {
    marginTop: 6,
  },
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  degree: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  institution: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique",
    color: COLORS.mediumGray,
  },
  eduDetail: {
    fontSize: 9,
    color: COLORS.lightGray,
    marginLeft: 14,
    marginTop: 1,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  skillTag: {
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

interface Props {
  resume: StructuredResume;
}

export default function ExecutiveTemplate({ resume }: Props) {
  const { contact, summary, experience, education, skills } = resume;

  const contactItems: string[] = [];
  if (contact.email) contactItems.push(contact.email);
  if (contact.phone) contactItems.push(contact.phone);
  if (contact.location) contactItems.push(contact.location);
  if (contact.linkedin) contactItems.push(contact.linkedin);
  if (contact.website) contactItems.push(contact.website);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{contact.name}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <Text key={i} style={styles.contactItem}>{item}</Text>
            ))}
          </View>
        </View>

        {/* Executive Summary */}
        {summary && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={styles.jobContainer} wrap={false}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <Text style={styles.dates}>{exp.dates}</Text>
                </View>
                <Text style={styles.company}>
                  {exp.company}{exp.location ? `, ${exp.location}` : ""}
                </Text>
                {exp.bullets.map((b, j) => (
                  <Text key={j} style={styles.bullet}>{"\u25AA  "}{b}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={styles.eduContainer}>
                <View style={styles.eduRow}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  {edu.dates && <Text style={styles.dates}>{edu.dates}</Text>}
                </View>
                <Text style={styles.institution}>{edu.institution}</Text>
                {edu.details && <Text style={styles.eduDetail}>{edu.details}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Competencies</Text>
            <View style={styles.skillsGrid}>
              {skills.map((skill, i) => (
                <Text key={i} style={styles.skillTag}>{skill}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
