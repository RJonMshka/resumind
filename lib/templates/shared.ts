import { StyleSheet } from "@react-pdf/renderer";

// Shared color palette matching CSS variables from globals.css
export const COLORS = {
  black: "#111111",
  darkGray: "#333333",
  mediumGray: "#555555",
  lightGray: "#888888",
  border: "#cccccc",
  accent: "#6c63ff",
  white: "#ffffff",
  offWhite: "#f5f5f5",
} as const;

// Shared base styles reused across templates
export const baseStyles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.black,
    lineHeight: 1.4,
  },
  contactName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9,
    color: COLORS.mediumGray,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  company: {
    fontSize: 10,
    color: COLORS.mediumGray,
  },
  dates: {
    fontSize: 9,
    color: COLORS.lightGray,
  },
  bullet: {
    fontSize: 10,
    marginLeft: 12,
    marginBottom: 2,
  },
  summary: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.offWhite,
    borderRadius: 3,
  },
});
