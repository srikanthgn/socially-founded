// firebase-simple.js
// Simple Firebase setup using CDN (no modules needed)
// Fixed version without Apple auth

// Firebase configuration
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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Auth providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
  'display': 'popup'
});

const appleProvider = new firebase.auth.OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');
appleProvider.setCustomParameters({
  locale: 'en'
});

// Simple Authentication Manager
class SimpleAuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => { // Make async
      this.currentUser = user;
      if (user) {
        console.log('User signed in:', user.displayName || user.email);
        await this.createUserProfile(user); // Ensure this completes

        const authInProgress = localStorage.getItem('sf-auth-in-progress');
        const userTypeExists = localStorage.getItem('sf-user-type');

        if (authInProgress && userTypeExists && (window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
          localStorage.removeItem('sf-auth-in-progress');
          // Not removing 'sf-user-type' here as passport.html or user-management.js might need it.
          console.log('Redirecting to passport.html after sign-in flow.');
          window.location.href = 'passport.html';
        } else {
          // Standard UI update if not part of the immediate redirect flow from index
          this.updateUI(user);
          // Show notification only if not redirecting immediately
          this.showNotification('Welcome back!', 'success');
        }
      } else {
        console.log('User signed out');
        this.updateUI(null); // Ensure UI is cleared
        localStorage.removeItem('sf-auth-in-progress'); // Clear flag on sign out
      }
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Google sign-in
      if (e.target.matches('#google-signin-btn') || e.target.closest('#google-signin-btn')) {
        e.preventDefault();
        // saveUserType() is called by the button's onclick in HTML before this.
        this.signInWithGoogle();
      }
      
      // Email sign-in modal
      if (e.target.matches('.social-button[data-provider="email"]') || 
          e.target.closest('.social-button[data-provider="email"]')) {
        e.preventDefault();
        this.showEmailModal();
      }
    });
  }

  async signInWithApple() {
    this.showLoadingState();
    localStorage.setItem('sf-auth-in-progress', 'true');
    try {
      const result = await auth.signInWithPopup(appleProvider);
      console.log('Apple sign-in successful:', result.user);
      // onAuthStateChanged will handle profile creation and redirection.
    } catch (error) {
      console.error('Apple sign-in error:', error);
      localStorage.removeItem('sf-auth-in-progress'); // Clear flag on error
      this.showNotification(this.getErrorMessage(error.code, 'Apple sign-in failed. Please try again or use another method.'), 'error');
      // Specific error handling for Apple (e.g., popup blocked, user cancelled)
      if (error.code === 'auth/popup-closed-by-user') {
         // User closed popup, common scenario.
      } else if (error.code === 'auth/cancelled-popup-request') {
         // Another popup was opened.
      }
    } finally {
      this.hideLoadingState();
    }
  }

  async signInWithGoogle() {
    localStorage.setItem('sf-auth-in-progress', 'true');
    // NOTE: sf-user-type is set by saveUserType() in index.html's button click.
    // Do NOT remove sf-user-type here.
    try {
      this.showLoadingState();
      const result = await auth.signInWithPopup(googleProvider);
      console.log('Google sign-in successful:', result.user);
      // Notification will be handled by onAuthStateChanged logic or on passport.html
    } catch (error) {
      console.error('Google sign-in error:', error);
      localStorage.removeItem('sf-auth-in-progress'); // Clear flag on error
      this.showNotification('Failed to sign in with Google. Please try again.', 'error');
    } finally {
      this.hideLoadingState();
    }
  }

  showEmailModal() {
    // Create simple email modal
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; font-family: 'Poppins', sans-serif;">
        <div style="background: white; border-radius: 12px; width: 90%; max-width: 400px; padding: 30px; position: relative;">
          <button onclick="this.closest('div').parentNode.remove()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
          
          <h2 style="text-align: center; margin-bottom: 20px; color: #003554;">Sign In</h2>
          
          <div id="email-form">
            <div style="margin-bottom: 15px;">
              <input type="email" id="email-input" placeholder="Email address" style="width: 100%; padding: 12px; border: 2px solid #E0E0E0; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 20px;">
              <input type="password" id="password-input" placeholder="Password" style="width: 100%; padding: 12px; border: 2px solid #E0E0E0; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <button onclick="window.authManager.signInWithEmail()" style="width: 100%; padding: 12px; background: #003554; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-bottom: 10px;">Sign In</button>
            
            <button onclick="window.authManager.createAccount()" style="width: 100%; padding: 12px; background: white; color: #003554; border: 2px solid #003554; border-radius: 8px; font-size: 16px; cursor: pointer;">Create Account</button>
          </div>
          
          <div id="loading-state" style="display: none; text-align: center; padding: 20px;">
            <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #003554; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 10px;">Loading...</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on email input
    setTimeout(() => {
      document.getElementById('email-input').focus();
    }, 100);
  }

  async signInWithEmail() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    
    if (!email || !password) {
      this.showNotification('Please fill in all fields.', 'error');
      return;
    }
    
    localStorage.setItem('sf-auth-in-progress', 'true');
    try {
      this.showModalLoading();
      const result = await auth.signInWithEmailAndPassword(email, password);
      console.log('Email sign-in successful:', result.user);
      // Notification and redirection are handled by onAuthStateChanged
      this.closeModal();
    } catch (error) {
      console.error('Email sign-in error:', error);
      localStorage.removeItem('sf-auth-in-progress'); // Clear flag on error
      this.showNotification(this.getErrorMessage(error.code), 'error');
    } finally {
      this.hideModalLoading();
    }
  }

  async createAccount() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    
    if (!email || !password) {
      this.showNotification('Please fill in all fields.', 'error');
      return;
    }
    
    localStorage.setItem('sf-auth-in-progress', 'true');
    try {
      this.showModalLoading();
      const result = await auth.createUserWithEmailAndPassword(email, password);
      console.log('Account creation successful:', result.user);
      // Notification and redirection are handled by onAuthStateChanged
      this.closeModal();
    } catch (error) {
      console.error('Account creation error:', error);
      localStorage.removeItem('sf-auth-in-progress'); // Clear flag on error
      this.showNotification(this.getErrorMessage(error.code), 'error');
    } finally {
      this.hideModalLoading();
    }
  }

  async createUserProfile(user) {
    try {
      // Call the global initializeUserSession from user-management.js
      // This function is expected to handle actual profile creation/update in Firestore
      // and also needs to be aware of 'sf-user-type' from localStorage.
      console.log('Attempting to call window.initializeUserSession for user:', user.uid);
      if (window.initializeUserSession && typeof window.initializeUserSession === 'function') {
        await window.initializeUserSession(user);
        console.log('window.initializeUserSession completed for SimpleAuthManager.createUserProfile');
      } else {
        console.error('Error: window.initializeUserSession is not defined or not a function. User profile creation might be incomplete.');
        // Fallback or detailed error for debugging
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            console.log("Fallback: User profile does not exist, attempting basic creation.");
            // Basic data, ideally user-management.js handles richer profile data with userType
            await userRef.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                photoURL: user.photoURL || null,
                // 'sf-user-type' should be read by initializeUserSession or its downstream functions
            });
        } else {
            await userRef.update({ lastLoginAt: firebase.firestore.FieldValue.serverTimestamp() });
        }
      }
    } catch (error) {
      console.error('Error in SimpleAuthManager.createUserProfile calling user-management.js or fallback:', error);
      // Optionally, re-throw or handle more gracefully
    }
  }

  generatePassportId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `SF-${year}-${randomNum}`;
  }

  updateUI(user) {
    const signupForm = document.querySelector('.signup-form');
    
    if (user && signupForm) {
      // User is signed in - update the form
      signupForm.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="margin-bottom: 20px;">
            <img src="${user.photoURL || '/default-avatar.png'}" alt="Profile" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid #003554;">
          </div>
          <h3 style="color: #003554; margin-bottom: 10px;">Welcome, ${user.displayName || user.email}!</h3>
          <p style="margin-bottom: 20px;">You're now part of the SociallyFounded community.</p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <a href="passport.html" style="padding: 10px 20px; background: #003554; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View Passport</a>
            <button onclick="window.authManager.signOut()" style="padding: 10px 20px; background: white; color: #003554; border: 2px solid #003554; border-radius: 6px; font-weight: 500; cursor: pointer;">Sign Out</button>
          </div>
        </div>
      `;
    }
  }

  async signOut() {
    try {
      await auth.signOut();
      this.showNotification('Successfully signed out!', 'success');
      
      // Reload the page to reset the form
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Sign-out error:', error);
      this.showNotification('Failed to sign out. Please try again.', 'error');
    }
  }

  // Utility methods
  showLoadingState() {
    // Add loading state to social buttons
    document.querySelectorAll('.social-button').forEach(btn => {
      btn.style.opacity = '0.6';
      btn.style.pointerEvents = 'none';
    });
  }

  hideLoadingState() {
    document.querySelectorAll('.social-button').forEach(btn => {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    });
  }

  showModalLoading() {
    const formDiv = document.getElementById('email-form');
    const loadingDiv = document.getElementById('loading-state');
    if (formDiv && loadingDiv) {
      formDiv.style.display = 'none';
      loadingDiv.style.display = 'block';
    }
  }

  hideModalLoading() {
    const formDiv = document.getElementById('email-form');
    const loadingDiv = document.getElementById('loading-state');
    if (formDiv && loadingDiv) {
      formDiv.style.display = 'block';
      loadingDiv.style.display = 'none';
    }
  }

  closeModal() {
    const modal = document.querySelector('[style*="position: fixed"][style*="z-index: 10000"]');
    if (modal) {
      modal.remove();
    }
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      backgroundColor: bgColor,
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: '500',
      zIndex: '10001',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      wordWrap: 'break-word',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  showPhoneModal() {
    // Close any existing modal first, especially the email one if it's open
    const existingEmailModal = document.querySelector('[style*="z-index: 10000"]');
    if (existingEmailModal && existingEmailModal.querySelector('#email-input')) {
        existingEmailModal.remove();
    }

    const modalId = 'phone-auth-modal';
    // Check if phone modal already exists
    if (document.getElementById(modalId)) {
        return; // Modal already open
    }

    const modalHTML = `
      <div id="${modalId}" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; font-family: 'Poppins', sans-serif;">
        <div style="background: white; border-radius: 12px; width: 90%; max-width: 420px; padding: 30px; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
          <button id="close-phone-modal-btn" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
          <h2 style="text-align: center; margin-bottom: 20px; color: #003554;">Sign In with Phone</h2>

          <div id="phone-input-section-modal">
            <p style="margin-bottom: 10px; font-size: 14px; color: #555;">Enter your phone number (with country code, e.g., +14155552671):</p>
            <input type="tel" id="phone-number-input-modal" placeholder="e.g., +14155552671" style="width: 100%; padding: 12px; border: 2px solid #E0E0E0; border-radius: 8px; font-size: 16px; box-sizing: border-box; margin-bottom: 10px;">
            <div id="recaptcha-container-modal" style="margin-bottom: 15px; display: flex; justify-content: center;"></div>
            <button id="send-otp-btn-modal" style="width: 100%; padding: 12px; background: #003554; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">Send OTP</button>
          </div>

          <div id="otp-input-section-modal" style="display: none;">
            <p style="margin-bottom: 10px; font-size: 14px; color: #555;">Enter the OTP sent to your phone:</p>
            <input type="text" id="otp-input-modal" placeholder="Enter OTP" style="width: 100%; padding: 12px; border: 2px solid #E0E0E0; border-radius: 8px; font-size: 16px; box-sizing: border-box; margin-bottom: 10px;" autocomplete="one-time-code">
            <button id="submit-otp-btn-modal" style="width: 100%; padding: 12px; background: #005073; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">Submit OTP</button>
          </div>

          <div id="phone-loading-state-modal" style="display: none; text-align: center; padding: 20px;">
            <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #003554; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 10px;">Loading...</p>
          </div>
          <p id="phone-auth-error-modal" style="color:red; text-align:center; margin-top:15px; font-size:14px; min-height: 18px;"></p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('close-phone-modal-btn').addEventListener('click', () => this.closeModal(modalId));
    document.getElementById('send-otp-btn-modal').addEventListener('click', () => this.sendOtp());
    document.getElementById('submit-otp-btn-modal').addEventListener('click', () => this.confirmOtp());

    setTimeout(() => {
      try {
        if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
            window.recaptchaVerifier.clear(); // Clear previous instance if any
        }
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-modal', {
          'size': 'invisible',
          'callback': (response) => {
            console.log("reCAPTCHA solved (invisible):", response);
          },
          'expired-callback': () => {
            this.showNotification('reCAPTCHA challenge expired. Please try sending OTP again.', 'error');
            localStorage.removeItem('sf-auth-in-progress');
            const sendOtpBtn = document.getElementById('send-otp-btn-modal');
            if(sendOtpBtn) sendOtpBtn.disabled = false;
            this.hideModalLoading('phone-input-section-modal', 'phone-loading-state-modal');
          }
        });
        window.recaptchaVerifier.render().then((widgetId) => {
            window.recaptchaWidgetId = widgetId;
        }).catch(err => {
          console.error("Recaptcha render error:", err);
          const errorP = document.getElementById('phone-auth-error-modal');
          if(errorP) errorP.textContent = 'Failed to initialize reCAPTCHA. Refresh & try again.';
          this.showNotification('Failed to initialize reCAPTCHA. Refresh & try again.', 'error');
        });
      } catch(e) {
          console.error("Error setting up reCAPTCHA: ", e);
          const errorP = document.getElementById('phone-auth-error-modal');
          if(errorP) errorP.textContent = 'Error with reCAPTCHA setup. Refresh & try again.';
      }
    }, 150);
  }

  showModalLoading(formId = 'email-form', loadingId = 'loading-state') {
    const formDiv = document.getElementById(formId);
    const loadingDiv = document.getElementById(loadingId);
    const errorPPhone = document.getElementById('phone-auth-error-modal'); // Specific to phone modal
    const errorPEmail = document.querySelector('#email-form + p'); // Assuming error p is sibling for email

    if (formDiv) formDiv.style.display = 'none';
    if (loadingDiv) loadingDiv.style.display = 'block';

    if (errorPPhone) errorPPhone.textContent = '';
    if (errorPEmail) errorPEmail.textContent = '';
  }

  hideModalLoading(formId = 'email-form', loadingId = 'loading-state') {
    const formDiv = document.getElementById(formId);
    const loadingDiv = document.getElementById(loadingId);
    if (formDiv) formDiv.style.display = 'block';
    if (loadingDiv) loadingDiv.style.display = 'none';
  }

  async sendOtp() {
    const phoneNumberInput = document.getElementById('phone-number-input-modal');
    const errorP = document.getElementById('phone-auth-error-modal');
    if (!phoneNumberInput || !errorP) return;

    const phoneNumber = phoneNumberInput.value.trim();
    errorP.textContent = '';

    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      errorP.textContent = 'Invalid phone number. Use format +[countrycode][number].';
      this.showNotification('Invalid phone number format.', 'error');
      return;
    }

    localStorage.setItem('sf-auth-in-progress', 'true');
    this.showModalLoading('phone-input-section-modal', 'phone-loading-state-modal');
    document.getElementById('send-otp-btn-modal').disabled = true;

    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      this.showNotification('OTP sent successfully!', 'success');

      document.getElementById('phone-input-section-modal').style.display = 'none';
      document.getElementById('otp-input-section-modal').style.display = 'block';
      this.hideModalLoading('otp-input-section-modal', 'phone-loading-state-modal');
      document.getElementById('otp-input-modal').focus();
      document.getElementById('send-otp-btn-modal').disabled = false; // Re-enable for retries if needed later
    } catch (error) {
      console.error('Error sending OTP:', error);
      errorP.textContent = `Error sending OTP: ${this.getErrorMessage(error.code, error.message)}`;
      this.showNotification(`Error sending OTP: ${this.getErrorMessage(error.code, error.message)}`, 'error');
      localStorage.removeItem('sf-auth-in-progress');
      document.getElementById('send-otp-btn-modal').disabled = false;
      this.hideModalLoading('phone-input-section-modal', 'phone-loading-state-modal');
      if (appVerifier && typeof appVerifier.clear === 'function') {
        appVerifier.clear(); // Clear the current verifier to allow re-rendering/re-attempt
      }
       // Re-initialize recaptcha on certain errors
      if (error.code === 'auth/captcha-check-failed' || error.code === 'auth/invalid-recaptcha-token') {
        // This re-initialization might be aggressive, test thoroughly
        setTimeout(() => {
            try {
                window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container-modal', { 'size': 'invisible', 'expired-callback': () => { /* ... */ } });
                window.recaptchaVerifier.render().catch(e => console.error("Re-render failed", e));
            } catch (e) { console.error("Error re-init recaptcha", e); }
        }, 200);
      }
    }
  }

  async confirmOtp() {
    const otpInput = document.getElementById('otp-input-modal');
    const errorP = document.getElementById('phone-auth-error-modal');
    if (!otpInput || !errorP) return;

    const code = otpInput.value.trim();
    errorP.textContent = '';

    if (!code.match(/^\d{6}$/)) {
      errorP.textContent = 'Please enter a valid 6-digit OTP.';
      this.showNotification('Invalid OTP format.', 'error');
      return;
    }

    if (!window.confirmationResult) {
      errorP.textContent = 'OTP confirmation context lost. Please resend OTP.';
      this.showNotification('OTP confirmation context lost. Please resend OTP.', 'error');
      localStorage.removeItem('sf-auth-in-progress');
      document.getElementById('otp-input-section-modal').style.display = 'none';
      document.getElementById('phone-input-section-modal').style.display = 'block';
      document.getElementById('send-otp-btn-modal').disabled = false;
      this.hideModalLoading('phone-input-section-modal', 'phone-loading-state-modal');
      return;
    }

    this.showModalLoading('otp-input-section-modal', 'phone-loading-state-modal');
    document.getElementById('submit-otp-btn-modal').disabled = true;

    try {
      const result = await window.confirmationResult.confirm(code);
      console.log('Phone number authentication successful:', result.user);
      this.closeModal('phone-auth-modal');
    } catch (error) {
      console.error('Error confirming OTP:', error);
      errorP.textContent = `Error confirming OTP: ${this.getErrorMessage(error.code, error.message)}`;
      this.showNotification(`Error confirming OTP: ${this.getErrorMessage(error.code, error.message)}`, 'error');

      // If OTP is wrong, allow retry, don't clear sf-auth-in-progress unless it's a fatal error for this attempt.
      if (error.code === 'auth/invalid-verification-code') {
        otpInput.value = ''; // Clear input for retry
        otpInput.focus();
      } else if (error.code === 'auth/code-expired') {
        // Force resend OTP
        localStorage.removeItem('sf-auth-in-progress');
        document.getElementById('otp-input-section-modal').style.display = 'none';
        document.getElementById('phone-input-section-modal').style.display = 'block';
        document.getElementById('send-otp-btn-modal').disabled = false;
        errorP.textContent = 'OTP expired. Please send a new one.';
      } else {
        // For other errors, potentially clear flag and reset
        localStorage.removeItem('sf-auth-in-progress');
      }
      document.getElementById('submit-otp-btn-modal').disabled = false;
      this.hideModalLoading('otp-input-section-modal', 'phone-loading-state-modal');
    }
  }

  closeModal(modalId = null) {
    let modalToRemove;
    if (modalId) {
      modalToRemove = document.getElementById(modalId);
    } else {
      // Fallback for the email modal if no ID is passed (original behavior)
      modalToRemove = document.querySelector('div[style*="z-index: 10000"]');
      if (modalToRemove && !modalToRemove.id) { // Ensure it's likely the generic email modal
         // No specific cleanup needed for email modal beyond removing it
      } else if (modalToRemove && modalToRemove.id !== 'phone-auth-modal') {
         // If it's some other modal, just remove it
      } else {
        // If modalId was not passed, but a phone modal was found, do not remove it here
        // This function should primarily target the modalId passed or the generic email one
        if(modalToRemove && modalToRemove.id === 'phone-auth-modal') modalToRemove = null;
      }
    }

    if (modalToRemove) {
      modalToRemove.remove();
    }

    // Specific cleanup for phone modal resources if it's the one being closed
    if (modalId === 'phone-auth-modal' || (!modalId && !modalToRemove)) { // If phone modal was implicitly targeted or explicitly
        const phoneModalStillExists = document.getElementById('phone-auth-modal');
        if (phoneModalStillExists) phoneModalStillExists.remove(); // ensure removal if targeted by generic selector

        if (window.recaptchaVerifier) {
            if (typeof window.recaptchaVerifier.clear === 'function') {
                 window.recaptchaVerifier.clear(); // Clears the reCAPTCHA widget
            }
            window.recaptchaVerifier = null; // Allow re-initialization
            console.log("Recaptcha verifier instance cleared.");
        }
        const recaptchaContainer = document.getElementById('recaptcha-container-modal');
        if (recaptchaContainer) {
            recaptchaContainer.innerHTML = ''; // Clear the container physically
        }
        if (window.confirmationResult) {
            window.confirmationResult = null;
            console.log("Cleared window.confirmationResult.");
        }
    }
  }

  getErrorMessage(errorCode, defaultMessage = 'An error occurred. Please try again.') {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many requests. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.',
      'auth/invalid-phone-number': 'Invalid phone number format. Please include the country code (e.g., +1).',
      'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.',
      'auth/missing-phone-number': 'Please enter a phone number.',
      'auth/quota-exceeded': 'SMS quota exceeded. Please try again later or contact support.',
      'auth/code-expired': 'The OTP has expired. Please request a new one.',
      'auth/invalid-verification-code': 'Invalid OTP. Please check the code and try again.'
    };

    return errorMessages[errorCode] || defaultMessage;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add CSS for spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  // Create global auth manager instance
  window.authManager = new SimpleAuthManager();
  console.log('Firebase authentication initialized');
});

// Export for global access
window.firebase = firebase;
window.auth = auth;
window.db = db;
