import { DateTime } from "luxon";

export default function(eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add(".git/**");
  eleventyConfig.ignores.add("_site/**");
  eleventyConfig.ignores.add(".opencode/**");
  eleventyConfig.ignores.add("package.json");
  eleventyConfig.ignores.add("package-lock.json");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("favicon_io");
  eleventyConfig.addPassthroughCopy("sw.js");
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("blog/**/*.html");
  eleventyConfig.ignores.add("templates/**");

  eleventyConfig.addCollection("articlePosts", (collectionsApi) => {
    try {
      return collectionsApi.getFilteredByGlob("articles/*.md").slice();
    } catch (e) {
      return [];
    }
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value, null, 4));

  eleventyConfig.addFilter("mergeBlogData", (existing, posts, blog) => {
    const generated = (posts || [])
      .filter((p) => {
        const b = p?.data?.blog;
        if (b) return b === blog;
        return false;
        // fallback to path
        return blog === 'essencia'
          ? (p.inputPath || '').includes('essencia')
          : (p.inputPath || '').includes('disco');
      })
      .map((p) => {
        const html =
          p.templateContent ||
          (typeof p.content === 'string' ? p.content : '') ||
          '';
        const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const lines = plain.split('. ').filter(Boolean);
        let resumen = 'Sin resumen';
        for (const line of lines) {
          const clean = line.trim();
          if (clean && clean.length > 10) {
            resumen = clean.length > 200 ? clean.slice(0, 200) + '...' : clean;
            break;
          }
        }
        const url = (p.url || '').replace(/^\/blog\/[^/]+\//, '');
        return {
          titulo: p.data.title,
          fecha: p.date instanceof Date ? p.date.toISOString().slice(0, 10) : String(p.data.date),
          url: url || (p.url || ''),
          categoria: p.data.category || 'General',
          resumen: resumen,
        };
      });

    const byTitle = new Map();
    for (const e of (existing || [])) {
      byTitle.set(e.titulo, e);
    }
    for (const g of generated) {
      byTitle.set(g.titulo, g);
    }
    const result = [...byTitle.values()].sort((a, b) =>
      String(b.fecha).localeCompare(String(a.fecha))
    );
    return result;
  });
  eleventyConfig.ignores.add("update_post.py");
  eleventyConfig.ignores.add("tools/**");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("AGENTS.md");
  // articles are processed, not ignored

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const dt = DateTime.fromJSDate(dateObj);
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${dt.day} de ${months[dt.month - 1]} de ${dt.year}`;
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISODate();
  });

  eleventyConfig.addFilter("blogBackLink", (blog) => {
    return `/blog/${blog}/`;
  });

  eleventyConfig.addTransform("articlePostProcess", (content, outputPath) => {
    if (outputPath && outputPath.endsWith(".html")) {
      content = content.replace(/(<div class="article-content">)([\s\S]*?)(<\/div>)/g, (match, open, inner, close) => {
        let t = inner;
        t = t.replace(/<h([1-6])>(.*?)<\/h\1>/gs, '<h$1 class="article-heading article-heading--$1">$2</h$1>');
        t = t.replace(/<blockquote>/g, '<blockquote class="article-blockquote">');
        t = t.replace(/<strong>/g, '<strong class="article-strong">');
        t = t.replace(/<em>/g, '<em class="article-em">');
        t = t.replace(/(<a\s)(?![^>]*class=)/g, '$1class="article-link" ');
        t = t.replace(/(<img\s)(?![^>]*class=)/g, '$1class="article-image" ');
        return open + t + close;
      });
    }
    return content;
  });

  return {
    dir: {
      input: ".",
      includes: "templates",
      layouts: "templates",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}