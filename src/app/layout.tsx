import type { Metadata } from "next";
import "./globals.css";
import { ChessboardStyles } from "@/components/chess/ChessboardWrapper";

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
      <body>
        <ChessboardStyles />
        {children}
      </body>
    </html>
  );
}
