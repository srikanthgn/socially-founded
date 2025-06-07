// passport-app.js
// Digital Passport functionality for SociallyFounded
// Add this CSS to the passport styles:
`.share-passport-btn {
    text-align: center;
    margin-top: 20px;
}

.btn-share-passport {
    background: linear-gradient(45deg, #0077B5, #1DA1F2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.btn-share-passport:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 119, 181, 0.3);
}`
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Digital Passport app initializing...');
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase not initialized');
        return;
    }
    
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(async function(user) {
        console.log('🔐 Auth state changed:', user ? user.email : 'No user');
        
        if (user) {
            // User is signed in
            console.log('✅ User authenticated:', user.displayName || user.email);
            
            // Initialize user session
            try {
                const userProfile = await initializeUserSession(user);
                
                if (userProfile) {
                    // Store references
                    window.currentUser = user;
                    window.currentUserProfile = userProfile;
                    
                    // Show passport content
                    showPassportContent();
                    
                    // Load passport data
                    await loadPassportData();
                    
                    // Initialize features
                    initializeEventListeners();
                    
                    console.log('✅ Digital Passport ready!');
                } else {
                    console.error('❌ Failed to initialize user profile');
                    showAuthRequired();
                }
            } catch (error) {
                console.error('❌ Error initializing session:', error);
                showAuthRequired();
            }
        } else {
            // No user signed in
            console.log('❌ No user authenticated');
            showAuthRequired();
        }
    });
});

// Show passport content
function showPassportContent() {
    const authRequired = document.getElementById('auth-required');
    const passportContent = document.getElementById('passport-content');
    
    if (authRequired) authRequired.style.display = 'none';
    if (passportContent) passportContent.style.display = 'block';
}

// Show authentication required
function showAuthRequired() {
    const authRequired = document.getElementById('auth-required');
    const passportContent = document.getElementById('passport-content');
    
    if (authRequired) authRequired.style.display = 'block';
    if (passportContent) passportContent.style.display = 'none';
}

// Load passport data
async function loadPassportData() {
    if (!window.currentUser || !window.currentUserProfile) {
        console.error('No user data available');
        return;
    }
    
    const profile = window.currentUserProfile.profile || {};
    const passport = window.currentUserProfile.passport || {};
    
    // Update passport display
    updateElement('passport-name', profile.displayName || 'Founder');
    updateElement('passport-id', passport.id || 'SF000000');
    updateElement('passport-level', passport.level || 1);
    updateElement('passport-xp', passport.experience || 0);
    updateElement('passport-checkins', passport.totalCheckIns || 0);
    updateElement('passport-streak', passport.currentStreak || 0);
    
    // Update member since date
    if (profile.joinDate) {
        const joinDate = profile.joinDate.toDate ? profile.joinDate.toDate() : new Date(profile.joinDate);
        updateElement('member-since', joinDate.toLocaleDateString());
    }
    
    // Update avatar
    if (profile.photoURL) {
        const avatar = document.getElementById('passport-avatar');
        const defaultAvatar = document.getElementById('default-avatar');
        if (avatar) {
            avatar.src = profile.photoURL;
            avatar.style.display = 'block';
        }
        if (defaultAvatar) {
            defaultAvatar.style.display = 'none';
        }
    }
    
    // Load achievements
    loadAchievements(passport.achievements || []);
    
    // Load recent activity
    loadRecentActivity();
}

