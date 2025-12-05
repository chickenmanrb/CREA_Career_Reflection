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
  title: "Acquisitions Career Pathway Reflection",
  description: "Write, refine, and score six prompts to clarify your career direction.",
  icons: {
    icon: "/assets/favicon.webp",
  },
  openGraph: {
    title: "Acquisitions Career Pathway Reflection",
    description: "Write, refine, and score six prompts to clarify your career direction.",
    images: [
      {
        url: "/assets/CRE logo.webp",
        width: 800,
        height: 800,
        alt: "Acquisitions Career Pathway Reflection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acquisitions Career Pathway Reflection",
    description: "Write, refine, and score six prompts to clarify your career direction.",
    images: ["/assets/CRE logo.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
