import { Providers } from './providers';
import { NavBar } from './components/NavBar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VowSwap - Wedding Decor Marketplace',
  description: 'Discover unique wedding decor items to make your special day unforgettable.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
