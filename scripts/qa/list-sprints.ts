import { getSprints } from '@/lib/content';

for (const s of await getSprints()) {
  console.log(`${s.number} | ${s.missions.length} missions | ${s.topics.length} topics | ${s.readyChecks.length} checks | ${s.duration} | ${s.phase} | ${s.title}`);
}
