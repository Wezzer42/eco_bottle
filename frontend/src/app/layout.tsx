import type { ReactNode } from 'react';
import ClientProviders from '@/components/ClientProviders';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';

export const metadata = {
  title: 'EcoBottle',
  description: 'Sustainable hydration',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <Header />
          {children}
          <Footer brandName="EcoBottle" description="Sustainable hydration for everyone." />
          <Toaster 
            position="bottom-right"
            richColors
            closeButton
            expand={true}
          />
        </ClientProviders>
      </body>
    </html>
  );
}


