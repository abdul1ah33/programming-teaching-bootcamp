import Image from 'next/image';
import type { Project } from '@/lib/model/types';
import { cx } from '@/components/ui/primitives';

/** The project's screenshot, or a quiet typographic placeholder (no stock art). */
export function ProjectVisual({ project, sprintNumber, className, priority }: { project: Project; sprintNumber?: number; className?: string; priority?: boolean }) {
  return (
    <div className={cx('relative aspect-[16/10] overflow-hidden rounded-md border border-border bg-surface-2', className)}>
      {project.screenshot ? (
        <Image
          src={project.screenshot}
          alt={`Screenshot of ${project.title}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-top"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between p-4 font-mono text-xs text-muted">
          <span>{sprintNumber !== undefined ? `sprint_${sprintNumber}/` : 'project/'}</span>
          <span className="text-[0.95rem] leading-relaxed text-text/70">
            <span className="text-primary">&gt;_</span> {project.title.replace(/^EXAMPLE — /, '').toLowerCase().replace(/\s+/g, '_')}
            <span className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[2px] bg-primary/60" />
          </span>
        </div>
      )}
    </div>
  );
}
