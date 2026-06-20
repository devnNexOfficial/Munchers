import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Muncherz',
  description: 'Single restaurant premium ordering web app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAFAFA] text-[#0A0A0A] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
