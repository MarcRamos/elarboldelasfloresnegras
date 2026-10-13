import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'blog-data-source.js');

function parseBlogData() {
  try {
    const content = fs.readFileSync(dataFile, 'utf8');
    const result = { disco: [], essencia: [] };
    const discoMatch = content.match(/var\s+articulosDisco\s*=\s*(\[[^\]]*\])/s);
    const essMatch = content.match(/var\s+articulosEssencia\s*=\s*(\[[^\]]*\])/s);
    if (discoMatch) {
      result.disco = JSON.parse(discoMatch[1]);
    }
    if (essMatch) {
      result.essencia = JSON.parse(essMatch[1]);
    }
    return result;
  } catch (e) {
    return { disco: [], essencia: [] };
  }
}

const data = parseBlogData();

export default {
  disco: data.disco,
  essencia: data.essencia
};
