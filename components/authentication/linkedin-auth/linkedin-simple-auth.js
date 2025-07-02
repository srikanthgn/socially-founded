// Simple LinkedIn Verification Service - No OAuth
class LinkedInSimpleAuth {
    constructor() {
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
        
        console.log('✅ LinkedIn Simple Auth: Initialized successfully');
    }

    setupEventListeners() {
        this.button = document.getElementById('linkedinAuthBtn');
        this.messageDiv = document.getElementById('linkedinAuthMessage');
        
        if (this.button) {
            this.button.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToLinkedInVerification();
            });
            console.log('✅ LinkedIn Simple Auth: Button listener attached');
        } else {
            console.error('❌ LinkedIn Simple Auth: Button not found');
        }
    }

    goToLinkedInVerification() {
        console.log('🔗 LinkedIn Simple Auth: Redirecting to verification page...');
        
        // Simple redirect to verification page - NO OAUTH
        window.location.href = 'https://sociallyfounded.com/linkedin-verify.html';
    }

    showMessage(text, type) {
        if (!this.messageDiv) return;
        
        this.messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        this.messageDiv.textContent = text;
    }
}

// Initialize LinkedIn Simple Auth Service
const linkedInSimpleAuth = new LinkedInSimpleAuth();

// Export for global access
window.linkedInSimpleAuth = linkedInSimpleAuth;
window.LinkedInSimpleAuth = LinkedInSimpleAuth;
