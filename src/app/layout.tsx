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
  title: "Career Reflection",
  description: "Write, refine, and download guided career reflection transcripts.",
  icons: {
    icon: "/assets/favicon.webp",
  },
  openGraph: {
    title: "Career Reflection",
    description: "Write, refine, and download guided career reflection transcripts.",
    images: [
      {
        url: "/assets/CRE logo.webp",
        width: 800,
        height: 800,
        alt: "Career Reflection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Reflection",
    description: "Write, refine, and download guided career reflection transcripts.",
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
