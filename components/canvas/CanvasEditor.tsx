'use client';
import { useCallback, useState, useRef, useEffect, createContext, useContext } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Plus, MousePointer2, Hand, LayoutTemplate, History,
  HelpCircle, Type, Image as ImageIcon, Video, Music,
  Upload, FolderOpen, Send, ChevronDown, Maximize2,
  DownloadCloud, List, Mic, ImagePlay, Clapperboard,
  Focus, Expand, BarChart2, Volume2,
} from 'lucide-react';
import { cn, uid } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import AssetPickerModal from '@/components/ui/AssetPickerModal';
import type { CanvasProject } from '@/lib/types';

// ─── Context ────────────────────────────────────────────────────────────────
interface NodeMenuCtx {
  openMenu: (nodeId: string, x: number, y: number) => void;
  addConnected: (fromId: string, type: 'text' | 'image' | 'video' | 'audio') => void;
}
const NodeMenuContext = createContext<NodeMenuCtx>({ openMenu: () => {}, addConnected: () => {} });
const DraggingContext = createContext<React.MutableRefObject<boolean>>({ current: false });

// ─── Handle button styles ────────────────────────────────────────────────────
// Shown only on group hover, z-index above the card
const handleBtnCls =
  'opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-400';

// Left target handle (for receiving connections)
const TargetHandle = () => (
  <Handle
    type="target"
    position={Position.Left}
    className="!opacity-0 group-hover:!opacity-100 !transition-opacity"
    style={{
      width: 32, height: 32, borderRadius: '50%',
      background: '#fff', border: '1.5px solid #d1d5db',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      cursor: 'crosshair', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
  >
    <span style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1, pointerEvents: 'none' }}>+</span>
  </Handle>
);

// Right source handle — drag to connect, click to open add-node menu
function RightAddBtn({ nodeId }: { nodeId: string }) {
  const { openMenu } = useContext(NodeMenuContext);
  return (
    <Handle
      type="source"
      position={Position.Right}
      className="!opacity-0 group-hover:!opacity-100 !transition-opacity"
      style={{
        width: 32, height: 32, borderRadius: '50%',
        background: '#fff', border: '1.5px solid #d1d5db',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        cursor: 'crosshair', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        openMenu(nodeId, rect.right, rect.top);
      }}
      title="拖动连线 / 点击添加节点"
    >
      <span style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1, pointerEvents: 'none' }}>+</span>
    </Handle>
  );
}

// ─── NodeHeader ──────────────────────────────────────────────────────────────
function NodeHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs text-slate-500 flex-1 font-medium">{label}</span>
      <span className="text-[10px] text-slate-300 font-mono">318 × 193</span>
    </div>
  );
}

// ─── NodeCard ────────────────────────────────────────────────────────────────
function NodeCard({ selected, children }: { selected?: boolean; children: React.ReactNode }) {
  return (
    // overflow-visible so handles can stick out; group enables hover-show of handles
    <div
      className={cn(
        'relative bg-white rounded-2xl overflow-visible transition-all group',
        selected
          ? 'shadow-[0_0_0_1.5px_#6366f1,0_4px_20px_rgba(0,0,0,0.08)]'
          : 'shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)]',
      )}
    >
      {children}
    </div>
  );
}

// ─── Panel open state — opens on click-select, closes when deselected ────────
function usePanelState(selected?: boolean) {
  const [panelOpen, setPanelOpen] = useState(false);
  const prevSelected = useRef(false);
  const draggingRef = useContext(DraggingContext);
  useEffect(() => {
    if (selected && !prevSelected.current && !draggingRef.current) setPanelOpen(true);
    if (!selected) setPanelOpen(false);
    prevSelected.current = !!selected;
  }, [selected, draggingRef]);
  return [panelOpen, setPanelOpen] as const;
}