// Update element helper
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Load achievements
function loadAchievements(userAchievements) {
    const achievementsGrid = document.getElementById('achievements-grid');
    if (!achievementsGrid) return;
    
    // Define all achievements
    const allAchievements = [
        { key: 'founding_member', name: 'Founding Member', icon: '🚀', category: 'milestone' },
        { key: 'first_checkin', name: 'First Steps', icon: '👣', category: 'checkin' },
        { key: 'streak_week', name: 'Week Warrior', icon: '🔥', category: 'streak' },
        { key: 'streak_month', name: 'Monthly Master', icon: '💎', category: 'streak' },
        { key: 'rising_founder', name: 'Rising Founder', icon: '📈', category: 'level' },
        { key: 'veteran_builder', name: 'Veteran Builder', icon: '⭐', category: 'level' },
        { key: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', category: 'social' },
        { key: 'venue_explorer', name: 'Venue Explorer', icon: '🗺️', category: 'exploration' }
    ];
    
    // Clear existing content
    achievementsGrid.innerHTML = '';
    
    // Add each achievement
    allAchievements.forEach(achievement => {
        const isEarned = userAchievements.includes(achievement.key);
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${isEarned ? 'earned' : 'locked'}`;
        badge.innerHTML = `
            <span class="achievement-icon">${achievement.icon}</span>
            <span class="achievement-name">${achievement.name}</span>
        `;
        achievementsGrid.appendChild(badge);
    });
}

// Load recent activity
function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    // For now, show sample activities
    const sampleActivities = [
        { icon: '✅', title: 'Account Created', time: 'Just now' },
        { icon: '🏆', title: 'Earned Founding Member Achievement', time: 'Just now' }
    ];
    
    activityList.innerHTML = '';
    
    sampleActivities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        activityList.appendChild(item);
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Any additional event listeners can go here
    console.log('✅ Event listeners initialized');
}

// Handle quick check-in
window.handleQuickCheckIn = async function() {
    const btn = document.getElementById('checkin-btn');
    const btnText = document.getElementById('checkin-text');
    const btnIcon = document.getElementById('checkin-icon');
    
    if (!window.currentUser) {
        console.error('No user logged in');
        return;
    }
    
    // Disable button
    btn.disabled = true;
    btnText.textContent = 'Checking in...';
    btnIcon.innerHTML = '<div class="spinner"></div>';
    
    try {
        // Get current location (or use default)
        const location = await getCurrentLocation();
        
        // Select a test venue
        const venues = ['venue_001', 'venue_002', 'venue_003'];
        const venueId = venues[Math.floor(Math.random() * venues.length)];
        
        // Record check-in
        const result = await recordCheckIn(window.currentUser.uid, venueId, location);
        
        if (result) {
            // Success!
            btnText.textContent = 'Checked in!';
            btnIcon.textContent = '✅';
            
            // Reload passport data to show updates
            setTimeout(async () => {
                await loadPassportData();
                btnText.textContent = 'Check In at Current Location';
                btnIcon.textContent = '📍';
                btn.disabled = false;
            }, 2000);
        } else {
            throw new Error('Check-in failed');
        }
    } catch (error) {
        console.error('Check-in error:', error);
        btnText.textContent = 'Check-in failed';
        btnIcon.textContent = '❌';
        
        setTimeout(() => {
            btnText.textContent = 'Check In at Current Location';
            btnIcon.textContent = '📍';
            btn.disabled = false;
        }, 2000);
    }
};

// Get current location
async function getCurrentLocation() {
    return new Promise((resolve) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                error => {
                    console.log('Location error:', error);
                    // Default location (Dubai)
                    resolve({ latitude: 25.2048, longitude: 55.2708 });
                }
            );
        } else {
            // Default location
            resolve({ latitude: 25.2048, longitude: 55.2708 });
        }
    });
}

// Handle sign out
window.handleSignOut = function() {
    firebase.auth().signOut().then(() => {
        console.log('✅ Signed out successfully');
        window.location.href = '/';
    }).catch((error) => {
        console.error('❌ Sign out error:', error);
    });
};

// Make auth modal available
window.showAuthModal = function() {
    // For now, redirect to homepage
    window.location.href = '/';
};

// Additional code to add to passport-app.js
// This ensures proper integration with the profile system

// Update the existing loadPassportData function to include profile loading
const originalLoadPassportData = window.loadPassportData;

window.loadPassportData = async function(user) {
    try {
        // Call the profile integration version first
        if (window.loadPassportData !== originalLoadPassportData) {
            await originalLoadPassportData(user);
        }
        
        // Ensure user profile exists and is complete
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData || !userData.profile) {
            console.log('Profile incomplete, creating/updating...');
            
            // Get provider data
            let providerData = null;
            if (user.providerData && user.providerData.length > 0) {
                providerData = user.providerData[0];
            }
            
            // Create or update profile with provider data
            const profileUpdates = {
                'profile.email': user.email,
                'profile.displayName': user.displayName || providerData?.displayName || '',
                'profile.photoURL': user.photoURL || providerData?.photoURL || '',
                'profile.phoneNumber': user.phoneNumber || providerData?.phoneNumber || '',
                'profile.updatedAt': firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Extract LinkedIn data if available
            if (providerData && providerData.providerId === 'linkedin.com') {
                // LinkedIn data might be in different format
                if (providerData.displayName) {
                    profileUpdates['profile.displayName'] = providerData.displayName;
                }
                if (providerData.photoURL) {
                    profileUpdates['profile.photoURL'] = providerData.photoURL;
                }
            }
            
            // Update Firestore
            await firebase.firestore().collection('users').doc(user.uid).update(profileUpdates);
            
            // Reload the data
            const updatedDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            const updatedData = updatedDoc.data();
            
            // Update the display
            updatePassportDisplay(updatedData);
            createProfileSection(updatedData);
        }
        
    } catch (error) {
        console.error('Error in enhanced loadPassportData:', error);
    }
};

// Ensure proper initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePassportApp);
} else {
    initializePassportApp();
}

function initializePassportApp() {
    // Make sure Font Awesome is loaded for icons
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(faLink);
    }
    
    // Check authentication state
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            console.log('User authenticated:', user.email);
            
            // Load passport data with profile
            await loadPassportData(user);
            
            // Hide sign-in prompt if visible
            const signInPrompt = document.getElementById('signInPrompt');
            if (signInPrompt) {
                signInPrompt.style.display = 'none';
            }
            
            // Show passport content
            const passportContent = document.querySelector('.passport-content');
            if (passportContent) {
                passportContent.style.display = 'block';
            }
        } else {
            // User is not signed in
            console.log('User not authenticated');
            
            // Show sign-in prompt
            const signInPrompt = document.getElementById('signInPrompt');
            if (signInPrompt) {
                signInPrompt.style.display = 'block';
            }
            
            // Hide passport content
            const passportContent = document.querySelector('.passport-content');
            if (passportContent) {
                passportContent.style.display = 'none';
            }
        }
    });
}

console.log('✅ Digital Passport app loaded');

// Social Sharing System for Sprint 2
console.log('Loading social sharing system...');

function triggerTestShare(type = 'levelUp') {
    const testData = {
        levelUp: {
            title: '🚀 Level 5 Founder!',
            message: 'Just reached Level 5 on SociallyFounded! Building my entrepreneurial journey one check-in at a time. #SociallyFounded #EntrepreneurLife',
            url: 'https://sociallyfounded.com',
            emoji: '🚀'
        },
        achievement: {
            title: '🏆 Achievement Unlocked!',
            message: 'Just unlocked "Check-in Champion" achievement on SociallyFounded! #SociallyFounded #Achievement',
            url: 'https://sociallyfounded.com',
            emoji: '🏆'
        }
    };

    if (testData[type]) {
        showSharingPrompt(type, testData[type]);
    }
}

function showSharingPrompt(trigger, data) {
    if (document.querySelector('.sharing-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'sharing-modal';
    modal.innerHTML = `
        <div class="sharing-overlay" onclick="closeSharingModal()"></div>
        <div class="sharing-content">
            <button class="sharing-close" onclick="closeSharingModal()">×</button>
            
            <div class="sharing-header">
                <div class="sharing-emoji">${data.emoji}</div>
                <h3>${data.title}</h3>
                <p>Share your milestone with the world!</p>
            </div>
            
            <div class="sharing-buttons">
                <button class="btn-share-linkedin" onclick="shareToLinkedIn('${encodeURIComponent(data.message)}', '${data.url}')">
                    <i class="fab fa-linkedin"></i>
                    <span><strong>LinkedIn</strong><small>Professional network</small></span>
                    <div class="xp-badge">+5 XP</div>
                </button>
                
                <button class="btn-share-twitter" onclick="shareToTwitter('${encodeURIComponent(data.message)}', '${data.url}')">
                    <i class="fab fa-twitter"></i>
                    <span><strong>Twitter</strong><small>Social network</small></span>
                    <div class="xp-badge">+5 XP</div>
                </button>
                
                <button class="btn-share-copy" onclick="copyShareText('${encodeURIComponent(data.message)}', '${data.url}')">
                    <i class="fas fa-copy"></i>
                    <span><strong>Copy Link</strong><small>Share anywhere</small></span>
                </button>
                
                <button class="btn-share-later" onclick="closeSharingModal()">Maybe Later</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('modal-visible'), 10);
}

function shareToLinkedIn(encodedMessage, url) {
    const message = decodeURIComponent(encodedMessage);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(message)}`;
    window.open(shareUrl, 'linkedinShare', 'width=600,height=500');
    closeSharingModal();
    if (window.showToast) window.showToast('✅ Shared to LinkedIn! +5 XP earned', 'success');
}

function shareToTwitter(encodedMessage, url) {
    const message = decodeURIComponent(encodedMessage);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, 'twitterShare', 'width=600,height=400');
    closeSharingModal();
    if (window.showToast) window.showToast('✅ Shared to Twitter! +5 XP earned', 'success');
}

function copyShareText(encodedMessage, url) {
    const message = decodeURIComponent(encodedMessage);
    const fullText = `${message}\n\n${url}`;
    navigator.clipboard.writeText(fullText).then(() => {
        if (window.showToast) window.showToast('✅ Share text copied to clipboard!', 'success');
    });
    closeSharingModal();
}

function closeSharingModal() {
    const modal = document.querySelector('.sharing-modal');
    if (modal) modal.remove();
}

window.triggerTestShare = triggerTestShare;
window.closeSharingModal = closeSharingModal;

console.log('✅ Social sharing system loaded');
