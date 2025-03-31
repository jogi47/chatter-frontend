import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from '@/components/ui/toast-context';
import '@/app/debug-settings';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Chatter",
  description: "Chat about anything with anyone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer>
          <main className="min-h-screen max-w-screen-md mx-auto">
            {children}
          </main>
        </ToastContainer>
      </body>
    </html>
  );
} 