import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenUp Automation Game | AI-First Ideation",
  description: "Collaborate on automation ideas and let AI categorize them in real-time",
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
