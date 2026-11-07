export default {
  layout: "post.njk",
  eleventyComputed: {    permalink: (data) => {
      const blog = data.blog || 'essencia';
      const date = data.page.date instanceof Date ? data.page.date : new Date(data.page.date);
      // Los artículos migrados desde blog/*.html conservan su índice histórico
      // para no romper las URLs antiguas.
      const idx = data.legacyIndex
        || ((data.blogIndex && typeof data.blogIndex.getIndex === 'function')
          ? data.blogIndex.getIndex(blog, date.getFullYear(), date.getMonth() + 1, data.page.inputPath)
          : 1);
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      return `/blog/${blog}/posts/${blog}-${mm}-${date.getFullYear()}-${idx}.html`;
    },
  },
};