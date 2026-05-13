'use client';
import { Zap, User, Settings } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AccountPage() {
  const { user } = useStore();
  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">账户</h1>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center gap-4 shadow-sm">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="" className="w-16 h-16 rounded-full bg-slate-100" />
          <div>
            <p className="font-semibold text-slate-900 text-lg">{user.name}</p>
            <p className="text-slate-500 text-sm mt-0.5">ID: {user.id}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={18} className="text-amber-500" />
            <h2 className="font-semibold text-slate-900">积分余额</h2>
          </div>
          <div className="text-4xl font-bold text-amber-500">{user.credits.toFixed(2)}</div>
          <p className="text-slate-500 text-sm mt-2">积分可用于 AI 视频生成、AI 图片生成等功能</p>
          <button className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">
            充值积分
          </button>
        </div>
      </div>
    </div>
  );
}
