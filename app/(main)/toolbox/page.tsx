'use client';
import Link from 'next/link';
import { Video, Image, Layout, Wrench } from 'lucide-react';

const TOOLS = [
  { icon: Video, title: 'AI 视频生成', desc: '输入文字描述，一键生成专业视频内容', href: '/toolbox/video-generation', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: Image, title: 'AI 图片生成', desc: '精准描述即可生成高质量产品图', href: '/toolbox/image-generation', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { icon: Layout, title: '无限画布', desc: '多节点工作流，连接素材与创意', href: '/canvas', color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

export default function ToolboxPage() {
  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Wrench size={24} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-slate-900">工具箱</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500/50 hover:bg-slate-50 transition-all group shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center mb-4`}>
                <tool.icon size={24} className={tool.color} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-slate-500">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
