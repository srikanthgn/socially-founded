// firebase-auth-complete.js
// Complete consolidated authentication system for SociallyFounded

// Firebase configuration - THIS IS THE CORRECT CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyCdaZa0TmP3pJ6qd7gmZEKsl9PEHTE2pMU",
  authDomain: "sociallyfounded-df98f.firebaseapp.com",
  projectId: "sociallyfounded-df98f",
  storageBucket: "sociallyfounded-df98f.firebasestorage.app",
  messagingSenderId: "994533610259",
  appId: "1:994533610259:web:fe740378a4c000211e40e6",
  measurementId: "G-EY0BZE30Q0"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized by firebase-auth-complete.js");
} else {
  firebase.app(); 
  console.log("Firebase was already initialized. Using existing app.");
}

function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined' && firebase.auth && typeof firebase.auth === 'function' && firebase.firestore && typeof firebase.firestore === 'function') {
                clearInterval(checkFirebase);
                console.log("Firebase services confirmed ready in waitForFirebase.");
                resolve();
            } else {
                console.log("Waiting for Firebase services to be fully ready...");
            }
        }, 100);
    });
}

async function initializeAuth() {
    console.log("Initializing Auth System from firebase-auth-complete.js");
    await waitForFirebase();
    console.log("Firebase ready, setting up auth state listener.");

    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('User authenticated (firebase-auth-complete.js):', user.email || user.phoneNumber || user.uid);
            await ensureUserProfile(user);
            handleAuthenticatedUser(user);
        } else {
            console.log('User not authenticated (firebase-auth-complete.js)');
            handleUnauthenticatedUser();
        }
    });
}

async function ensureUserProfile(user) {
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(user.uid);
    try {
        const doc = await userRef.get();
        if (!doc.exists) {
            const userTypeFromStorage = localStorage.getItem('sf-user-type') || 'founder';
            console.log(`New user: ${user.uid}. User type from localStorage: ${userTypeFromStorage}`);
            const profileData = {
                uid: user.uid,
                email: user.email || null,
                displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'SociallyFounded User') || null,
                photoURL: user.photoURL || null,
                phoneNumber: user.phoneNumber || null,
                providerId: user.providerData[0]?.providerId || 'unknown',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                profileComplete: false,
                userType: userTypeFromStorage,
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
                    connectionsMade: 0
                }
            };
            await userRef.set(profileData);
            console.log('Created new user profile for UID:', user.uid, 'with userType:', userTypeFromStorage);
        } else {
            console.log('User profile already exists for UID:', user.uid, '. Updating lastActive.');
            const existingData = doc.data();
            if (existingData && existingData.profile) {
                 await userRef.update({ 'profile.lastActive': firebase.firestore.FieldValue.serverTimestamp() });
            } else {
                 await userRef.update({ lastActive: firebase.firestore.FieldValue.serverTimestamp() });
                console.warn("User profile object missing, updated top-level lastActive for user:", user.uid);
            }
        }
    } catch (error) {
        console.error('Error ensuring user profile:', error);
    }
}

function handleAuthenticatedUser(user) {
    const currentPage = window.location.pathname;
    console.log(`Handling authenticated user on page: ${currentPage}`);
    const authInProgress = localStorage.getItem('sf-auth-in-progress');

    if (currentPage === '/' || currentPage.endsWith('/index.html')) {
        if (authInProgress) {
            localStorage.removeItem('sf-auth-in-progress');
            console.log('Redirecting from index.html to passport.html after auth flow completion.');
            window.location.href = 'passport.html';
        } else {
            updateHomepageForAuthenticatedUser(user);
        }
    } else if (currentPage.endsWith('/passport.html')) {
        const authRequired = document.getElementById('auth-required');
        const passportContent = document.getElementById('passport-content');
        if (authRequired) authRequired.style.display = 'none';
        if (passportContent) passportContent.style.display = 'block';
        if (typeof loadPassportData === 'function') {
            loadPassportData(); 
        } else {
            console.warn('loadPassportData function not found on passport.html.');
        }
    } else if (currentPage.endsWith('/linkedin-auth-handler.html')) {
        if (authInProgress) { 
            localStorage.removeItem('sf-auth-in-progress');
            console.log('Redirecting from linkedin-auth-handler.html to passport.html');
            window.location.href = 'passport.html';
        } else {
            console.warn('sf-auth-in-progress not set on linkedin-auth-handler, but user is auth. Defaulting to passport.');
            window.location.href = 'passport.html';
        }
    }
}

