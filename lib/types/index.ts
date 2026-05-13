// ========== Asset Types ==========
export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl: string;
  format: string;
  size: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  source: 'upload' | 'ai-generated';
  tags: string[];
  libraryId: string;
  createdAt: number;
}

export interface AssetLibrary {
  id: string;
  name: string;
  count: number;
  isDefault: boolean;
  createdAt: number;
}

// ========== Chat Types ==========
export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Asset[];
  timestamp: number;
  status: 'sending' | 'streaming' | 'done' | 'error';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  mode: 'agent' | 'video' | 'image';
  skills: Skill[];
  createdAt: number;
  updatedAt: number;
}

// ========== Video Types ==========
export type VideoRatio = '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16';
export type VideoResolution = '480p' | '720p' | '1080p';

export interface VideoConfig {
  ratio: VideoRatio;
  resolution: VideoResolution;
  audio: 'on' | 'off';
  duration: number;
}

export interface VideoTask {
  id: string;
  prompt: string;
  model: 'seedance-2.0-vip' | 'seedance-2.0-fast-vip';
  config: VideoConfig;
  referenceAssets: Asset[];
  status: 'queued' | 'generating' | 'done' | 'failed';
  progress: number;
  result?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  };
  credits: number;
  createdAt: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  type: 'video' | 'image';
  createdAt: number;
}

// ========== Image Types ==========
export type ImageRatio = '16:9' | '4:3' | '1:1' | '4:5' | '3:4' | '9:16';
export type ImageResolution = '1k' | '2k' | '4k';
export type ImageFormat = 'png' | 'jpeg';

export interface ImageConfig {
  ratio: ImageRatio;
  resolution: ImageResolution;
  format: ImageFormat;
}

export interface ImageTask {
  id: string;
  prompt: string;
  model: 'advanced';
  config: ImageConfig;
  referenceAssets: Asset[];
  status: 'queued' | 'generating' | 'done' | 'failed';
  progress: number;
  result?: {
    imageUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
  };
  credits: number;
  createdAt: number;
}

// ========== Canvas Types ==========
export interface CanvasNode {
  id: string;
  type: 'image' | 'video' | 'text' | 'audio';
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: {
    src?: string;
    text?: string;
    label?: string;
    style?: Record<string, unknown>;
  };
  connections: string[];
}

export interface CanvasProject {
  id: string;
  name: string;
  thumbnail?: string;
  nodes: CanvasNode[];
  viewport: { x: number; y: number; zoom: number };
  createdAt: number;
  updatedAt: number;
}

// ========== User Types ==========
export interface User {
  id: string;
  name: string;
  avatar: string;
  credits: number;
}
