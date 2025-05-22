// firebase-simple.js
// Simple Firebase setup using CDN (no modules needed)
// Create this file as an alternative to the ES6 module version

// This script should be loaded AFTER Firebase CDN scripts
// Add these script tags to your HTML head BEFORE this file:
/*
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>
*/

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
appleProvider.setCustomParameters({
  'locale': 'en'
});

// Simple Authentication Manager
class SimpleAuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.updateUI(user);
      
      if (user) {
        console.log('User signed in:', user.displayName || user.email);
        this.createUserProfile(user);
        this.showNotification('Welcome back!', 'success');
      } else {
        console.log('User signed out');
      }
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Google sign-in
      if (e.target.matches('.social-button[data-provider="google"]') || 
          e.target.closest('.social-button[data-provider="google"]')) {
        e.preventDefault();
        this.signInWithGoogle();
      }
      
      // Apple sign-in
      if (e.target.matches('.social-button[data-provider="apple"]') || 
          e.target.closest('.social-button[data-provider="apple"]')) {
        e.preventDefault();
        this.signInWithApple();
      }
      
      // Email sign-in modal
      if (e.target.matches('.social-button[data-provider="email"]') || 
          e.target.closest('.social-button[data-provider="email"]')) {
        e.preventDefault();
        this.showEmailModal();
      }
    });
  }

  async signInWithGoogle() {
    try {
      this.showLoadingState();
      const result = await auth.signInWithPopup(googleProvider);
      console.log('Google sign-in successful:', result.user);
      this.showNotification('Successfully signed in with Google!', 'success');
    } catch (error) {
      console.error('Google sign-in error:', error);
      this.showNotification('Failed to sign in with Google. Please try again.', 'error');
    } finally {
      this.hideLoadingState();
    }
  }

  async signInWithApple() {
    try {
      this.showLoadingState();
      const result = await auth.signInWithPopup(appleProvider);
      console.log('Apple sign-in successful:', result.user);
      this.showNotification('Successfully signed in with Apple!', 'success');
    } catch (error) {
      console.error('Apple sign-in error:', error);
      this.showNotification('Failed to sign in with Apple. Please try again.', 'error');
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
    
    try {
      this.showModalLoading();
      const result = await auth.signInWithEmailAndPassword(email, password);
      console.log('Email sign-in successful:', result.user);
      this.showNotification('Successfully signed in!', 'success');
      this.closeModal();
    } catch (error) {
      console.error('Email sign-in error:', error);
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
    
    try {
      this.showModalLoading();
      const result = await auth.createUserWithEmailAndPassword(email, password);
      console.log('Account creation successful:', result.user);
      this.showNotification('Account created successfully!', 'success');
      this.closeModal();
    } catch (error) {
      console.error('Account creation error:', error);
      this.showNotification(this.getErrorMessage(error.code), 'error');
    } finally {
      this.hideModalLoading();
    }
  }

  async createUserProfile(user) {
    try {
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        const passportId = this.generatePassportId();
        
        const userData = {
          uid: user.uid,
          displayName: user.displayName || user.email,
          email: user.email,
          photoURL: user.photoURL,
          passportId: passportId,
          level: 'Explorer',
          levelNumber: 1,
          experience: 0,
          checkInCount: 0,
          venueCount: 0,
          ideaCount: 0,
          connectionCount: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await userRef.set(userData);
        console.log('User profile created successfully');
      } else {
        await userRef.update({
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('User profile updated');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
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
