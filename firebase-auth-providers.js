// firebase-auth-providers.js
// Complete authentication setup for all providers

// Initialize all auth providers
function initializeAuthProviders() {
    // Existing providers
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    
    // New providers
    const facebookProvider = new firebase.auth.FacebookAuthProvider();
    
    // LinkedIn requires custom OAuth implementation
    // Phone auth is built into Firebase
    
    return {
        google: googleProvider,
        facebook: facebookProvider
    };
}

// Enhanced sign-in function with profile inheritance
async function signInWithProvider(providerName) {
    const providers = initializeAuthProviders();
    
    try {
        let result;
        
        switch(providerName) {
            case 'google':
                result = await firebase.auth().signInWithPopup(providers.google);
                break;
                
            case 'facebook':
                providers.facebook.addScope('public_profile');
                providers.facebook.addScope('email');
                result = await firebase.auth().signInWithPopup(providers.facebook);
                break;
                
            case 'linkedin':
                // LinkedIn requires custom OAuth flow
                return signInWithLinkedIn();
                
            default:
                throw new Error('Unknown provider');
        }
        
        // Extract profile information
        const user = result.user;
        const profile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            providerId: result.credential.providerId
        };
        
        // Handle additional provider data
        if (result.additionalUserInfo) {
            const additionalInfo = result.additionalUserInfo.profile;
            
            // Facebook specific
            if (providerName === 'facebook' && additionalInfo) {
                profile.firstName = additionalInfo.first_name;
                profile.lastName = additionalInfo.last_name;
                profile.photoURL = additionalInfo.picture?.data?.url || profile.photoURL;
            }
        }
        
        // Update or create user profile
        await updateUserProfile(profile);
        
        // Redirect to MyPassport
        window.location.href = '/passport.html';
        
    } catch (error) {
        console.error(`Error signing in with ${providerName}:`, error);
        showAuthError(error.message);
    }
}

// Phone authentication with SMS/WhatsApp
async function signInWithPhone(phoneNumber, useWhatsApp = false) {
    try {
        // Configure reCAPTCHA
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    console.log('reCAPTCHA solved');
                }
            });
        }
        
        const appVerifier = window.recaptchaVerifier;
        
        // Send verification code
        const confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        
        // Show OTP input UI
        showOTPInput(phoneNumber, useWhatsApp);
        
    } catch (error) {
        console.error('Error during phone sign-in:', error);
        showAuthError(error.message);
    }
}

// Verify OTP code
async function verifyOTP(code) {
    try {
        const result = await window.confirmationResult.confirm(code);
        const user = result.user;
        
        // Create basic profile for phone users
        const profile = {
            uid: user.uid,
            phoneNumber: user.phoneNumber,
            displayName: null, // To be filled by user
            photoURL: null, // To be filled by user
            email: null, // To be filled by user
            providerId: 'phone',
            profileComplete: false // Flag to prompt profile completion
        };
        
        await updateUserProfile(profile);
        
        // Redirect to MyPassport with profile completion prompt
        window.location.href = '/passport.html?completeProfile=true';
        
    } catch (error) {
        console.error('Error verifying OTP:', error);
        showAuthError('Invalid verification code');
    }
}

// LinkedIn OAuth (simplified client-side approach)
async function signInWithLinkedIn() {
    // Since you've configured LinkedIn in Firebase as a custom OAuth provider
    // We can use Firebase's OAuthProvider
    try {
        const provider = new firebase.auth.OAuthProvider('oidc.linkedin');
        
        // LinkedIn OAuth scopes
        provider.addScope('r_liteprofile');
        provider.addScope('r_emailaddress');
        
        // Sign in with popup
        const result = await firebase.auth().signInWithPopup(provider);
        
        // Extract profile information
        const user = result.user;
        const profile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            providerId: 'linkedin.com'
        };
        
        // Update user profile
        await updateUserProfile(profile);
        
        // Redirect to MyPassport
        window.location.href = '/passport.html';
        
    } catch (error) {
        console.error('Error signing in with LinkedIn:', error);
        
        // If custom OAuth provider doesn't work, fall back to redirect flow
        if (error.code === 'auth/operation-not-allowed') {
            // Fallback to manual OAuth flow
            signInWithLinkedInManual();
        } else {
            showAuthError(error.message);
        }
    }
}

// Manual LinkedIn OAuth flow (backup method)
function signInWithLinkedInManual() {
    // IMPORTANT: Replace this with your actual LinkedIn Client ID from your LinkedIn app
    const clientId = '77tpngrlwmwnz7'; // <-- REPLACE THIS!
    
    // For example: const clientId = '77xxxxxxxxxxxxx';
    
    const redirectUri = encodeURIComponent(window.location.origin + '/linkedin-callback.html');
    const state = generateRandomString(16);
    const scope = 'r_liteprofile r_emailaddress';
    
    // Store state for CSRF protection
    sessionStorage.setItem('linkedin_oauth_state', state);
    
    // Redirect to LinkedIn OAuth
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `state=${state}&` +
        `scope=${scope}`;
    
    window.location.href = authUrl;
}

// Handle LinkedIn callback (separate page needed)
async function handleLinkedInCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    // Verify state
    const savedState = sessionStorage.getItem('linkedin_oauth_state');
    if (state !== savedState) {
        throw new Error('Invalid state parameter');
    }
    
    // Exchange code for token (requires backend)
    // For now, we'll need a Cloud Function to handle this
    const response = await fetch('/api/auth/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    
    const data = await response.json();
    
    // Sign in with custom token
    await firebase.auth().signInWithCustomToken(data.customToken);
    
    // Update profile with LinkedIn data
    await updateUserProfile(data.profile);
    
    window.location.href = '/passport.html';
}

// WhatsApp Business API integration (requires approval)
async function sendWhatsAppOTP(phoneNumber) {
    // WhatsApp OTP requires WhatsApp Business API
    // This is a placeholder for the implementation
    try {
        const response = await fetch('/api/whatsapp/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });
        
        if (response.ok) {
            showWhatsAppOTPInput(phoneNumber);
        } else {
            // Fallback to SMS
            signInWithPhone(phoneNumber, false);
        }
    } catch (error) {
        console.error('WhatsApp OTP failed, falling back to SMS:', error);
        signInWithPhone(phoneNumber, false);
    }
}

// Update user profile in Firestore
async function updateUserProfile(profileData) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const userRef = db.collection('users').doc(user.uid);
    
    try {
        const doc = await userRef.get();
        
        if (!doc.exists) {
            // Create new profile
            await userRef.set({
                ...profileData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                passport: {
                    id: generatePassportId(),
                    level: 1,
                    experience: 0,
                    totalCheckIns: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastCheckIn: null,
                    achievements: ['founding_member']
                }
            });
        } else {
            // Update existing profile with new data
            const updates = {};
            
            // Only update non-null values
            Object.keys(profileData).forEach(key => {
                if (profileData[key] !== null && profileData[key] !== undefined) {
                    updates[`profile.${key}`] = profileData[key];
                }
            });
            
            if (Object.keys(updates).length > 0) {
                await userRef.update(updates);
            }
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
}

// Helper functions
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generatePassportId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `SF${timestamp}${random}`.toUpperCase();
}

function showAuthError(message) {
    // Show error in UI
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Export functions
window.authProviders = {
    signInWithProvider,
    signInWithPhone,
    verifyOTP,
    sendWhatsAppOTP,
    handleLinkedInCallback
};
