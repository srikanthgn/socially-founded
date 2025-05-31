// user-management.js
// User Management System for SociallyFounded
// This file handles user profiles, passport creation, and data management

// Wait for Firebase to be initialized
if (typeof firebase === 'undefined') {
    console.error('Firebase not loaded. Make sure firebase-config.js loads first.');
}

// User profile management
async function createUserProfile(user) {
    if (!user) return null;
    
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(user.uid);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
        // Create new user profile
        const userData = {
            profile: {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'Founder',
                photoURL: user.photoURL || null,
                joinDate: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                userType: localStorage.getItem('sf-user-type') || 'founder' // Store the user type, default to 'founder'
            },
            passport: {
                id: generatePassportId(),
                level: 1,
                experience: 0,
                totalCheckIns: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastCheckIn: null,
                achievements: ['founding_member'] // Welcome achievement
            },
stats: {
    ideasRegistered: 0,
    venuesVisited: 0,
    connectionsMade: 0,  // ✅ Fixed
    eventsAttended: 0
},
            
            settings: {
                notifications: true,
                privacy: 'public',
                theme: 'light'
            }
        };
        
        try {
            // Log the userType that's about to be saved for a new user
            console.log('User type from localStorage for new profile:', localStorage.getItem('sf-user-type'));
            await userRef.set(userData);
            console.log('✅ User profile created successfully with userType:', userData.profile.userType);
            
            // Record user creation activity
            await recordActivity(user.uid, 'account_created', {
                timestamp: new Date().toISOString()
            });
            
            return userData;
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            return null;
        }
    } else {
        // Update last active timestamp
        await userRef.update({
            'profile.lastActive': firebase.firestore.FieldValue.serverTimestamp()
        });
        return userSnap.data();
    }
}

// Generate unique passport ID
function generatePassportId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `SF${timestamp}${randomStr}`.toUpperCase();
}

// Get user profile
async function getUserProfile(userId) {
    if (!userId) return null;
    
    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();
        
        if (userSnap.exists) {
            return userSnap.data();
        } else {
            console.log('No user profile found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

// Update user profile
async function updateUserProfile(userId, updates) {
    if (!userId || !updates) return false;
    
    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(userId);
        await userRef.update(updates);
        console.log('✅ Profile updated successfully');
        return true;
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        return false;
    }
}

// Experience and leveling system
async function awardExperience(userId, points, reason) {
    if (!userId || !points) return false;
    
    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();
        
        if (!userSnap.exists) return false;
        
        const currentData = userSnap.data();
        const currentXP = currentData.passport.experience || 0;
        const newXP = currentXP + points;
        const newLevel = calculateLevel(newXP);
        const oldLevel = currentData.passport.level || 1;
        
        // Update user XP and level
        await userRef.update({
            'passport.experience': newXP,
            'passport.level': newLevel
        });
        
        // Record XP gain activity
        await recordActivity(userId, 'xp_gained', {
            points: points,
            reason: reason,
            newTotal: newXP,
            newLevel: newLevel
        });
        
        // Check for level up
        if (newLevel > oldLevel) {
            await handleLevelUp(userId, oldLevel, newLevel);
        }
        
        console.log(`✅ Awarded ${points} XP to user. New total: ${newXP}`);
        return { newXP, newLevel, leveledUp: newLevel > oldLevel };
    } catch (error) {
        console.error('❌ Error awarding experience:', error);
        return false;
    }
}

// Calculate level from XP
function calculateLevel(xp) {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    
    // Level 5 and above: every 500 XP is a new level
    return Math.floor((xp - 1000) / 500) + 5;
}

// Handle level up events
async function handleLevelUp(userId, oldLevel, newLevel) {
    console.log(`🎉 Level up! ${oldLevel} → ${newLevel}`);
    
    // Award level-based achievements
    if (newLevel === 2) {
        await addAchievement(userId, 'rising_founder');
    } else if (newLevel === 5) {
        await addAchievement(userId, 'veteran_builder');
    }
    
    // Record level up activity
    await recordActivity(userId, 'level_up', {
        oldLevel: oldLevel,
        newLevel: newLevel,
        timestamp: new Date().toISOString()
    });
}

async function recordCheckIn(venueId, venueName, location = null) {
    const user = firebase.auth().currentUser;
    if (!user) throw new Error('No authenticated user');
    
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(user.uid);
    
    try {
        // Get current user data
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error('User profile not found');
        }
        
        const userData = userDoc.data();
        const now = new Date();
        
        // Get last check-in from passport (not from stats)
        const lastCheckIn = userData.passport.lastCheckIn;
        const currentStreak = userData.passport.currentStreak || 0;
        
        // Calculate new streak
        let newStreak = 1;
        if (lastCheckIn) {
            const lastDate = lastCheckIn.toDate ? lastCheckIn.toDate() : new Date(lastCheckIn);
            const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                newStreak = currentStreak + 1;
            } else if (daysDiff === 0) {
                newStreak = currentStreak;
            }
        }
        
        // Update user document
        await userRef.update({
            'passport.totalCheckIns': firebase.firestore.FieldValue.increment(1),
            'passport.lastCheckIn': now,
            'passport.currentStreak': newStreak,
            'passport.longestStreak': Math.max(newStreak, userData.passport.longestStreak || 0),
            'stats.venuesVisited': firebase.firestore.FieldValue.increment(1)
        });
        
        // Record the check-in
        const checkInData = {
            userId: user.uid,
            venueId: venueId,
            venueName: venueName,
            timestamp: now,
            location: location || { latitude: 0, longitude: 0 },
            points: 10
        };
        
        await db.collection('checkIns').add(checkInData);
        
        // Award XP for check-in - FIXED PARAMETERS
        await awardExperience(user.uid, 10, 'check_in');
        
        // Check for achievements
        // await checkAchievements(); // Comment out for now if this function doesn't exist
        
        // Record activity - FIXED PARAMETERS
        await recordActivity(user.uid, 'check_in', {
            venue: venueName,
            points: 10
        });
        
        console.log('✅ Check-in recorded successfully');
        return checkInData;
        
    } catch (error) {
        console.error('❌ Error recording check-in:', error);
        throw error;
    }
}




