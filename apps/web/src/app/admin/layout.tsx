import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ToastContainer } from '@/components/ui/Toast';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Панель управления — Особо Вкусно',
  description: 'Админ-панель для управления рестораном',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="font-sans min-h-screen bg-bg-light">
        <AuthProvider>
          <div className="flex min-h-screen">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
              <header className="bg-bg-dark text-text-inverse h-14 md:h-16 flex items-center px-4 md:px-6 shadow-sm">
                <h1 className="font-semibold body md:text-h3">
                  Особо Вкусно · панель управления
                </h1>
              </header>
              <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>
          </div>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
