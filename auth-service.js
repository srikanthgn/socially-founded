// auth-service.js
// Authentication service for SociallyFounded
// Create this file in your root directory

import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, appleProvider, db } from './firebase-config.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.notifyAuthStateListeners(user);
    });
  }

  // Add auth state listener
  addAuthStateListener(callback) {
    this.authStateListeners.push(callback);
  }

  // Remove auth state listener
  removeAuthStateListener(callback) {
    this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
  }

  // Notify all listeners of auth state changes
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => callback(user));
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create or update user profile in Firestore
      await this.createUserProfile(user);
      
      return {
        success: true,
        user: user,
        message: 'Successfully signed in with Google!'
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to sign in with Google. Please try again.'
      };
    }
  }

  // Sign in with Apple
  async signInWithApple() {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      
      // Create or update user profile in Firestore
      await this.createUserProfile(user);
      
      return {
        success: true,
        user: user,
        message: 'Successfully signed in with Apple!'
      };
    } catch (error) {
      console.error('Apple sign-in error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to sign in with Apple. Please try again.'
      };
    }
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: result.user,
        message: 'Successfully signed in!'
      };
    } catch (error) {
      console.error('Email sign-in error:', error);
      return {
        success: false,
        error: error.message,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Create account with email and password
  async createAccountWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update display name
      await updateProfile(user, {
        displayName: displayName
      });

      // Create user profile in Firestore
      await this.createUserProfile(user, { displayName });
      
      return {
        success: true,
        user: user,
        message: 'Account created successfully!'
      };
    } catch (error) {
      console.error('Account creation error:', error);
      return {
        success: false,
        error: error.message,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Successfully signed out!'
      };
    } catch (error) {
      console.error('Sign-out error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to sign out. Please try again.'
      };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Create user profile in Firestore
  async createUserProfile(user, additionalData = {}) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Generate unique passport ID
        const passportId = this.generatePassportId();
        
        const userData = {
          uid: user.uid,
          displayName: user.displayName || additionalData.displayName,
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
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          ...additionalData
        };

        await setDoc(userRef, userData);
        console.log('User profile created successfully');
      } else {
        // Update last login time for existing users
        await setDoc(userRef, {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
        console.log('User profile updated');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Generate unique passport ID
  generatePassportId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `SF-${year}-${randomNum}`;
  }

  // Get user-friendly error messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
      'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.'
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get user profile from Firestore
  async getUserProfile() {
    if (!this.currentUser) return null;
    
    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log('No user profile found');
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
