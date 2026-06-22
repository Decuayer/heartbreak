import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nehir Polat'ın Paneli 💕",
    template: "%s | Nehir Polat'ın Paneli",
  },
  description: "Seninle her anımız, kalbimin en özel köşesinde. Seninle geçirdiğimiz zamana özel dijital bir köşe.",
  keywords: ["heartbeat", "love", "romance", "aşk", "anılar"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
