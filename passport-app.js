// passport-app.js
// Digital Passport functionality for SociallyFounded

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

console.log('✅ Digital Passport app loaded');
