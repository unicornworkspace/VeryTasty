import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import '@/styles/globals.css';
import { Header, Footer } from '@/components/layout/Header';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/hooks/use-theme';
import { ToastContainer } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Особо Вкусно — Ресторан современной кухни',
  description:
    'Ресторан "Особо Вкусно" — выбирайте любимые блюда и открывайте предложения для гостей ресторана. Меню, акции, карта гостя — всё на сайте.',
  keywords: ['ресторан', 'меню', 'доставка', 'бонусы', 'акции'],
  openGraph: {
    title: 'Особо Вкусно',
    description: 'С огня — к вашему столу',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-bg-light text-text-primary">
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
