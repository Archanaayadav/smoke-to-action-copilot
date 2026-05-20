import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Feedback Priorities",
  description: "Turn customer feedback into clear product and support priorities."
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
