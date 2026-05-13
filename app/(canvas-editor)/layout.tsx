import { ToastContainer } from '@/components/ui/Toast';

export default function CanvasEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {children}
      <ToastContainer />
    </div>
  );
}
