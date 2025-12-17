import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asset Management Career Pathway Reflection",
  description: "Write, refine, and download your Asset Management reflection transcript.",
};

export default function AssetManagementLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

