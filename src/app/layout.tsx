import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";

import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Betri Hub",
  description: "Apps for the Betri triathlon group.",
  applicationName: "Betri Hub",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Betri Hub",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} flex min-h-full flex-col antialiased`}
      >
        {/* Phone-first shell: a centered column that never grows wider than a
            comfortable mobile width, even on desktop. */}
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-1 flex-col bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
