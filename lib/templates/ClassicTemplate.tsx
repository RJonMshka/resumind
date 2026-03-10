import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredResume } from "@/types";
import { COLORS } from "./shared";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 54,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.black,
    lineHeight: 1.4,
  },

  /* ---- Header ---- */
  header: {
    textAlign: "center",
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.black,
    marginBottom: 6,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 9,
    color: COLORS.mediumGray,
    lineHeight: 1.6,
  },

  /* ---- Sections ---- */
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    paddingBottom: 4,
    marginBottom: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: COLORS.border,
    color: COLORS.darkGray,
  },

  /* ---- Summary ---- */
  summary: {
    fontSize: 10,
    color: COLORS.darkGray,
    lineHeight: 1.55,
  },

  /* ---- Experience ---- */
  jobBlock: {
    marginBottom: 12,
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
  },
  dates: {
    fontSize: 9,
    color: COLORS.lightGray,
  },
  company: {
    fontSize: 10,
    color: COLORS.mediumGray,
    marginBottom: 5,
  },
  bullet: {
    fontSize: 10,
    marginLeft: 10,
    marginBottom: 3,
    lineHeight: 1.45,
  },

  /* ---- Education ---- */
  eduBlock: {
    marginBottom: 8,
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
    color: COLORS.mediumGray,
  },
  eduDetail: {
    fontSize: 9,
    color: COLORS.lightGray,
    marginLeft: 10,
    marginTop: 2,
  },

  /* ---- Skills ---- */
  skillsText: {
    fontSize: 10,
    color: COLORS.darkGray,
    lineHeight: 1.6,
  },
});

interface Props {
  resume: StructuredResume;
}

export default function ClassicTemplate({ resume }: Props) {
  const { contact, summary, experience, education, skills } = resume;

  const contactParts: string[] = [];
  if (contact.email) contactParts.push(contact.email);
  if (contact.phone) contactParts.push(contact.phone);
  if (contact.location) contactParts.push(contact.location);
  if (contact.linkedin) contactParts.push(contact.linkedin);
  if (contact.website) contactParts.push(contact.website);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{contact.name}</Text>
          {contactParts.length > 0 && (
            <Text style={styles.contactLine}>{contactParts.join("  |  ")}</Text>
          )}
        </View>

        {/* Summary */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
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
                  <Text key={j} style={styles.bullet}>{"\u2022  "}{b}</Text>
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
                {edu.details && (
                  <Text style={styles.eduDetail}>{edu.details}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsText}>{skills.join("  \u2022  ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
