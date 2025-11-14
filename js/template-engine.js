/**
 * Simple Template Engine for BerozgaarCoder
 * Loads templates and renders them with data
 */

class TemplateEngine {
    constructor() {
        this.templates = {};
        this.cache = new Map();
    }

    /**
     * Load a template from a URL
     */
    async loadTemplate(name, url) {
        if (this.templates[name]) {
            return this.templates[name];
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${url}`);
            }
            const template = await response.text();
            this.templates[name] = template;
            return template;
        } catch (error) {
            console.error(`Error loading template ${name}:`, error);
            return null;
        }
    }

    /**
     * Render a template with data
     */
    render(template, data) {
        let result = template;

        // Replace all {{variable}} placeholders
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            result = result.replace(regex, data[key] || '');
        });

        return result;
    }

    /**
     * Load all common templates
     */
    async loadCommonTemplates() {
        await Promise.all([
            this.loadTemplate('header', '/templates/header.html'),
            this.loadTemplate('footer', '/templates/footer.html'),
            this.loadTemplate('blog-post', '/templates/blog-post.html')
        ]);
    }

    /**
     * Inject header and footer into page
     */
    async injectLayout() {
        const headerEl = document.getElementById('site-header');
        const footerEl = document.getElementById('site-footer');

        if (headerEl && this.templates.header) {
            headerEl.outerHTML = this.templates.header;
        }

        if (footerEl && this.templates.footer) {
            footerEl.outerHTML = this.templates.footer;
            // Update current year
            const yearEl = document.querySelector('.current-year');
            if (yearEl) {
                yearEl.textContent = new Date().getFullYear();
            }
        }

        // Update active navigation
        this.updateActiveNav();
    }

    /**
     * Update active navigation based on current page
     */
    updateActiveNav() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.main-nav a');

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href');

            if (currentPath === linkPath ||
                (linkPath === '/posts/' && currentPath.includes('/posts/'))) {
                link.classList.add('active');
            }
        });
    }
}

// Global template engine instance
window.templateEngine = new TemplateEngine();
