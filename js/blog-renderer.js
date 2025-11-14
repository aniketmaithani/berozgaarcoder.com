/**
 * Blog Renderer for Markdown Posts
 * Loads markdown files, parses frontmatter, and renders blog posts
 */

class BlogRenderer {
    constructor() {
        this.unsplashAccessKey = 'YOUR_UNSPLASH_ACCESS_KEY'; // Will use fallback images
        this.imageCache = new Map();
    }

    /**
     * Parse frontmatter from markdown content
     */
    parseFrontmatter(markdown) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);

        if (!match) {
            return { frontmatter: {}, content: markdown };
        }

        const frontmatterText = match[1];
        const content = match[2];
        const frontmatter = {};

        // Parse YAML-like frontmatter
        frontmatterText.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > -1) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                // Handle arrays (tags)
                if (key === 'tags') {
                    frontmatter[key] = [];
                } else if (line.trim().startsWith('-')) {
                    const tag = line.trim().substring(1).trim();
                    if (frontmatter.tags) {
                        frontmatter.tags.push(tag);
                    }
                } else {
                    frontmatter[key] = value;
                }
            }
        });

        return { frontmatter, content };
    }

    /**
     * Get Unsplash image URL based on keyword
     */
    getImageUrl(imageName) {
        // Map of image names to Unsplash search queries
        const imageKeywords = {
            'invoice-automation': 'python code laptop automation',
            'anxiety-journey': 'peaceful meditation mindfulness calm',
            'recovery-journey': 'sunrise hope healing recovery',
            'progress-update': 'progress growth career success',
            'default': 'coding developer workspace'
        };

        const keyword = imageKeywords[imageName] || imageKeywords['default'];

        // For now, use Unsplash source API (no auth required)
        // Format: https://source.unsplash.com/1200x600/?keyword
        return `https://source.unsplash.com/1200x600/?${encodeURIComponent(keyword)}`;
    }

    /**
     * Calculate reading time
     */
    calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const wordCount = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    }

    /**
     * Generate share URLs
     */
    generateShareUrls(title, url) {
        const encodedTitle = encodeURIComponent(title);
        const encodedUrl = encodeURIComponent(url);

        return {
            twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        };
    }

    /**
     * Render blog post from markdown file
     */
    async renderPost(slug) {
        try {
            // Load markdown file
            const response = await fetch(`/content/blog/${slug}.md`);
            if (!response.ok) {
                throw new Error('Post not found');
            }

            const markdown = await response.text();
            const { frontmatter, content } = this.parseFrontmatter(markdown);

            // Get image URL
            const featuredImage = this.getImageUrl(frontmatter.featuredImage || 'default');

            // Parse markdown to HTML using marked
            const htmlContent = marked.parse(content);

            // Calculate reading time
            const readingTime = this.calculateReadingTime(content);

            // Get current page URL
            const currentUrl = window.location.href;

            // Generate share URLs
            const shareUrls = this.generateShareUrls(frontmatter.title, currentUrl);

            // Inject content into page
            this.injectPostContent(frontmatter, htmlContent, featuredImage, readingTime, shareUrls);

            // Update page metadata
            this.updatePageMetadata(frontmatter, featuredImage, currentUrl);

        } catch (error) {
            console.error('Error rendering post:', error);
            this.showError('Failed to load blog post');
        }
    }

    /**
     * Inject post content into the DOM
     */
    injectPostContent(frontmatter, htmlContent, featuredImage, readingTime, shareUrls) {
        // Update title
        const titleEl = document.querySelector('.post-title');
        if (titleEl) {
            titleEl.textContent = frontmatter.title;
        }

        // Update featured image
        const imageEl = document.querySelector('.post-featured-image');
        if (imageEl) {
            imageEl.src = featuredImage;
            imageEl.alt = frontmatter.imageAlt || frontmatter.title;
        }

        // Update meta information
        const dateEl = document.querySelector('.post-date');
        if (dateEl) {
            dateEl.textContent = frontmatter.date;
            dateEl.setAttribute('datetime', frontmatter.datetime);
        }

        const authorEl = document.querySelector('.post-author');
        if (authorEl) {
            authorEl.textContent = frontmatter.author || 'Aniket Maithani';
        }

        const readingTimeEl = document.querySelector('.reading-time-value');
        if (readingTimeEl) {
            readingTimeEl.textContent = readingTime;
        }

        // Inject markdown content
        const contentEl = document.getElementById('post-content');
        if (contentEl) {
            contentEl.innerHTML = htmlContent;
        }

        // Inject tags
        if (frontmatter.tags && frontmatter.tags.length > 0) {
            const tagsEl = document.getElementById('post-tags');
            if (tagsEl) {
                const tagsHTML = `
                    <span>Tags:</span>
                    ${frontmatter.tags.map(tag => `<a href="/tag/${tag}" class="post-tag">#${tag}</a>`).join(' ')}
                `;
                tagsEl.innerHTML = tagsHTML;
            }
        }

        // Update share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            const platform = btn.dataset.platform;
            if (shareUrls[platform]) {
                btn.href = shareUrls[platform];
            }
        });
    }

    /**
     * Update page metadata (title, OG tags, etc.)
     */
    updatePageMetadata(frontmatter, featuredImage, currentUrl) {
        // Update page title
        document.title = `${frontmatter.title} | BerozgaarCoder`;

        // Update or create meta tags
        this.updateMetaTag('description', frontmatter.description);
        this.updateMetaTag('og:title', frontmatter.title, 'property');
        this.updateMetaTag('og:description', frontmatter.description, 'property');
        this.updateMetaTag('og:image', featuredImage, 'property');
        this.updateMetaTag('og:url', currentUrl, 'property');
        this.updateMetaTag('twitter:title', frontmatter.title);
        this.updateMetaTag('twitter:description', frontmatter.description);
        this.updateMetaTag('twitter:image', featuredImage);
    }

    /**
     * Update or create a meta tag
     */
    updateMetaTag(name, content, attr = 'name') {
        let element = document.querySelector(`meta[${attr}="${name}"]`);

        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attr, name);
            document.head.appendChild(element);
        }

        element.setAttribute('content', content);
    }

    /**
     * Show error message
     */
    showError(message) {
        const contentEl = document.getElementById('post-content');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="error-message">
                    <h2>Oops!</h2>
                    <p>${message}</p>
                    <p><a href="/posts/">← Back to all posts</a></p>
                </div>
            `;
        }
    }
}

// Global blog renderer instance
window.blogRenderer = new BlogRenderer();
