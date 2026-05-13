'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Plus, Clock, Sparkles, Video, Image as ImageIcon, Layout, Folder,
  ArrowUp, Bot, User, Copy, RotateCcw, ThumbsUp, ThumbsDown, X,
  ChevronDown, AtSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { toast } from '@/components/ui/Toast';
import AssetPickerModal from '@/components/ui/AssetPickerModal';
import AssetThumbnails from '@/components/ui/AssetThumbnails';
import type { Asset, Skill } from '@/lib/types';
import Link from 'next/link';

/* ── 快捷入口卡片数据 ── */
const QUICK_ENTRIES = [
  {
    icon: ImageIcon,
    title: '图片生成',
    desc: '一句话生图 / 改图',
    href: '/toolbox/image-generation',
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Video,
    title: '视频生成',
    desc: '生成可投放的素材',
    href: '/toolbox/video-generation',
    gradient: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Layout,
    title: '无限画布',
    desc: '一站式工作台 / 多模态混排',
    href: '/canvas',
    gradient: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-50',
  },
  {
    icon: Folder,
    title: '资产库',
    desc: '虚拟人 / 真人 / 商品 /...',
    href: '/assets',
    gradient: 'from-orange-400 to-amber-500',
    bg: 'bg-orange-50',
  },
];

/* ── 模式 Tab ── */
const MODES = [
  { id: 'agent' as const, label: 'Agent 模式', icon: Sparkles },
  { id: 'video' as const, label: '视频生成', icon: Video },
  { id: 'image' as const, label: '图片生成', icon: ImageIcon },
];

