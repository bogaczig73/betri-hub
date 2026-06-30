import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";

import { ThemeScript } from "@/components/theme/ThemeScript";

import "./globals.css";

// The Verge type stack, via documented open-source substitutes:
//   Manuka      → Anton         (display shout, ≥ large headline sizes only)
//   PolySans    → Space Grotesk (UI / body workhorse)
//   PolySans Mono → Space Mono  (UPPERCASE labels, timestamps, button text)
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Betri Hub",
  description: "Apps for the Betri triathlon group.",
  applicationName: "Betri Hub",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Betri Hub",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Match the canvas of each theme.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#131313" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${anton.variable} ${grotesk.variable} ${spaceMono.variable} flex min-h-full flex-col antialiased`}
      >
        {/* Mobile-first shell that fans out on larger screens: a phone column
            on mobile, widening to a comfortable desktop container (~1280px). */}
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-1 flex-col bg-background md:max-w-3xl lg:max-w-6xl">
          {children}
        </div>
      </body>
    </html>
  );
}
