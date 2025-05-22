// auth-ui.js
// Authentication UI management for SociallyFounded
// Create this file in your root directory

import authService from './auth-service.js';

class AuthUI {
  constructor() {
    this.currentModal = null;
    this.init();
  }

  init() {
    // Listen for auth state changes
    authService.addAuthStateListener((user) => {
      this.handleAuthStateChange(user);
    });

    // Set up event listeners when DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Social login buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.social-button[data-provider="google"]') || 
          e.target.closest('.social-button[data-provider="google"]')) {
        e.preventDefault();
        this.handleGoogleSignIn();
      }
      
      if (e.target.matches('.social-button[data-provider="apple"]') || 
          e.target.closest('.social-button[data-provider="apple"]')) {
        e.preventDefault();
        this.handleAppleSignIn();
      }
      
      if (e.target.matches('.social-button[data-provider="email"]') || 
          e.target.closest('.social-button[data-provider="email"]')) {
        e.preventDefault();
        this.showEmailAuthModal();
      }

      // Auth modal buttons
      if (e.target.matches('#email-signin-btn')) {
        e.preventDefault();
        this.handleEmailSignIn();
      }
      
      if (e.target.matches('#email-signup-btn')) {
        e.preventDefault();
        this.handleEmailSignUp();
      }
      
      if (e.target.matches('#forgot-password-btn')) {
        e.preventDefault();
        this.handleForgotPassword();
      }
      
      if (e.target.matches('#close-auth-modal') || e.target.matches('.auth-modal-overlay')) {
        this.closeAuthModal();
      }
      
      if (e.target.matches('#toggle-auth-mode')) {
        this.toggleAuthMode();
      }
      
