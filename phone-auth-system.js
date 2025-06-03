// Phone Authentication System for SociallyFounded
// Handles both SMS and WhatsApp authentication

// Global variables
let phoneAuthVerifier = null;
let confirmationResult = null;
let useWhatsApp = false;

// Initialize reCAPTCHA verifier
function initializeRecaptcha() {
    // Create container if it doesn't exist
    let recaptchaContainer = document.getElementById('recaptcha-container');
    if (!recaptchaContainer) {
        recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = 'recaptcha-container';
        document.body.appendChild(recaptchaContainer);
    }
    
    // Clear any existing verifier
    if (phoneAuthVerifier) {
        phoneAuthVerifier.clear();
        phoneAuthVerifier = null;
    }
    
    try {
        phoneAuthVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
                console.log('reCAPTCHA expired, reinitializing...');
                phoneAuthVerifier = null;
            }
        });
        
        // Render it immediately
        phoneAuthVerifier.render().then((widgetId) => {
            console.log('reCAPTCHA widget rendered with ID:', widgetId);
        }).catch((error) => {
            console.error('Error rendering reCAPTCHA:', error);
        });
    } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
    }
}

// Show phone authentication form
function showPhoneAuth(isWhatsApp = false) {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('Firebase not loaded yet');
        showAuthError('Authentication system is still loading. Please try again in a moment.');
        return;
    }
    
    useWhatsApp = isWhatsApp;
    
    // Hide auth grid
    const authGrid = document.getElementById('authIconsGrid');
    if (authGrid) authGrid.style.display = 'none';
    
    // Show phone form
    const phoneForm = document.getElementById('phoneAuthForm');
    if (phoneForm) {
        phoneForm.style.display = 'block';
        phoneForm.innerHTML = createPhoneAuthForm(isWhatsApp);
        
        // Initialize country code selector
        initializeCountryCodeSelector();
        
        // Focus on phone input
        setTimeout(() => {
            const phoneInput = document.getElementById('phoneNumberInput');
            if (phoneInput) phoneInput.focus();
        }, 100);
    }
    
    // Initialize reCAPTCHA
    setTimeout(() => {
        initializeRecaptcha();
    }, 500);
}

// Hide phone authentication form
function hidePhoneAuth() {
    const authGrid = document.getElementById('authIconsGrid');
    const phoneForm = document.getElementById('phoneAuthForm');
    const otpContainer = document.getElementById('otpContainer');
    
    if (phoneForm) phoneForm.style.display = 'none';
    if (otpContainer) otpContainer.style.display = 'none';
    if (authGrid) authGrid.style.display = 'grid';
    
    // Clear any errors
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
}

// Create phone authentication form HTML
function createPhoneAuthForm(isWhatsApp) {
    const icon = isWhatsApp ? 'fab fa-whatsapp' : 'fas fa-mobile-alt';
    const title = isWhatsApp ? 'Sign in with WhatsApp' : 'Sign in with SMS';
    const subtitle = isWhatsApp 
        ? 'We\'ll send a verification code to your WhatsApp' 
        : 'We\'ll send a verification code via SMS';
    
    return `
        <div class="phone-auth-header">
            <i class="${icon}" style="font-size: 3rem; color: ${isWhatsApp ? '#25d366' : '#6c757d'}; margin-bottom: 1rem;"></i>
            <h3>${title}</h3>
            <p style="color: #666; margin-bottom: 1.5rem;">${subtitle}</p>
        </div>
        
        <form onsubmit="sendPhoneOTP(event)" style="width: 100%;">
            <div class="phone-input-group">
                <select id="countryCode" class="country-code-select">
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+7">🇷🇺 +7</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+27">🇿🇦 +27</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+46">🇸🇪 +46</option>
                </select>
                
                <input 
                    type="tel" 
                    id="phoneNumberInput" 
                    placeholder="Phone number"
                    required
                    pattern="[0-9]{7,15}"
                    title="Please enter a valid phone number"
                    class="phone-number-input"
                />
            </div>
            
            <button type="submit" class="auth-submit-btn" style="margin-top: 1rem;">
                <span class="btn-text">Send Verification Code</span>
                <span class="btn-loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i> Sending...
                </span>
            </button>
        </form>
        
        <button onclick="hidePhoneAuth()" class="back-btn" style="margin-top: 1rem;">
            ← Back to options
        </button>
    `;
}

// Initialize country code selector with user's location
function initializeCountryCodeSelector() {
    // Try to detect user's country (you can enhance this with IP geolocation)
    const countryCode = document.getElementById('countryCode');
    if (countryCode) {
        // Default to user's timezone or use geolocation API
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Simple mapping (enhance as needed)
        if (userTimezone.includes('America')) countryCode.value = '+1';
        else if (userTimezone.includes('London')) countryCode.value = '+44';
        else if (userTimezone.includes('India')) countryCode.value = '+91';
        else if (userTimezone.includes('Dubai')) countryCode.value = '+971';
        // Add more mappings as needed
    }
}

