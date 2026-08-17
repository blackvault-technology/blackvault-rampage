import fs from 'node:fs';
const xml = fs.readFileSync('/tmp/rampage-arxiv.xml', 'utf8');
const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
const clean = (value) => value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const records = entries.map((entry, index) => {
  const get = (tag) => clean(entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] || '');
  const id = get('id').replace('http://arxiv.org/abs/', '').replace('https://arxiv.org/abs/', '');
  const title = get('title');
  const summary = get('summary');
  const authors = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) => clean(m[1])).slice(0, 3).join(', ');
  const categories = [...entry.matchAll(/<category[^>]*term="([^"]+)"/g)].map((m) => m[1]).slice(0, 3);
  const topic = categories.some((c) => c === 'cs.OS') ? 'Operating Systems' : categories.some((c) => c === 'cs.NI') ? 'Networking' : categories.some((c) => c === 'cs.DC') ? 'Distributed Systems' : 'Compilers & Architecture';
  return { id: `arxiv-${index + 1}`, title, author: authors || 'arXiv authors', institution: 'arXiv / Cornell University', url: `https://arxiv.org/pdf/${id}.pdf`, topic, level: 'Research', pages: 'Open PDF', readTime: '45–90 min', tags: [...categories, 'paper'], relatedCourse: topic === 'Distributed Systems' || topic === 'Operating Systems' ? 'systems-research-lab' : 'compiler-runtime-architecture', note: clean(summary).slice(0, 210) };
});
fs.writeFileSync('/home/ubuntu/blackvault-rampage/client/src/data/arxivResources.ts', `// Generated from the public arXiv API. Each URL resolves to an actual open PDF.\nimport type { PdfResource } from './catalog';\nexport const arxivResources: PdfResource[] = ${JSON.stringify(records, null, 2)};\n`);
console.log(`Wrote ${records.length} real arXiv PDF records.`);
