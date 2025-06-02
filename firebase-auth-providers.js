// firebase-auth-providers.js
// Complete authentication setup for all providers

// Initialize all auth providers
function initializeAuthProviders() {
    // Existing providers
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    
    // New providers
    const facebookProvider = new firebase.auth.FacebookAuthProvider();
    
    // LinkedIn uses Cloud Functions
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
                // LinkedIn uses Cloud Functions for OAuth
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
        console.error('Full error object:', JSON.stringify(error, null, 2));
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        showAuthError(error.message);
    }
}

// LinkedIn OAuth using existing Cloud Functions
async function signInWithLinkedIn() {
    try {
        // Get the return URL to pass to the function
        const returnUrl = window.location.origin;
        
        // Call your startLinkedInAuth function to get the OAuth URL
        const response = await fetch(`https://us-central1-sociallyfounded-df98f.cloudfunctions.net/startLinkedInAuth?returnUrl=${encodeURIComponent(returnUrl)}`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error('Failed to start LinkedIn authentication');
        }
        
        const data = await response.json();
        
        // Redirect to LinkedIn OAuth URL
        if (data.authUrl) {
            window.location.href = data.authUrl;
        } else {
            throw new Error('No authentication URL received');
        }
        
    } catch (error) {
        console.error('Error signing in with LinkedIn:', error);
        showAuthError('LinkedIn sign-in failed. Please try again.');
    }
}
// Handle LinkedIn callback is managed by the Cloud Function
// The linkedinCallback function will create a custom token and redirect back to your app

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
        if (window.showOTPInput) {
            window.showOTPInput(phoneNumber, useWhatsApp);
        }
        
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
    signInWithLinkedIn,
    showAuthError
};
