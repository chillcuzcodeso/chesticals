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
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/react-chessboard@4.6.0/dist/chessboard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
