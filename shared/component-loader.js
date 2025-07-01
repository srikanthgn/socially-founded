// 🔧 ATOMIC SERVICE: Component Loading Only
// File: shared/component-loader.js
// Purpose: Single-responsibility component loading
// Dependencies: None (standalone atomic service)

class ComponentLoaderService {
    constructor() {
        this.loadedComponents = new Map();
        this.loadingPromises = new Map();
        this.initialize();
    }

    // ONLY component loader initialization
    initialize() {
        console.log('🔧 Component Loader Service initialized');
    }

    // ONLY load HTML component
    async loadComponent(containerId, componentPath) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container not found: ${containerId}`);
            }

            console.log(`🔄 Loading component: ${componentPath} → #${containerId}`);

            // Prevent duplicate loading
            if (this.loadingPromises.has(componentPath)) {
                return await this.loadingPromises.get(componentPath);
            }

            // Create loading promise
            const loadingPromise = this.performComponentLoad(container, componentPath);
            this.loadingPromises.set(componentPath, loadingPromise);

            const result = await loadingPromise;
            
            // Clean up loading promise
            this.loadingPromises.delete(componentPath);
            
            return result;

        } catch (error) {
            console.error(`❌ Component loading failed: ${componentPath}`, error);
            this.showLoadingError(containerId, componentPath, error.message);
            throw error;
        }
    }

    // ONLY perform the actual loading
    async performComponentLoad(container, componentPath) {
        // Load HTML content
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        container.innerHTML = html;

        // Load corresponding JavaScript if it exists
        await this.loadComponentScript(componentPath);

        // Load corresponding CSS if it exists
        await this.loadComponentCSS(componentPath);

        // Mark as loaded
        this.loadedComponents.set(componentPath, {
            loadedAt: new Date(),
            container: container.id,
            status: 'loaded'
        });

        console.log(`✅ Component loaded successfully: ${componentPath}`);
        return { success: true, path: componentPath };
    }

    // ONLY load component JavaScript
    async loadComponentScript(componentPath) {
        const jsPath = componentPath.replace('.html', '.js');
        
        try {
            // Check if script already exists
            const existingScript = document.querySelector(`script[src="${jsPath}"]`);
            if (existingScript) {
                console.log(`⚡ Script already loaded: ${jsPath}`);
                return;
            }

            // Test if JavaScript file exists
            const response = await fetch(jsPath, { method: 'HEAD' });
            if (response.ok) {
                const script = document.createElement('script');
                script.src = jsPath;
                script.type = 'module';
                script.onload = () => {
                    console.log(`📜 Script loaded: ${jsPath}`);
                };
                script.onerror = () => {
                    console.warn(`⚠️ Script load failed: ${jsPath}`);
                };
                document.head.appendChild(script);
            }
        } catch (error) {
            // JavaScript file doesn't exist - that's okay
            console.log(`📜 No JavaScript file: ${jsPath}`);
        }
    }

    // ONLY load component CSS
    async loadComponentCSS(componentPath) {
        const cssPath = componentPath.replace('.html', '.css');
        
        try {
            // Check if CSS already exists
            const existingLink = document.querySelector(`link[href="${cssPath}"]`);
            if (existingLink) {
                console.log(`🎨 CSS already loaded: ${cssPath}`);
                return;
            }

            // Test if CSS file exists
            const response = await fetch(cssPath, { method: 'HEAD' });
            if (response.ok) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssPath;
                link.onload = () => {
                    console.log(`🎨 CSS loaded: ${cssPath}`);
                };
                link.onerror = () => {
                    console.warn(`⚠️ CSS load failed: ${cssPath}`);
                };
                document.head.appendChild(link);
            }
        } catch (error) {
            // CSS file doesn't exist - that's okay
            console.log(`🎨 No CSS file: ${cssPath}`);
        }
    }

    // ONLY show loading error
    showLoadingError(containerId, componentPath, errorMessage) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    padding: 1rem;
                    border-radius: 8px;
                    margin: 1rem 0;
                    font-family: 'Poppins', sans-serif;
                ">
                    <h4>❌ Component Load Failed</h4>
                    <p><strong>Component:</strong> ${componentPath}</p>
                    <p><strong>Error:</strong> ${errorMessage}</p>
                    <p><strong>Container:</strong> #${containerId}</p>
                </div>
            `;
        }
    }

    // ONLY load multiple components at once
    async loadComponents(componentMappings) {
        const loadingPromises = Object.entries(componentMappings).map(
            ([containerId, componentPath]) => this.loadComponent(containerId, componentPath)
        );

        try {
            const results = await Promise.allSettled(loadingPromises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            
            console.log(`🎯 Batch loading completed: ${successful} successful, ${failed} failed`);
            return results;
        } catch (error) {
            console.error('❌ Batch component loading failed:', error);
            throw error;
        }
    }

    // ONLY get loading status
    getLoadedComponents() {
        return Array.from(this.loadedComponents.entries()).map(([path, info]) => ({
            path,
            ...info
        }));
    }

    // ONLY check if component is loaded
    isComponentLoaded(componentPath) {
        return this.loadedComponents.has(componentPath);
    }
}

// Create global component loader instance
let componentLoaderService = null;

// ONLY initialize component loader
function initializeComponentLoader() {
    if (!componentLoaderService) {
        componentLoaderService = new ComponentLoaderService();
    }
    return componentLoaderService;
}

// Export for global use
window.SFComponentLoader = {
    initialize: initializeComponentLoader,
    getService: () => componentLoaderService,
    loadComponent: (containerId, componentPath) => {
        if (!componentLoaderService) {
            initializeComponentLoader();
        }
        return componentLoaderService.loadComponent(containerId, componentPath);
    },
    loadComponents: (componentMappings) => {
        if (!componentLoaderService) {
            initializeComponentLoader();
        }
        return componentLoaderService.loadComponents(componentMappings);
    }
};

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeComponentLoader();
    console.log('🚀 Component Loader Service ready');
});

// Convenience global function
window.loadComponent = (containerId, componentPath) => {
    return window.SFComponentLoader.loadComponent(containerId, componentPath);
};
