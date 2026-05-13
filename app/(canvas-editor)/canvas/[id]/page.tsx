import CanvasEditorClient from './client';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function CanvasEditorPage() {
  return <CanvasEditorClient />;
}