// Calculate streak
function calculateStreak(lastCheckIn, currentStreak = 0) {
    if (!lastCheckIn) return 1; // First check-in
    
    const lastDate = lastCheckIn.toDate ? lastCheckIn.toDate() : new Date(lastCheckIn);
    const today = new Date();
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysSince === 0) {
        return currentStreak; // Already checked in today
    } else if (daysSince === 1) {
        return currentStreak + 1; // Consecutive day
    } else {
        return 1; // Streak broken, start over
    }
}

// Achievement system
async function addAchievement(userId, achievementKey) {
    if (!userId || !achievementKey) return false;
    
    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(userId);
        const userSnap = await userRef.get();
        
        if (!userSnap.exists) return false;
        
        const currentAchievements = userSnap.data().passport.achievements || [];
        
        // Check if already has achievement
        if (currentAchievements.includes(achievementKey)) {
            console.log('User already has this achievement');
            return false;
        }
        
        // Add achievement
        await userRef.update({
            'passport.achievements': firebase.firestore.FieldValue.arrayUnion(achievementKey)
        });
        
        // Award achievement XP
        const achievementXP = getAchievementXP(achievementKey);
        if (achievementXP > 0) {
            await awardExperience(userId, achievementXP, `achievement_${achievementKey}`);
        }
        
        // Record activity
        await recordActivity(userId, 'achievement_unlocked', {
            achievement: achievementKey,
            xpAwarded: achievementXP
        });
        
        console.log(`✅ Achievement unlocked: ${achievementKey}`);
        return true;
    } catch (error) {
        console.error('❌ Error adding achievement:', error);
        return false;
    }
}

// Get achievement XP value
function getAchievementXP(achievementKey) {
    const xpValues = {
        founding_member: 0, // Welcome achievement, no XP
        first_checkin: 20,
        streak_week: 50,
        streak_month: 200,
        rising_founder: 30,
        veteran_builder: 100,
        social_butterfly: 50,
        venue_explorer: 75
    };
    
    return xpValues[achievementKey] || 0;
}

// Record user activity
async function recordActivity(userId, type, data = {}) {
    try {
        const db = firebase.firestore();
        const activityData = {
            userId: userId,
            type: type,
            data: data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('activities').add(activityData);
        console.log(`📝 Activity recorded: ${type}`);
    } catch (error) {
        console.error('Error recording activity:', error);
    }
}

// Session management
async function initializeUserSession(user) {
    if (!user) {
        console.log('No user provided for session initialization');
        return null;
    }
    
    try {
        // Create or update user profile
        const userProfile = await createUserProfile(user);
        
        // Set up real-time listeners if needed
        // (We'll add this in a future update)
        
        console.log('✅ User session initialized');
        return userProfile;
    } catch (error) {
        console.error('❌ Error initializing user session:', error);
        return null;
    }
}

// Export utilities for debugging
window.debugAwardXP = async (points) => {
    const auth = firebase.auth();
    const user = auth.currentUser;
    if (!user) {
        console.error('No user logged in');
        return;
    }
    
    const result = await awardExperience(user.uid, points, 'debug_award');
    console.log('Debug XP award result:', result);
};

window.debugUnlockAchievement = async (achievementKey) => {
    const auth = firebase.auth();
    const user = auth.currentUser;
    if (!user) {
        console.error('No user logged in');
        return;
    }
    
    const result = await addAchievement(user.uid, achievementKey);
    console.log('Debug achievement unlock result:', result);
};

// Make functions globally available
window.createUserProfile = createUserProfile;
window.getUserProfile = getUserProfile;
window.updateUserProfile = updateUserProfile;
window.awardExperience = awardExperience;
window.recordCheckIn = recordCheckIn;
window.addAchievement = addAchievement;
window.initializeUserSession = initializeUserSession;

console.log('✅ User management system loaded');
