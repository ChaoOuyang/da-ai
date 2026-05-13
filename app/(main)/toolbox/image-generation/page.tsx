'use client';
import { useState } from 'react';
import {
  Plus, Maximize2, AlignJustify, ChevronDown, ChevronLeft,
  Image as ImageIcon, Download, Heart, Clock, Loader, CheckCircle, AlertCircle,
  BarChart2, Settings2,
} from 'lucide-react';
import { cn, calcImageCredits } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { toast } from '@/components/ui/Toast';
import AssetPickerModal from '@/components/ui/AssetPickerModal';
import AssetThumbnails from '@/components/ui/AssetThumbnails';
import type { ImageRatio, ImageResolution, ImageFormat } from '@/lib/types';

const RATIOS: ImageRatio[] = ['16:9', '4:3', '1:1', '4:5', '3:4', '9:16'];
const RESOLUTIONS: { value: ImageResolution; label: string }[] = [
  { value: '1k', label: '标清 1K' },
  { value: '2k', label: '高清 2K' },
  { value: '4k', label: '超清 4K' },
];
const FORMATS: ImageFormat[] = ['png', 'jpeg'];

function StatusIcon({ status }: { status: string }) {
  if (status === 'queued') return <Clock size={13} className="text-amber-500" />;
  if (status === 'generating') return <Loader size={13} className="text-blue-500 animate-spin" />;
  if (status === 'done') return <CheckCircle size={13} className="text-emerald-500" />;
  return <AlertCircle size={13} className="text-red-500" />;
}

function configSummary(config: { ratio: string; resolution: string; format: string }) {
  return `${config.ratio} · ${config.resolution.toUpperCase()} · ${config.format.toUpperCase()}`;
}

