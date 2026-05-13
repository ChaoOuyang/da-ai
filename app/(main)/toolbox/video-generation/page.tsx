'use client';
import { useState } from 'react';
import {
  Plus, Wand2, Maximize2, AlignJustify, ChevronDown, ChevronLeft,
  Video, Play, Download, Clock, Loader, CheckCircle, AlertCircle,
  BarChart2, Settings2,
} from 'lucide-react';
import { cn, calcVideoCredits } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { toast } from '@/components/ui/Toast';
import AssetPickerModal from '@/components/ui/AssetPickerModal';
import AssetThumbnails from '@/components/ui/AssetThumbnails';
import type { VideoRatio, VideoResolution } from '@/lib/types';

const RATIOS: VideoRatio[] = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'];
const RESOLUTIONS: { value: VideoResolution; label: string }[] = [
  { value: '480p', label: '标清 480p' },
  { value: '720p', label: '高清 720p' },
  { value: '1080p', label: '超清 1080p' },
];
const RATIO_ASPECT: Record<VideoRatio, string> = {
  '21:9': 'aspect-[21/9]', '16:9': 'aspect-video', '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square', '3:4': 'aspect-[3/4]', '9:16': 'aspect-[9/16]',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'queued') return <Clock size={13} className="text-amber-500" />;
  if (status === 'generating') return <Loader size={13} className="text-blue-500 animate-spin" />;
  if (status === 'done') return <CheckCircle size={13} className="text-emerald-500" />;
  return <AlertCircle size={13} className="text-red-500" />;
}

/* 视频设置摘要文字 */
function configSummary(config: { ratio: string; resolution: string; duration: number }) {
  return `${config.ratio} · ${config.resolution} · ${config.duration}s`;
}