// Send OTP
async function sendPhoneOTP(event) {
    event.preventDefault();
    
    const countryCode = document.getElementById('countryCode').value;
    const phoneNumber = document.getElementById('phoneNumberInput').value;
    const fullPhoneNumber = countryCode + phoneNumber;
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 7) {
        showAuthError('Please enter a valid phone number');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('.auth-submit-btn');
    setButtonLoading(submitBtn, true);
    
    try {
        // Clear any previous errors
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) errorDiv.style.display = 'none';
        
        // Make sure reCAPTCHA is initialized
        if (!phoneAuthVerifier) {
            console.log('Initializing reCAPTCHA verifier...');
            initializeRecaptcha();
            
            // Wait a bit for initialization
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Send OTP
        console.log('Sending OTP to:', fullPhoneNumber);
        confirmationResult = await firebase.auth().signInWithPhoneNumber(fullPhoneNumber, phoneAuthVerifier);
        
        console.log('OTP sent successfully');
        
        // Show OTP input form
        showOTPInput(fullPhoneNumber);
        
    } catch (error) {
        console.error('Error sending OTP:', error);
        
        let errorMessage = 'Failed to send verification code. ';
        
        switch (error.code) {
            case 'auth/invalid-phone-number':
                errorMessage = 'Invalid phone number. Please check and try again.';
                break;
            case 'auth/missing-phone-number':
                errorMessage = 'Please enter a phone number.';
                break;
            case 'auth/quota-exceeded':
                errorMessage = 'Too many requests. Please try again later.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This phone number has been disabled.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Phone authentication is not enabled. Please contact support.';
                break;
            case 'auth/app-not-authorized':
                errorMessage = 'This app is not authorized to use Firebase Authentication. Please check your Firebase configuration.';
                break;
            default:
                errorMessage += error.message;
        }
        
        showAuthError(errorMessage);
        
        // Reset reCAPTCHA
        phoneAuthVerifier = null;
        initializeRecaptcha();
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Show OTP input form
function showOTPInput(phoneNumber) {
    const phoneForm = document.getElementById('phoneAuthForm');
    const otpContainer = document.getElementById('otpContainer');
    
    if (phoneForm) phoneForm.style.display = 'none';
    
    if (otpContainer) {
        otpContainer.style.display = 'block';
        otpContainer.innerHTML = createOTPForm(phoneNumber);
        
        // Auto-focus first OTP input
        setTimeout(() => {
            const firstInput = document.querySelector('.otp-digit-input');
            if (firstInput) firstInput.focus();
        }, 100);
        
        // Set up OTP input handling
        setupOTPInputs();
    }
}

// Create OTP form HTML
function createOTPForm(phoneNumber) {
    const maskedPhone = phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4);
    
    return `
        <div class="otp-verification">
            <h3>Verify Your Phone</h3>
            <p style="color: #666; margin-bottom: 1.5rem;">
                Enter the 6-digit code sent to<br>
                <strong>${maskedPhone}</strong>
            </p>
            
            <form onsubmit="verifyOTP(event)">
                <div class="otp-inputs">
                    <input type="text" class="otp-digit-input" maxlength="1" pattern="[0-9]" required>
                    <input type="text" class="otp-digit-input" maxlength="1" pattern="[0-9]" required>
                    <input type="text" class="otp-digit-input" maxlength="1" pattern="[0-9]" required>
                    <input type="text" class="otp-digit-input" maxlength="1" pattern="[0-9]" required>
                    <input type="text" class="otp-digit-input" maxlength="1" pattern="[0-9]" required>
                    <input type="text" class="otp-digit-input" maxlength="1" pattern="[0-9]" required>
                </div>
                
                <button type="submit" class="auth-submit-btn" style="margin-top: 1.5rem;">
                    <span class="btn-text">Verify</span>
                    <span class="btn-loading" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i> Verifying...
                    </span>
                </button>
            </form>
            
            <div class="otp-actions">
                <button onclick="resendOTP()" class="text-btn" style="margin-top: 1rem;">
                    Didn't receive code? Resend
                </button>
                <button onclick="hidePhoneAuth()" class="text-btn">
                    ← Change phone number
                </button>
            </div>
        </div>
    `;
}

// Set up OTP input handling
function setupOTPInputs() {
    const inputs = document.querySelectorAll('.otp-digit-input');
    
    inputs.forEach((input, index) => {
        // Handle input
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            
            if (value && index < inputs.length - 1) {
                // Move to next input
                inputs[index + 1].focus();
            }
            
            // Check if all inputs are filled
            const allFilled = Array.from(inputs).every(inp => inp.value);
            if (allFilled) {
                // Auto-submit
                const form = input.closest('form');
                if (form) form.dispatchEvent(new Event('submit'));
            }
        });
        
        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                // Move to previous input
                inputs[index - 1].focus();
            }
        });
        
        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').trim();
            
            if (/^\d{6}$/.test(pastedData)) {
                // Valid 6-digit code
                pastedData.split('').forEach((digit, i) => {
                    if (inputs[i]) inputs[i].value = digit;
                });
                
                // Submit form
                const form = input.closest('form');
                if (form) form.dispatchEvent(new Event('submit'));
            }
        });
    });
}

