'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

const NAV_ITEMS = [
  { label: 'AI对话', href: '/agent-chat' },
  { label: 'AI视频', href: '/toolbox/video-generation' },
  { label: 'AI图片', href: '/toolbox/image-generation' },
  { label: '画布', href: '/canvas' },
  { label: '工具箱', href: '/toolbox' },
  { label: '资产', href: '/assets' },
];

export default function TopNav() {
  const pathname = usePathname();
  const { user } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/toolbox') return pathname === '/toolbox';
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 h-14 flex items-center px-4 md:px-6 bg-white border-b border-slate-200">
      {/* Logo */}
      <Link href="/agent-chat" className="mr-6 flex items-center gap-1.5 shrink-0">
        <span className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          DA·AI
        </span>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
              isActive(item.href)
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            {item.label}
            {isActive(item.href) && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/account"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
        >
          <Zap size={14} className="text-amber-400" />
          <span className="font-medium">{user.credits.toFixed(2)}</span>
        </Link>

        <button className="relative group">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            alt="头像"
            className="w-8 h-8 rounded-full bg-slate-100"
          />
        </button>

        {/* Mobile menu */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-4 flex flex-col gap-1 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
                isActive(item.href) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
