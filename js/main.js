/**
 * BerozgaarCoder - Main JavaScript file
 * Handles interactive elements and functionality
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  loadLatestPosts();
});

/**
 * Loads and displays the latest published posts on the homepage
 * Limits to 5 posts maximum
 */
function loadLatestPosts() {
  const postGrid = document.getElementById('latest-posts-container');
  
  if (!postGrid) return; // Exit if we're not on a page with posts
  
  // Use the correct path to the JSON file
  // Load posts from the local JSON file
  fetch('/posts.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load posts: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      // Filter only published posts and limit to 5
      const publishedPosts = data.posts
        .filter(post => post.published)
        .slice(0, 5);
      
      // Clear existing hardcoded post cards
      postGrid.innerHTML = '';
      
      // Add each post to the grid
      publishedPosts.forEach(post => {
        const postCard = createPostCard(post);
        postGrid.appendChild(postCard);
      });
    })
    .catch(error => {
      console.error('Error loading posts:', error);
      postGrid.innerHTML = '<p>Unable to load posts at this time.</p>';
    });
}

/**
 * Creates a post card element from post data
 * @param {Object} post - The post data
 * @return {HTMLElement} - The post card element
 */
function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'post-card';
  
  article.innerHTML = `
    <a href="${post.url}" class="post-link">
      <div class="post-image">
        <img src="${post.image}" alt="${post.title}">
      </div>
      <div class="post-content">
        <h3 class="post-title">${post.title}</h3>
        <time datetime="${post.datetime}">${post.date}</time>
        <p class="post-excerpt">${post.excerpt}</p>
        <span class="read-more">Read More →</span>
      </div>
    </a>
  `;
  
  return article;
}
