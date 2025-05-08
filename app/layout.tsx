import type { Metadata } from "next";
import localfont from "next/font/local";
import "./globals.css";
import ThemeProvider from "@/context/Theme";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const audiowide = localfont({
  src: "./fonts/audiowideReg.ttf",
  variable: "--font-audiowide",
  weight: "400",
});

const orbitron = localfont({
  src: "./fonts/orbitronVF.ttf",
  variable: "--font-orbitron",
  weight: "300, 400, 500, 600, 700",
});

const montserrat = localfont({
  src: "./fonts/montserratVF.ttf",
  variable: "--font-montserrat",
  weight: "300, 400, 500, 600, 700",
});

export const metadata: Metadata = {
  title: "LightEd",
  description:
    "An ai educational platform to empower pastors and church leaders to share their light",
  icons: {
    icon: "/images/site-logo.svg",
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
      </head>
      <SessionProvider session={session}>
        <body
          className={`${montserrat.variable} ${audiowide.variable} ${orbitron.variable} antialiased`}
        >
          <ThemeProvider attribute="class">
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