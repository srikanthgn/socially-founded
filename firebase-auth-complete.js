// firebase-auth-complete.js
// Complete consolidated authentication system for SociallyFounded
// This replaces firebase-simple.js and consolidates all auth logic

// Wait for Firebase to be initialized
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
                clearInterval(checkFirebase);
                resolve();
            }
        }, 100);
    });
}

// Initialize authentication system
async function initializeAuth() {
    await waitForFirebase();
    
    // Set up auth state listener
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            console.log('User authenticated:', user.email || user.phoneNumber);
            
            // Ensure user profile exists
            await ensureUserProfile(user);
            
            // Handle page-specific logic
            handleAuthenticatedUser(user);
        } else {
            // User is signed out
            console.log('User not authenticated');
            handleUnauthenticatedUser();
        }
    });
}

// Ensure user profile exists in Firestore
async function ensureUserProfile(user) {
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(user.uid);
    
    try {
        const doc = await userRef.get();
        
        if (!doc.exists) {
            // Create new profile
            const profileData = {
                uid: user.uid,
                email: user.email || null,
                displayName: user.displayName || null,
                photoURL: user.photoURL || null,
                phoneNumber: user.phoneNumber || null,
                providerId: user.providerData[0]?.providerId || 'unknown',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                profileComplete: false,
                passport: {
                    id: generatePassportId(),
                    level: 1,
                    experience: 0,
                    totalCheckIns: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastCheckIn: null,
                    achievements: ['founding_member']
                },
                stats: {
                    ideasRegistered: 0,
                    venuesVisited: 0,
                    connectionsМаde: 0
                }
            };
            
            await userRef.set(profileData);
            console.log('Created new user profile');
        }
    } catch (error) {
        console.error('Error ensuring user profile:', error);
    }
}

// Handle authenticated user based on current page
function handleAuthenticatedUser(user) {
    const currentPage = window.location.pathname;
    
    if (currentPage === '/' || currentPage === '/index.html') {
        // On homepage - DON'T redirect, just update the auth section
        updateHomepageForAuthenticatedUser(user);
    } else if (currentPage === '/passport.html') {
        // On passport page, show content
        const authRequired = document.getElementById('auth-required');
        const passportContent = document.getElementById('passport-content');
        
        if (authRequired) authRequired.style.display = 'none';
        if (passportContent) passportContent.style.display = 'block';
        
        // Load passport data if function exists
        if (typeof loadPassportData === 'function') {
            loadPassportData();
        }
        
        // Check for profile completion
        checkProfileCompletionStatus(user);
    }
}

// Update homepage for authenticated users
function updateHomepageForAuthenticatedUser(user) {
    // Find the auth container
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
        // Get user display info
        const displayName = user.displayName || 'Entrepreneur';
        const displayEmail = user.email || user.phoneNumber || '';
        
        // Replace auth options with logged-in state
        authContainer.innerHTML = `
            <h2 style="text-align: center; margin-bottom: 1rem; color: #003554;">Welcome Back, ${displayName}!</h2>
            <p style="text-align: center; color: #666; margin-bottom: 1.5rem;">
                ${displayEmail ? `Signed in as <strong>${displayEmail}</strong>` : 'You are signed in'}
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="window.location.href='/passport.html'" 
                        style="padding: 15px 30px; background: #003554; color: white; border: none; 
                               border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;
                               transition: all 0.3s;">
                    View My Passport
                </button>
                <button onclick="handleSignOut()" 
                        style="padding: 15px 30px; background: transparent; color: #003554; 
                               border: 2px solid #003554; border-radius: 8px; font-size: 16px; 
                               font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    Sign Out
                </button>
            </div>
            <p style="text-align: center; margin-top: 1.5rem; font-size: 14px; color: #666;">
                Continue exploring below or head to your passport to track your journey
            </p>
        `;
    }
}

// Handle unauthenticated user
function handleUnauthenticatedUser() {
    const currentPage = window.location.pathname;
    
    if (currentPage === '/passport.html') {
        // Show auth required message
        const authRequired = document.getElementById('auth-required');
        const passportContent = document.getElementById('passport-content');
        
        if (authRequired) authRequired.style.display = 'block';
        if (passportContent) passportContent.style.display = 'none';
    }
    // On homepage, do nothing - let normal auth UI show
}

// Check if profile needs completion
async function checkProfileCompletionStatus(user) {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const shouldCompleteProfile = urlParams.get('completeProfile') === 'true';
    
    if (shouldCompleteProfile || user.providerData[0]?.providerId === 'phone') {
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData?.profileComplete) {
            // Trigger profile completion if function exists
            if (typeof checkProfileCompletion === 'function') {
                setTimeout(() => checkProfileCompletion(), 1000);
            }
        }
    }
}

