// ========== Blog Configuration ==========
export const CONFIG = {
  // GitHub Repository
  github: {
    owner: 'your-username',
    repo: 'your-blog-repo',
    branch: 'main',
    postsDir: 'posts',
  },

  // Blog Info
  blog: {
    title: '张三的技术博客',
    subtitle: '分享代码与思考',
    description: '一个专注于前端开发、技术分享的个人博客',
    author: '张三',
  },

  // Social Links
  social: {
    github: 'https://github.com/your-username',
    email: 'your-email@example.com',
    twitter: '',
    juejin: '',
    zhihu: '',
  },

  // Pagination
  pagination: {
    postsPerPage: 10,
  },

  // Search
  search: {
    enabled: true,
    placeholder: '搜索文章...',
  },
};

export default CONFIG;