export default function VideoGenerationPage() {
  const { video, setVideoConfig, setVideoPrompt, setVideoModel, setVideoReferenceAssets, submitVideoGeneration } = useStore();

  const [activeTab, setActiveTab] = useState<'preview' | 'history'>('preview');
  const [showQueue, setShowQueue] = useState(true);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewTask, setPreviewTask] = useState(video.tasks.find((t) => t.status === 'done') ?? null);

  const credits = calcVideoCredits(video.config);
  const queuedCount = video.tasks.filter((t) => t.status === 'queued').length;
  const generatingCount = video.tasks.filter((t) => t.status === 'generating').length;

  function handleGenerate() {
    if (!video.prompt.trim()) { toast.error('请输入视频描述内容'); return; }
    submitVideoGeneration();
    toast.success('已加入生成队列');
  }

  return (
    <div className="h-full flex overflow-hidden bg-white">

      {/* ── 左栏：输入区 ── */}
      <div className="w-[480px] shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-hidden">

        {/* 顶部标题栏 */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h1 className="font-semibold text-slate-900 text-base">AI视频</h1>
          <button
            onClick={() => { setVideoPrompt(''); setVideoReferenceAssets([]); toast.info('已新建'); }}
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
              <span className="text-xs text-slate-500">{video.referenceAssets.length} / 11</span>
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

            {video.referenceAssets.length > 0 ? (
              <AssetThumbnails
                assets={video.referenceAssets}
                onRemove={(id) => setVideoReferenceAssets(video.referenceAssets.filter((a) => a.id !== id))}
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
          <div className="px-5 pt-4">
            <textarea
              value={video.prompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="帮我做一个袋鼠旅行的品牌宣传广告，用来给美团酒店宣传的"
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y leading-relaxed"
              style={{ minHeight: 320, maxHeight: 480 }}
              maxLength={2000}
            />
          </div>

          {/* 字数 + 帮我写 */}
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">{video.prompt.length} / 2000</span>
            <button className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors font-medium">
              <Wand2 size={14} />帮我写
            </button>
          </div>

          {/* 模型 + 视频设置 */}
          <div className="px-5 pb-4 flex gap-3">
            {/* 模型选择 */}
            <div className="flex-1">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer transition-all">
                <BarChart2 size={15} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-400 leading-none mb-0.5">模型</div>
                  <select
                    value={video.model}
                    onChange={(e) => setVideoModel(e.target.value as typeof video.model)}
                    className="w-full bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="seedance-2.0-vip">Seedance-2.0-VIP</option>
                    <option value="seedance-2.0-fast-vip">Fast-VIP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 视频设置 */}
            <div className="flex-1 relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
              >
                <Settings2 size={15} className="text-slate-400 shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[10px] text-slate-400 leading-none mb-0.5">视频设置</div>
                  <div className="text-xs font-medium text-slate-700 truncate">{configSummary(video.config)}</div>
                </div>
                <ChevronDown size={13} className={cn('text-slate-400 shrink-0 transition-transform', showSettings && 'rotate-180')} />
              </button>

              {showSettings && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-20 space-y-4">
                  {/* 比例 */}
                  <div>
                    <div className="text-xs text-slate-500 mb-2">视频比例</div>
                    <div className="flex flex-wrap gap-1.5">
                      {RATIOS.map((r) => (
                        <button key={r} onClick={() => setVideoConfig({ ratio: r })}
                          className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                            video.config.ratio === r ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400'
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
                        <button key={res.value} onClick={() => setVideoConfig({ resolution: res.value })}
                          className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all',
                            video.config.resolution === res.value ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400'
                          )}>
                          {res.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 音频 */}
                  <div>
                    <div className="text-xs text-slate-500 mb-2">音频</div>
                    <div className="flex gap-1.5">
                      {(['on', 'off'] as const).map((a) => (
                        <button key={a} onClick={() => setVideoConfig({ audio: a })}
                          className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all',
                            video.config.audio === a ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400'
                          )}>
                          {a === 'on' ? '含音频' : '静音'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 时长 */}
                  <div>
                    <div className="text-xs text-slate-500 mb-2 flex justify-between">
                      <span>视频时长</span>
                      <span className="font-medium text-slate-700">{video.config.duration}s</span>
                    </div>
                    <input type="range" min={4} max={15} step={1} value={video.config.duration}
                      onChange={(e) => setVideoConfig({ duration: parseInt(e.target.value) })}
                      className="w-full accent-slate-900" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>4s</span><span>15s</span>
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
            立即生成视频
          </button>
        </div>
      </div>

      {/* ── 中栏：预览/历史 ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Tabs */}
        <div className="px-6 pt-4 flex items-center gap-6 border-b border-slate-200 bg-white shrink-0">
          {(['preview', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-all',
                activeTab === t
                  ? 'text-slate-900 border-slate-900'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              )}
            >
              {{ preview: '预览', history: '历史' }[t]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'preview' ? (
            previewTask?.result ? (
              <div className="p-6 space-y-4">
                <div className={cn('w-full bg-black rounded-2xl overflow-hidden shadow-sm', RATIO_ASPECT[previewTask.config.ratio])}>
                  <video src={previewTask.result.videoUrl} controls className="w-full h-full" />
                </div>
                <button onClick={() => toast.success('已下载')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-all shadow-sm">
                  <Download size={14} />下载
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <Video size={44} strokeWidth={1} className="text-slate-300" />
                <p className="text-sm">点击右侧队列中带成片的任务即可预览。</p>
              </div>
            )
          ) : (
            <div className="p-5 grid grid-cols-2 gap-4">
              {video.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => { if (task.status === 'done') { setPreviewTask(task); setActiveTab('preview'); } }}
                  className="rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all text-left group"
                >
                  <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
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
                  <div className="p-3">
                    <p className="text-xs text-slate-700 truncate leading-relaxed">{task.prompt}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <StatusIcon status={task.status} />
                      <span className="text-[11px] text-slate-400">
                        {{ queued: '排队中', generating: `生成中 ${task.progress}%`, done: '已完成', failed: '失败' }[task.status]}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {video.tasks.length === 0 && (
                <div className="col-span-2 py-20 flex flex-col items-center text-slate-400 gap-3">
                  <Video size={40} strokeWidth={1} className="text-slate-300" />
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
          {/* 标题 */}
          <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-sm font-medium text-slate-800">任务队列</span>
            <button
              onClick={() => setShowQueue(false)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={13} />收起
            </button>
          </div>

          {/* 计数卡片 */}
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

          {/* 任务列表 */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
            {video.tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => { if (task.status === 'done') { setPreviewTask(task); setActiveTab('preview'); } }}
                className="w-full rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all text-left bg-white"
              >
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
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
            ))}
            {video.tasks.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">暂无任务</p>
            )}
          </div>
        </div>
      )}

      {/* 收起状态下的展开按钮 */}
      {!showQueue && (
        <button
          onClick={() => setShowQueue(true)}
          className="w-8 shrink-0 border-l border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
        >
          <span className="text-[10px] writing-mode-vertical rotate-180" style={{ writingMode: 'vertical-rl' }}>任务队列</span>
        </button>
      )}

      <AssetPickerModal
        open={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        onConfirm={(selected) => setVideoReferenceAssets([...video.referenceAssets, ...selected].slice(0, 11))}
      />
    </div>
  );
}
