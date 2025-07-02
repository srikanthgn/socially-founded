// LinkedIn Auth Atomic Service - Single Responsibility
class LinkedInAuthService {
    constructor() {
        this.clientId = '77tpngrlwmwnz7'; // SF Production LinkedIn App
        this.redirectUri = 'https://sociallyfounded.com/linkedin-callback.html';
        this.scope = 'r_liteprofile r_emailaddress';
        this.state = this.generateState();
        this.button = null;
        this.messageDiv = null;
        this.initialize();
    }

    initialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
        
        console.log('✅ LinkedIn Auth: Initialized successfully');
    }

    setupEventListeners() {
        this.button = document.getElementById('linkedinAuthBtn');
        this.messageDiv = document.getElementById('linkedinAuthMessage');
        
        if (this.button) {
            this.button.addEventListener('click', (e) => {
                e.preventDefault();
                this.authenticate();
            });
            console.log('✅ LinkedIn Auth: Button listener attached');
        } else {
            console.error('❌ LinkedIn Auth: Button not found');
        }
    }

    generateState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    authenticate() {
        console.log('🔗 LinkedIn Auth: Starting authentication...');
        this.setLoading(true);
        
        try {
            const authUrl = this.buildAuthUrl();
            console.log('🔗 LinkedIn Auth: Redirecting to:', authUrl);
            
            // Slight delay to show loading state
            setTimeout(() => {
                window.location.href = authUrl;
            }, 500);
            
        } catch (error) {
            console.error('❌ LinkedIn Auth Error:', error);
            this.handleError('Failed to initiate LinkedIn authentication');
            this.setLoading(false);
        }
    }

    buildAuthUrl() {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: this.scope,
            state: this.state
        });
        
        return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    }

    setLoading(loading) {
        if (!this.button) return;
        
        if (loading) {
            this.button.disabled = true;
            this.button.innerHTML = `
                <div class="linkedin-loading-spinner"></div>
                Connecting to LinkedIn...
            `;
        } else {
            this.button.disabled = false;
            this.button.innerHTML = `
                <svg class="linkedin-icon" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Continue with LinkedIn
            `;
        }
    }

    handleError(message) {
        console.error('❌ LinkedIn Auth:', message);
        this.showMessage(message, 'error');
    }

    handleSuccess(userData) {
        console.log('✅ LinkedIn Auth: Success', userData);
        this.showMessage('LinkedIn authentication successful!', 'success');
        
        // Notify coordinator if available
        if (window.authCoordinator) {
            window.authCoordinator.handleAuthSuccess({
                provider: 'linkedin',
                user: userData,
                method: 'redirect'
            });
        }
    }

    showMessage(text, type) {
        if (!this.messageDiv) return;
        
        this.messageDiv.className = type;
        this.messageDiv.textContent = text;
    }
}

// Initialize LinkedIn Auth Service
const linkedInAuth = new LinkedInAuthService();

// Export for global access
window.linkedInAuth = linkedInAuth;
window.LinkedInAuthService = LinkedInAuthService;