// Verify OTP
async function verifyOTP(event) {
    event.preventDefault();
    
    // Collect OTP from inputs
    const inputs = document.querySelectorAll('.otp-digit-input');
    const otp = Array.from(inputs).map(input => input.value).join('');
    
    if (otp.length !== 6) {
        showAuthError('Please enter the complete 6-digit code');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('.auth-submit-btn');
    setButtonLoading(submitBtn, true);
    
    try {
        // Verify OTP
        const result = await confirmationResult.confirm(otp);
        console.log('Phone authentication successful:', result.user);
        
        // Check if profile needs completion
        if (window.checkProfileCompletion) {
            await window.checkProfileCompletion(result.user);
        } else {
            // Redirect to passport
            window.location.href = '/passport.html';
        }
        
    } catch (error) {
        console.error('OTP verification error:', error);
        
        let errorMessage = 'Verification failed. ';
        
        switch (error.code) {
            case 'auth/invalid-verification-code':
                errorMessage = 'Invalid verification code. Please try again.';
                break;
            case 'auth/code-expired':
                errorMessage = 'Verification code expired. Please request a new one.';
                break;
            default:
                errorMessage += 'Please check the code and try again.';
        }
        
        showAuthError(errorMessage);
        
        // Clear OTP inputs
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Resend OTP
async function resendOTP() {
    // Show phone form again
    const phoneForm = document.getElementById('phoneAuthForm');
    const otpContainer = document.getElementById('otpContainer');
    
    if (otpContainer) otpContainer.style.display = 'none';
    if (phoneForm) phoneForm.style.display = 'block';
    
    showAuthError('Please enter your phone number again to receive a new code.');
}

// Helper function to show errors
function showAuthError(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Helper function for button loading state
function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    const textSpan = button.querySelector('.btn-text');
    const loadingSpan = button.querySelector('.btn-loading');
    
    if (isLoading) {
        if (textSpan) textSpan.style.display = 'none';
        if (loadingSpan) loadingSpan.style.display = 'inline';
        button.disabled = true;
    } else {
        if (textSpan) textSpan.style.display = 'inline';
        if (loadingSpan) loadingSpan.style.display = 'none';
        button.disabled = false;
    }
}

// Additional styles for phone authentication
const phoneAuthStyles = `
<style>
/* Phone Authentication Styles */
.phone-auth-header {
    text-align: center;
    margin-bottom: 2rem;
}

.phone-input-group {
    display: flex;
    gap: 0.5rem;
    width: 100%;
}

.country-code-select {
    width: 120px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    background: white;
}

.phone-number-input {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
}

.phone-number-input:focus,
.country-code-select:focus {
    outline: none;
    border-color: #003554;
}

/* OTP Input Styles */
.otp-verification {
    text-align: center;
    padding: 2rem;
}

.otp-inputs {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin: 2rem 0;
}

.otp-digit-input {
    width: 45px;
    height: 45px;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    border: 2px solid #ddd;
    border-radius: 8px;
    transition: border-color 0.3s;
}

.otp-digit-input:focus {
    outline: none;
    border-color: #003554;
}

.otp-actions {
    margin-top: 2rem;
}

.text-btn {
    background: none;
    border: none;
    color: #003554;
    cursor: pointer;
    font-size: 14px;
    padding: 0.5rem;
    text-decoration: none;
}

.text-btn:hover {
    text-decoration: underline;
}

.back-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 14px;
    padding: 0.5rem 1rem;
}

.back-btn:hover {
    color: #003554;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
    .phone-input-group {
        flex-direction: column;
    }
    
    .country-code-select {
        width: 100%;
    }
    
    .otp-digit-input {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
    }
}
</style>
`;

// Add styles to document if not already present
if (!document.getElementById('phone-auth-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'phone-auth-styles';
    styleElement.innerHTML = phoneAuthStyles;
    document.head.appendChild(styleElement);
}

console.log('Phone authentication system loaded');
