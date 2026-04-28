import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeBootstrapScript, ThemeProvider } from "@/components/ThemeProvider";
import { TabBar } from "@/components/TabBar";
import { SwRegister } from "@/components/SwRegister";
import { OnboardingGate } from "@/components/OnboardingGate";
import { ToastHost } from "@/components/ToastHost";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FUEL — Nutrition Tracking",
  description: "Editorial nutrition tracking. Macros, micros, and signal you can read.",
  applicationName: "FUEL",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FUEL",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#16140F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <ThemeBootstrapScript />
      </head>
      <body className="min-h-dvh flex flex-col">
        <ThemeProvider>
          <OnboardingGate>
            <main className="flex-1 flex flex-col pb-[88px]">{children}</main>
            <TabBar />
          </OnboardingGate>
          <ToastHost />
          <SwRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
