import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HireIQ — Your CV, Brutally Improved",
  description: "AI-powered CV analysis, ATS scoring, and job-tailored rewrites. Get hired faster with HireIQ.",
  metadataBase: new URL('https://hireiq.live'),
  openGraph: {
    title: 'HireIQ — Your CV, Brutally Improved',
    description: 'AI-powered CV analysis, ATS scoring, and job-tailored rewrites.',
    siteName: 'HireIQ',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
