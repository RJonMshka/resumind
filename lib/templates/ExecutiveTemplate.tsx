import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredResume } from "@/types";
import { COLORS } from "./shared";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 52,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.black,
    lineHeight: 1.45,
  },

  /* ---- Header ---- */
  header: {
    paddingBottom: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: COLORS.black,
    marginBottom: 6,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  contactItem: {
    fontSize: 9,
    color: COLORS.mediumGray,
  },

  /* ---- Summary ---- */
  summarySection: {
    marginTop: 16,
    marginBottom: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f7f7f8",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.black,
  },
  summaryText: {
    fontSize: 10,
    color: COLORS.darkGray,
    lineHeight: 1.6,
  },

  /* ---- Sections ---- */
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    paddingBottom: 5,
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.black,
  },

  /* ---- Experience ---- */
  jobBlock: {
    marginBottom: 14,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 10.5,
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
    marginBottom: 6,
  },
  bullet: {
    fontSize: 10,
    marginLeft: 12,
    marginBottom: 3,
    lineHeight: 1.45,
  },

  /* ---- Education ---- */
  eduBlock: {
    marginBottom: 10,
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  degree: {
    fontSize: 10.5,
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
    marginLeft: 12,
    marginTop: 2,
  },

  /* ---- Skills ---- */
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    fontSize: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#f0f0f2",
    borderWidth: 0.75,
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

        {/* Professional Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp, i) => (
              <View
                key={i}
                style={i < experience.length - 1 ? styles.jobBlock : { ...styles.jobBlock, marginBottom: 0 }}
                wrap={false}
              >
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
              <View
                key={i}
                style={i < education.length - 1 ? styles.eduBlock : { ...styles.eduBlock, marginBottom: 0 }}
              >
                <View style={styles.eduHeader}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  {edu.dates && <Text style={styles.dates}>{edu.dates}</Text>}
                </View>
                <Text style={styles.institution}>{edu.institution}</Text>
                {edu.details && <Text style={styles.eduDetail}>{edu.details}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Core Competencies */}
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