// Authentication provider functions
const authProviders = {
    // Sign in with OAuth providers
    async signInWithProvider(providerName) {
        try {
            let provider;
            
            switch(providerName) {
                case 'google':
                    provider = new firebase.auth.GoogleAuthProvider();
                    break;
                case 'facebook':
                    provider = new firebase.auth.FacebookAuthProvider();
                    provider.addScope('public_profile');
                    provider.addScope('email');
                    break;
                case 'linkedin':
                    return this.signInWithLinkedIn();
                default:
                    throw new Error('Unknown provider: ' + providerName);
            }
            
            const result = await firebase.auth().signInWithPopup(provider);
            console.log('Sign in successful:', providerName);
            
            // Auth state listener will handle the redirect
            
        } catch (error) {
            console.error(`Error signing in with ${providerName}:`, error);
            
            // Handle specific error cases
            if (error.code === 'auth/popup-closed-by-user') {
                console.log('User cancelled sign-in');
                return;
            }
            
            if (error.code === 'auth/account-exists-with-different-credential') {
                this.showAuthError('An account already exists with the same email address but different sign-in credentials.');
                return;
            }
            
            // For Facebook when not configured
            if (providerName === 'facebook' && error.code === 'auth/internal-error') {
                this.showAuthError('Facebook login is not available yet. Please use another sign-in method.');
                return;
            }
            
            this.showAuthError(error.message);
        }
    },
    
    // LinkedIn OAuth via Cloud Functions
    async signInWithLinkedIn() {
        try {
            const returnUrl = window.location.origin;
            const response = await fetch(
                `https://us-central1-sociallyfounded-df98f.cloudfunctions.net/startLinkedInAuth?returnUrl=${encodeURIComponent(returnUrl)}`,
                { method: 'GET' }
            );
            
            if (!response.ok) {
                throw new Error('Failed to start LinkedIn authentication');
            }
            
            const data = await response.json();
            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                throw new Error('No authentication URL received');
            }
        } catch (error) {
            console.error('LinkedIn sign-in error:', error);
            this.showAuthError('LinkedIn sign-in failed. Please try again.');
        }
    },
    
    // Phone authentication
    async signInWithPhone(phoneNumber, useWhatsApp = false) {
        try {
            // Initialize reCAPTCHA if needed
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                    'size': 'invisible',
                    'callback': (response) => {
                        console.log('reCAPTCHA solved');
                    }
                });
            }
            
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            
            // Show OTP input
            if (window.showOTPInput) {
                window.showOTPInput(phoneNumber, useWhatsApp);
            }
            
        } catch (error) {
            console.error('Phone sign-in error:', error);
            
            // Handle specific errors
            if (error.code === 'auth/invalid-phone-number') {
                this.showAuthError('Invalid phone number. Please check and try again.');
            } else if (error.code === 'auth/too-many-requests') {
                this.showAuthError('Too many attempts. Please try again later.');
            } else {
                this.showAuthError(error.message);
            }
            
            // Reset reCAPTCHA on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.render();
            }
        }
    },
    
    // Verify OTP
    async verifyOTP(code) {
        try {
            if (!window.confirmationResult) {
                throw new Error('No confirmation result found. Please request a new code.');
            }
            
            const result = await window.confirmationResult.confirm(code);
            console.log('Phone authentication successful');
            
            // Set profile completion flag for phone users
            const user = result.user;
            if (user && !user.displayName) {
                // Redirect with profile completion flag
                window.location.href = '/passport.html?completeProfile=true';
            }
            
        } catch (error) {
            console.error('OTP verification error:', error);
            
            if (error.code === 'auth/invalid-verification-code') {
                this.showAuthError('Invalid verification code. Please try again.');
            } else if (error.code === 'auth/code-expired') {
                this.showAuthError('Verification code expired. Please request a new one.');
            } else {
                this.showAuthError('Verification failed. Please try again.');
            }
        }
    },
    
    // WhatsApp OTP (fallback to SMS)
    async sendWhatsAppOTP(phoneNumber) {
        // WhatsApp Business API not implemented, fallback to SMS
        console.log('WhatsApp API not available, using SMS fallback');
        return this.signInWithPhone(phoneNumber, false);
    },
    
    // Show error messages
    showAuthError(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            // Fallback to alert if error div not found
            alert('Error: ' + message);
        }
    }
};

// Sign out function
async function handleSignOut() {
    try {
        await firebase.auth().signOut();
        console.log('User signed out successfully');
        
        // Reload the page to reset UI
        window.location.reload();
        
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Error signing out. Please try again.');
    }
}

// Utility functions
function generatePassportId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `SF${timestamp}${random}`.toUpperCase();
}

// Handle LinkedIn OAuth callback
function handleLinkedInCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const customToken = urlParams.get('token');
    
    if (customToken) {
        firebase.auth().signInWithCustomToken(customToken)
            .then(() => {
                // Clear token from URL
                window.history.replaceState({}, document.title, window.location.pathname);
                console.log('LinkedIn sign-in successful');
                // Auth state listener will handle the rest
            })
            .catch((error) => {
                console.error('LinkedIn token error:', error);
                authProviders.showAuthError('LinkedIn sign-in failed. Please try again.');
            });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    handleLinkedInCallback();
});

// Export for global use
window.authProviders = authProviders;
window.handleSignOut = handleSignOut;
