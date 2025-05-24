// passport-app.js
// Digital Passport Application Logic
// Create this file in your root directory

// ============================================
// GLOBAL STATE
// ============================================

let currentUser = null;
let currentUserData = null;

// Sample venues for testing (will be replaced with real venue system)
const TEST_VENUES = [
    {
        id: 'venue_001',
        name: 'Startup Café',
        address: '123 Innovation Street, Tech District',
        type: 'café',
        coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
        id: 'venue_002', 
        name: 'The Founders Hub',
        address: '456 Entrepreneur Avenue, Business Quarter',
        type: 'coworking',
        coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    {
        id: 'venue_003',
        name: 'Code & Coffee',
        address: '789 Builder Boulevard, Creative Commons',
        type: 'café',
        coordinates: { lat: 40.7505, lng: -73.9934 }
    }
];

// Achievement definitions
const ACHIEVEMENTS = {
    founding_member: {
        name: 'Founding Member',
        description: 'Welcome to SociallyFounded!',
        icon: '🚀',
        category: 'milestone'
    },
    first_checkin: {
        name: 'First Steps',
        description: 'Completed your first check-in',
        icon: '👣',
        category: 'checkin'
    },
    streak_week: {
        name: 'Week Warrior',
        description: '7-day check-in streak',
        icon: '🔥',
        category: 'streak'
    },
    streak_month: {
        name: 'Monthly Master',
        description: '30-day check-in streak',
        icon: '💎',
        category: 'streak'
    },
    level_2: {
        name: 'Rising Founder',
        description: 'Reached Level 2',
        icon: '📈',
        category: 'level'
    },
    level_5: {
        name: 'Veteran Builder',
        description: 'Reached Level 5',
        icon: '⭐',
        category: 'level'
    },
    social_butterfly: {
        name: 'Social Butterfly',
        description: 'Made 10+ connections',
        icon: '🦋',
        category: 'social'
    },
    venue_explorer: {
        name: 'Venue Explorer',
        description: 'Visited 5+ different venues',
        icon: '🗺️',
        category: 'exploration'
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Digital Passport app initializing...');
    
    try {
        // Initialize user session
        const sessionData = await initializeUserSession();
        
        if (sessionData.user) {
            currentUser = sessionData.user;
            currentUserData = sessionData.userData;
            showPassportContent();
            await loadPassportData();
        } else {
            showAuthRequired();
        }
    } catch (error) {
        console.error('❌ Error initializing passport app:', error);
        showAuthRequired();
    }
});

// ============================================
// UI MANAGEMENT
// ============================================

function showAuthRequired() {
    document.getElementById('auth-required').style.display = 'block';
    document.getElementById('passport-content').style.display = 'none';
    console.log('👤 Authentication required - showing sign in prompt');
}

function showPassportContent() {
    document.getElementById('auth-required').style.display = 'none';
    document.getElementById('passport-content').style.display = 'block';
    console.log('✅ User authenticated - showing passport content');
}

// ============================================
// PASSPORT DATA LOADING
// ============================================

async function loadPassportData() {
    try {
        console.log('📊 Loading passport data for user:', currentUser.uid);
        
        // Get fresh user data
        currentUserData = await getUserProfile(currentUser.uid);
        
        if (currentUserData) {
            updatePassportDisplay(currentUserData);
            await loadAchievements(currentUserData);
            await loadRecentActivity(currentUser.uid);
        } else {
            console.error('❌ No user data found');
        }
    } catch (error) {
        console.error('❌ Error loading passport data:', error);
    }
}

function updatePassportDisplay(userData) {
    const passport = userData.passport;
    
    // Update passport ID
    const passportIdEl = document.getElementById('passport-id');
    if (passportIdEl) passportIdEl.textContent = passport.id || 'SF000000';
    
    // Update user info
    const nameEl = document.getElementById('passport-name');
    if (nameEl) nameEl.textContent = userData.displayName || 'Anonymous Founder';
    
    const memberSinceEl = document.getElementById('member-since');
    if (memberSinceEl && userData.joinDate) {
        const date = userData.joinDate.toDate();
        memberSinceEl.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Update avatar
    const avatarEl = document.getElementById('passport-avatar');
    const defaultAvatarEl = document.getElementById('default-avatar');
    
    if (userData.photoURL) {
        avatarEl.src = userData.photoURL;
        avatarEl.style.display = 'block';
        defaultAvatarEl.style.display = 'none';
    } else {
        avatarEl.style.display = 'none';
        defaultAvatarEl.style.display = 'flex';
    }
    
    // Update stats
    const levelEl = document.getElementById('passport-level');
    if (levelEl) levelEl.textContent = passport.level || 1;
    
    const xpEl = document.getElementById('passport-xp');
    if (xpEl) xpEl.textContent = passport.experience || 0;
    
    const checkInsEl = document.getElementById('passport-checkins');
    if (checkInsEl) checkInsEl.textContent = passport.totalCheckIns || 0;
    
    const streakEl = document.getElementById('passport-streak');
    if (streakEl) streakEl.textContent = passport.currentStreak || 0;
    
    console.log('✅ Passport display updated');
}

async function loadAchievements(userData) {
    const achievementsGrid = document.getElementById('achievements-grid');
    if (!achievementsGrid) return;
    
    const userAchievements = userData.passport.achievements || [];
    achievementsGrid.innerHTML = '';
    
    // Create achievement badges
    Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
        const isEarned = userAchievements.includes(key);
        
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${isEarned ? 'earned' : 'locked'}`;
        badge.innerHTML = `
            <span class="achievement-icon">${achievement.icon}</span>
            <div class="achievement-name">${achievement.name}</div>
        `;
        
        // Add tooltip or click handler for more info
        badge.title = achievement.description;
        
        achievementsGrid.appendChild(badge);
    });
    
    console.log(`✅ Loaded ${userAchievements.length} earned achievements`);
}

async function loadRecentActivity(uid) {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    // For now, show sample activities
    // Later this will load from Firestore activities collection
    const sampleActivities = [
        {
            type: 'checkin',
            title: 'Checked in at Startup Café',
            time: '2 hours ago',
            icon: '📍'
        },
        {
            type: 'xp_gained',
            title: 'Earned 10 XP for check-in',
            time: '2 hours ago',
            icon: '⭐'
        },
        {
            type: 'achievement',
            title: 'Unlocked "First Steps" achievement',
            time: '1 day ago',
            icon: '🏆'
        },
        {
            type: 'level_up',
            title: 'Level up! Now Level 2',
            time: '3 days ago',
            icon: '📈'
        }
    ];
    
    activityList.innerHTML = '';
    
    sampleActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
    
    console.log('✅ Recent activity loaded');
}

// ============================================
// CHECK-IN FUNCTIONALITY
// ============================================

async function handleQuickCheckIn() {
    const checkInBtn = document.getElementById('checkin-btn');
    const checkInIcon = document.getElementById('checkin-icon');
    const checkInText = document.getElementById('checkin-text');
    
    if (!currentUser) {
        showAuthModal();
        return;
    }
    
    try {
        // Update UI to loading state
        checkInBtn.disabled = true;
        checkInBtn.classList.add('loading');
        checkInIcon.innerHTML = '<div class="spinner"></div>';
        checkInText.textContent = 'Checking in...';
        
        // Try to get user's location
        const location = await getCurrentLocation();
        
        // For demo purposes, use a random test venue
        const randomVenue = TEST_VENUES[Math.floor(Math.random() * TEST_VENUES.length)];
        
        // Record the check-in
        const checkInId = await recordCheckIn(currentUser.uid, randomVenue, location);
        
        // Show success
        checkInIcon.innerHTML = '✅';
        checkInText.textContent = `Checked in at ${randomVenue.name}!`;
        
        // Log activity
        await logActivity(currentUser.uid, 'checkin', {
            venueId: randomVenue.id,
            venueName: randomVenue.name,
            checkInId: checkInId
        });
        
        // Reload passport data to show updated stats
        setTimeout(async () => {
            await loadPassportData();
            
            // Reset button
            checkInBtn.disabled = false;
            checkInBtn.classList.remove('loading');
            checkInIcon.innerHTML = '📍';
            checkInText.textContent = 'Check In at Current Location';
        }, 2000);
        
        console.log('✅ Check-in successful:', checkInId);
        
    } catch (error) {
        console.error('❌ Check-in failed:', error);
        
        // Show error state
        checkInIcon.innerHTML = '❌';
        checkInText.textContent = 'Check-in failed - try again';
        
        // Reset button after delay
        setTimeout(() => {
            checkInBtn.disabled = false;
            checkInBtn.classList.remove('loading');
            checkInIcon.innerHTML = '📍';
            checkInText.textContent = 'Check In at Current Location';
        }, 3000);
    }
}

// Get user's current location
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                console.warn('⚠️ Location access denied, using default location');
                // Return default location (NYC) if permission denied
                resolve({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    accuracy: null
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

// ============================================
// AUTHENTICATION HANDLERS
// ============================================

async function handleSignOut() {
    try {
        await firebase.auth().signOut();
        currentUser = null;
        currentUserData = null;
        showAuthRequired();
        console.log('✅ User signed out successfully');
    } catch (error) {
        console.error('❌ Error signing out:', error);
    }
}

// ============================================
// GLOBAL FUNCTIONS (for HTML onclick handlers)
// ============================================

// Make functions available globally
window.handleQuickCheckIn = handleQuickCheckIn;
window.handleSignOut = handleSignOut;
window.showAuthModal = showAuthModal;

// ============================================
// TESTING & DEBUG FUNCTIONS
// ============================================

// Debug function to award test XP (remove in production)
window.debugAwardXP = async function(points) {
    if (currentUser) {
        try {
            await awardExperience(currentUser.uid, points, 'Debug XP award');
            await loadPassportData();
            console.log(`✅ Awarded ${points} XP for testing`);
        } catch (error) {
            console.error('❌ Error awarding XP:', error);
        }
    }
};

// Debug function to simulate achievement unlock
window.debugUnlockAchievement = async function(achievementKey) {
    if (currentUser && ACHIEVEMENTS[achievementKey]) {
        try {
            await addAchievements(currentUser.uid, [achievementKey]);
                       await loadPassportData();
            console.log(`✅ Unlocked achievement: ${achievementKey}`);
        } catch (error) {
            console.error('❌ Error unlocking achievement:', error);
        }
    }
};

console.log('🚀 Digital Passport app loaded successfully');


