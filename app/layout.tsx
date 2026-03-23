import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Scribe - Medical Transcription",
  description:
    "Offline AI-powered medical transcription with speaker diarization and SOAP note generation. HIPAA-ready, 100% private.",
  keywords: [
    "medical transcription",
    "SOAP notes",
    "AI transcription",
    "speaker diarization",
    "HIPAA compliant",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
