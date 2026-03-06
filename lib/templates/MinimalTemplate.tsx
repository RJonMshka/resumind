import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredResume } from "@/types";
import { COLORS } from "./shared";

const styles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 60,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.darkGray,
    lineHeight: 1.6,
  },
  name: {
    fontSize: 28,
    fontFamily: "Helvetica",
    fontWeight: 300,
    color: COLORS.black,
    marginBottom: 4,
    letterSpacing: 2,
  },
  contactLine: {
    fontSize: 9,
    color: COLORS.lightGray,
    marginBottom: 1,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    marginVertical: 16,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: COLORS.lightGray,
    marginBottom: 8,
  },
  summary: {
    fontSize: 10,
    color: COLORS.mediumGray,
    lineHeight: 1.7,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 8,
    marginBottom: 1,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },
  dates: {
    fontSize: 9,
    color: COLORS.lightGray,
  },
  company: {
    fontSize: 10,
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginLeft: 8,
    marginBottom: 2,
  },
  eduRow: {
    marginTop: 6,
  },
  degree: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },
  institution: {
    fontSize: 10,
    color: COLORS.mediumGray,
  },
  skillsText: {
    fontSize: 10,
    color: COLORS.mediumGray,
    lineHeight: 1.7,
  },
});

interface Props {
  resume: StructuredResume;
}

export default function MinimalTemplate({ resume }: Props) {
  const { contact, summary, experience, education, skills } = resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View>
          <Text style={styles.name}>{contact.name}</Text>
          {contact.email && <Text style={styles.contactLine}>{contact.email}</Text>}
          {contact.phone && <Text style={styles.contactLine}>{contact.phone}</Text>}
          {contact.location && <Text style={styles.contactLine}>{contact.location}</Text>}
          {(contact.linkedin || contact.website) && (
            <Text style={styles.contactLine}>
              {[contact.linkedin, contact.website].filter(Boolean).join("  \u00B7  ")}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} wrap={false}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <Text style={styles.dates}>{exp.dates}</Text>
                </View>
                <Text style={styles.company}>
                  {exp.company}{exp.location ? `  \u00B7  ${exp.location}` : ""}
                </Text>
                {exp.bullets.map((b, j) => (
                  <Text key={j} style={styles.bullet}>{"\u2013  "}{b}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={styles.eduRow}>
                <Text style={styles.degree}>
                  {edu.degree}{edu.dates ? `  \u00B7  ${edu.dates}` : ""}
                </Text>
                <Text style={styles.institution}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>{skills.join("  \u00B7  ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
