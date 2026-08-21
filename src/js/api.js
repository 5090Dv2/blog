// ========== GitHub API Module ==========
import { CONFIG } from './config.js';

const { owner, repo, branch, postsDir } = CONFIG.github;
const CACHE_KEY = 'blog_posts_cache';
const CACHE_TTL = 10 * 60 * 1000;

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
 * Fetch posts list from GitHub
 */
export async function fetchPosts() {
  const cached = getCached(CACHE_KEY);
  if (cached) return cached;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${postsDir}?ref=${branch}`;
  
  try {
    const response = await fetch(url);
    
    if (response.status === 403) {
      const cached2 = getCached(CACHE_KEY + '_fallback');
      if (cached2) return cached2;
      throw new Error('GitHub API rate limit exceeded. Try again later.');
    }
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const mdFiles = data
      .filter(file => file.name.endsWith('.md'))
      .sort((a, b) => {
        const dateA = a.commit?.committer?.date || 0;
        const dateB = b.commit?.committer?.date || 0;
        return new Date(dateB) - new Date(dateA);
      });
    
    setCache(CACHE_KEY, mdFiles);
    setCache(CACHE_KEY + '_fallback', mdFiles);
    return mdFiles;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
}

/**
 * Fetch single post content
 */
export async function fetchPostContent(file) {
  try {
    const response = await fetch(file.download_url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch file content');
    }
    
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch post content:', error);
    throw error;
  }
}

/**
 * Fetch commit author for a file
 */
export async function fetchCommitAuthor(filename) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=${postsDir}/${filename}&per_page=1`;
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
    return null;
  } catch (error) {
    console.error('Failed to fetch commit author:', error);
    return null;
  }
}

/**
 * Fetch multiple posts content
 */
export async function fetchMultiplePostsContent(files) {
  return Promise.all(files.map(file => fetchPostContent(file)));
}
