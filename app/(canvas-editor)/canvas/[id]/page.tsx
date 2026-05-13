'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import CanvasEditor from '@/components/canvas/CanvasEditor';

export default function CanvasEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { canvas, updateCanvasProject } = useStore();
  const project = canvas.projects.find((p) => p.id === id);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(project?.name ?? '');

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p className="text-lg mb-4">画布不存在</p>
          <Link href="/canvas" className="text-indigo-400 hover:text-indigo-300">返回画布列表</Link>
        </div>
      </div>
    );
  }

  function saveName() {
    if (name.trim() && name !== project?.name) {
      updateCanvasProject(id, { name: name.trim() });
    }
    setIsEditingName(false);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-11 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0 z-10">
        <Link href="/canvas" className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
          <span className="text-white font-black text-xs leading-none">D</span>
        </Link>
        {isEditingName ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setIsEditingName(false); }}
            className="text-sm font-medium text-slate-800 bg-slate-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm font-medium text-slate-800 hover:text-slate-900 px-1 py-0.5 rounded hover:bg-slate-100 transition-all"
          >
            {project.name}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <CanvasEditor project={project} />
      </div>
    </div>
  );
}
