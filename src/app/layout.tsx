import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dots",
  description: "guess the correct combination of 4 colors",
  openGraph: {
    title: "dots",
    description: "guess the correct combination of 4 colors",
    images: [
      {
        url: "/placeholder.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "dots",
    description: "guess the correct combination of 4 colors",
    images: ["/placeholder.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
