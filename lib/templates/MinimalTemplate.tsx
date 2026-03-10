import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredResume } from "@/types";
import { COLORS } from "./shared";

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 64,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.darkGray,
    lineHeight: 1.5,
  },

  /* ---- Header ---- */
  header: {
    marginBottom: 6,
  },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica",
    color: COLORS.black,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  contactItem: {
    fontSize: 8.5,
    color: COLORS.lightGray,
  },
  contactSep: {
    fontSize: 8.5,
    color: COLORS.border,
  },

  /* ---- Divider ---- */
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    marginVertical: 18,
  },

  /* ---- Sections ---- */
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: COLORS.lightGray,
    marginBottom: 10,
  },

  /* ---- Summary ---- */
  summary: {
    fontSize: 10,
    color: COLORS.mediumGray,
    lineHeight: 1.65,
  },

  /* ---- Experience ---- */
  jobBlock: {
    marginBottom: 16,
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
    color: COLORS.black,
  },
  dates: {
    fontSize: 8.5,
    color: COLORS.lightGray,
  },
  company: {
    fontSize: 9.5,
    color: COLORS.mediumGray,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginLeft: 8,
    marginBottom: 3.5,
    lineHeight: 1.5,
  },

  /* ---- Education ---- */
  eduBlock: {
    marginBottom: 10,
  },
  degree: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
    marginBottom: 2,
  },
  institution: {
    fontSize: 9.5,
    color: COLORS.mediumGray,
  },

  /* ---- Skills ---- */
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
            <View style={styles.contactRow}>
              {contactParts.map((part, i) => (
                <View key={i} style={{ flexDirection: "row" }}>
                  {i > 0 && <Text style={styles.contactSep}>{"  \u00B7  "}</Text>}
                  <Text style={styles.contactItem}>{part}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* About */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
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
                  {exp.company}{exp.location ? `  \u00B7  ${exp.location}` : ""}
                </Text>
                {exp.bullets.map((b, j) => (
                  <Text key={j} style={styles.bullet}>{"\u2013  "}{b}</Text>
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
                <Text style={styles.degree}>
                  {edu.degree}{edu.dates ? `  \u00B7  ${edu.dates}` : ""}
                </Text>
                <Text style={styles.institution}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
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
