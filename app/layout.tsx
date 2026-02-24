import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

/* ── Gestura Headline TRIAL — headings / display ────────── */
const gestura = localFont({
  src: [
    {
      path: "../public/fonts/gestura/GesturaHeadlineTRIAL-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/gestura/GesturaHeadlineTRIAL-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/gestura/GesturaHeadlineTRIAL-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/gestura/GesturaHeadlineTRIAL-RegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/gestura/GesturaHeadlineTRIAL-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/gestura/GesturaHeadlineTRIAL-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gestura",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/* ── Mozaic GEO — body / UI text ────────────────────────── */
const mozaic = localFont({
  src: [
    {
      path: "../public/fonts/mozaic/MozaicGEO-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/mozaic/MozaicGEO-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/mozaic/MozaicGEO-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/mozaic/MozaicGEO-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mozaic",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "LaCraf — Handmade Marketplace",
  description:
    "A marketplace for artisans to showcase and sell their handmade crafts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${gestura.variable} ${mozaic.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
