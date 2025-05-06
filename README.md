# BerozgaarCoder Blog

A modern, SEO-friendly personal blog powered by GitHub Pages with custom domain setup. The blog features a clean, responsive design with easy content management.

**Website**: [berozgaarcoder.com](https://berozgaarcoder.com)

**Tagline**: Code Ka Jugaad

## Repository Structure

```
berozgaarcoder/
├── index.html              # Home page
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   └── main.js             # JavaScript functionality
├── images/                 # Image directory
├── posts/                  # Blog post HTML files
│   ├── post-template.html  # Template for new posts
│   └── first-post.html     # Example first post
├── _layouts/               # Layout templates 
│   ├── default.html        # Main layout template
│   └── post.html           # Post layout template
├── _includes/              # Reusable components
│   ├── header.html         # Header component
│   ├── footer.html         # Footer component
│   └── meta.html           # SEO metadata
├── CNAME                   # Custom domain config
├── sitemap.xml             # XML sitemap for SEO
├── robots.txt              # Instructions for web crawlers
└── README.md               # Repository documentation
```

## Features

- Modern, responsive design with clean typography
- SEO-friendly with proper metadata, schema markup, and sitemap
- Easy content management with simple HTML templates
- Mobile-first approach with responsive layouts
- Dark mode support
- Syntax highlighting for code examples
- Reading time estimation for blog posts
- Social sharing capabilities
- Newsletter subscription form
- Comment system integration ready

## Adding a New Blog Post

1. Duplicate `posts/post-template.html` and rename it with your post slug (e.g., `my-new-post.html`)
2. Edit the metadata in the `<head>` section:
   - Update `<title>`, `<meta name="description">`, and OpenGraph/Twitter tags
   - Set the correct `<meta property="article:published_time">` value
3. Replace the content in the `<article>` section with your blog post content
4. Add the post to the homepage by updating the post card in `index.html`
5. Update `sitemap.xml` with the new post URL

## Customization

### Changing Colors and Fonts

The color scheme and typography can be customized in the `css/style.css` file. Look for the `:root` CSS variables at the top:

```css
:root {
  /* Color Palette */
  --primary: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --secondary: #f97316;
  /* ... other variables ... */
  
  /* Typography */
  --font-sans: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Fira Code', monospace;
}
```

### Adding Custom JavaScript Functionality

Add your custom JavaScript to the `js/main.js` file. The file is structured with named functions for different features.

## GitHub Pages Setup Instructions

### 1. Create a new GitHub repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository: `yourusername.github.io` (replace `yourusername` with your GitHub username)
4. Make the repository public
5. Click "Create repository"

### 2. Upload your files

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/yourusername.github.io.git
   ```
2. Copy all the files from this template to the cloned repository folder
3. Commit and push the files:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" branch and click "Save"
5. Your site will be published at `https://yourusername.github.io`

### 4. Set up custom domain (berozgaarcoder.com)

1. Purchase your domain (berozgaarcoder.com) from a domain registrar like Namecheap, GoDaddy, or Google Domains
2. In your GitHub repository, make sure the `CNAME` file exists with your domain name:
   ```
   berozgaarcoder.com
   ```
3. Configure DNS settings at your domain registrar:

   **Option 1: Apex domain (berozgaarcoder.com)**
   
   Add these A records pointing to GitHub's IP addresses:
   - A record: @ → 185.199.108.153
   - A record: @ → 185.199.109.153
   - A record: @ → 185.199.110.153
   - A record: @ → 185.199.111.153
   
   **Option 2: With www subdomain**
   
   Add a CNAME record:
   - CNAME record: www → yourusername.github.io
   
4. Go back to your repository settings on GitHub
5. In the "GitHub Pages" section, under "Custom domain", enter your domain name:
   ```
   berozgaarcoder.com
   ```
6. Check the "Enforce HTTPS" option (may need to wait up to 24 hours to be available)

### 5. Wait for DNS propagation

DNS changes can take up to 24-48 hours to propagate globally. Once propagation is complete, your site should be accessible at your custom domain.

## Maintenance and Updates

1. To update your blog, simply edit files in your local repository, commit, and push changes
2. GitHub will automatically rebuild and deploy your site
3. Keep your sitemap.xml updated with new posts for better SEO

## SEO Best Practices

This template includes:
- Semantic HTML structure
- Proper meta tags and Open Graph data
- Schema.org markup for rich search results
- XML sitemap and robots.txt
- Optimized page load speed
- Mobile-friendly responsive design

Remember to:
- Use descriptive, keyword-rich titles and meta descriptions
- Include relevant keywords in headings and content
- Add alt text to all images
- Update your sitemap when adding new content

## License

This project is open source and available under the [MIT License](LICENSE).

## Questions?

If you have any questions about setting up or customizing this blog template, feel free to open an issue in this repository.

---

Happy blogging! 📝✨