export default function ImageGenerationPage() {
  const { image, setImageConfig, setImagePrompt, setImageReferenceAssets, submitImageGeneration } = useStore();

  const [activeTab, setActiveTab] = useState<'preview' | 'history'>('preview');
  const [showQueue, setShowQueue] = useState(true);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);

  const credits = calcImageCredits(image.config);
  const queuedCount = image.tasks.filter((t) => t.status === 'queued').length;
  const generatingCount = image.tasks.filter((t) => t.status === 'generating').length;
  const doneTasks = image.tasks.filter((t) => t.status === 'done');

  function handleGenerate() {
    if (!image.prompt.trim()) { toast.error('请输入图片描述内容'); return; }
    submitImageGeneration();
    toast.success('已加入生成队列');
    setActiveTab('history');
  }

  return (
    <div className="h-full flex overflow-hidden bg-white">

      {/* ── 左栏：输入区 ── */}
      <div className="w-[480px] shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-hidden">

        {/* 顶部标题栏 */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h1 className="font-semibold text-slate-900 text-base">AI 生图</h1>
          <button
            onClick={() => { setImagePrompt(''); setImageReferenceAssets([]); toast.info('已新建'); }}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Plus size={14} />新建
          </button>
        </div>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto">

          {/* 参考素材区 */}
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">{image.referenceAssets.length} / 10</span>
              <div className="flex items-center gap-2">
                <button title="添加素材" onClick={() => setShowAssetPicker(true)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                  <BarChart2 size={14} />
                </button>
                <button title="排列" className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                  <AlignJustify size={14} />
                </button>
                <button title="全屏" className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {image.referenceAssets.length > 0 ? (
              <AssetThumbnails
                assets={image.referenceAssets}
                onRemove={(id) => setImageReferenceAssets(image.referenceAssets.filter((a) => a.id !== id))}
              />
            ) : (
              <button
                onClick={() => setShowAssetPicker(true)}
                className="w-16 h-16 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-500 transition-all"
              >
                <Plus size={16} />
                <span className="text-[10px]">参考素材</span>
              </button>
            )}
          </div>

          {/* 文本域 */}
          <div className="px-5 pt-4 pb-2">
            <div className="relative">
              <textarea
                value={image.prompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="请输入你想生成的图片内容，支持中英文输入；可 @ 引用上方参考素材。"
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y leading-relaxed"
                style={{ minHeight: 380, maxHeight: 520 }}
                maxLength={2000}
              />
              {/* resize handle visual hint */}
              <div className="absolute bottom-0 right-0 w-3 h-3 opacity-30">
                <svg viewBox="0 0 10 10" className="text-slate-400 fill-current">
                  <path d="M0 10 L10 0 L10 10Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 字数 */}
          <div className="px-5 pb-4 text-right">
            <span className="text-xs text-slate-400">{image.prompt.length} / 2000</span>
          </div>

          {/* 模型 + 图片设置 */}
          <div className="px-5 pb-4 flex gap-3">
            {/* 模型 */}
            <div className="flex-1">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 cursor-default transition-all">
                <BarChart2 size={15} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-400 leading-none mb-0.5">模型</div>
                  <div className="text-xs font-medium text-slate-700">高级版</div>
                </div>
                <ChevronDown size={13} className="text-slate-300 shrink-0" />
              </div>
            </div>

            {/* 图片设置 */}
            <div className="flex-1 relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
              >
                <Settings2 size={15} className="text-slate-400 shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[10px] text-slate-400 leading-none mb-0.5">图片设置</div>
                  <div className="text-xs font-medium text-slate-700 truncate">{configSummary(image.config)}</div>
                </div>
                <ChevronDown size={13} className={cn('text-slate-400 shrink-0 transition-transform', showSettings && 'rotate-180')} />
              </button>

              {showSettings && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-20 space-y-4">
                  {/* 比例 */}
                  <div>
                    <div className="text-xs text-slate-500 mb-2">比例</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {RATIOS.map((r) => (
                        <button key={r} onClick={() => setImageConfig({ ratio: r })}
                          className={cn('py-1.5 rounded-lg text-xs font-medium border transition-all',
                            image.config.ratio === r ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400'
                          )}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 分辨率 */}
                  <div>
                    <div className="text-xs text-slate-500 mb-2">分辨率</div>
                    <div className="flex gap-1.5">
                      {RESOLUTIONS.map((res) => (
                        <button key={res.value} onClick={() => setImageConfig({ resolution: res.value })}
                          className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all',
                            image.config.resolution === res.value ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400'
                          )}>
                          {res.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 格式 */}
                  <div>
                    <div className="text-xs text-slate-500 mb-2">格式</div>
                    <div className="flex gap-1.5">
                      {FORMATS.map((f) => (
                        <button key={f} onClick={() => setImageConfig({ format: f })}
                          className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium border uppercase transition-all',
                            image.config.format === f ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400'
                          )}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部：积分 + 生成按钮 */}
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 shrink-0 space-y-3">
          <p className="text-center text-sm text-slate-500">
            预计消耗 <span className="font-semibold text-slate-800">{credits} 积分</span>
          </p>
          <button
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-semibold text-sm transition-all active:scale-[0.99]"
          >
            立即生成图片
          </button>
        </div>
      </div>

      {/* ── 中栏：预览/历史 ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <div className="px-6 pt-4 flex items-center gap-6 border-b border-slate-200 bg-white shrink-0">
          {(['preview', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-all',
                activeTab === t ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'
              )}
            >
              {{ preview: '预览', history: '历史' }[t]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'preview' ? (
            doneTasks.length > 0 && doneTasks[previewIdx]?.result ? (
              <div className="p-6 flex flex-col items-center gap-4">
                <img
                  src={doneTasks[previewIdx].result!.imageUrl}
                  alt="生成结果"
                  className="max-w-lg w-full rounded-2xl shadow-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => toast.success('已下载')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 shadow-sm transition-all">
                    <Download size={14} />下载
                  </button>
                  <button onClick={() => toast.success('已收藏')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 shadow-sm transition-all">
                    <Heart size={14} />收藏
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <ImageIcon size={44} strokeWidth={1} className="text-slate-300" />
                <p className="text-sm">点击右侧队列中带成片的任务即可预览。</p>
              </div>
            )
          ) : (
            <div className="p-5 grid grid-cols-3 gap-4">
              {image.tasks.map((task, idx) => {
                const doneIdx = doneTasks.indexOf(task);
                return (
                  <button
                    key={task.id}
                    onClick={() => { if (task.status === 'done') { setPreviewIdx(doneIdx >= 0 ? doneIdx : 0); setActiveTab('preview'); } }}
                    className="rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
                      {task.result
                        ? <img src={task.result.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        : <StatusIcon status={task.status} />
                      }
                      {task.status === 'generating' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                          <div className="h-full bg-slate-600 transition-all" style={{ width: `${task.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2 flex items-center gap-1.5">
                      <StatusIcon status={task.status} />
                      <span className="text-[11px] text-slate-400">
                        {{ queued: '排队中', generating: `${task.progress}%`, done: '成片', failed: '失败' }[task.status]}
                      </span>
                    </div>
                  </button>
                );
              })}
              {image.tasks.length === 0 && (
                <div className="col-span-3 py-20 flex flex-col items-center text-slate-400 gap-3">
                  <ImageIcon size={40} strokeWidth={1} className="text-slate-300" />
                  <p className="text-sm">暂无生成记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 右栏：任务队列 ── */}
      {showQueue && (
        <div className="w-[180px] shrink-0 flex flex-col border-l border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-sm font-medium text-slate-800">任务队列</span>
            <button
              onClick={() => setShowQueue(false)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={13} />收起
            </button>
          </div>

          <div className="px-3 py-3 grid grid-cols-2 gap-2 shrink-0">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-slate-800">{queuedCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">排队中</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-slate-800">{generatingCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">生成中</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
            {image.tasks.map((task, idx) => {
              const doneIdx = doneTasks.indexOf(task);
              return (
                <button
                  key={task.id}
                  onClick={() => { if (task.status === 'done') { setPreviewIdx(doneIdx >= 0 ? doneIdx : 0); setActiveTab('preview'); } }}
                  className="w-full rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all text-left bg-white"
                >
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    {task.result
                      ? <img src={task.result.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><StatusIcon status={task.status} /></div>
                    }
                    {task.status === 'generating' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200">
                        <div className="h-full bg-slate-600 transition-all" style={{ width: `${task.progress}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5 flex items-center gap-1.5">
                    <StatusIcon status={task.status} />
                    <span className="text-[10px] text-slate-500 truncate flex-1">
                      {{ queued: '排队中', generating: `${task.progress}%`, done: '成片', failed: '失败' }[task.status]}
                    </span>
                  </div>
                </button>
              );
            })}
            {image.tasks.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">暂无任务</p>
            )}
          </div>
        </div>
      )}

      {!showQueue && (
        <button
          onClick={() => setShowQueue(true)}
          className="w-8 shrink-0 border-l border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
        >
          <span className="text-[10px]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>任务队列</span>
        </button>
      )}

      <AssetPickerModal
        open={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        onConfirm={(selected) => setImageReferenceAssets([...image.referenceAssets, ...selected].slice(0, 10))}
      />
    </div>
  );
}
