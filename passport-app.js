// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Digital Passport app initializing...');
    
    // Wait for Firebase to initialize
    if (typeof firebase === 'undefined') {
        console.error('Firebase not initialized');
        return;
    }
    
    // Check authentication state
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('👤 User authenticated:', user.displayName || user.email);
            
            // Initialize user session
            if (typeof initializeUserSession === 'function') {
                const userProfile = await initializeUserSession(user);
                if (userProfile) {
                    console.log('✅ User session initialized');
                    
                    // Update global user reference
                    window.currentUser = user;
                    window.currentUserProfile = userProfile;
                    
                    // Hide auth required, show passport content
                    const authRequired = document.getElementById('auth-required');
                    const passportContent = document.getElementById('passport-content');
                    
                    if (authRequired) authRequired.style.display = 'none';
                    if (passportContent) passportContent.style.display = 'block';
                    
                    // Load passport data
                    await loadPassportData();
                    
                    // Initialize other features
                    initializeEventListeners();
                    
                    console.log('✅ Digital Passport ready!');
                }
            }
        } else {
            console.log('👤 No user authenticated');
            showAuthRequired();
        }
    });
});

// Show authentication required message
function showAuthRequired() {
    const authRequired = document.getElementById('auth-required');
    const passportContent = document.getElementById('passport-content');
    
    if (authRequired) authRequired.style.display = 'block';
    if (passportContent) passportContent.style.display = 'none';
}

// Make auth modal available globally
window.showAuthModal = function() {
    if (typeof showSignInModal === 'function') {
        showSignInModal();
    } else {
        // Fallback to redirect
        window.location.href = '/';
    }
};