// ─── Text Node ───────────────────────────────────────────────────────────────
function TextNode({ data, selected, id }: NodeProps & { data: { label: string; text?: string } }) {
  const [text, setText] = useState(data.text ?? '');
  const [editing, setEditing] = useState(false);
  const [panelOpen, setPanelOpen] = usePanelState(selected);
  const { setNodes } = useReactFlow();
  const taRef = useRef<HTMLTextAreaElement>(null);

  function updateText(val: string) {
    setText(val);
    setNodes((ns) => ns.map((n) => n.id === id ? { ...n, data: { ...n.data, text: val } } : n));
  }

  return (
    <div className="relative" style={{ width: 318 }}>
      {/* Top toolbar — only when panel is open */}
      {panelOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-14 flex items-center bg-white border border-slate-200 rounded-2xl shadow-lg px-1 py-1 gap-0.5 whitespace-nowrap nodrag" style={{ minWidth: 360, zIndex: 200 }}>
          <span className="px-3 py-1.5 text-xs text-slate-500 border-r border-slate-200">{text.length} 字</span>
          {[
            { icon: <ImagePlay size={13} />, label: '去生图片' },
            { icon: <Clapperboard size={13} />, label: '去生视频' },
          ].map(({ icon, label }) => (
            <button key={label} onClick={() => toast.info(`${label}功能即将上线`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-xl transition-all nodrag">
              {icon}{label}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-200 mx-1" />
          {[{ icon: <Focus size={13} />, label: '聚焦' }, { icon: <Expand size={13} />, label: '展开' }].map(({ icon, label }) => (
            <button key={label} onClick={() => toast.info(`${label}功能即将上线`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-xl transition-all nodrag">
              {icon}{label}
            </button>
          ))}
        </div>
      )}

      <NodeHeader icon={<Type size={13} />} label={data.label || '文本节点'} />

      <NodeCard selected={selected}>
        <TargetHandle />
        <RightAddBtn nodeId={id} />

        {/* Card inner — clip overflow for rounded corners */}
        <div className="overflow-hidden rounded-2xl">
          {editing ? (
            <textarea ref={taRef} value={text} onChange={(e) => updateText(e.target.value)}
              onBlur={() => setEditing(false)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-300 px-4 pt-4 pb-6 focus:outline-none resize-none leading-relaxed nodrag"
              style={{ minHeight: 193 }}
              placeholder="请输入您的指令、提示词或脚本等..." />
          ) : (
            <div onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); setTimeout(() => taRef.current?.focus(), 0); }}
              className="px-4 pt-4 pb-6 text-sm leading-relaxed cursor-default select-none"
              style={{ minHeight: 193 }}>
              {text
                ? <span className="text-slate-700 whitespace-pre-wrap">{text}</span>
                : <span className="text-slate-300">请输入您的指令、提示词或脚本等...</span>}
            </div>
          )}
        </div>
      </NodeCard>

      {/* Bottom panel — only when clicked (not dragged) */}
      {panelOpen && (
        <div className="mt-3 bg-white rounded-2xl border border-slate-100 shadow-lg p-5 nodrag" style={{ zIndex: 10 }}>
          <div className="flex items-start gap-4">
            <button className="w-16 h-16 shrink-0 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-indigo-400 transition-all nodrag">
              <Plus size={18} />
            </button>
            <p className="text-xs text-slate-400 mt-1">最多 12 个参考素材</p>
            <div className="ml-auto flex flex-col gap-2">
              {[<Maximize2 size={15} />, <DownloadCloud size={15} />, <List size={15} />].map((icon, i) => (
                <button key={i} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all nodrag">{icon}</button>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center">
            <span className="text-xs text-blue-500 mr-auto">✦ 计算中.../条</span>
            <button className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-900 flex items-center justify-center transition-all nodrag">
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Image Node ──────────────────────────────────────────────────────────────
function ImageNode({ data, selected, id }: NodeProps & { data: { label: string; src?: string } }) {
  const [prompt, setPrompt] = useState('');
  const [panelOpen, setPanelOpen] = usePanelState(selected);

  return (
    <div className="relative" style={{ width: 318 }}>
      <NodeHeader icon={<ImageIcon size={13} />} label={data.label || '图片节点'} />
      <NodeCard selected={selected}>
        <TargetHandle />
        <RightAddBtn nodeId={id} />
        <div className="overflow-hidden rounded-2xl">
          <div className="flex items-center justify-center bg-slate-50" style={{ height: 193 }}>
            {data.src ? <img src={data.src} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={36} strokeWidth={1} className="text-slate-300" />}
          </div>
        </div>
      </NodeCard>
      {panelOpen && (
        <div className="absolute top-full left-0 mt-3 bg-white rounded-2xl border border-slate-100 shadow-lg p-5 nodrag" style={{ width: 420 }}>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 flex items-center justify-center text-slate-300 hover:text-indigo-400 transition-all nodrag"><Plus size={18} /></button>
              <p className="text-[10px] text-slate-400 text-center leading-tight">最多 9 张参考图<br />与 1 段参考视频</p>
            </div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="可上传参考图并输入文字，或使用 @ 引用已添加的素材。可自由组合图、文。"
              className="flex-1 text-xs text-slate-500 placeholder-slate-300 bg-transparent focus:outline-none resize-none nodrag leading-relaxed" style={{ minHeight: 80 }} />
            <div className="flex flex-col gap-2 shrink-0">
              {[<Maximize2 size={15} />, <DownloadCloud size={15} />, <List size={15} />].map((icon, i) => (
                <button key={i} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 nodrag">{icon}</button>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs text-slate-600 nodrag whitespace-nowrap"><span className="text-indigo-400">✦</span> 高级版 <ChevronDown size={11} /></button>
            <div className="w-px h-3 bg-slate-200" />
            <button className="flex items-center gap-1 text-xs text-slate-600 nodrag whitespace-nowrap"><span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" /> 1:1 <ChevronDown size={11} /></button>
            <div className="w-px h-3 bg-slate-200" />
            <button className="flex items-center gap-1 text-xs text-slate-600 nodrag whitespace-nowrap">标清·1K <ChevronDown size={11} /></button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-blue-500 whitespace-nowrap">✦ 1.18/张</span>
              <button className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-900 flex items-center justify-center transition-all nodrag"><Send size={13} className="text-white" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Video Node ──────────────────────────────────────────────────────────────
function VideoNode({ data, selected, id }: NodeProps & { data: { label: string; src?: string } }) {
  const [prompt, setPrompt] = useState('');
  const [panelOpen, setPanelOpen] = usePanelState(selected);

  return (
    <div className="relative" style={{ width: 318 }}>
      <NodeHeader icon={<Video size={13} />} label={data.label || '视频节点'} />
      <NodeCard selected={selected}>
        <TargetHandle />
        <RightAddBtn nodeId={id} />
        <div className="overflow-hidden rounded-2xl">
          <div className="flex items-center justify-center bg-white" style={{ height: 193 }}>
            {data.src ? <video src={data.src} controls className="w-full h-full nodrag" /> : <Video size={36} strokeWidth={1} className="text-slate-300" />}
          </div>
        </div>
      </NodeCard>
      {panelOpen && (
        <div className="absolute top-full left-0 mt-3 bg-white rounded-2xl border border-slate-100 shadow-lg p-5 nodrag" style={{ width: 420 }}>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <button className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 flex items-center justify-center text-slate-300 hover:text-indigo-400 transition-all nodrag"><Plus size={18} /></button>
              <button className="w-7 h-7 rounded-full border border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:text-indigo-400 transition-all nodrag"><Plus size={13} /></button>
            </div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="上传参考素材并输入文字，或使用 @ 引用已添加的素材。可自由组合图、文、音、视频。"
              className="flex-1 text-xs text-slate-500 placeholder-slate-300 bg-transparent focus:outline-none resize-none nodrag leading-relaxed" style={{ minHeight: 80 }} />
            <div className="flex flex-col gap-2 shrink-0">
              {[<Maximize2 size={15} />, <DownloadCloud size={15} />, <List size={15} />].map((icon, i) => (
                <button key={i} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 nodrag">{icon}</button>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs text-slate-600 nodrag whitespace-nowrap"><BarChart2 size={12} /> Seedance-2.0-VIP <ChevronDown size={11} /></button>
            <div className="w-px h-3 bg-slate-200" />
            <button className="flex items-center gap-1 text-xs text-slate-600 nodrag whitespace-nowrap"><span className="w-2 h-3.5 rounded-sm bg-slate-200 inline-block" /> 9:16 720p 15s <ChevronDown size={11} /></button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-blue-500 whitespace-nowrap">✦ 20.40/条</span>
              <button className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-900 flex items-center justify-center transition-all nodrag"><Send size={13} className="text-white" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Audio Node ──────────────────────────────────────────────────────────────
function AudioNode({ data, selected, id }: NodeProps & { data: { label: string; src?: string } }) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative" style={{ width: 318 }}>
      <NodeHeader icon={<Volume2 size={13} />} label={data.label || '音频'} />
      <NodeCard selected={selected}>
        <TargetHandle />
        <RightAddBtn nodeId={id} />
        <button onClick={() => fileRef.current?.click()}
          className="absolute top-3 right-3 w-9 h-9 bg-slate-600 hover:bg-slate-700 rounded-xl flex items-center justify-center text-white transition-all nodrag" style={{ zIndex: 10 }}>
          <Upload size={15} />
        </button>
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" />
        <div className="overflow-hidden rounded-2xl">
          <div className="flex flex-col items-center justify-center py-6 gap-4" style={{ minHeight: 193 }}>
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Mic size={28} strokeWidth={1.5} className="text-slate-500" />
            </div>
            {data.src
              ? <audio src={data.src} controls className="w-[85%] nodrag" />
              : <audio controls className="w-[85%] nodrag" style={{ opacity: 0.4 }} />}
          </div>
        </div>
      </NodeCard>
    </div>
  );
}

const nodeTypes = { text: TextNode, image: ImageNode, video: VideoNode, audio: AudioNode };

// ─── AddMenu popup ────────────────────────────────────────────────────────────
function AddMenuPopup({ x, y, fromNodeId, onAdd, onAsset, onClose }: {
  x: number; y: number; fromNodeId: string | null;
  onAdd: (type: 'text' | 'image' | 'video' | 'audio', fromId: string | null) => void;
  onAsset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed bg-white rounded-3xl shadow-2xl border border-slate-100 py-5 w-56"
      style={{ left: x + 8, top: y - 20, zIndex: 9999 }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}>
      <p className="text-xs text-slate-400 font-medium px-5 mb-3">添加节点</p>
      {([
        { type: 'text' as const, icon: <Type size={18} strokeWidth={1.5} />, label: '文本' },
        { type: 'image' as const, icon: <ImageIcon size={18} strokeWidth={1.5} />, label: '图片' },
        { type: 'video' as const, icon: <Video size={18} strokeWidth={1.5} />, label: '视频' },
        { type: 'audio' as const, icon: <Music size={18} strokeWidth={1.5} />, label: '音频' },
      ]).map(({ type, icon, label }) => (
        <button key={type} onClick={() => { onAdd(type, fromNodeId); onClose(); }}
          className="w-full flex items-center gap-4 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-all">
          <span className="text-slate-400">{icon}</span>{label}
        </button>
      ))}
      <div className="h-px bg-slate-100 my-2 mx-5" />
      <p className="text-xs text-slate-400 font-medium px-5 mb-3">添加资源</p>
      <label className="w-full flex items-center gap-4 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-all cursor-pointer">
        <Upload size={18} strokeWidth={1.5} className="text-slate-400" />从本地上传
        <input type="file" className="hidden" multiple accept="image/*,video/*,audio/*" onChange={() => onClose()} />
      </label>
      <button onClick={() => { onAsset(); onClose(); }}
        className="w-full flex items-center gap-4 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-all">
        <FolderOpen size={18} strokeWidth={1.5} className="text-slate-400" />从资产库选择
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function projectToRFNodes(project: CanvasProject): Node[] {
  return project.nodes.map((n) => ({
    id: n.id, type: n.type, position: n.position,
    data: { label: n.data.label ?? n.type, text: n.data.text, src: n.data.src },
  }));
}
function projectToRFEdges(project: CanvasProject): Edge[] {
  const edges: Edge[] = [];
  for (const node of project.nodes)
    for (const targetId of node.connections)
      edges.push({ id: `${node.id}-${targetId}`, source: node.id, target: targetId, style: { stroke: '#cbd5e1', strokeWidth: 1.5 } });
  return edges;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CanvasEditor({ project }: { project: CanvasProject }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(projectToRFNodes(project));
  const [edges, setEdges, onEdgesChange] = useEdgesState(projectToRFEdges(project));
  const [tool, setTool] = useState<'select' | 'hand'>('select');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [nodeMenu, setNodeMenu] = useState<{ fromId: string; x: number; y: number } | null>(null);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const draggingRef = useRef(false);

  // Keep a ref to latest nodes so addNode always reads current positions
  const nodesRef = useRef(nodes);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, style: { stroke: '#cbd5e1', strokeWidth: 1.5 } }, eds)),
    [setEdges],
  );

  function addNode(type: 'text' | 'image' | 'video' | 'audio', fromId: string | null = null, extra: Record<string, unknown> = {}) {
    const label = { text: '文本节点', image: '图片节点', video: '视频节点', audio: '音频' }[type];
    const newId = uid();
    const srcNode = fromId ? nodesRef.current.find((n) => n.id === fromId) : null;
    const position = srcNode
      ? { x: srcNode.position.x + 380, y: srcNode.position.y }
      : { x: 300 + Math.random() * 300, y: 150 + Math.random() * 300 };

    setNodes((ns) => [...ns, { id: newId, type, data: { label, ...extra }, position }]);

    if (fromId) {
      setEdges((eds) => [...eds, {
        id: `${fromId}-${newId}`,
        source: fromId,
        target: newId,
        style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
      }]);
    }
  }

  const nodeMenuCtx: NodeMenuCtx = {
    openMenu: (nodeId, x, y) => setNodeMenu({ fromId: nodeId, x, y }),
    addConnected: (fromId, type) => addNode(type, fromId),
  };

  return (
    <DraggingContext.Provider value={draggingRef}>
    <NodeMenuContext.Provider value={nodeMenuCtx}>
      <div className="w-full h-full" onClick={() => { setSideMenuOpen(false); setNodeMenu(null); }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          panOnDrag selectionOnDrag={false}
          fitView proOptions={{ hideAttribution: true }}
          deleteKeyCode="Delete"
          connectionLineStyle={{ stroke: '#cbd5e1', strokeWidth: 1.5 }}
          onNodeDragStart={() => { draggingRef.current = true; }}
          onNodeDragStop={() => { setTimeout(() => { draggingRef.current = false; }, 0); }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#d1d5db" style={{ backgroundColor: '#f1f5f9' }} />

          {/* Left toolbar */}
          <Panel position="top-left" style={{ margin: '24px 0 0 24px' }}>
            <div className="flex flex-col gap-1 bg-white rounded-2xl shadow-md border border-slate-200/80 py-2 px-1.5" style={{ width: 52 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <button onClick={() => setSideMenuOpen(!sideMenuOpen)}
                  className={cn('w-full flex items-center justify-center h-9 rounded-xl transition-all', sideMenuOpen ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100')}>
                  <Plus size={18} />
                </button>
                {sideMenuOpen && (
                  <div className="absolute left-full top-0 ml-3 z-30">
                    <AddMenuPopup x={0} y={0} fromNodeId={null}
                      onAdd={(t, from) => addNode(t, from)}
                      onAsset={() => setShowAssetPicker(true)}
                      onClose={() => setSideMenuOpen(false)} />
                  </div>
                )}
              </div>
              <div className="h-px bg-slate-100 my-0.5 mx-1" />
              {[
                { id: 'select', icon: <MousePointer2 size={17} /> },
                { id: 'hand', icon: <Hand size={17} /> },
              ].map(({ id, icon }) => (
                <button key={id} onClick={() => setTool(id as 'select' | 'hand')}
                  className={cn('w-full flex items-center justify-center h-9 rounded-xl transition-all', tool === id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100')}>
                  {icon}
                </button>
              ))}
              <div className="h-px bg-slate-100 my-0.5 mx-1" />
              {[{ icon: <LayoutTemplate size={16} />, label: '模版' }, { icon: <History size={16} />, label: '历史' }].map(({ icon, label }) => (
                <button key={label} onClick={() => toast.info(`${label}功能即将上线`)}
                  className="w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
                  {icon}<span className="text-[9px] text-slate-400">{label}</span>
                </button>
              ))}
              <div className="h-px bg-slate-100 my-0.5 mx-1" />
              <button onClick={() => toast.info('帮助中心即将上线')}
                className="w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
                <HelpCircle size={16} /><span className="text-[9px] text-slate-400">帮助</span>
              </button>
            </div>
          </Panel>

          {/* Bottom AI input */}
          <Panel position="bottom-center" style={{ marginBottom: 24 }}>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3 px-4 py-3 w-[480px]">
              <button className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap shrink-0">
                <span className="font-medium">deepseek-v3</span><ChevronDown size={11} />
              </button>
              <div className="w-px h-4 bg-slate-200 shrink-0" />
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && chatInput.trim()) { addNode('text', null, { text: chatInput.trim(), label: 'AI 生成' }); setChatInput(''); } }}
                placeholder="请输入内容开始对话..."
                className="flex-1 text-sm text-slate-700 focus:outline-none placeholder-slate-400 bg-transparent" />
              <button onClick={() => { if (chatInput.trim()) { addNode('text', null, { text: chatInput.trim(), label: 'AI 生成' }); setChatInput(''); } }}
                className={cn('w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0', chatInput.trim() ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400')}>
                <Send size={14} />
              </button>
            </div>
          </Panel>

          <Controls showInteractive={false} className="!bg-white !border-slate-200 !rounded-xl !shadow-md" />
        </ReactFlow>

        {/* Node right-side + menu (fixed overlay) */}
        {nodeMenu && (
          <AddMenuPopup x={nodeMenu.x} y={nodeMenu.y} fromNodeId={nodeMenu.fromId}
            onAdd={(type, from) => { addNode(type, from); setNodeMenu(null); }}
            onAsset={() => { setShowAssetPicker(true); setNodeMenu(null); }}
            onClose={() => setNodeMenu(null)} />
        )}

        <AssetPickerModal open={showAssetPicker} onClose={() => setShowAssetPicker(false)}
          onConfirm={(assets) => assets.forEach((a) => addNode(a.type as 'image' | 'video' | 'audio', null, { src: a.url, label: a.name }))} />
      </div>
    </NodeMenuContext.Provider>
    </DraggingContext.Provider>
  );
}
