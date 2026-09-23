import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_APP_URL ?? "https://roofing-sales-assistant-production.up.railway.app"),
  title: {
    default: "RidgePilot — Roofing sales from WhatsApp",
    template: "%s | RidgePilot",
  },
  description: "Find roofing leads, manage homeowner outreach, create takeoffs, price jobs, and send proposals—all from WhatsApp.",
  applicationName: "RidgePilot",
  openGraph: {
    title: "RidgePilot — Roofing sales from WhatsApp",
    description: "From permit lead to customer-ready proposal, without leaving WhatsApp.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
