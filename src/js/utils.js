// ========== Utility Functions ==========

/**
 * Parse frontmatter from markdown content
 */
export function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);
  
  if (match) {
    const frontmatter = {};
    const lines = match[1].split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        const value = valueParts.join(':').trim();
        if (key.trim() === 'tags') {
          frontmatter[key.trim()] = value.split(',').map(t => t.trim());
        } else {
          frontmatter[key.trim()] = value;
        }
      }
    });
    
    return { frontmatter, content: content.slice(match[0].length) };
  }
  
  return { frontmatter: {}, content };
}

/**
 * Generate title from filename
 */
export function generateTitle(filename) {
  return filename
    .replace('.md', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format date to Chinese format
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date to short format
 */
export function formatDateShort(dateString) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * Get year from date string
 */
export function getYear(dateString) {
  return new Date(dateString).getFullYear();
}

/**
 * Get excerpt from content
 */
export function getExcerpt(content, maxLength = 150) {
  const text = content
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_`~\[\]()!]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Calculate reading time
 */
export function getReadingTime(content) {
  const words = content.replace(/[#*`\-[\]()!]/g, '').length;
  const minutes = Math.ceil(words / 300);
  return minutes || 1;
}

/**
 * Extract tags from content
 */
export function extractTags(content) {
  const tagRegex = /#[\u4e00-\u9fa5a-zA-Z0-9]+/g;
  const matches = content.match(tagRegex) || [];
  return [...new Set(matches.map(tag => tag.slice(1)))];
}

/**
 * Group posts by year
 */
export function groupByYear(posts) {
  const grouped = {};
  
  posts.forEach(post => {
    const date = post.frontmatter?.date || post.file?.commit?.committer?.date;
    const year = date ? getYear(date) : '未知';
    
    if (!grouped[year]) {
      grouped[year] = [];
    }
    
    grouped[year].push(post);
  });
  
  return grouped;
}

/**
 * Group posts by category
 */
export function groupByCategory(posts) {
  const grouped = {};
  
  posts.forEach(post => {
    const category = post.frontmatter?.category || '未分类';
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(post);
  });
  
  return grouped;
}

/**
 * Extract all tags with count
 */
export function extractAllTags(posts) {
  const tagCount = {};
  
  posts.forEach(post => {
    const tags = post.frontmatter?.tags || [];
    tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
