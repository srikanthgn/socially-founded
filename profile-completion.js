// profile-completion.js
// Handles profile completion for users who sign in with phone

async function checkProfileCompletion() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const shouldCompleteProfile = urlParams.get('completeProfile') === 'true';
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    // Check if profile is incomplete
    if (shouldCompleteProfile || userData?.profileComplete === false) {
        showProfileCompletionModal();
    }
}

function showProfileCompletionModal() {
    const modal = document.createElement('div');
    modal.id = 'profileCompletionModal';
    modal.innerHTML = `
        <div class="modal-backdrop">
            <div class="modal-content">
                <h2>Complete Your Profile</h2>
                <p>Welcome to SociallyFounded! Let's set up your founder profile.</p>
                
                <form id="profileCompletionForm" onsubmit="saveProfile(event)">
                    <div class="profile-photo-section">
                        <div class="photo-preview" id="photoPreview">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <label for="photoUpload" class="photo-upload-btn">
                            <i class="fas fa-camera"></i> Upload Photo
                        </label>
                        <input type="file" id="photoUpload" accept="image/*" 
                               onchange="previewPhoto(event)" style="display: none;">
                    </div>
                    
                    <div class="form-group">
                        <label for="displayName">Full Name *</label>
                        <input type="text" id="displayName" required 
                               placeholder="Enter your full name">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" required 
                               placeholder="your@email.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="company">Company/Project (Optional)</label>
                        <input type="text" id="company" 
                               placeholder="Your company or project name">
                    </div>
                    
                    <div class="form-group">
                        <label for="bio">Short Bio (Optional)</label>
                        <textarea id="bio" rows="3" 
                                  placeholder="Tell us about your entrepreneurial journey..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="linkedinUrl">LinkedIn Profile (Optional)</label>
                        <input type="url" id="linkedinUrl" 
                               placeholder="https://linkedin.com/in/yourprofile">
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">
                            Save Profile & Continue
                        </button>
                        <button type="button" class="btn-secondary" onclick="skipProfile()">
                            Skip for now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add styles
    const styles = document.createElement('style');
    styles.innerHTML = `
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
        }
        
        .modal-content {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        
        .modal-content h2 {
            margin-bottom: 0.5rem;
            color: #003554;
        }
        
        .modal-content p {
            color: #666;
            margin-bottom: 2rem;
        }
        
        .profile-photo-section {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .photo-preview {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            overflow: hidden;
            border: 3px solid #e0e0e0;
        }
        
        .photo-preview i {
            font-size: 4rem;
            color: #ccc;
        }
        
        .photo-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .photo-upload-btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #003554;
            color: white;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background 0.2s;
        }
        
        .photo-upload-btn:hover {
            background: #002544;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #e0e0e0;
            border-radius: 0.5rem;
            font-size: 1rem;
            transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #003554;
        }
        
        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .btn-primary,
        .btn-secondary {
            padding: 0.875rem 1.5rem;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            flex: 1;
        }
        
        .btn-primary {
            background: #003554;
            color: white;
        }
        
        .btn-primary:hover {
            background: #002544;
            transform: translateY(-1px);
        }
        
        .btn-secondary {
            background: #f5f5f5;
            color: #666;
        }
        
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        
        @media (max-width: 480px) {
            .form-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(styles);
    document.body.appendChild(modal);
}

let selectedPhotoFile = null;

function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        selectedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').innerHTML = 
                `<img src="${e.target.result}" alt="Profile photo">`;
        };
        reader.readAsDataURL(file);
    }
}

async function saveProfile(event) {
    event.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    // Show loading state
    const submitBtn = event.target.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    try {
        // Upload photo if selected
        let photoURL = null;
        if (selectedPhotoFile) {
            const storageRef = firebase.storage().ref();
            const photoRef = storageRef.child(`profile-photos/${user.uid}`);
            const snapshot = await photoRef.put(selectedPhotoFile);
            photoURL = await snapshot.ref.getDownloadURL();
        }
        
        // Prepare profile data
        const profileData = {
            displayName: document.getElementById('displayName').value,
            email: document.getElementById('email').value,
            company: document.getElementById('company').value || null,
            bio: document.getElementById('bio').value || null,
            linkedinUrl: document.getElementById('linkedinUrl').value || null,
            photoURL: photoURL || null,
            profileComplete: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Update Firestore
        await db.collection('users').doc(user.uid).update({
            profile: profileData
        });
        
        // Update Firebase Auth profile
        await user.updateProfile({
            displayName: profileData.displayName,
            photoURL: profileData.photoURL
        });
        
        // Update email if different
        if (user.email !== profileData.email) {
            await user.updateEmail(profileData.email);
        }
        
        // Close modal and refresh passport
        document.getElementById('profileCompletionModal').remove();
        
        // Refresh the passport display
        if (window.loadPassportData) {
            window.loadPassportData();
        }
        
        // Show success message
        showSuccessToast('Profile updated successfully!');
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile: ' + error.message);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function skipProfile() {
    const modal = document.getElementById('profileCompletionModal');
    if (modal) {
        modal.remove();
    }
    
    // Show reminder toast
    showInfoToast('You can complete your profile anytime from settings');
}

function showSuccessToast(message) {
    showToast(message, 'success');
}

function showInfoToast(message) {
    showToast(message, 'info');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations
const animationStyles = document.createElement('style');
animationStyles.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyles);

// Export function
window.checkProfileCompletion = checkProfileCompletion;
