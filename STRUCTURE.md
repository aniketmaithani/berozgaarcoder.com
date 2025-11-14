# BerozgaarCoder - Project Structure Documentation

## Overview

This website has been restructured to follow modern web development best practices with a clean, modular architecture. The new structure separates content (Markdown), presentation (CSS), and logic (JavaScript) for better maintainability and scalability.

## Directory Structure

```
berozgaarcoder.com/
├── content/
│   └── blog/                    # Markdown blog posts with frontmatter
│       ├── automating-invoices-with-python-and-ses.md
│       ├── finding-my-path-job-search-journey.md
│       ├── the-long-road-recovery-journey.md
│       └── one-month-down-job-search-progress-update.md
├── templates/
│   ├── header.html              # Reusable header template
│   ├── footer.html              # Reusable footer template
│   └── blog-post.html           # Blog post layout template
├── css/
│   └── style.css                # Single, well-organized stylesheet
├── js/
│   ├── template-engine.js       # Template loading and rendering
│   ├── blog-renderer.js         # Markdown blog post renderer
│   ├── main.js                  # Main JavaScript file
│   └── lib/                     # External libraries
│       └── marked.min.js        # Markdown parser (placeholder)
├── images/
│   └── blog/                    # Blog post images
├── posts/                       # Legacy HTML blog posts (for reference)
├── index.html                   # Homepage
├── about.html                   # About page
├── blog.html                    # Blog post renderer page
└── posts.json                   # Blog post metadata (auto-generated)
```

## Key Features

### 1. Markdown-Based Blog Posts

Blog posts are now written in Markdown with YAML frontmatter for metadata:

```markdown
---
title: "Your Blog Post Title"
description: "A brief description"
author: "Aniket Maithani"
date: "Month Day, Year"
datetime: "YYYY-MM-DDTHH:MM:SS+05:30"
category: "Category Name"
tags:
  - tag1
  - tag2
featuredImage: "image-keyword"
imageAlt: "Image description"
published: true
---

## Your Content Here

Write your blog post content in Markdown...
```

### 2. Reusable Template System

Templates are HTML fragments that can be loaded and reused across pages:

- **Header**: `templates/header.html` - Site navigation and branding
- **Footer**: `templates/footer.html` - Footer links and copyright
- **Blog Post**: `templates/blog-post.html` - Blog post layout structure

### 3. Automatic Image Integration

The system automatically fetches relevant images from Unsplash based on the `featuredImage` keyword in the frontmatter. No manual image sourcing required!

### 4. Single CSS File

All styles are consolidated in `css/style.css` with clear organization:

- CSS Variables (colors, fonts, spacing)
- Reset & Base Styles
- Layout Components
- Typography
- Buttons
- Header & Navigation
- Blog Post Styles (enhanced for aesthetics)
- Footer
- Responsive Design
- Dark Mode Support
- Animations
- Utility Classes

### 5. Clean, Aesthetic Blog Layout

The new blog layout features:

- **Hero Image** with gradient overlay
- **Elevated header card** that overlays the hero image
- **Large, readable typography** (1.125rem base font size)
- **Proper spacing** for comfortable reading
- **Syntax highlighting** for code blocks
- **Beautiful share buttons** with hover effects
- **Tag system** with pill-style tags
- **Reading time calculator**
- **Breadcrumb navigation**

## How to Use

### Creating a New Blog Post

1. Create a new Markdown file in `content/blog/`:
   ```bash
   touch content/blog/my-new-post.md
   ```

2. Add frontmatter and content:
   ```markdown
   ---
   title: "My Awesome Post"
   description: "This is an amazing post"
   author: "Aniket Maithani"
   date: "November 14, 2025"
   datetime: "2025-11-14T10:00:00+05:30"
   category: "Technology"
   tags:
     - javascript
     - webdev
   featuredImage: "coding-laptop"
   imageAlt: "Person coding on laptop"
   published: true
   ---

   ## Introduction

   Your content here...
   ```

3. Access the blog post at:
   ```
   https://berozgaarcoder.com/blog.html?post=my-new-post
   ```

### Customizing Templates

1. Edit the template files in `templates/`
2. The template engine will automatically load and inject them
3. Use `{{variable}}` placeholders for dynamic content

### Updating Styles

All styles are in `css/style.css`. The file is organized with clear comments marking each section. Find the section you want to modify and make changes.

### Adding New Pages

1. Create a new HTML file
2. Include the template engine scripts:
   ```html
   <script src="/js/template-engine.js"></script>
   <script>
     templateEngine.loadCommonTemplates().then(() => {
       templateEngine.injectLayout();
     });
   </script>
   ```

