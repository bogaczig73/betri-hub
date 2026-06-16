import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

// FerrariSans is licensed; Inter is the documented open-source substitute.
// A single family carries every text role — display at 500, body at 400.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
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
  // Near-black canvas — never pure black.
  themeColor: "#181818",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} flex min-h-full flex-col antialiased`}
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
