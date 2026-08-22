// ========== GitHub API Module ==========
import { CONFIG } from './config.js';

const { owner, repo, branch } = CONFIG.github;
const CACHE_KEY = 'blog_posts_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCache(key, data) {
  localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
}

/**
 * Fetch posts list - API first, static fallback
 */
export async function fetchPosts() {
  const cached = getCached(CACHE_KEY);
  if (cached) return cached;

  // Try GitHub API
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/posts?ref=${branch}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const mdFiles = data
        .filter(file => file.name.endsWith('.md'))
        .sort((a, b) => {
          const dateA = a.commit?.committer?.date || 0;
          const dateB = b.commit?.committer?.date || 0;
          return new Date(dateB) - new Date(dateA);
        });
      setCache(CACHE_KEY, mdFiles);
      return mdFiles;
    }
  } catch {}

  // Fallback to static posts.json
  try {
    const response = await fetch('./posts.json');
    if (response.ok) {
      const data = await response.json();
      setCache(CACHE_KEY, data);
      return data;
    }
  } catch {}

  throw new Error('Failed to fetch posts');
}

/**
 * Fetch single post content
 */
export async function fetchPostContent(file) {
  const tryUrls = [
    file.download_url,
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`
  ];
  
  for (const url of tryUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.text();
    } catch {}
  }
  throw new Error('Failed to fetch post content');
}

/**
 * Fetch commit author for a file
 */
export async function fetchCommitAuthor(filename) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=posts/${filename}&per_page=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.length > 0) {
      return {
        name: data[0].commit.author.name,
        date: data[0].commit.author.date,
        avatar: data[0].author?.avatar_url || null,
      };
    }
  } catch {}
  return null;
}

export async function fetchMultiplePostsContent(files) {
  return Promise.all(files.map(file => fetchPostContent(file)));
}
