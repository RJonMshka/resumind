import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredResume } from "@/types";
import { COLORS } from "./shared";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.black,
    lineHeight: 1.5,
  },
  header: {
    textAlign: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.black,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9,
    color: COLORS.mediumGray,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summary: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  jobRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
    marginTop: 6,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  dates: {
    fontSize: 9,
    color: COLORS.lightGray,
  },
  company: {
    fontSize: 10,
    color: COLORS.mediumGray,
    marginBottom: 3,
  },
  bullet: {
    fontSize: 10,
    marginLeft: 12,
    marginBottom: 2,
  },
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 4,
  },
  degree: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  institution: {
    fontSize: 10,
    color: COLORS.mediumGray,
  },
  eduDetail: {
    fontSize: 9,
    color: COLORS.lightGray,
    marginLeft: 12,
    marginTop: 1,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  skill: {
    fontSize: 10,
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
        <View style={styles.header}>
          <Text style={styles.name}>{contact.name}</Text>
          {contactParts.length > 0 && (
            <Text style={styles.contactLine}>{contactParts.join("  |  ")}</Text>
          )}
        </View>

        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} wrap={false}>
                <View style={styles.jobRow}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <Text style={styles.dates}>{exp.dates}</Text>
                </View>
                <Text style={styles.company}>
                  {exp.company}{exp.location ? `, ${exp.location}` : ""}
                </Text>
                {exp.bullets.map((b, j) => (
                  <Text key={j} style={styles.bullet}>{"  \u2022  "}{b}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i}>
                <View style={styles.eduRow}>
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

        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {skills.map((skill, i) => (
                <Text key={i} style={styles.skill}>
                  {skill}{i < skills.length - 1 ? "," : ""}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
