import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WanLogger",
  description: "WAN IP logger dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

