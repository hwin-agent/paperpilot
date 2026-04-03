import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PaperPilot — arXiv Paper → Working Code",
  description:
    "Paste a research paper URL. Get a validated, documented implementation in minutes. Powered by GLM 5.1.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "PaperPilot — arXiv Paper → Working Code",
    description:
      "Paste a research paper. Get a validated Python implementation with code that cites the paper's equations. Powered by GLM 5.1.",
    type: "website",
    siteName: "PaperPilot",
  },
  twitter: {
    card: "summary_large_image",
    title: "PaperPilot — arXiv Paper → Working Code",
    description:
      "Paste a research paper. Get a validated Python implementation with code that cites the paper's equations. Powered by GLM 5.1.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Source+Sans+3:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
