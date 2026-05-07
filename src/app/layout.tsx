import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'NexCommerce - Premium Store',
  description: 'The best products at the best prices.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Navbar />
          <main className="container fade-in" style={{ padding: '2rem 1.5rem' }}>
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
