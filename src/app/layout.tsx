import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

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
  description: "guess the correct order",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Head>
          <title>dots</title>
          <meta
            name="description"
            content="guess the correct combination of 4 colors"
          />
          <meta name="image" content="/placeholder.png" />
          <meta property="og:image" content="/placeholder.png" />
          <meta property="og:title" content="dots" />
          <meta
            property="og:description"
            content="guess the correct combination of 4 colors"
          />
        </Head>
        {children}
      </body>
    </html>
  );
}
