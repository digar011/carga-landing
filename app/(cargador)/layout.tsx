import { Header } from '@/components/shared/header';
import { Sidebar } from '@/components/shared/sidebar';
import { BottomNav } from '@/components/shared/bottom-nav';

export default function CargadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar role="cargador" />
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>
      <BottomNav role="cargador" />
    </div>
  );
}
