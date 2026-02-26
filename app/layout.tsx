import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resumind — ATS Resume Optimizer",
  description: "Optimize your resume for ATS systems using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
