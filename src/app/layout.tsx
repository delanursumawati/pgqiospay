import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QRIS Payment Gateway - Qiospay",
  description: "Web Payment Gateway berbasis QRIS dari Qiospay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
