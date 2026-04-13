import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WanWatch",
  description: "WAN IP logger dashboard"
};

// Inlined script prevents flash of wrong theme before React hydrates.
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('wanwatch-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e){}
})();
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
