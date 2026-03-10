import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredResume } from "@/types";
import { COLORS } from "./shared";

const SIDEBAR_BG = "#1e293b";
const SIDEBAR_ACCENT = "#94a3b8";
const SIDEBAR_HEADING = "#e2e8f0";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.black,
    lineHeight: 1.4,
  },

  /* ---- Sidebar ---- */
  sidebar: {
    width: 180,
    backgroundColor: SIDEBAR_BG,
    color: COLORS.white,
    paddingTop: 44,
    paddingBottom: 48,
    paddingHorizontal: 22,
  },
  sidebarName: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    lineHeight: 1.3,
    marginBottom: 20,
  },
  sidebarSection: {
    marginBottom: 22,
  },
  sidebarSectionTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: SIDEBAR_ACCENT,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.75,
    borderBottomColor: "#334155",
  },
  sidebarText: {
    fontSize: 8.5,
    color: SIDEBAR_HEADING,
    marginBottom: 4,
    lineHeight: 1.45,
  },
  sidebarSkill: {
    fontSize: 8.5,
    color: SIDEBAR_HEADING,
    marginBottom: 5,
    paddingLeft: 8,
    lineHeight: 1.4,
  },
  sidebarEduBlock: {
    marginBottom: 12,
  },
  sidebarEduDegree: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    marginBottom: 2,
    lineHeight: 1.35,
  },
  sidebarEduInstitution: {
    fontSize: 8.5,
    color: SIDEBAR_HEADING,
    marginBottom: 2,
  },
  sidebarEduDates: {
    fontSize: 8,
    color: SIDEBAR_ACCENT,
  },

  /* ---- Main ---- */
  main: {
    flex: 1,
    paddingTop: 44,
    paddingBottom: 48,
    paddingLeft: 30,
    paddingRight: 40,
  },
  mainSectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: SIDEBAR_BG,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: SIDEBAR_BG,
  },
  mainSection: {
    marginBottom: 22,
  },

  /* ---- Summary ---- */
  summary: {
    fontSize: 10,
    color: COLORS.darkGray,
    lineHeight: 1.55,
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

          {/* Contact */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionTitle}>Contact</Text>
            {contact.email && <Text style={styles.sidebarText}>{contact.email}</Text>}
            {contact.phone && <Text style={styles.sidebarText}>{contact.phone}</Text>}
            {contact.location && <Text style={styles.sidebarText}>{contact.location}</Text>}
            {contact.linkedin && <Text style={styles.sidebarText}>{contact.linkedin}</Text>}
            {contact.website && <Text style={styles.sidebarText}>{contact.website}</Text>}
          </View>

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Skills</Text>
              {skills.map((skill, i) => (
                <Text key={i} style={styles.sidebarSkill}>{"\u2022  "}{skill}</Text>
              ))}
            </View>
          )}

          {/* Education */}
          {education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Education</Text>
              {education.map((edu, i) => (
                <View
                  key={i}
                  style={i < education.length - 1 ? styles.sidebarEduBlock : { ...styles.sidebarEduBlock, marginBottom: 0 }}
                >
                  <Text style={styles.sidebarEduDegree}>{edu.degree}</Text>
                  <Text style={styles.sidebarEduInstitution}>{edu.institution}</Text>
                  {edu.dates && <Text style={styles.sidebarEduDates}>{edu.dates}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Profile / Summary */}
          {summary && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Profile</Text>
              <Text style={styles.summary}>{summary}</Text>
            </View>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Experience</Text>
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
        </View>
      </Page>
    </Document>
  );
}
