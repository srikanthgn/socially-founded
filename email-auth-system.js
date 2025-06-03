// Email Authentication Implementation for SociallyFounded

// Modal Control Functions
function showEmailAuthModal() {
    document.getElementById('email-auth-modal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeEmailAuthModal() {
    document.getElementById('email-auth-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    clearEmailForms();
}

// Tab Switching
function switchAuthTab(tab) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    // Hide all forms
    document.getElementById('signin-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'none';
    
    // Show selected form and activate tab
    if (tab === 'signin') {
        document.getElementById('signin-form').style.display = 'block';
        tabs[0].classList.add('active');
    } else if (tab === 'signup') {
        document.getElementById('signup-form').style.display = 'block';
        tabs[1].classList.add('active');
    }
    
    // Clear any error messages
    clearErrors();
}

// Show forgot password form
function showForgotPassword() {
    document.getElementById('signin-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'block';
    
    // Hide tabs when showing forgot password
    document.querySelector('.auth-tabs').style.display = 'none';
}

// Sign In Handler
async function handleEmailSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const submitBtn = event.target.querySelector('.auth-submit-btn');
    const errorDiv = document.getElementById('signin-error');
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    errorDiv.style.display = 'none';
    
    try {
        // Sign in with Firebase
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('Email sign in successful:', userCredential.user.uid);
        
        // Close modal and redirect to passport
        closeEmailAuthModal();
        window.location.href = '/passport.html';
        
    } catch (error) {
        console.error('Email sign in error:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
        }
        
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Sign Up Handler
async function handleEmailSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const submitBtn = event.target.querySelector('.auth-submit-btn');
    const errorDiv = document.getElementById('signup-error');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    
    // Validate passwords match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    try {
        // Create user with Firebase
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log('Email sign up successful:', userCredential.user.uid);
        
        // Update user profile with name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        // Create user profile in Firestore
        if (window.createUserProfile) {
            await window.createUserProfile({
                uid: userCredential.user.uid,
                email: email,
                displayName: name,
                photoURL: null,
                phoneNumber: null
            });
        }
        
        // Close modal and redirect to passport
        closeEmailAuthModal();
        window.location.href = '/passport.html';
        
    } catch (error) {
        console.error('Email sign up error:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'An account already exists with this email address.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled.';
                break;
        }
        
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Password Reset Handler
async function handlePasswordReset(event) {
    event.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    const submitBtn = event.target.querySelector('.auth-submit-btn');
    const errorDiv = document.getElementById('reset-error');
    const successDiv = document.getElementById('reset-success');
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    try {
        // Send password reset email
        await firebase.auth().sendPasswordResetEmail(email);
        console.log('Password reset email sent to:', email);
        
        // Show success message
        successDiv.style.display = 'block';
        
        // Clear the form
        document.getElementById('reset-email').value = '';
        
        // Switch back to sign in after 3 seconds
        setTimeout(() => {
            switchAuthTab('signin');
            document.querySelector('.auth-tabs').style.display = 'flex';
        }, 3000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        
        // Show user-friendly error messages
        let errorMessage = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many requests. Please try again later.';
                break;
        }
        
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Helper Functions
function setButtonLoading(button, isLoading) {
    const textSpan = button.querySelector('.btn-text');
    const loadingSpan = button.querySelector('.btn-loading');
    
    if (isLoading) {
        textSpan.style.display = 'none';
        loadingSpan.style.display = 'inline';
        button.disabled = true;
    } else {
        textSpan.style.display = 'inline';
        loadingSpan.style.display = 'none';
        button.disabled = false;
    }
}

function clearErrors() {
    document.getElementById('signin-error').style.display = 'none';
    document.getElementById('signup-error').style.display = 'none';
    document.getElementById('reset-error').style.display = 'none';
    document.getElementById('reset-success').style.display = 'none';
}

function clearEmailForms() {
    // Clear all form inputs
    document.getElementById('signin-email').value = '';
    document.getElementById('signin-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
    document.getElementById('reset-email').value = '';
    
    // Clear any messages
    clearErrors();
    
    // Reset to sign in tab
    switchAuthTab('signin');
    document.querySelector('.auth-tabs').style.display = 'flex';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('email-auth-modal');
    if (event.target === modal) {
        closeEmailAuthModal();
    }
}

// Update the email icon click handler
function updateEmailIconHandler() {
    // Find the email icon in the auth grid
    const authIcons = document.querySelectorAll('.auth-icon');
    authIcons.forEach(icon => {
        if (icon.innerHTML.includes('fa-envelope')) {
            icon.onclick = function(e) {
                e.preventDefault();
                showEmailAuthModal();
            };
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    updateEmailIconHandler();
});

console.log('Email authentication system loaded');
