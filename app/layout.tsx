import type { Metadata } from "next";
import { Gloock, Instrument_Sans, Caveat } from "next/font/google";
import "./globals.css";

const gloock = Gloock({
  variable: "--font-gloock",
  subsets: ["latin"],
  weight: "400",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dear, someday",
  description: "A little place for everything I dream of.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${gloock.variable} ${instrument.variable} ${caveat.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
