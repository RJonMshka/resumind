import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredResume } from "@/types";
import { COLORS } from "./shared";

const SIDEBAR_WIDTH = 170;

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.black,
    lineHeight: 1.5,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: "#1a1a2e",
    color: COLORS.white,
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  main: {
    flex: 1,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 32,
  },
  sidebarName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    marginBottom: 12,
  },
  sidebarSection: {
    marginTop: 16,
  },
  sidebarSectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#9e9eff",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#333355",
  },
  sidebarText: {
    fontSize: 9,
    color: "#cccccc",
    marginBottom: 2,
  },
  sidebarSkill: {
    fontSize: 9,
    color: "#cccccc",
    marginBottom: 3,
    paddingLeft: 8,
  },
  mainSectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#1a1a2e",
    marginTop: 16,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a2e",
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
    marginTop: 8,
    marginBottom: 2,
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
    marginLeft: 10,
    marginBottom: 2,
  },
});

interface Props {
  resume: StructuredResume;
}

export default function ModernTemplate({ resume }: Props) {
  const { contact, summary, experience, education, skills } = resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarName}>{contact.name}</Text>

          {/* Contact Info */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionTitle}>Contact</Text>
            {contact.email && <Text style={styles.sidebarText}>{contact.email}</Text>}
            {contact.phone && <Text style={styles.sidebarText}>{contact.phone}</Text>}
            {contact.location && <Text style={styles.sidebarText}>{contact.location}</Text>}
            {contact.linkedin && <Text style={styles.sidebarText}>{contact.linkedin}</Text>}
            {contact.website && <Text style={styles.sidebarText}>{contact.website}</Text>}
          </View>

          {/* Skills in sidebar */}
          {skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Skills</Text>
              {skills.map((skill, i) => (
                <Text key={i} style={styles.sidebarSkill}>{"\u2022  "}{skill}</Text>
              ))}
            </View>
          )}

          {/* Education in sidebar */}
          {education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Education</Text>
              {education.map((edu, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={{ ...styles.sidebarText, fontFamily: "Helvetica-Bold", color: COLORS.white, fontSize: 9 }}>
                    {edu.degree}
                  </Text>
                  <Text style={styles.sidebarText}>{edu.institution}</Text>
                  {edu.dates && <Text style={{ ...styles.sidebarText, fontSize: 8 }}>{edu.dates}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {summary && (
            <View>
              <Text style={styles.mainSectionTitle}>Profile</Text>
              <Text style={styles.summary}>{summary}</Text>
            </View>
          )}

          {experience.length > 0 && (
            <View>
              <Text style={styles.mainSectionTitle}>Experience</Text>
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
                    <Text key={j} style={styles.bullet}>{"\u2022  "}{b}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
