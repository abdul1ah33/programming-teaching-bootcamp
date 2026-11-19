'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { fileTypeLabel, FileRow } from '@/components/ui/file-row';
import { ChipFilter, SelectFilter } from '@/components/ui/filter';
import { EmptyState } from '@/components/ui/primitives';
import { formatDate } from '@/lib/derive/dates';
import type { Resource } from '@/lib/derive/resources';
import { FILE_TYPES } from '@/lib/model/enums';
import { useQueryState } from './use-query-state';

/** Inline PDF preview, loaded only when asked for (PDFs can be large). */
function PdfPreview({ url, label }: { url: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pb-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary-tint"
      >
        {open ? <EyeOff className="size-3.5" aria-hidden="true" /> : <Eye className="size-3.5" aria-hidden="true" />}
        {open ? 'Hide preview' : 'Preview here'}
        <span className="sr-only"> of {label}</span>
      </button>
      {open && (
        <iframe
          src={`${url}#view=FitH`}
          title={`Preview of ${label}`}
          loading="lazy"
          className="mt-2 h-[70vh] max-h-[720px] w-full rounded-md border border-border bg-surface-2"
        />
      )}
    </div>
  );
}

type ListProps = { resources: Resource[]; sprints: { slug: string; label: string }[] };

/** Filters live in the URL (?sprint=…&type=…). */
export function ResourceList(props: ListProps) {
  const [sprint, setSprint] = useQueryState('sprint');
  const [type, setType] = useQueryState('type');
  return <ResourceListView {...props} sprint={sprint} type={type} setSprint={setSprint} setType={setType} />;
}

/** Shown before JavaScript has read the URL (and in the static HTML): everything, unfiltered. */
export function ResourceListFallback(props: ListProps) {
  const [sprint, setSprint] = useState('all');
  const [type, setType] = useState('all');
  return <ResourceListView {...props} sprint={sprint} type={type} setSprint={setSprint} setType={setType} />;
}

function ResourceListView({
  resources,
  sprints,
  sprint,
  type,
  setSprint,
  setType,
}: ListProps & { sprint: string; type: string; setSprint: (v: string) => void; setType: (v: string) => void }) {

  const bySprint = resources.filter((r) => sprint === 'all' || r.sprint?.slug === sprint);
  const shown = bySprint.filter((r) => type === 'all' || r.type === type);
  const usedTypes = FILE_TYPES.filter((t) => resources.some((r) => r.type === t.value));
  const usedSprints = sprints.filter((s) => resources.some((r) => r.sprint?.slug === s.slug));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-end sm:justify-between">
        <SelectFilter
          id="resource-sprint"
          label="Sprint"
          value={sprint}
          onChange={setSprint}
          options={[{ value: 'all', label: 'All sprints' }, ...usedSprints.map((s) => ({ value: s.slug, label: s.label }))]}
        />
        <ChipFilter
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: 'All', count: bySprint.length },
            ...usedTypes.map((t) => ({ value: t.value, label: t.label, count: bySprint.filter((r) => r.type === t.value).length })),
          ]}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {shown.length} files shown
      </p>
      {shown.length > 0 ? (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface px-4">
          {shown.map((r) => (
            <li key={r.key}>
              <FileRow
                label={r.label}
                type={r.type}
                url={r.url}
                size={r.size}
                meta={
                  r.session ? (
                    <Link href={`/sessions/${r.session.slug}`} className="hover:text-text hover:underline">
                      Session {r.session.number} · {formatDate(r.session.date)}
                    </Link>
                  ) : r.sprint ? (
                    <Link href={`/sprints/${r.sprint.slug}`} className="hover:text-text hover:underline">
                      Sprint {r.sprint.number}
                    </Link>
                  ) : null
                }
              />
              {r.extension === 'pdf' && <PdfPreview url={r.url} label={r.label} />}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={resources.length ? 'No files match these filters' : 'No files yet'}>
          {resources.length ? (
            <button type="button" className="font-medium text-primary underline underline-offset-2" onClick={() => { setSprint('all'); setType('all'); }}>
              Show all files
            </button>
          ) : (
            'Slides, notes, exercises and solutions will appear here after each session.'
          )}
        </EmptyState>
      )}
      <p className="mt-4 text-xs text-muted">
        Types: {FILE_TYPES.map((t) => fileTypeLabel(t.value)).join(', ')}. PDFs open in the browser; other files download.
      </p>
    </div>
  );
}
