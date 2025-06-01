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
        // On homepage, redirect to passport
        window.location.href = '/passport.html';
    } else if (currentPage === '/passport.html') {
        // On passport page, show content
        document.getElementById('auth-required').style.display = 'none';
        document.getElementById('passport-content').style.display = 'block';
        
        // Load passport data if function exists
        if (typeof loadPassportData === 'function') {
            loadPassportData();
        }
        
        // Check for profile completion
        checkProfileCompletionStatus(user);
    }
}

// Handle unauthenticated user
function handleUnauthenticatedUser() {
    const currentPage = window.location.pathname;
    
    if (currentPage === '/passport.html') {
        // Show auth required message
        document.getElementById('auth-required').style.display = 'block';
        document.getElementById('passport-content').style.display = 'none';
    }
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
                    throw new Error('Unknown provider');
            }
            
            const result = await firebase.auth().signInWithPopup(provider);
            console.log('Sign in successful:', providerName);
            
        } catch (error) {
            console.error(`Error signing in with ${providerName}:`, error);
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
            
            if (!response.ok) throw new Error('Failed to start LinkedIn authentication');
            
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
                    'callback': (response) => console.log('reCAPTCHA solved')
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
            this.showAuthError(error.message);
        }
    },
    
    // Verify OTP
    async verifyOTP(code) {
        try {
            const result = await window.confirmationResult.confirm(code);
            console.log('Phone authentication successful');
            // Redirect handled by auth state listener
        } catch (error) {
            console.error('OTP verification error:', error);
            this.showAuthError('Invalid verification code');
        }
    },
    
    // WhatsApp OTP (fallback to SMS)
    async sendWhatsAppOTP(phoneNumber) {
        // WhatsApp Business API not implemented, fallback to SMS
        console.log('WhatsApp API not available, using SMS');
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
        }
    }
};

// Sign out function
async function handleSignOut() {
    try {
        await firebase.auth().signOut();
        console.log('User signed out');
        window.location.href = '/';
    } catch (error) {
        console.error('Sign out error:', error);
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