## Technical Details

### Template Engine

The `TemplateEngine` class (`js/template-engine.js`) provides:

- `loadTemplate(name, url)` - Load a template from a URL
- `render(template, data)` - Replace `{{placeholders}}` with data
- `injectLayout()` - Inject header and footer into current page
- `updateActiveNav()` - Highlight current page in navigation

### Blog Renderer

The `BlogRenderer` class (`js/blog-renderer.js`) provides:

- `parseFrontmatter(markdown)` - Extract YAML frontmatter from Markdown
- `renderPost(slug)` - Load and render a blog post by slug
- `getImageUrl(imageName)` - Generate Unsplash image URL
- `calculateReadingTime(text)` - Estimate reading time
- `generateShareUrls(title, url)` - Create social sharing links

### URL Structure

- Homepage: `/`
- About: `/about.html`
- Blog Post: `/blog.html?post=slug-name`
- Blog Archive: `/posts/`

## Image System

### Unsplash Integration

Images are automatically fetched from Unsplash based on keywords. The system maps image names to search queries:

```javascript
const imageKeywords = {
  'invoice-automation': 'python code laptop automation',
  'anxiety-journey': 'peaceful meditation mindfulness calm',
  'recovery-journey': 'sunrise hope healing recovery',
  'progress-update': 'progress growth career success',
  'default': 'coding developer workspace'
};
```

### Custom Images

To use custom images instead of Unsplash:

1. Place images in `images/blog/`
2. Update the `getImageUrl()` method in `blog-renderer.js`:
   ```javascript
   return `/images/blog/${imageName}.jpg`;
   ```

## Performance Optimizations

- **Template Caching**: Templates are loaded once and cached
- **Lazy Loading**: Images use `loading="lazy"` attribute
- **Minimal Dependencies**: Only Marked.js for Markdown parsing
- **Clean CSS**: Single stylesheet, no preprocessor overhead
- **Static Site**: No server-side processing required

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox
- CSS Custom Properties (variables)

## Future Enhancements

Potential improvements to consider:

1. **Build System**: Add a static site generator to pre-render blog posts
2. **Search Functionality**: Implement blog post search
3. **Categories & Tags**: Create dedicated pages for categories and tags
4. **RSS Feed**: Generate RSS feed from posts
5. **Comments**: Integrate a comment system (Disqus, Giscus, etc.)
6. **Dark Mode Toggle**: Add user-controllable dark mode
7. **Table of Contents**: Auto-generate ToC for long posts
8. **Related Posts**: Show related posts at the end of each article

## Maintenance

### Adding New Features

1. Create new JavaScript modules in `js/`
2. Update `style.css` with new component styles
3. Document changes in this file

### Updating Content

1. Edit Markdown files in `content/blog/`
2. No build step required - changes are live immediately

### Deployment

This is a static site that can be deployed to:

- **GitHub Pages** (current)
- **Netlify**
- **Vercel**
- **AWS S3 + CloudFront**
- Any static hosting service

## Best Practices

1. **Write semantic HTML** - Use appropriate HTML5 elements
2. **Keep CSS organized** - Follow the existing structure in style.css
3. **Use meaningful names** - Clear, descriptive variable and function names
4. **Comment complex code** - Help future maintainers understand your logic
5. **Test responsively** - Ensure layouts work on mobile, tablet, and desktop
6. **Optimize images** - Compress images before adding to repository
7. **Validate frontmatter** - Ensure all required fields are present in blog posts

## Troubleshooting

### Blog post not loading

- Check that the Markdown file exists in `content/blog/`
- Verify the slug in the URL matches the filename
- Open browser console to see any JavaScript errors

### Images not displaying

- Verify the `featuredImage` value in frontmatter
- Check browser console for CORS errors
- Ensure Unsplash is accessible

### Styles not applying

- Clear browser cache
- Check that `style.css` is loading (Network tab in DevTools)
- Verify CSS selectors match the HTML structure

## Contributing

When making changes:

1. Test locally before committing
2. Follow the existing code style
3. Update documentation if adding new features
4. Keep commits focused and descriptive

## License

All content and code © 2025 BerozgaarCoder. All rights reserved.

---

**Last Updated**: November 14, 2025
**Maintained by**: Aniket Maithani
**Contact**: [LinkedIn](https://linkedin.com/in/aniketmaithani) | [Twitter](https://twitter.com/2aniketmaithani)