      if (e.target.matches('#sign-out-btn')) {
        e.preventDefault();
        this.handleSignOut();
      }
    });
  }

  // Handle Google sign-in
  async handleGoogleSignIn() {
    this.showLoadingState('Signing in with Google...');
    
    const result = await authService.signInWithGoogle();
    
    if (result.success) {
      this.showSuccessMessage(result.message);
      this.closeAuthModal();
    } else {
      this.showErrorMessage(result.message);
    }
    
    this.hideLoadingState();
  }

  // Handle Apple sign-in
  async handleAppleSignIn() {
    this.showLoadingState('Signing in with Apple...');
    
    const result = await authService.signInWithApple();
    
    if (result.success) {
      this.showSuccessMessage(result.message);
      this.closeAuthModal();
    } else {
      this.showErrorMessage(result.message);
    }
    
    this.hideLoadingState();
  }

  // Handle email sign-in
  async handleEmailSignIn() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    if (!email || !password) {
      this.showErrorMessage('Please fill in all fields.');
      return;
    }
    
    this.showLoadingState('Signing in...');
    
    const result = await authService.signInWithEmail(email, password);
    
    if (result.success) {
      this.showSuccessMessage(result.message);
      this.closeAuthModal();
    } else {
      this.showErrorMessage(result.message);
    }
    
    this.hideLoadingState();
  }

  // Handle email sign-up
  async handleEmailSignUp() {
    const name = document.getElementById('auth-name').value;
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    if (!name || !email || !password) {
      this.showErrorMessage('Please fill in all fields.');
      return;
    }
    
    this.showLoadingState('Creating account...');
    
    const result = await authService.createAccountWithEmail(email, password, name);
    
    if (result.success) {
      this.showSuccessMessage(result.message);
      this.closeAuthModal();
    } else {
      this.showErrorMessage(result.message);
    }
    
    this.hideLoadingState();
  }

  // Handle forgot password
  async handleForgotPassword() {
    const email = document.getElementById('auth-email').value;
    
    if (!email) {
      this.showErrorMessage('Please enter your email address first.');
      return;
    }
    
    this.showLoadingState('Sending reset email...');
    
    const result = await authService.resetPassword(email);
    
    if (result.success) {
      this.showSuccessMessage(result.message);
    } else {
      this.showErrorMessage(result.message);
    }
    
    this.hideLoadingState();
  }

  // Handle sign out
  async handleSignOut() {
    const result = await authService.signOut();
    
    if (result.success) {
      this.showSuccessMessage(result.message);
    } else {
      this.showErrorMessage(result.message);
    }
  }

  // Show email authentication modal
  showEmailAuthModal() {
    const modal = this.createAuthModal();
    document.body.appendChild(modal);
    this.currentModal = modal;
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Focus on email input
    setTimeout(() => {
      document.getElementById('auth-email').focus();
    }, 100);
  }

  // Create authentication modal
  createAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal-overlay';
    modal.innerHTML = `
      <div class="auth-modal">
        <div class="auth-modal-header">
          <h2 id="auth-modal-title">Sign In</h2>
          <button id="close-auth-modal" class="close-btn">&times;</button>
        </div>
        
        <div class="auth-modal-body">
          <form id="auth-form">
            <div class="form-group" id="name-group" style="display: none;">
              <label for="auth-name">Full Name</label>
              <input type="text" id="auth-name" placeholder="Enter your full name">
            </div>
            
            <div class="form-group">
              <label for="auth-email">Email Address</label>
              <input type="email" id="auth-email" placeholder="Enter your email" required>
            </div>
            
            <div class="form-group">
              <label for="auth-password">Password</label>
              <input type="password" id="auth-password" placeholder="Enter your password" required>
            </div>
            
            <div class="auth-actions">
              <button type="submit" id="email-signin-btn" class="auth-btn primary">Sign In</button>
              <button type="button" id="email-signup-btn" class="auth-btn secondary" style="display: none;">Create Account</button>
            </div>
            
            <div class="auth-links">
              <button type="button" id="forgot-password-btn" class="link-btn">Forgot Password?</button>
              <button type="button" id="toggle-auth-mode" class="link-btn">Need an account? Sign up</button>
            </div>
          </form>
        </div>
        
        <div class="loading-overlay" style="display: none;">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading...</div>
        </div>
      </div>
    `;
    
    return modal;
  }

  // Toggle between sign-in and sign-up modes
  toggleAuthMode() {
    const title = document.getElementById('auth-modal-title');
    const nameGroup = document.getElementById('name-group');
    const signInBtn = document.getElementById('email-signin-btn');
    const signUpBtn = document.getElementById('email-signup-btn');
    const toggleBtn = document.getElementById('toggle-auth-mode');
    
    if (signInBtn.style.display !== 'none') {
      // Switch to sign-up mode
      title.textContent = 'Create Account';
      nameGroup.style.display = 'block';
      signInBtn.style.display = 'none';
      signUpBtn.style.display = 'block';
      toggleBtn.textContent = 'Already have an account? Sign in';
    } else {
      // Switch to sign-in mode
      title.textContent = 'Sign In';
      nameGroup.style.display = 'none';
      signInBtn.style.display = 'block';
      signUpBtn.style.display = 'none';
      toggleBtn.textContent = 'Need an account? Sign up';
    }
  }

  // Close authentication modal
  closeAuthModal() {
    if (this.currentModal) {
      document.body.removeChild(this.currentModal);
      this.currentModal = null;
      document.body.style.overflow = '';
    }
  }

  // Handle authentication state changes
  handleAuthStateChange(user) {
    if (user) {
      // User is signed in
      this.updateUIForSignedInUser(user);
    } else {
      // User is signed out
      this.updateUIForSignedOutUser();
    }
  }

  // Update UI for signed-in user
  updateUIForSignedInUser(user) {
    // Update social buttons to show user info
    this.updateSocialButtons(user);
    
    // Hide signup form if visible
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
      signupForm.style.display = 'none';
    }
    
    // Show user profile section
    this.showUserProfile(user);
  }

  // Update UI for signed-out user
  updateUIForSignedOutUser() {
    // Reset social buttons
    this.resetSocialButtons();
    
    // Show signup form
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
      signupForm.style.display = 'block';
    }
    
    // Hide user profile section
    this.hideUserProfile();
  }

  // Update social login buttons to show user status
  updateSocialButtons(user) {
    const socialButtons = document.querySelectorAll('.social-button');
    socialButtons.forEach(button => {
      const provider = button.getAttribute('data-provider');
      if (!provider) return;
      
      // Update button appearance for signed-in state
      button.innerHTML = `
        <img src="${user.photoURL || '/default-avatar.png'}" alt="Profile" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 8px;">
        <span>Signed in as ${user.displayName || user.email}</span>
        <button id="sign-out-btn" style="margin-left: 10px; background: none; border: 1px solid #ccc; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Sign Out</button>
      `;
    });
  }

  // Reset social buttons to original state
  resetSocialButtons() {
    // This would reset the buttons to their original signup state
    // Implementation depends on your specific button structure
  }

  // Show user profile section
  showUserProfile(user) {
    // Create or update user profile display
    // Implementation depends on where you want to show user info
  }

  // Hide user profile section
  hideUserProfile() {
    // Hide user profile display
  }

  // Show loading state
  showLoadingState(message = 'Loading...') {
    if (this.currentModal) {
      const loadingOverlay = this.currentModal.querySelector('.loading-overlay');
      const loadingText = this.currentModal.querySelector('.loading-text');
      
      if (loadingOverlay && loadingText) {
        loadingText.textContent = message;
        loadingOverlay.style.display = 'flex';
      }
    }
  }

  // Hide loading state
  hideLoadingState() {
    if (this.currentModal) {
      const loadingOverlay = this.currentModal.querySelector('.loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
    }
  }

  // Show success message
  showSuccessMessage(message) {
    this.showNotification(message, 'success');
  }

  // Show error message
  showErrorMessage(message) {
    this.showNotification(message, 'error');
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: '500',
      zIndex: '10000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
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

// Initialize AuthUI
const authUI = new AuthUI();
export default authUI;
