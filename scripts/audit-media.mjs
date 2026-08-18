import fs from 'node:fs';
import data from '../client/src/data/curriculum.json' with { type: 'json' };

const courses = data.courses ?? data;
const rows = [];
const hostCounts = new Map();
const kindCounts = new Map();
const add = (url, kind, courseId, lessonId) => {
  if (!url) return;
  let host = 'invalid';
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}
  hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
  kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1);
  rows.push({ courseId, lessonId, kind, url, host });
};
for (const course of courses) {
  for (const phase of course.phases ?? []) {
    for (const lesson of phase.lessons ?? []) {
      add(lesson.video, 'video', course.id, lesson.id);
      for (const resource of lesson.resources ?? []) add(resource.url, 'source', course.id, lesson.id);
      if (!lesson.video) rows.push({ courseId: course.id, lessonId: lesson.id, kind: 'missing-video' });
      if (!(lesson.resources?.length)) rows.push({ courseId: course.id, lessonId: lesson.id, kind: 'missing-source' });
    }
  }
}
const embeds = rows.filter((row) => row.kind === 'video').map((row) => ({ ...row, embedKind: row.url.includes('youtube.com/embed/') || row.url.includes('youtube-nocookie.com/embed/') ? 'youtube-embed' : row.url.match(/\.(mp4|webm|ogg)(\?|$)/i) ? 'native-file' : row.url.includes('pyodide.org') ? 'pyodide' : 'other' }));
console.log(JSON.stringify({ lessons: rows.filter((r) => r.kind === 'video' || r.kind === 'missing-video').length, videos: embeds.length, missingVideos: rows.filter((r) => r.kind === 'missing-video'), missingSources: rows.filter((r) => r.kind === 'missing-source'), kindCounts: Object.fromEntries(kindCounts), hostCounts: Object.fromEntries(hostCounts), embeds }, null, 2));
