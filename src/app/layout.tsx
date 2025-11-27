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
  title: "CRE Analyst AI Mock Interview",
  description:
    "CRE Analyst Mock Interview Coach",
  icons: {
    icon: "/assets/favicon.webp",
  },
  openGraph: {
    title: "CRE Analyst AI Mock Interview",
    description: "CRE Analyst Mock Interview Coach",
    images: [
      {
        url: "/assets/CRE logo.webp",
        width: 800,
        height: 800,
        alt: "CRE Analyst",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CRE Analyst AI Mock Interview",
    description: "CRE Analyst Mock Interview Coach",
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
