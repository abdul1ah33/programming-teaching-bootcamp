import { Download, Eye, File, FileArchive, FileText, Image as ImageIcon, Presentation } from 'lucide-react';
import { FILE_TYPES, type FileType } from '@/lib/model/enums';
import { canPreview, fileExtension } from '@/lib/derive/resources';
import type { ReactNode } from 'react';
import { cx, Tag } from './primitives';

const IMAGE = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);
const ARCHIVE = new Set(['zip', 'rar', '7z', 'gz', 'tar']);
const SLIDES = new Set(['ppt', 'pptx', 'key', 'odp']);

function FileIcon({ url, className }: { url: string; className?: string }) {
  const ext = fileExtension(url);
  const props = { className, 'aria-hidden': true as const };
  if (ext === 'pdf') return <FileText {...props} />;
  if (IMAGE.has(ext)) return <ImageIcon {...props} />;
  if (ARCHIVE.has(ext)) return <FileArchive {...props} />;
  if (SLIDES.has(ext)) return <Presentation {...props} />;
  return <File {...props} />;
}

export const fileTypeLabel = (type: FileType) => FILE_TYPES.find((t) => t.value === type)?.label ?? type;

/** One file: icon, label, type and extension, with Open (PDF) / Download actions. */
export function FileRow({
  label,
  type,
  url,
  meta,
  className,
}: {
  label: string;
  type: FileType;
  url: string;
  meta?: ReactNode;
  className?: string;
}) {
  const ext = fileExtension(url);
  const preview = canPreview(url);
  return (
    <div className={cx('flex items-center gap-3 py-2.5', className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-surface-2 text-muted">
        <FileIcon url={url} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{label}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <Tag>{fileTypeLabel(type)}</Tag>
          {ext && <span className="font-mono uppercase">{ext}</span>}
          {meta}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {preview && (
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary-tint"
          >
            <Eye className="size-3.5" aria-hidden="true" />
            Open<span className="sr-only"> {label}</span>
          </a>
        )}
        <a
          href={url}
          download
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-text"
        >
          <Download className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Download</span>
          <span className="sr-only"> {label}</span>
        </a>
      </div>
    </div>
  );
}
