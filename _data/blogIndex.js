import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'blog-data-source.js');

function loadIndices() {
  try {
    const content = fs.readFileSync(dataFile, 'utf8');
    const result = { disco: {}, essencia: {} };
    const discoMatch = content.match(/var\s+articulosDisco\s*=\s*(\[[^\]]*\])/s);
    const essMatch = content.match(/var\s+articulosEssencia\s*=\s*(\[[^\]]*\])/s);
    if (discoMatch) {
      const arr = JSON.parse(discoMatch[1]);
      for (const a of arr) {
        const m = a.url.match(/disco-(\d{2})-(\d{4})-(\d+)\.html$/);
        if (m) {
          const key = `${m[2]}-${m[1]}`;
          const idx = parseInt(m[3]);
          if (!result.disco[key] || idx > result.disco[key]) {
            result.disco[key] = idx;
          }
        }
      }
    }
    if (essMatch) {
      const arr = JSON.parse(essMatch[1]);
      for (const a of arr) {
        const m = a.url.match(/essencia-(\d{2})-(\d{4})-(\d+)\.html$/);
        if (m) {
          const key = `${m[2]}-${m[1]}`;
          const idx = parseInt(m[3]);
          if (!result.essencia[key] || idx > result.essencia[key]) {
            result.essencia[key] = idx;
          }
        }
      }
    }
    return result;
  } catch (e) {
    return { disco: {}, essencia: {} };
  }
}

const baseIndices = loadIndices();
const assigned = { disco: {}, essencia: {} };

export default {
  indices: baseIndices,
  getIndex(blog, year, month, inputPath) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (!assigned[blog]) assigned[blog] = {};
    if (!assigned[blog][key]) assigned[blog][key] = { counter: baseIndices[blog]?.[key] || 0, files: new Map() };
    const state = assigned[blog][key];
    if (inputPath && state.files.has(inputPath)) {
      return state.files.get(inputPath);
    }
    const next = state.counter + 1;
    state.counter = next;
    if (inputPath) state.files.set(inputPath, next);
    return next;
  },
  getNext(blog, year, month) {
    return this.getIndex(blog, year, month, null);
  },
};
