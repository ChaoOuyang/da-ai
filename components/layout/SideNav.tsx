'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Video, Image, Layout, Grid2X2, Folder, Zap, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

const NAV_ITEMS = [
  { label: 'AI对话', href: '/agent-chat', icon: MessageSquare },
  { label: 'AI视频', href: '/toolbox/video-generation', icon: Video },
  { label: 'AI图片', href: '/toolbox/image-generation', icon: Image },
  { label: '画布', href: '/canvas', icon: Layout },
  { label: '工具箱', href: '/toolbox', icon: Grid2X2 },
  { label: '资产', href: '/assets', icon: Folder },
];

export default function SideNav() {
  const pathname = usePathname();
  const { user } = useStore();

  function isActive(href: string) {
    if (href === '/toolbox') return pathname === '/toolbox';
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[68px] shrink-0 h-full flex flex-col items-center bg-white border-r border-slate-200 py-3 z-40">
      {/* Logo */}
      <Link href="/agent-chat" className="mb-6 mt-1 flex items-center justify-center">
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
          <span className="text-white font-black text-sm leading-none">D</span>
        </div>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all text-center',
                active
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: credits + avatar */}
      <div className="flex flex-col items-center gap-3 pb-1">
        <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors">
          <Zap size={14} className="text-amber-400" />
          <span className="text-[10px] text-slate-500">积分</span>
          <span className="text-[10px] font-medium text-slate-600">{user.credits.toFixed(2)}</span>
        </button>
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
          alt="头像"
          className="w-8 h-8 rounded-full bg-slate-100"
        />
        <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
          <Menu size={16} />
        </button>
      </div>
    </aside>
  );
}
