import MarkdownIt from 'markdown-it';
import { fetchPosts, fetchPostContent, fetchCommitAuthor } from './api.js';
import { parseFrontmatter, generateTitle, formatDate, formatDateShort, getExcerpt, getReadingTime, extractTags, groupByYear, groupByCategory, extractAllTags } from './utils.js';
import { showPage } from './navigation.js';
import { CONFIG } from './config.js';

const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: true });
let allPosts = [];
let parsedPosts = [];

export async function initRenderer() {
  await loadPosts();
}

async function loadPosts() {
  try {
    allPosts = await fetchPosts();
    parsedPosts = await Promise.all(
      allPosts.map(async (file, index) => {
        const content = await fetchPostContent(file);
        const { frontmatter, content: markdownContent } = parseFrontmatter(content);
        const commitAuthor = await fetchCommitAuthor(file.name);
        const author = frontmatter.author || commitAuthor?.name || CONFIG.blog.author;
        return {
          index, file, frontmatter, content: markdownContent,
          title: frontmatter.title || generateTitle(file.name),
          date: frontmatter.date || file.commit?.committer?.date,
          tags: frontmatter.tags || extractTags(markdownContent),
          category: frontmatter.category || '未分类',
          readingTime: getReadingTime(markdownContent),
          excerpt: frontmatter.excerpt || getExcerpt(markdownContent),
          author,
          commitAuthor,
        };
      })
    );
    renderPostList();
    renderSidebar();
    updateStats();
  } catch (error) {
    console.error('Failed to load posts:', error);
    renderError(error.message);
  }
}

function renderPostList() {
  const container = document.getElementById('postsList');
  if (!container) return;
  if (parsedPosts.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3 class="empty-state__title">暂无文章</h3><p class="empty-state__description">请在 GitHub 仓库的 ' + CONFIG.github.postsDir + ' 目录下上传 Markdown 文件</p></div>';
    return;
  }
  container.innerHTML = parsedPosts.slice(0, CONFIG.pagination.postsPerPage).map(post => {
    const tagsHtml = post.tags.slice(0, 3).map(tag => '<span class="tag">' + tag + '</span>').join('');
    return '<article class="post-item" onclick="window.showPost(' + post.index + ')">' +
      '<div class="post-item__meta"><span class="cat">' + post.category + '</span><span>·</span><span>' + (post.date ? formatDate(post.date) : '未知日期') + '</span><span>·</span><span>' + post.author + '</span></div>' +
      '<h3 class="post-item__title">' + post.title + '</h3>' +
      '<p class="post-item__excerpt">' + post.excerpt + '</p>' +
      '<div class="post-item__foot">' + tagsHtml + '<span>' + post.readingTime + ' 分钟阅读</span></div>' +
      '</article>';
  }).join('');
  container.classList.add('stagger');
}

function renderSidebar() {
  renderTagCloud();
  renderCategoryList();
}

function renderTagCloud() {
  const container = document.getElementById('tagCloud');
  if (!container) return;
  const tags = extractAllTags(parsedPosts);
  if (tags.length === 0) { container.innerHTML = '<span class="widget__loading">暂无标签</span>'; return; }
  container.innerHTML = tags.slice(0, 15).map(t => '<span class="tag" title="' + t.count + ' 篇文章">' + t.tag + '</span>').join('');
}

function renderCategoryList() {
  const container = document.getElementById('categoryList');
  if (!container) return;
  const categories = groupByCategory(parsedPosts);
  container.innerHTML = Object.entries(categories).sort((a, b) => b[1].length - a[1].length).map(([cat, posts]) =>
    '<li><a href="#categories" onclick="window.showPage(\'categories\'); return false;"><span>' + cat + '</span><span class="count">' + posts.length + '</span></a></li>'
  ).join('');
}

function updateStats() {
  const s1 = document.getElementById('statPosts');
  const s2 = document.getElementById('statCategories');
  const s3 = document.getElementById('statTags');
  if (s1) s1.textContent = parsedPosts.length;
  if (s2) s2.textContent = Object.keys(groupByCategory(parsedPosts)).length;
  if (s3) s3.textContent = extractAllTags(parsedPosts).length;
}

function renderError(message) {
  const c = document.getElementById('postsList');
  if (c) c.innerHTML = '<div class="error-state"><p>加载失败: ' + message + '</p><p>请检查配置是否正确，以及仓库是否为公开仓库</p></div>';
}

export function renderArchives() {
  const container = document.getElementById('archivesList');
  if (!container) return;
  const grouped = groupByYear(parsedPosts);
  const years = Object.keys(grouped).sort((a, b) => b - a);
  container.innerHTML = years.map(year =>
    '<div class="archive-year"><h3 class="archive-year__label">' + year + '</h3>' +
    grouped[year].map(post =>
      '<div class="archive-row" onclick="window.showPost(' + post.index + ')"><span class="archive-row__date">' + (post.date ? formatDateShort(post.date) : '') + '</span><span class="archive-row__title">' + post.title + '</span></div>'
    ).join('') + '</div>'
  ).join('');
}

export function renderCategories() {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  const categories = groupByCategory(parsedPosts);
  container.innerHTML = Object.entries(categories).sort((a, b) => b[1].length - a[1].length).map(([cat, posts]) =>
    '<div class="category-card" onclick="window.showPage(\'home\'); return false;"><h3 class="category-card__name">' + cat + '</h3><span class="category-card__count">' + posts.length + ' 篇</span></div>'
  ).join('');
}

window.showPost = async function(index) {
  const post = parsedPosts[index];
  if (!post) return;
  showPage('post');
  document.getElementById('postTitle').textContent = post.title;
  const ds = document.getElementById('postDate');
  if (ds) ds.textContent = post.date ? formatDate(post.date) : '未知日期';
  const as = document.getElementById('postAuthor');
  if (as) as.textContent = post.author;
  const rs = document.getElementById('postReading');
  if (rs) rs.textContent = post.readingTime + ' 分钟阅读';
  const tc = document.getElementById('postTags');
  if (tc) tc.innerHTML = post.tags.map(tag => '<span class="tag">' + tag + '</span>').join('');
  const pc = document.getElementById('postContent');
  if (pc) pc.innerHTML = md.render(post.content);
  const prev = document.getElementById('prevPost');
  const next = document.getElementById('nextPost');
  if (prev) {
    if (index > 0) {
      prev.style.display = 'flex';
      prev.querySelector('.article__nav-title').textContent = parsedPosts[index - 1].title;
      prev.onclick = function(e) { e.preventDefault(); window.showPost(index - 1); };
    } else { prev.style.display = 'none'; }
  }
  if (next) {
    if (index < parsedPosts.length - 1) {
      next.style.display = 'flex';
      next.querySelector('.article__nav-title').textContent = parsedPosts[index + 1].title;
      next.onclick = function(e) { e.preventDefault(); window.showPost(index + 1); };
    } else { next.style.display = 'none'; }
  }
  document.title = post.title + ' | ' + CONFIG.blog.title;
};

export function searchPosts(query) {
  if (!query) return parsedPosts;
  const q = query.toLowerCase();
  return parsedPosts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.excerpt.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
}