function updateHomepageForAuthenticatedUser(user) {
    const signupForm = document.querySelector('.signup-form'); 
    if (signupForm) {
        const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Founder');
        signupForm.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <img src="${user.photoURL || 'favicon.svg'}" alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; border: 3px solid #003554;">
                <h3 style="color: #003554; margin-bottom: 10px; font-size: 22px;">Welcome back, ${displayName}!</h3>
                <p style="margin-bottom: 25px; font-size: 16px;">You're successfully signed in.</p>
                <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                    <a href="passport.html" style="display: block; width: 100%; max-width: 250px; padding: 12px 20px; background: #003554; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; font-size:16px;">View My Passport</a>
                    <button onclick="handleSignOut()" style="display: block; width: 100%; max-width: 250px; padding: 12px 20px; background: transparent; color: #003554; border: 2px solid #003554; border-radius: 8px; font-weight: 500; cursor: pointer; font-size:16px;">Sign Out</button>
                </div>
            </div>
        `;
    } else {
        console.warn("Signup form container (.signup-form) not found on homepage for UI update.");
    }
}

function handleUnauthenticatedUser() {
    const currentPage = window.location.pathname;
    console.log(`Handling unauthenticated user on page: ${currentPage}`);
    if (currentPage.endsWith('/passport.html')) {
        const authRequired = document.getElementById('auth-required');
        const passportContent = document.getElementById('passport-content');
        if (authRequired) authRequired.style.display = 'block';
        if (passportContent) passportContent.style.display = 'none';
    } else if (currentPage === '/' || currentPage.endsWith('/index.html')) {
        console.log("User is unauthenticated on homepage. Original auth form should be visible.");
    }
}

const authProviders = {
    async signInWithProvider(providerName) {
        localStorage.setItem('sf-auth-in-progress', 'true'); 
        try {
            let provider;
            if (providerName === 'google') {
                provider = new firebase.auth.GoogleAuthProvider();
            } else if (providerName === 'facebook') {
                provider = new firebase.auth.FacebookAuthProvider();
            } else {
                console.error('Unsupported provider for signInWithProvider:', providerName);
                throw new Error('Unsupported provider: ' + providerName);
            }
            const result = await firebase.auth().signInWithPopup(provider);
            console.log(`${providerName} sign-in successful:`, result.user);
        } catch (error) {
            console.error(`Error signing in with ${providerName}:`, error);
            localStorage.removeItem('sf-auth-in-progress'); 
            this.showAuthError(error.message || `Failed to sign in with ${providerName}.`);
        }
    },
    signInWithLinkedIn() { 
        if (typeof window.saveUserTypeFromIndex === 'function') { 
            window.saveUserTypeFromIndex();
        } else {
            console.warn('saveUserTypeFromIndex function not found. User type might not be saved before LinkedIn redirect.');
        }
        localStorage.setItem('sf-auth-in-progress', 'true'); 
        localStorage.setItem('sf-linkedin-auth-in-progress', 'true');
        const startLinkedInAuthUrl = 'https://us-central1-sociallyfounded-df98f.cloudfunctions.net/startLinkedInAuth';
        console.log('Redirecting to LinkedIn Auth Function:', startLinkedInAuthUrl);
        window.location.href = startLinkedInAuthUrl;
    },
    async signInWithPhone(phoneNumber) { 
        localStorage.setItem('sf-auth-in-progress', 'true');
        try {
            const recaptchaContainerId = 'recaptcha-container'; 
            const recaptchaContainer = document.getElementById(recaptchaContainerId);
            if (!recaptchaContainer) {
                console.error(`reCAPTCHA container with ID '${recaptchaContainerId}' not found on the current page.`);
                this.showAuthError("reCAPTCHA setup error. Container not found.");
                localStorage.removeItem('sf-auth-in-progress');
                return;
            }
            recaptchaContainer.style.display = 'block';
            if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
                try { window.recaptchaVerifier.clear(); console.log("Cleared previous reCAPTCHA verifier."); }
                catch (e) { console.warn("Error clearing previous reCAPTCHA:", e); }
            }
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainerId, {
                'size': 'invisible',
                'callback': (response) => { console.log('reCAPTCHA solved, proceeding with phone sign-in.'); },
                'expired-callback': () => { 
                    this.showAuthError('reCAPTCHA challenge expired. Please try again.');
                    localStorage.removeItem('sf-auth-in-progress');
                }
            });
            const appVerifier = window.recaptchaVerifier;
            await appVerifier.render(); 
            console.log("reCAPTCHA rendered, attempting phone number sign-in for:", phoneNumber);
            const confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult; 
            if (typeof window.showOTPInputUI === 'function') { 
                window.showOTPInputUI(phoneNumber);
            } else {
                console.warn("window.showOTPInputUI function not found. UI won't update for OTP entry.");
            }
        } catch (error) {
            console.error('Phone sign-in error:', error);
            localStorage.removeItem('sf-auth-in-progress');
            this.showAuthError(error.message || 'Failed to send OTP.');
            if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
                 try { window.recaptchaVerifier.clear(); } catch(e) { console.warn("Error clearing reCAPTCHA on error:", e); }
            }
        }
    },
    async verifyOTP(code) {
        if (!localStorage.getItem('sf-auth-in-progress')) {
            localStorage.setItem('sf-auth-in-progress', 'true');
        }
        if (!window.confirmationResult) {
            console.error('OTP verification error: No confirmation result found.');
            this.showAuthError('No confirmation context. Please request a new OTP.');
            localStorage.removeItem('sf-auth-in-progress'); 
            return;
        }
        try {
            const result = await window.confirmationResult.confirm(code);
            console.log('Phone OTP authentication successful:', result.user);
        } catch (error) {
            console.error('OTP verification error:', error);
            localStorage.removeItem('sf-auth-in-progress'); 
            this.showAuthError(error.message || 'Invalid OTP or verification failed.');
        }
    },
    showAuthError(message) {
        console.error("Auth Error to User:", message);
        const errorDisplay = document.getElementById('auth-error-message');
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
            setTimeout(() => { errorDisplay.style.display = 'none'; errorDisplay.textContent = ''; }, 6000);
        } else {
            alert(message);
        }
    }
};

async function handleSignOut() {
    try {
        await firebase.auth().signOut();
        console.log('User signed out successfully (firebase-auth-complete.js)');
        window.location.href = '/index.html'; 
    } catch (error) {
        console.error('Sign out error:', error);
        authProviders.showAuthError('Error signing out. Please try again.');
    }
}

function generatePassportId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `SF${timestamp}${random}`.toUpperCase();
}

function handleLinkedInCallback() {
    if (window.location.pathname.endsWith('/linkedin-auth-handler.html')) {
        console.log("Handling LinkedIn Callback on linkedin-auth-handler.html via firebase-auth-complete.js");
        const urlParams = new URLSearchParams(window.location.search);
        const customToken = urlParams.get('token');
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        localStorage.removeItem('sf-linkedin-auth-in-progress');
        if (errorParam) {
            console.error('Error from LinkedIn OAuth on handler page:', errorDescription || errorParam);
            authProviders.showAuthError(`LinkedIn Sign-In Error: ${errorDescription || errorParam}`);
            localStorage.removeItem('sf-auth-in-progress');
            const messageElement = document.getElementById('message'); 
            if (messageElement) messageElement.innerHTML = `<p class="error">LinkedIn Sign-In Error: ${errorDescription || errorParam}. Please <a href="index.html">try again</a>.</p>`;
            const spinnerElement = document.getElementById('spinner');
            if(spinnerElement) spinnerElement.style.display = 'none';
            return;
        }
        if (customToken) {
            localStorage.setItem('sf-auth-in-progress', 'true'); 
            firebase.auth().signInWithCustomToken(customToken)
                .then((userCredential) => {
                    console.log('LinkedIn custom token sign-in successful (on handler page):', userCredential.user);
                })
                .catch((error) => {
                    console.error('LinkedIn custom token sign-in error (on handler page):', error);
                    authProviders.showAuthError('LinkedIn sign-in failed (token error). Please try again.');
                    localStorage.removeItem('sf-auth-in-progress');
                    const messageElement = document.getElementById('message');
                    if (messageElement) messageElement.innerHTML = `<p class="error">LinkedIn Sign-In Error (token). Please <a href="index.html">try again</a>.</p>`;
                    const spinnerElement = document.getElementById('spinner');
                    if(spinnerElement) spinnerElement.style.display = 'none';
                });
        } else if (!errorParam) { 
            console.log("LinkedIn callback page loaded without token or error param (on handler page).");
            const messageElement = document.getElementById('message');
            if(messageElement) messageElement.innerHTML = `<p class="error">Invalid LinkedIn authentication callback. Please <a href="index.html">try again</a>.</p>`;
            const spinnerElement = document.getElementById('spinner');
            if(spinnerElement) spinnerElement.style.display = 'none';
            localStorage.removeItem('sf-auth-in-progress');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeAuth(); 
    handleLinkedInCallback(); 
});

window.authProviders = authProviders;
window.handleSignOut = handleSignOut; 

console.log("firebase-auth-complete.js loaded and initialized.");
