<!-- Email Authentication Modal -->
<div id="email-auth-modal" class="auth-modal" style="display: none;">
    <div class="auth-modal-content">
        <span class="auth-close" onclick="closeEmailAuthModal()">&times;</span>
        
        <div class="auth-header">
            <img src="favicon.svg" alt="SociallyFounded" style="width: 50px; height: 50px; margin-bottom: 10px;">
            <h2>Welcome to SociallyFounded</h2>
        </div>
        
        <!-- Tab Navigation -->
        <div class="auth-tabs">
            <button class="auth-tab active" onclick="switchAuthTab('signin')">Sign In</button>
            <button class="auth-tab" onclick="switchAuthTab('signup')">Sign Up</button>
        </div>
        
        <!-- Sign In Form -->
        <div id="signin-form" class="auth-form-container">
            <form onsubmit="handleEmailSignIn(event)">
                <div class="form-group">
                    <label for="signin-email">Email Address</label>
                    <input type="email" id="signin-email" required placeholder="founder@example.com">
                </div>
                
                <div class="form-group">
                    <label for="signin-password">Password</label>
                    <input type="password" id="signin-password" required placeholder="Enter your password" minlength="6">
                </div>
                
                <div class="form-group">
                    <a href="#" onclick="showForgotPassword()" class="forgot-password-link">Forgot your password?</a>
                </div>
                
                <button type="submit" class="auth-submit-btn">
                    <span class="btn-text">Sign In</span>
                    <span class="btn-loading" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i> Signing in...
                    </span>
                </button>
                
                <div class="auth-error" id="signin-error" style="display: none;"></div>
            </form>
        </div>
        
        <!-- Sign Up Form -->
        <div id="signup-form" class="auth-form-container" style="display: none;">
            <form onsubmit="handleEmailSignUp(event)">
                <div class="form-group">
                    <label for="signup-name">Full Name</label>
                    <input type="text" id="signup-name" required placeholder="Jane Founder">
                </div>
                
                <div class="form-group">
                    <label for="signup-email">Email Address</label>
                    <input type="email" id="signup-email" required placeholder="founder@example.com">
                </div>
                
                <div class="form-group">
                    <label for="signup-password">Password</label>
                    <input type="password" id="signup-password" required placeholder="Create a password" minlength="6">
                    <small class="form-hint">Minimum 6 characters</small>
                </div>
                
                <div class="form-group">
                    <label for="signup-confirm-password">Confirm Password</label>
                    <input type="password" id="signup-confirm-password" required placeholder="Confirm your password">
                </div>
                
                <button type="submit" class="auth-submit-btn">
                    <span class="btn-text">Create Account</span>
                    <span class="btn-loading" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i> Creating account...
                    </span>
                </button>
                
                <div class="auth-error" id="signup-error" style="display: none;"></div>
                
                <p class="auth-terms">
                    By signing up, you agree to our <a href="#" target="_blank">Terms of Service</a> 
                    and <a href="#" target="_blank">Privacy Policy</a>
                </p>
            </form>
        </div>
        
        <!-- Forgot Password Form -->
        <div id="forgot-password-form" class="auth-form-container" style="display: none;">
            <form onsubmit="handlePasswordReset(event)">
                <p class="auth-description">Enter your email address and we'll send you a link to reset your password.</p>
                
                <div class="form-group">
                    <label for="reset-email">Email Address</label>
                    <input type="email" id="reset-email" required placeholder="founder@example.com">
                </div>
                
                <button type="submit" class="auth-submit-btn">
                    <span class="btn-text">Send Reset Link</span>
                    <span class="btn-loading" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i> Sending...
                    </span>
                </button>
                
                <div class="auth-success" id="reset-success" style="display: none;">
                    <i class="fas fa-check-circle"></i> Password reset email sent! Check your inbox.
                </div>
                
                <div class="auth-error" id="reset-error" style="display: none;"></div>
                
                <div class="form-group" style="margin-top: 20px;">
                    <a href="#" onclick="switchAuthTab('signin')" class="back-to-signin">← Back to Sign In</a>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
/* Email Authentication Modal Styles */
.auth-modal {
    display: none;
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    overflow: auto;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.auth-modal-content {
    background-color: #ffffff;
    margin: 5% auto;
    padding: 0;
    width: 90%;
    max-width: 450px;
    border-radius: 12px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.auth-close {
    color: #666;
    float: right;
    font-size: 28px;
    font-weight: bold;
    padding: 15px 20px;
    cursor: pointer;
    transition: color 0.3s;
}

.auth-close:hover {
    color: #003554;
}

.auth-header {
    text-align: center;
    padding: 30px 20px 20px;
}

.auth-header h2 {
    color: #003554;
    margin: 0;
    font-size: 24px;
}

/* Tab Navigation */
.auth-tabs {
    display: flex;
    border-bottom: 2px solid #e0e0e0;
    margin: 0 30px;
}

.auth-tab {
    flex: 1;
    background: none;
    border: none;
    padding: 15px;
    font-size: 16px;
    cursor: pointer;
    color: #666;
    transition: all 0.3s;
    position: relative;
}

.auth-tab.active {
    color: #003554;
    font-weight: 600;
}

.auth-tab.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #003554;
}

/* Form Styles */
.auth-form-container {
    padding: 30px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.form-group input:focus {
    outline: none;
    border-color: #003554;
}

.form-hint {
    display: block;
    margin-top: 5px;
    color: #666;
    font-size: 13px;
}

.forgot-password-link {
    color: #003554;
    text-decoration: none;
    font-size: 14px;
}

.forgot-password-link:hover {
    text-decoration: underline;
}

.back-to-signin {
    color: #003554;
    text-decoration: none;
    font-size: 14px;
}

/* Submit Button */
.auth-submit-btn {
    width: 100%;
    padding: 14px;
    background-color: #003554;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 10px;
}

.auth-submit-btn:hover {
    background-color: #002540;
}

.auth-submit-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.btn-loading {
    display: none;
}

/* Messages */
.auth-error {
    margin-top: 15px;
    padding: 12px;
    background-color: #fee;
    border: 1px solid #fcc;
    color: #c33;
    border-radius: 6px;
    font-size: 14px;
}

.auth-success {
    margin-top: 15px;
    padding: 12px;
    background-color: #efe;
    border: 1px solid #cfc;
    color: #363;
    border-radius: 6px;
    font-size: 14px;
}

.auth-description {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
}

.auth-terms {
    margin-top: 20px;
    font-size: 13px;
    color: #666;
    text-align: center;
}

.auth-terms a {
    color: #003554;
    text-decoration: none;
}

.auth-terms a:hover {
    text-decoration: underline;
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
    .auth-modal-content {
        margin: 10% auto;
        width: 95%;
    }
    
    .auth-form-container {
        padding: 20px;
    }
}
</style>
