import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smoke-to-Action Copilot",
  description: "A decision copilot for turning customer review smoke signals into prioritized action."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
