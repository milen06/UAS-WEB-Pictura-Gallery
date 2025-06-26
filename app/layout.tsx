import './globals.css';
import NavbarWrapper from '@/app/components/NavbarWrapper';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pictura Gallery - Katalog Gambar Keren",
  description: "Platform katalog gambar buatan pengguna yang bisa di-upload, bookmark, dan diunduh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NavbarWrapper />
        <div className="pt-24">
          {children}
        </div>
      </body>
    </html>
  );
}