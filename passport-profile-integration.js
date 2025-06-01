// passport-profile-integration.js
// Add this to your passport page to integrate profile completion

// Update the loadPassportData function to handle profile data properly
async function loadPassportData() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create initial profile if it doesn't exist
            await createUserProfile(user);
            return;
        }
        
        const userData = userDoc.data();
        const profile = userData.profile || {};
        const passport = userData.passport || {};
        
        // Update passport display with profile data
        updatePassportDisplay({
            // Use profile data with fallbacks
            name: profile.displayName || user.displayName || 'Entrepreneur',
            email: profile.email || user.email || '',
            photoURL: profile.photoURL || user.photoURL || '/images/default-avatar.png',
            company: profile.company || '',
            bio: profile.bio || '',
            linkedinUrl: profile.linkedinUrl || '',
            
            // Passport data
            passportId: passport.id || 'Generating...',
            level: passport.level || 1,
            experience: passport.experience || 0,
            totalCheckIns: passport.totalCheckIns || 0,
            currentStreak: passport.currentStreak || 0,
            achievements: passport.achievements || []
        });
        
        // Check if profile needs completion
        if (!profile.profileComplete && user.providerData[0].providerId === 'phone') {
            // Show profile completion for phone users
            checkProfileCompletion();
        }
        
    } catch (error) {
        console.error('Error loading passport data:', error);
    }
}

// Enhanced updatePassportDisplay function
function updatePassportDisplay(data) {
    // Update avatar
    const avatarElements = document.querySelectorAll('.passport-avatar, .user-avatar');
    avatarElements.forEach(el => {
        if (data.photoURL) {
            el.innerHTML = `<img src="${data.photoURL}" alt="${data.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            el.innerHTML = `<i class="fas fa-user-circle" style="font-size: 3rem; color: #ccc;"></i>`;
        }
    });
    
    // Update name
    const nameElements = document.querySelectorAll('.passport-name, .user-name');
    nameElements.forEach(el => {
        el.textContent = data.name;
    });
    
    // Update passport ID
    const passportIdElement = document.querySelector('.passport-id');
    if (passportIdElement) {
        passportIdElement.textContent = data.passportId;
    }
    
    // Update stats
    document.querySelector('.stat-level').textContent = data.level;
    document.querySelector('.stat-xp').textContent = data.experience;
    document.querySelector('.stat-checkins').textContent = data.totalCheckIns;
    document.querySelector('.stat-streak').textContent = data.currentStreak;
    
    // Update profile section if exists
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) {
        profileSection.innerHTML = `
            <div class="profile-header">
                <h3>Profile Information</h3>
                <button class="edit-profile-btn" onclick="showProfileEditModal()">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <div class="profile-details">
                ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
                ${data.bio ? `<p><strong>Bio:</strong> ${data.bio}</p>` : ''}
                ${data.linkedinUrl ? `<p><strong>LinkedIn:</strong> <a href="${data.linkedinUrl}" target="_blank">View Profile</a></p>` : ''}
                ${!data.company && !data.bio && !data.linkedinUrl ? '<p class="text-muted">Complete your profile to stand out!</p>' : ''}
            </div>
        `;
    }
}

// Function to show profile edit modal
function showProfileEditModal() {
    // Reuse the profile completion modal but with edit mode
    showProfileCompletionModal();
    
    // Pre-fill the form with existing data
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const profile = userDoc.data()?.profile || {};
            
            // Pre-fill form fields
            if (profile.displayName) document.getElementById('displayName').value = profile.displayName;
            if (profile.email) document.getElementById('email').value = profile.email;
            if (profile.company) document.getElementById('company').value = profile.company;
            if (profile.bio) document.getElementById('bio').value = profile.bio;
            if (profile.linkedinUrl) document.getElementById('linkedinUrl').value = profile.linkedinUrl;
            
            // Show existing photo
            if (profile.photoURL) {
                document.getElementById('photoPreview').innerHTML = 
                    `<img src="${profile.photoURL}" alt="Profile photo">`;
            }
            
            // Change button text
            document.querySelector('.btn-primary').textContent = 'Update Profile';
            
            // Change skip button to cancel
            document.querySelector('.btn-secondary').textContent = 'Cancel';
            document.querySelector('.btn-secondary').onclick = () => {
                document.getElementById('profileCompletionModal').remove();
            };
        }
    });
}

// Add profile section to passport page if not exists
function addProfileSection() {
    const passportCard = document.querySelector('.passport-card');
    if (passportCard && !document.querySelector('.profile-section')) {
        const profileSection = document.createElement('div');
        profileSection.className = 'profile-section';
        profileSection.style.cssText = `
            margin-top: 2rem;
            padding: 1.5rem;
            background: #f9f9f9;
            border-radius: 0.5rem;
        `;
        
        passportCard.appendChild(profileSection);
    }
}

// Add styles for profile section
const profileStyles = document.createElement('style');
profileStyles.innerHTML = `
    .profile-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background: #f9f9f9;
        border-radius: 0.5rem;
    }
    
    .profile-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .profile-header h3 {
        margin: 0;
        color: #003554;
    }
    
    .edit-profile-btn {
        padding: 0.5rem 1rem;
        background: #003554;
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .edit-profile-btn:hover {
        background: #002544;
    }
    
    .profile-details p {
        margin: 0.5rem 0;
        color: #333;
    }
    
    .profile-details strong {
        color: #003554;
    }
    
    .profile-details a {
        color: #0077b5;
        text-decoration: none;
    }
    
    .profile-details a:hover {
        text-decoration: underline;
    }
    
    .text-muted {
        color: #999;
        font-style: italic;
    }
`;
document.head.appendChild(profileStyles);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add profile section to passport
    addProfileSection();
    
    // Load profile completion script
    const script = document.createElement('script');
    script.src = 'profile-completion.js';
    document.body.appendChild(script);
    
    // Check authentication and profile
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadPassportData();
            
            // Check if coming from auth with profile completion flag
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('completeProfile') === 'true') {
                setTimeout(() => checkProfileCompletion(), 1000);
            }
        }
    });
});
