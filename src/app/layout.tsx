import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chesticals - Real-time Multiplayer Chess",
  description: "Play chess online with real-time multiplayer support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
