import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acquisitions Career Pathway Reflection",
  description: "Write, refine, and download your Acquisitions reflection transcript.",
};

export default function AcquisitionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

