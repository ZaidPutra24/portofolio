import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zaid Helsinki Portfolio",
  description: "Web Developer, Designer & AI Enthusiast",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          id="three-js"
          strategy="afterInteractive"
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        />
        {children}
      </body>
    </html>
  );
}
