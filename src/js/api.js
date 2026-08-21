// ========== GitHub API Module ==========
import { CONFIG } from './config.js';

const { owner, repo, branch } = CONFIG.github;

/**
 * Fetch posts list from static JSON (no API rate limit)
 */
export async function fetchPosts() {
  try {
    const response = await fetch('./posts.json');
    if (!response.ok) throw new Error('Failed to load posts.json');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to fetch file content');
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
    return null;
  } catch {
    return null;
  }
}

export async function fetchMultiplePostsContent(files) {
  return Promise.all(files.map(file => fetchPostContent(file)));
}
