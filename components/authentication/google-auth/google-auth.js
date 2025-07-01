// 🔬 ATOMIC SERVICE: Google Authentication Only
// File: /components/authentication/google-auth/google-auth.js
// Purpose: Single-responsibility Google OAuth logic
// Dependencies: Firebase Auth, Google Auth Provider

class GoogleAuthService {
    constructor() {
        this.provider = null;
        this.isInitialized = false;
        this.isLoading = false;
        this.initialize();
    }

    // ONLY Google Auth initialization
    async initialize() {
        try {
            console.log('🔵 Google Auth: Initializing...');
            
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            // Set up Google Auth Provider
            this.provider = new firebase.auth.GoogleAuthProvider();
            this.provider.addScope('email');
            this.provider.addScope('profile');
            
            // Set up button event listener
            this.setupButtonListener();
            
            this.isInitialized = true;
            console.log('✅ Google Auth: Initialized successfully');
            
        } catch (error) {
            console.error('❌ Google Auth: Initialization failed', error);
            this.showError('Google authentication setup failed');
        }
    }

    // ONLY wait for Firebase
    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebase && window.firebase.auth && window.db) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    // ONLY set up button click listener
    setupButtonListener() {
        const button = document.getElementById('google-sign-in-btn');
        if (button) {
            button.addEventListener('click', () => this.handleSignIn());
            console.log('🔵 Google Auth: Button listener attached');
        } else {
            console.error('❌ Google Auth: Button not found');
        }
    }

    // ONLY handle Google sign-in
    async handleSignIn() {
        if (!this.isInitialized || this.isLoading) {
            console.warn('⚠️ Google Auth: Not ready or already loading');
            return;
        }

        try {
            console.log('🔵 Google Auth: Starting sign-in process...');
            
            this.setLoadingState(true);
            this.hideError();
            this.showStatus('Signing in with Google...');

            // Perform Google OAuth
            const result = await firebase.auth().signInWithPopup(this.provider);
            const user = result.user;
            
            console.log('✅ Google Auth: Sign-in successful', user.uid);
            
            // Create user profile
            await this.createUserProfile(user);
            
            // Show success state
            this.setSuccessState();
            
            // Notify success
            this.notifyAuthSuccess(user);
            
        } catch (error) {
            console.error('❌ Google Auth: Sign-in failed', error);
            this.handleAuthError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    // ONLY create user profile in database
    async createUserProfile(user) {
        try {
            const userRef = window.db.collection('users').doc(user.uid);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                console.log('🔵 Google Auth: Creating new user profile...');
                
                // Generate SF Passport ID
                const passportId = this.generateSFPassportId();
                
                const userData = {
                    uid: user.uid,
                    displayName: user.displayName || 'Entrepreneur',
                    email: user.email,
                    photoURL: user.photoURL || '',
                    authProvider: 'google',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    
                    // SF Passport
                    sfPassport: {
                        id: passportId,
                        level: 1,
                        tier: 'Navy',
                        experience: 0,
                        issuedDate: firebase.firestore.FieldValue.serverTimestamp()
                    },
                    
                    // Entrepreneur Profile
                    entrepreneur: {
                        active: true,
                        linkedinVerified: false,
                        ideas: [],
                        achievements: ['Digital Passport'],
                        venueCheckIns: []
                    },
                    
                    // Gamification
                    gamification: {
                        sfPoints: 50, // Welcome bonus
                        dailyStreak: 1,
                        achievements: ['Digital Passport', 'Google Sign-in'],
                        level: 1,
                        experiencePoints: 50
                    }
                };
                
                await userRef.set(userData);
                console.log('✅ Google Auth: User profile created');
            } else {
                // Update last login
                await userRef.update({
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('✅ Google Auth: User login updated');
            }
        } catch (error) {
            console.error('❌ Google Auth: Profile creation failed', error);
            throw error;
        }
    }

    // ONLY generate SF Passport ID
    generateSFPassportId() {
        const randomNum = Math.floor(Math.random() * 9000000) + 1000000;
        const countryCode = this.detectCountryCode();
        return `SF-${randomNum}-${countryCode}`;
    }

    // ONLY detect country code
    detectCountryCode() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const countryMap = {
                'Asia/Dubai': 'AE',
                'America/New_York': 'US',
                'Europe/London': 'GB',
                'Asia/Kolkata': 'IN',
                'Australia/Sydney': 'AU'
            };
            return countryMap[timezone] || 'US';
        } catch (error) {
            return 'US';
        }
    }

    // ONLY handle authentication errors
    handleAuthError(error) {
        let errorMessage = 'Google sign-in failed. Please try again.';
        
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-in cancelled. Please try again.';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Popup blocked. Please allow popups and try again.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
        }
        
        this.showError(errorMessage);
    }

    // ONLY notify authentication success
    notifyAuthSuccess(user) {
        // Call global success handler
        if (window.onAuthSuccess) {
            window.onAuthSuccess({
                provider: 'google',
                user: user,
                method: 'popup'
            });
        }
        
        // Redirect to welcome page after short delay
        setTimeout(() => {
            window.location.href = '/welcome/';
        }, 1000);
    }

    // ONLY set loading state
    setLoadingState(loading) {
        this.isLoading = loading;
        const button = document.getElementById('google-sign-in-btn');
        
        if (button) {
            button.disabled = loading;
            if (loading) {
                button.classList.add('loading');
            } else {
                button.classList.remove('loading');
            }
        }
    }

    // ONLY set success state
    setSuccessState() {
        const button = document.getElementById('google-sign-in-btn');
        if (button) {
            button.classList.add('success');
            button.querySelector('.google-text').textContent = 'Signed in successfully!';
        }
        
        this.showStatus('Welcome to SociallyFounded!');
    }

    // ONLY show status message
    showStatus(message) {
        const statusEl = document.getElementById('google-auth-status');
        const textEl = statusEl?.querySelector('.status-text');
        
        if (statusEl && textEl) {
            textEl.textContent = message;
            statusEl.classList.remove('hidden');
        }
    }

    // ONLY show error message
    showError(message) {
        const errorEl = document.getElementById('google-auth-error');
        const textEl = errorEl?.querySelector('.error-text');
        
        if (errorEl && textEl) {
            textEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
    }

    // ONLY hide error message
    hideError() {
        const errorEl = document.getElementById('google-auth-error');
        if (errorEl) {
            errorEl.classList.add('hidden');
        }
    }
}

// Initialize Google Auth Service when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔵 Google Auth: DOM ready, initializing service...');
    window.googleAuthService = new GoogleAuthService();
});

// Export for testing
window.GoogleAuthService = GoogleAuthService;
