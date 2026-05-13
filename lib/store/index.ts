import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Asset,
  AssetLibrary,
  Conversation,
  Message,
  Skill,
  VideoTask,
  VideoConfig,
  ImageTask,
  ImageConfig,
  CanvasProject,
  User,
  PromptTemplate,
} from '@/lib/types';

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ========== Mock Seeds ==========
const MOCK_ASSETS: Asset[] = [
  { id: 'a1', name: '产品主图.jpg', type: 'image', url: 'https://picsum.photos/seed/1/800/600', thumbnailUrl: 'https://picsum.photos/seed/1/400/300', format: 'jpg', size: 204800, dimensions: { width: 800, height: 600 }, source: 'upload', tags: ['产品', '主图'], libraryId: 'default', createdAt: Date.now() - 86400000 * 3 },
  { id: 'a2', name: '背景图.png', type: 'image', url: 'https://picsum.photos/seed/2/1920/1080', thumbnailUrl: 'https://picsum.photos/seed/2/400/225', format: 'png', size: 512000, dimensions: { width: 1920, height: 1080 }, source: 'upload', tags: ['背景'], libraryId: 'default', createdAt: Date.now() - 86400000 * 2 },
  { id: 'a3', name: 'AI生成图片.png', type: 'image', url: 'https://picsum.photos/seed/3/800/800', thumbnailUrl: 'https://picsum.photos/seed/3/400/400', format: 'png', size: 350000, dimensions: { width: 800, height: 800 }, source: 'ai-generated', tags: ['AI'], libraryId: 'default', createdAt: Date.now() - 86400000 },
  { id: 'a4', name: '宣传视频.mp4', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://picsum.photos/seed/4/400/225', format: 'mp4', size: 5242880, duration: 30, source: 'upload', tags: ['宣传'], libraryId: 'default', createdAt: Date.now() - 3600000 * 5 },
  { id: 'a5', name: 'AI视频.mp4', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://picsum.photos/seed/5/400/225', format: 'mp4', size: 8388608, duration: 15, source: 'ai-generated', tags: ['AI'], libraryId: 'default', createdAt: Date.now() - 3600000 * 2 },
  { id: 'a6', name: '背景音乐.mp3', type: 'audio', url: '#', thumbnailUrl: '', format: 'mp3', size: 3145728, duration: 180, source: 'upload', tags: ['音乐'], libraryId: 'default', createdAt: Date.now() - 3600000 * 8 },
  { id: 'a7', name: '促销图.jpg', type: 'image', url: 'https://picsum.photos/seed/7/600/800', thumbnailUrl: 'https://picsum.photos/seed/7/300/400', format: 'jpg', size: 180000, dimensions: { width: 600, height: 800 }, source: 'upload', tags: ['促销'], libraryId: 'lib2', createdAt: Date.now() - 86400000 * 4 },
  { id: 'a8', name: '细节图.jpg', type: 'image', url: 'https://picsum.photos/seed/8/1000/1000', thumbnailUrl: 'https://picsum.photos/seed/8/400/400', format: 'jpg', size: 220000, dimensions: { width: 1000, height: 1000 }, source: 'upload', tags: ['细节'], libraryId: 'lib2', createdAt: Date.now() - 86400000 },
];

const MOCK_LIBRARIES: AssetLibrary[] = [
  { id: 'default', name: '全部素材', count: 6, isDefault: true, createdAt: Date.now() - 86400000 * 30 },
  { id: 'lib2', name: '商品图册', count: 2, isDefault: false, createdAt: Date.now() - 86400000 * 7 },
];

const MOCK_SKILLS: Skill[] = [
  { id: 'material-analysis', name: '素材分析', icon: '🔍', description: '分析上传素材的构图、色彩、元素' },
  { id: 'video-deconstruct', name: '视频拆解', icon: '🎬', description: '将视频拆解为分镜和元素说明' },
  { id: 'video-script', name: '视频脚本', icon: '📝', description: '根据描述生成视频脚本' },
  { id: 'image-prompt', name: '图片提示词', icon: '✨', description: '结构化输出图片生成提示词' },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    title: '电商主图设计咨询',
    messages: [
      { id: 'm1', role: 'user', content: '帮我分析一下这张产品主图的构图和色彩', timestamp: Date.now() - 3600000, status: 'done' },
      { id: 'm2', role: 'assistant', content: '这张产品主图整体构图采用了**居中式构图**，主体产品位于画面正中央，背景简洁干净，能够有效突出产品本身。\n\n**色彩分析：**\n- 主色调：白色背景，给人简洁、高端的感觉\n- 产品色：暖橙色，与背景形成鲜明对比\n- 辅助色：无明显辅助色，整体干净利落\n\n**建议：**\n可以适当添加一些细节阴影，增加产品的立体感和质感。', timestamp: Date.now() - 3590000, status: 'done' },
    ],
    mode: 'agent',
    skills: [],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3590000,
  },
];

const MOCK_VIDEO_TASKS: VideoTask[] = [
  {
    id: 'vt1',
    prompt: '一个电商产品展示视频，产品在白色背景上旋转，光影效果精美',
    model: 'seedance-2.0-vip',
    config: { ratio: '16:9', resolution: '1080p', audio: 'off', duration: 8 },
    referenceAssets: [],
    status: 'done',
    progress: 100,
    result: { videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnailUrl: 'https://picsum.photos/seed/vt1/640/360', duration: 8 },
    credits: 20.40,
    createdAt: Date.now() - 3600000 * 2,
  },
];

const MOCK_IMAGE_TASKS: ImageTask[] = [
  {
    id: 'it1',
    prompt: '一款精美的电商产品主图，白色背景，专业摄影风格',
    model: 'advanced',
    config: { ratio: '1:1', resolution: '2k', format: 'png' },
    referenceAssets: [],
    status: 'done',
    progress: 100,
    result: { imageUrl: 'https://picsum.photos/seed/it1/1024/1024', thumbnailUrl: 'https://picsum.photos/seed/it1/400/400', width: 1024, height: 1024 },
    credits: 1.18,
    createdAt: Date.now() - 1800000,
  },
];

const MOCK_CANVAS_PROJECTS: CanvasProject[] = [
  {
    id: 'cp1',
    name: '春季促销素材',
    thumbnail: 'https://picsum.photos/seed/cp1/400/225',
    nodes: [
      { id: 'n1', type: 'image', position: { x: 100, y: 100 }, size: { width: 280, height: 200 }, data: { src: 'https://picsum.photos/seed/1/400/300', label: '产品主图' }, connections: ['n2'] },
      { id: 'n2', type: 'text', position: { x: 450, y: 120 }, size: { width: 280, height: 180 }, data: { text: '春季限定，清爽上市！', label: '文案节点' }, connections: [] },
    ],
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'cp2',
    name: '视频脚本策划',
    thumbnail: undefined,
    nodes: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: Date.now() - 3600000 * 3,
    updatedAt: Date.now() - 3600000 * 2,
  },
];

// ========== Store Interface ==========
interface StoreState {
  user: User;
  assets: {
    libraries: AssetLibrary[];
    currentLibraryId: string;
    items: Asset[];
    filters: {
      type: 'all' | 'image' | 'video' | 'audio';
      source: 'all' | 'upload' | 'ai-generated';
      query: string;
    };
  };
  chat: {
    conversations: Conversation[];
    currentId: string | null;
    mode: 'agent' | 'video' | 'image';
    selectedSkills: Skill[];
  };
  video: {
    tasks: VideoTask[];
    config: VideoConfig;
    prompt: string;
    model: 'seedance-2.0-vip' | 'seedance-2.0-fast-vip';
    referenceAssets: Asset[];
    promptTemplates: PromptTemplate[];
  };
  image: {
    tasks: ImageTask[];
    config: ImageConfig;
    prompt: string;
    referenceAssets: Asset[];
  };
  canvas: {
    projects: CanvasProject[];
    currentProject: CanvasProject | null;
  };
  skills: Skill[];

  // Actions
  setUser: (user: Partial<User>) => void;

  // Asset actions
  setAssetFilter: (filter: Partial<StoreState['assets']['filters']>) => void;
  setCurrentLibrary: (id: string) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  moveAssets: (ids: string[], targetLibraryId: string) => void;
  addLibrary: (name: string) => void;
  removeLibrary: (id: string) => void;
  renameLibrary: (id: string, name: string) => void;

  // Chat actions
  setCurrentConversation: (id: string | null) => void;
  setChatMode: (mode: 'agent' | 'video' | 'image') => void;
  setSelectedSkills: (skills: Skill[]) => void;
  sendMessage: (content: string, attachments?: Asset[]) => void;
  newConversation: () => void;

  // Video actions
  setVideoConfig: (config: Partial<VideoConfig>) => void;
  setVideoPrompt: (prompt: string) => void;
  setVideoModel: (model: 'seedance-2.0-vip' | 'seedance-2.0-fast-vip') => void;
  setVideoReferenceAssets: (assets: Asset[]) => void;
  addVideoTask: (task: VideoTask) => void;
  submitVideoGeneration: () => void;

  // Image actions
  setImageConfig: (config: Partial<ImageConfig>) => void;
  setImagePrompt: (prompt: string) => void;
  setImageReferenceAssets: (assets: Asset[]) => void;
  submitImageGeneration: () => void;

  // Canvas actions
  addCanvasProject: (name: string) => CanvasProject;
  updateCanvasProject: (id: string, data: Partial<CanvasProject>) => void;
  deleteCanvasProject: (id: string) => void;
  duplicateCanvasProject: (id: string) => void;
  setCurrentProject: (project: CanvasProject | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: { id: 'u1', name: '用户', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default', credits: 128.50 },

      assets: {
        libraries: MOCK_LIBRARIES,
        currentLibraryId: 'default',
        items: MOCK_ASSETS,
        filters: { type: 'all', source: 'all', query: '' },
      },

      chat: {
        conversations: MOCK_CONVERSATIONS,
        currentId: null,
        mode: 'agent',
        selectedSkills: [],
      },

      video: {
        tasks: MOCK_VIDEO_TASKS,
        config: { ratio: '16:9', resolution: '720p', audio: 'off', duration: 8 },
        prompt: '',
        model: 'seedance-2.0-vip',
        referenceAssets: [],
        promptTemplates: [],
      },

      image: {
        tasks: MOCK_IMAGE_TASKS,
        config: { ratio: '1:1', resolution: '1k', format: 'png' },
        prompt: '',
        referenceAssets: [],
      },

      canvas: {
        projects: MOCK_CANVAS_PROJECTS,
        currentProject: null,
      },

      skills: MOCK_SKILLS,

      setUser: (u) => set((s) => ({ user: { ...s.user, ...u } })),

      setAssetFilter: (f) => set((s) => ({ assets: { ...s.assets, filters: { ...s.assets.filters, ...f } } })),
      setCurrentLibrary: (id) => set((s) => ({ assets: { ...s.assets, currentLibraryId: id } })),
      addAsset: (asset) => set((s) => ({
        assets: {
          ...s.assets,
          items: [asset, ...s.assets.items],
          libraries: s.assets.libraries.map((l) =>
            l.id === asset.libraryId || l.isDefault ? { ...l, count: l.count + 1 } : l
          ),
        },
      })),
      removeAsset: (id) => set((s) => {
        const asset = s.assets.items.find((a) => a.id === id);
        return {
          assets: {
            ...s.assets,
            items: s.assets.items.filter((a) => a.id !== id),
            libraries: s.assets.libraries.map((l) =>
              (l.id === asset?.libraryId || l.isDefault) && l.count > 0 ? { ...l, count: l.count - 1 } : l
            ),
          },
        };
      }),
      moveAssets: (ids, targetLibraryId) => set((s) => ({
        assets: {
          ...s.assets,
          items: s.assets.items.map((a) => ids.includes(a.id) ? { ...a, libraryId: targetLibraryId } : a),
        },
      })),
      addLibrary: (name) => set((s) => ({
        assets: {
          ...s.assets,
          libraries: [...s.assets.libraries, { id: uid(), name, count: 0, isDefault: false, createdAt: Date.now() }],
        },
      })),
      removeLibrary: (id) => set((s) => ({
        assets: {
          ...s.assets,
          libraries: s.assets.libraries.filter((l) => l.id !== id),
          items: s.assets.items.filter((a) => a.libraryId !== id),
          currentLibraryId: s.assets.currentLibraryId === id ? 'default' : s.assets.currentLibraryId,
        },
      })),
      renameLibrary: (id, name) => set((s) => ({
        assets: {
          ...s.assets,
          libraries: s.assets.libraries.map((l) => l.id === id ? { ...l, name } : l),
        },
      })),

      setCurrentConversation: (id) => set((s) => ({ chat: { ...s.chat, currentId: id } })),
      setChatMode: (mode) => set((s) => ({ chat: { ...s.chat, mode } })),
      setSelectedSkills: (skills) => set((s) => ({ chat: { ...s.chat, selectedSkills: skills } })),
      newConversation: () => {
        const id = uid();
        const conv: Conversation = {
          id,
          title: '新对话',
          messages: [],
          mode: get().chat.mode,
          skills: get().chat.selectedSkills,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({
          chat: {
            ...s.chat,
            conversations: [conv, ...s.chat.conversations],
            currentId: id,
          },
        }));
      },
      sendMessage: (content, attachments) => {
        const state = get();
        let convId = state.chat.currentId;

        if (!convId) {
          const id = uid();
          const conv: Conversation = {
            id,
            title: content.slice(0, 20) || '新对话',
            messages: [],
            mode: state.chat.mode,
            skills: state.chat.selectedSkills,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          set((s) => ({
            chat: { ...s.chat, conversations: [conv, ...s.chat.conversations], currentId: id },
          }));
          convId = id;
        }

        const userMsg: Message = {
          id: uid(),
          role: 'user',
          content,
          attachments,
          timestamp: Date.now(),
          status: 'done',
        };

        const aiMsg: Message = {
          id: uid(),
          role: 'assistant',
          content: '',
          timestamp: Date.now() + 100,
          status: 'streaming',
        };

        set((s) => ({
          chat: {
            ...s.chat,
            conversations: s.chat.conversations.map((c) =>
              c.id === convId
                ? { ...c, messages: [...c.messages, userMsg, aiMsg], title: c.title === '新对话' ? content.slice(0, 20) : c.title, updatedAt: Date.now() }
                : c
            ),
          },
        }));

        // Simulate streaming
        const responses = [
          '好的，我来帮您分析一下。',
          '\n\n根据您的描述，我建议以下方案：\n\n',
          '**方案一：** 使用简洁的白色背景，突出产品本身的质感。\n\n',
          '**方案二：** 采用渐变背景，增加视觉层次感，适合高端产品展示。\n\n',
          '**方案三：** 场景化拍摄，将产品置于使用场景中，提升用户代入感。\n\n',
          '如果您需要更具体的建议，可以上传参考素材，我会针对性地分析。',
        ];

        let fullContent = '';
        let partIdx = 0;
        const interval = setInterval(() => {
          if (partIdx >= responses.length) {
            clearInterval(interval);
            set((s) => ({
              chat: {
                ...s.chat,
                conversations: s.chat.conversations.map((c) =>
                  c.id === convId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === aiMsg.id ? { ...m, status: 'done' as const } : m
                        ),
                      }
                    : c
                ),
              },
            }));
            return;
          }
          fullContent += responses[partIdx++];
          const content = fullContent;
          set((s) => ({
            chat: {
              ...s.chat,
              conversations: s.chat.conversations.map((c) =>
                c.id === convId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === aiMsg.id ? { ...m, content } : m
                      ),
                    }
                  : c
              ),
            },
          }));
        }, 150);
      },

      setVideoConfig: (c) => set((s) => ({ video: { ...s.video, config: { ...s.video.config, ...c } } })),
      setVideoPrompt: (p) => set((s) => ({ video: { ...s.video, prompt: p } })),
      setVideoModel: (m) => set((s) => ({ video: { ...s.video, model: m } })),
      setVideoReferenceAssets: (a) => set((s) => ({ video: { ...s.video, referenceAssets: a } })),
      addVideoTask: (task) => set((s) => ({ video: { ...s.video, tasks: [task, ...s.video.tasks] } })),
      submitVideoGeneration: () => {
        const { video, user } = get();
        if (!video.prompt.trim()) return;

        const task: VideoTask = {
          id: uid(),
          prompt: video.prompt,
          model: video.model,
          config: { ...video.config },
          referenceAssets: [...video.referenceAssets],
          status: 'queued',
          progress: 0,
          credits: 20.40,
          createdAt: Date.now(),
        };

        set((s) => ({
          video: { ...s.video, tasks: [task, ...s.video.tasks] },
          user: { ...s.user, credits: Math.max(0, s.user.credits - 20.40) },
        }));

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress >= 100) {
            clearInterval(interval);
            set((s) => ({
              video: {
                ...s.video,
                tasks: s.video.tasks.map((t) =>
                  t.id === task.id
                    ? {
                        ...t,
                        status: 'done' as const,
                        progress: 100,
                        result: {
                          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                          thumbnailUrl: `https://picsum.photos/seed/${task.id}/640/360`,
                          duration: task.config.duration,
                        },
                      }
                    : t
                ),
              },
            }));
          } else {
            set((s) => ({
              video: {
                ...s.video,
                tasks: s.video.tasks.map((t) =>
                  t.id === task.id ? { ...t, status: 'generating' as const, progress } : t
                ),
              },
            }));
          }
        }, 2000);
      },

      setImageConfig: (c) => set((s) => ({ image: { ...s.image, config: { ...s.image.config, ...c } } })),
      setImagePrompt: (p) => set((s) => ({ image: { ...s.image, prompt: p } })),
      setImageReferenceAssets: (a) => set((s) => ({ image: { ...s.image, referenceAssets: a } })),
      submitImageGeneration: () => {
        const { image } = get();
        if (!image.prompt.trim()) return;

        const task: ImageTask = {
          id: uid(),
          prompt: image.prompt,
          model: 'advanced',
          config: { ...image.config },
          referenceAssets: [...image.referenceAssets],
          status: 'queued',
          progress: 0,
          credits: 1.18,
          createdAt: Date.now(),
        };

        set((s) => ({
          image: { ...s.image, tasks: [task, ...s.image.tasks] },
          user: { ...s.user, credits: Math.max(0, s.user.credits - 1.18) },
        }));

        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          if (progress >= 100) {
            clearInterval(interval);
            set((s) => ({
              image: {
                ...s.image,
                tasks: s.image.tasks.map((t) =>
                  t.id === task.id
                    ? {
                        ...t,
                        status: 'done' as const,
                        progress: 100,
                        result: {
                          imageUrl: `https://picsum.photos/seed/${task.id}/1024/1024`,
                          thumbnailUrl: `https://picsum.photos/seed/${task.id}/400/400`,
                          width: 1024,
                          height: 1024,
                        },
                      }
                    : t
                ),
              },
            }));
          } else {
            set((s) => ({
              image: {
                ...s.image,
                tasks: s.image.tasks.map((t) =>
                  t.id === task.id ? { ...t, status: 'generating' as const, progress } : t
                ),
              },
            }));
          }
        }, 1000);
      },

      addCanvasProject: (name) => {
        const project: CanvasProject = {
          id: uid(),
          name,
          nodes: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ canvas: { ...s.canvas, projects: [project, ...s.canvas.projects] } }));
        return project;
      },
      updateCanvasProject: (id, data) => set((s) => ({
        canvas: {
          ...s.canvas,
          projects: s.canvas.projects.map((p) => p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p),
          currentProject: s.canvas.currentProject?.id === id ? { ...s.canvas.currentProject, ...data } : s.canvas.currentProject,
        },
      })),
      deleteCanvasProject: (id) => set((s) => ({
        canvas: {
          ...s.canvas,
          projects: s.canvas.projects.filter((p) => p.id !== id),
          currentProject: s.canvas.currentProject?.id === id ? null : s.canvas.currentProject,
        },
      })),
      duplicateCanvasProject: (id) => {
        const project = get().canvas.projects.find((p) => p.id === id);
        if (!project) return;
        const copy: CanvasProject = {
          ...project,
          id: uid(),
          name: `${project.name} (副本)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ canvas: { ...s.canvas, projects: [copy, ...s.canvas.projects] } }));
      },
      setCurrentProject: (project) => set((s) => ({ canvas: { ...s.canvas, currentProject: project } })),
    }),
    {
      name: 'da-ai-store',
      partialize: (s) => ({
        user: s.user,
        assets: s.assets,
        chat: { conversations: s.chat.conversations, currentId: s.chat.currentId, mode: s.chat.mode, selectedSkills: [] },
        video: { tasks: s.video.tasks, config: s.video.config, model: s.video.model, prompt: '', referenceAssets: [], promptTemplates: s.video.promptTemplates },
        image: { tasks: s.image.tasks, config: s.image.config, prompt: '', referenceAssets: [] },
        canvas: s.canvas,
      }),
    }
  )
);
