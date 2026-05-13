import SideNav from '@/components/layout/SideNav';
import { ToastContainer } from '@/components/ui/Toast';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <SideNav />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
