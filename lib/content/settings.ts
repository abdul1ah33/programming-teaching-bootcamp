import type { Settings } from '@/lib/model/types';
import { memo, orNull, reader } from './reader';

export const getSettings = memo(async (): Promise<Settings> => {
  const s = await reader.singletons.settings.readOrThrow();
  if (!s.startDate) throw new Error('settings.startDate is required');
  return {
    siteTitle: s.siteTitle,
    studentFirstName: s.studentFirstName,
    teacherName: s.teacherName,
    contactEmail: orNull(s.contactEmail),
    contactWhatsApp: orNull(s.contactWhatsApp),
    startDate: s.startDate,
    scheduleText: s.scheduleText,
    learningPlanPdf: orNull(s.learningPlanPdf),
    pointsRules: s.pointsRules.map((r) => ({ key: r.key, label: r.label, points: r.points ?? 0 })),
  };
});
