// ========== GitHub API Module ==========
import { CONFIG } from './config.js';

const { owner, repo, branch, postsDir } = CONFIG.github;

/**
 * Fetch posts list from GitHub
 */
export async function fetchPosts() {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${postsDir}?ref=${branch}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter markdown files and sort by date
    const mdFiles = data
      .filter(file => file.name.endsWith('.md'))
      .sort((a, b) => {
        const dateA = a.commit?.committer?.date || 0;
        const dateB = b.commit?.committer?.date || 0;
        return new Date(dateB) - new Date(dateA);
      });
    
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
 * Fetch multiple posts content
 */
export async function fetchMultiplePostsContent(files) {
  return Promise.all(files.map(file => fetchPostContent(file)));
}
