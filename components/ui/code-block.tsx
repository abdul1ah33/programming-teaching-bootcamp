import { highlight } from '@/lib/highlight';
import type { Language } from '@/lib/model/enums';
import { CopyButton } from './copy-button';
import { cx } from './primitives';

/** Highlighted code (at build time) with a language label and a copy button. */
export async function CodeBlock({
  code,
  language,
  className,
  compact = false,
  showLanguage = true,
}: {
  code: string;
  language: Language;
  className?: string;
  compact?: boolean;
  showLanguage?: boolean;
}) {
  const html = await highlight(code, language);
  return (
    <div className={cx('code-block group relative rounded-md border border-border bg-surface-2', className)}>
      <div className="absolute right-2 top-2 flex items-center gap-2">
        {showLanguage && (
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted">
            {language === 'c' ? 'C' : 'Python'}
          </span>
        )}
        <CopyButton text={code} />
      </div>
      <div
        className={cx('overflow-x-auto font-mono text-[0.82rem] leading-[1.6]', compact ? 'px-3 py-2.5 pr-28' : 'px-4 py-3.5 pr-28')}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
