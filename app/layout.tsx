import type { Metadata } from "next";
import { Inter, Playfair_Display, Work_Sans } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/context/Theme";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lighted.life"),
  title: "Lighted",
  description:
    "Voice-to-Exegesis for Pastors. Send a voice note via Telegram with your sermon topic or scripture passage, and receive a beautifully crafted exegesis brief in seconds.",
  icons: {
    icon: "/images/site-logo.svg",
  },
  openGraph: {
    title: "Lighted — Free Sermon Research for Pastors",
    description:
      "Greek & Hebrew word studies, historical context, and cross-references for any passage — in seconds.",
    url: "https://lighted.life",
    siteName: "Lighted",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lighted — Free Sermon Research for Pastors",
    description:
      "Greek & Hebrew word studies, historical context, and cross-references for any passage — in seconds.",
  },
  alternates: {
    canonical: "https://lighted.life",
  },
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  "name": "Lighted",
                  "url": "https://lighted.life",
                  "description":
                    "Free voice-to-exegesis tool for pastors. Send a Telegram voice note with your sermon topic or scripture passage and receive a detailed exegesis brief in seconds.",
                  "applicationCategory": "Productivity",
                  "operatingSystem": "All",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                  },
                  "featureList": [
                    "Greek & Hebrew Word Studies",
                    "Historical & Cultural Context",
                    "Sermon Outline Suggestions",
                    "Cross-References",
                    "Telegram Voice Note Input",
                  ],
                },
                {
                  "@type": "Organization",
                  "name": "Lighted",
                  "url": "https://lighted.life",
                  "logo": "https://lighted.life/images/site-logo.svg",
                },
                {
                  "@type": "WebSite",
                  "name": "Lighted",
                  "url": "https://lighted.life",
                },
              ],
            }),
          }}
        />
      </head>
      <SessionProvider session={session}>
        <body
          className={`${inter.variable} ${playfair.variable} ${workSans.variable} font-sans antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
            {children}
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
};

export default RootLayout;