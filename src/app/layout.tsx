import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "PaoKoo — Couple's Wallet",
  description:
    "All-in-one finance, investment, and joint-account tracker designed for couples and young adults. Track spending, set shared goals, and grow your wealth together.",
  keywords: [
    "finance",
    "couples",
    "budget",
    "investment",
    "joint account",
    "money tracker",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main
            className="flex-1 transition-all duration-300 pb-24 lg:pb-0 lg:ml-[220px]"
          >
            {children}
          </main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