export default function AgentChatPage() {
  const { chat, skills, sendMessage, newConversation, setCurrentConversation, setChatMode, setSelectedSkills } = useStore();
  const currentConv = chat.conversations.find((c) => c.id === chat.currentId) ?? null;
  const messages = currentConv?.messages ?? [];

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Asset[]>([]);
  const [showSkills, setShowSkills] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    sendMessage(input.trim(), attachments.length > 0 ? attachments : undefined);
    setInput('');
    setAttachments([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function toggleSkill(skill: Skill) {
    const exists = chat.selectedSkills.find((s) => s.id === skill.id);
    setSelectedSkills(exists ? chat.selectedSkills.filter((s) => s.id !== skill.id) : [skill]);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="h-full flex bg-slate-50">
      {/* ── 历史面板 ── */}
      {showHistory && (
        <div className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">对话记录</span>
            <button onClick={() => setShowHistory(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {chat.conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setCurrentConversation(c.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all',
                  c.id === chat.currentId
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                )}
              >
                <div className="font-medium truncate">{c.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{c.messages.length} 条消息</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 主区域 ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {isEmpty ? (
          /* ════ 空状态 ════ */
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
            {/* 大标题 */}
            <h1 className="text-4xl font-bold text-slate-900 mb-12 tracking-tight">
              DA·AI，为电商而生的AIGC平台。
            </h1>

            {/* 大输入框 */}
            <div className="w-full max-w-[860px]">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* 附件预览 */}
                {attachments.length > 0 && (
                  <div className="px-4 pt-4">
                    <AssetThumbnails
                      assets={attachments}
                      onRemove={(id) => setAttachments((a) => a.filter((x) => x.id !== id))}
                      size="sm"
                    />
                  </div>
                )}

                {/* 上半部分：+号 + 输入框 */}
                <div className="flex items-start gap-3 px-4 pt-4 pb-2">
                  {/* + 按钮 */}
                  <button
                    onClick={() => setShowAssetPicker(true)}
                    className="mt-0.5 w-10 h-10 shrink-0 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-all"
                  >
                    <Plus size={18} />
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="结合参考、输入文字或 @ 主体，说说今天想做什么。"
                    rows={2}
                    className="flex-1 bg-transparent text-slate-800 text-base placeholder-slate-400 resize-none focus:outline-none leading-relaxed pt-1"
                  />
                </div>

                {/* 底部工具栏 */}
                <div className="flex items-center gap-1 px-4 py-3 border-t border-slate-100">
                  {/* 新建对话 */}
                  <button
                    onClick={() => { newConversation(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <Plus size={14} />新建对话
                  </button>

                  {/* 对话记录 */}
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <Clock size={14} />对话记录
                  </button>

                  <div className="w-px h-4 bg-slate-200 mx-1" />

                  {/* Mode tabs */}
                  {MODES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setChatMode(id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        chat.mode === id
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}

                  {/* 选择技能 (Agent模式) */}
                  {chat.mode === 'agent' && (
                    <div className="relative">
                      <button
                        onClick={() => setShowSkills(!showSkills)}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all',
                          showSkills || chat.selectedSkills.length > 0
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        )}
                      >
                        <Sparkles size={13} />
                        {chat.selectedSkills.length > 0 ? chat.selectedSkills[0].name : '选择技能'}
                        <ChevronDown size={12} />
                      </button>
                      {showSkills && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30">
                          <p className="text-xs text-slate-400 px-2 py-1.5 font-medium">选择技能</p>
                          {skills.map((sk) => (
                            <button
                              key={sk.id}
                              onClick={() => { toggleSkill(sk); setShowSkills(false); }}
                              className={cn(
                                'w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                                chat.selectedSkills.find((s) => s.id === sk.id)
                                  ? 'bg-indigo-50 text-indigo-600'
                                  : 'text-slate-700 hover:bg-slate-50'
                              )}
                            >
                              <span className="text-lg leading-none mt-0.5">{sk.icon}</span>
                              <div>
                                <div className="text-sm font-medium">{sk.name}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{sk.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 右侧发送按钮 */}
                  <div className="ml-auto">
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                        input.trim()
                          ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      <ArrowUp size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 快捷入口卡片 */}
            <div className="w-full max-w-[860px] grid grid-cols-4 gap-3 mt-6">
              {QUICK_ENTRIES.map((entry) => (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br', entry.gradient)}>
                    <entry.icon size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{entry.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">{entry.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        ) : (
          /* ════ 有消息状态 ════ */
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mt-1">
                        <Bot size={15} className="text-white" />
                      </div>
                    )}
                    <div className="max-w-[78%] space-y-1.5">
                      {msg.attachments && msg.attachments.length > 0 && (
                        <AssetThumbnails assets={msg.attachments} size="sm" />
                      )}
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-md'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-md shadow-sm'
                        )}
                      >
                        {msg.status === 'streaming' && msg.content === '' ? (
                          <div className="flex gap-1 items-center py-0.5">
                            {[0, 150, 300].map((delay) => (
                              <span key={delay} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                            ))}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        )}
                      </div>
                      {msg.role === 'assistant' && msg.status === 'done' && (
                        <div className="flex gap-0.5 pl-1">
                          {[
                            { icon: Copy, label: '复制', action: () => { navigator.clipboard.writeText(msg.content); toast.success('已复制'); } },
                            { icon: RotateCcw, label: '重新生成', action: () => toast.info('重新生成中...') },
                            { icon: ThumbsUp, label: '赞', action: () => toast.success('感谢反馈') },
                            { icon: ThumbsDown, label: '踩', action: () => toast.success('感谢反馈') },
                          ].map(({ icon: Icon, label, action }) => (
                            <button key={label} onClick={action} title={label} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                              <Icon size={13} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                        <User size={15} className="text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 底部输入框（有消息时） */}
            <div className="shrink-0 px-6 pb-5">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {attachments.length > 0 && (
                    <div className="px-4 pt-3">
                      <AssetThumbnails assets={attachments} onRemove={(id) => setAttachments((a) => a.filter((x) => x.id !== id))} size="sm" />
                    </div>
                  )}
                  <div className="flex items-start gap-3 px-4 pt-3 pb-2">
                    <button
                      onClick={() => setShowAssetPicker(true)}
                      className="mt-0.5 w-8 h-8 shrink-0 rounded-lg border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-all"
                    >
                      <Plus size={15} />
                    </button>
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="描述您想要的内容..."
                      rows={1}
                      className="flex-1 bg-transparent text-slate-800 text-sm placeholder-slate-400 resize-none focus:outline-none leading-relaxed pt-1 max-h-36 overflow-y-auto"
                    />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2.5 border-t border-slate-100">
                    <button onClick={() => { newConversation(); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
                      <Plus size={13} />新建
                    </button>
                    <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
                      <Clock size={13} />记录
                    </button>
                    <div className="w-px h-3.5 bg-slate-200 mx-1" />
                    {MODES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setChatMode(id)}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                          chat.mode === id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                        )}
                      >
                        <Icon size={12} />{label}
                      </button>
                    ))}
                    {chat.mode === 'agent' && (
                      <div className="relative">
                        <button
                          onClick={() => setShowSkills(!showSkills)}
                          className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all', showSkills || chat.selectedSkills.length > 0 ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100')}
                        >
                          <Sparkles size={12} />
                          {chat.selectedSkills.length > 0 ? chat.selectedSkills[0].name : '选择技能'}
                          <ChevronDown size={11} />
                        </button>
                        {showSkills && (
                          <div className="absolute bottom-full left-0 mb-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30">
                            {skills.map((sk) => (
                              <button
                                key={sk.id}
                                onClick={() => { toggleSkill(sk); setShowSkills(false); }}
                                className={cn('w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all', chat.selectedSkills.find((s) => s.id === sk.id) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50')}
                              >
                                <span className="text-base">{sk.icon}</span>
                                <div>
                                  <div className="text-sm font-medium">{sk.name}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">{sk.description}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="ml-auto">
                      <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={cn('w-8 h-8 rounded-full flex items-center justify-center transition-all', input.trim() ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}
                      >
                        <ArrowUp size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AssetPickerModal
        open={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        onConfirm={(selected) => setAttachments((prev) => [...prev, ...selected].slice(0, 12))}
      />
    </div>
  );
}
