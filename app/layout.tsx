import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Useless Radio",
  description: "Atlanta's newest platform for obscure media. Live radio, music videos, underground rap.",
  openGraph: {
    title: "Useless Radio",
    description: "Atlanta's newest platform for obscure media.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Useless Radio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      </body>
    </html>
  );
}
