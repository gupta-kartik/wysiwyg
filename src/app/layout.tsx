import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quick Notes - Solutions Engineering",
  description: "Lightning-fast note capture for GitHub Issues",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
