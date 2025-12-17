"use client"; // MARK THIS AS A CLIENT COMPONENT

import { Inter } from 'next/font/google';
import './globals.css';
import { ThirdwebProvider } from 'thirdweb/react';
import liff from '@line/liff'; // DIRECT IMPORT of liff
import { useEffect, useState } from 'react'; // Import useEffect

const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLiffReady, setIsLiffReady] = useState(false); // Track LIFF readiness
  const liffId = process.env.NEXT_PUBLIC_TEMPLATE_LINE_LIFF; //USE YOUR LIFF ID

  useEffect(() => {
    // Only initialize LIFF on the client-side
    if (typeof window !== 'undefined') {
      const initializeLiff = async () => {
        try {
          // Only initialize LIFF if LIFF ID is provided
          if (liffId) {
            await liff.init({ liffId: liffId });
          }
        } catch (error) {
          // If LIFF initialization fails, continue without LIFF
          console.log('LIFF initialization failed, continuing without LIFF:', error);
        } finally {
          // Always set ready to true, even if LIFF fails
          setIsLiffReady(true);
        }
      };

      // Add a small delay to ensure window is fully ready
      const timer = setTimeout(() => {
        initializeLiff();
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Server-side: mark as ready immediately
      setIsLiffReady(true);
    }
  }, [liffId]);

  return (
    <html lang="en">
      <body className={inter.className}>
        {isLiffReady ? (
          <ThirdwebProvider>{children}</ThirdwebProvider>
        ) : (
          <div>Loading LIFF...</div>
        )}
      </body>
    </html>
  );
}
