import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DA·AI - 为电商而生的 AIGC 平台',
  description: '多模态 AIGC 平台：AI 对话、AI 视频生成、AI 图片生成、无限画布、资产管理',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
