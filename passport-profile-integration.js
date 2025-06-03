// passport-profile-integration.js - Fixed Version
// This file integrates the profile system with the passport page

// Profile data loading and display
window.loadPassportData = async function(user) {
    try {
        // Load user profile data
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData) {
            console.log('No user data found, creating profile...');
            await createUserProfile(user);
            return;
        }

        // Update passport display with user data
        updatePassportDisplay(userData);
        
        // Create/update profile section
        createProfileSection(userData);
        
    } catch (error) {
        console.error('Error loading passport data:', error);
    }
};

// Create profile section in passport
function createProfileSection(userData) {
    // Check if profile section already exists
    let profileSection = document.querySelector('.profile-section');
    
    if (!profileSection) {
        // Create profile section HTML
        const passportContent = document.querySelector('.passport-content');
        if (!passportContent) return;
        
        profileSection = document.createElement('div');
        profileSection.className = 'profile-section';
        profileSection.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
        `;
        
        // Insert after passport card
        const passportCard = document.querySelector('.passport-card');
        if (passportCard && passportCard.parentNode) {
            passportCard.parentNode.insertBefore(profileSection, passportCard.nextSibling);
        }
    }
    
    // Get linked auth methods
    const authMethods = userData.authMethods || [];
    const linkedAccounts = authMethods.map(method => {
        const icons = {
            'google.com': '<i class="fab fa-google"></i>',
            'password': '<i class="fas fa-envelope"></i>',
            'phone': '<i class="fas fa-phone"></i>',
            'linkedin.com': '<i class="fab fa-linkedin"></i>',
            'facebook.com': '<i class="fab fa-facebook"></i>'
        };
        return icons[method] || '';
    }).join(' ');
    
    // Update profile section content
    profileSection.innerHTML = `
        <h3 style="color: white; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            Profile Information
            <button onclick="showProfileEditModal()" style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                font-size: 14px;
            ">
                <i class="fas fa-edit"></i> Edit
            </button>
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Name</label>
                <p style="color: white; margin: 5px 0;">${userData.profile?.displayName || 'Not set'}</p>
            </div>
            
            <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Email</label>
                <p style="color: white; margin: 5px 0;">${userData.profile?.email || 'Not set'}</p>
            </div>
            
            <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Phone</label>
                <p style="color: white; margin: 5px 0;">${userData.profile?.phoneNumber || 'Not set'}</p>
            </div>
            
            <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Company</label>
                <p style="color: white; margin: 5px 0;">${userData.profile?.company || 'Not set'}</p>
            </div>
            
            <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Linked Accounts</label>
                <p style="color: white; margin: 5px 0; font-size: 20px;">${linkedAccounts || 'None'}</p>
            </div>
            
            <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px;">Member Since</label>
                <p style="color: white; margin: 5px 0;">${new Date(userData.profile?.joinDate || Date.now()).toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

// Update passport display with user data
function updatePassportDisplay(userData) {
    // Update name
    const nameElement = document.querySelector('.passport-card h3');
    if (nameElement && userData.profile?.displayName) {
        nameElement.textContent = userData.profile.displayName;
    }
    
    // Update avatar
    const avatarElement = document.querySelector('.passport-card .user-avatar');
    if (avatarElement && userData.profile?.photoURL) {
        avatarElement.innerHTML = `<img src="${userData.profile.photoURL}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
    }
    
    // Update passport ID if needed
    const passportIdElement = document.querySelector('.passport-card p');
    if (passportIdElement && userData.passport?.passportId) {
        passportIdElement.textContent = `Passport ID: ${userData.passport.passportId}`;
    }
    
    // Update stats
    if (userData.passport) {
        const stats = {
            level: userData.passport.level || 1,
            experience: userData.passport.experience || 0,
            totalCheckIns: userData.passport.totalCheckIns || 0,
            currentStreak: userData.passport.currentStreak || 0
        };
        
        // Update stat displays
        document.querySelectorAll('.stat-value').forEach((el, index) => {
            const values = [stats.level, `${stats.experience} XP`, stats.totalCheckIns, stats.currentStreak];
            if (values[index] !== undefined) {
                el.textContent = values[index];
            }
        });
    }
}

// Show profile edit modal
window.showProfileEditModal = async function() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'profile-edit-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <h2 style="margin-bottom: 20px; color: #003554;">Edit Profile</h2>
                
                <form id="profile-edit-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Full Name *</label>
                        <input type="text" name="displayName" value="${userData.profile?.displayName || ''}" required
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Email *</label>
                        <input type="email" value="${userData.profile?.email || ''}" disabled
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #f5f5f5;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Phone Number</label>
                        <input type="tel" name="phoneNumber" value="${userData.profile?.phoneNumber || ''}"
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Company</label>
                        <input type="text" name="company" value="${userData.profile?.company || ''}"
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">LinkedIn Profile URL</label>
                        <input type="url" name="linkedinUrl" value="${userData.profile?.linkedinUrl || ''}"
                            placeholder="https://linkedin.com/in/yourprofile"
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Profile Photo</label>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 80px; height: 80px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                ${userData.profile?.photoURL ? 
                                    `<img src="${userData.profile.photoURL}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` : 
                                    '<i class="fas fa-user" style="font-size: 30px; color: #999;"></i>'
                                }
                            </div>
                            <input type="file" id="photo-upload" accept="image/*" style="display: none;">
                            <button type="button" onclick="document.getElementById('photo-upload').click()" style="
                                padding: 8px 16px;
                                background: #003554;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                            ">Change Photo</button>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="
                            flex: 1;
                            padding: 12px;
                            background: #003554;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 500;
                            cursor: pointer;
                        ">Save Changes</button>
                        
                        <button type="button" onclick="this.closest('.profile-edit-modal').remove()" style="
                            flex: 1;
                            padding: 12px;
                            background: #f0f0f0;
                            color: #333;
                            border: none;
                            border-radius: 8px;
                            font-weight: 500;
                            cursor: pointer;
                        ">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle photo upload
        const photoUpload = document.getElementById('photo-upload');
        photoUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    // Upload to Firebase Storage
                    const storageRef = firebase.storage().ref();
                    const photoRef = storageRef.child(`profile-photos/${user.uid}/${Date.now()}_${file.name}`);
                    const snapshot = await photoRef.put(file);
                    const photoURL = await snapshot.ref.getDownloadURL();
                    
                    // Update preview
                    const preview = modal.querySelector('.fa-user').parentElement;
                    preview.innerHTML = `<img src="${photoURL}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
                    
                    // Store URL for form submission
                    modal.photoURL = photoURL;
                } catch (error) {
                    console.error('Error uploading photo:', error);
                    alert('Failed to upload photo. Please try again.');
                }
            }
        });
        
        // Handle form submission
        const form = document.getElementById('profile-edit-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const formData = new FormData(form);
                const updates = {
                    'profile.displayName': formData.get('displayName'),
                    'profile.phoneNumber': formData.get('phoneNumber'),
                    'profile.company': formData.get('company'),
                    'profile.linkedinUrl': formData.get('linkedinUrl'),
                    'profile.updatedAt': firebase.firestore.FieldValue.serverTimestamp()
                };
                
                // Add photo URL if changed
                if (modal.photoURL) {
                    updates['profile.photoURL'] = modal.photoURL;
                }
                
                // Update Firestore
                await firebase.firestore().collection('users').doc(user.uid).update(updates);
                
                // Update display name in Firebase Auth
                if (formData.get('displayName') !== user.displayName) {
                    await user.updateProfile({
                        displayName: formData.get('displayName')
                    });
                }
                
                // Reload passport data
                await loadPassportData(user);
                
                // Close modal
                modal.remove();
                
                // Show success message
                showSuccessMessage('Profile updated successfully!');
                
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
            }
        });
        
    } catch (error) {
        console.error('Error showing profile edit modal:', error);
    }
};

// Show success message
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase Auth is ready
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            await loadPassportData(user);
        }
    });
});
