import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dark Tunnel - Portfolio Experience",
  description:
    "An immersive 3D portfolio journey through a dark tunnel on a handcar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
