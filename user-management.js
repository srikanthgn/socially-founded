// user-management.js
// User Management System for SociallyFounded
// This file handles user profiles, passport creation, and data management

// Import Firebase instances from firebase-config.js
import { auth, db } from './firebase-config.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    serverTimestamp,
    increment,
    arrayUnion,
    arrayRemove
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// User profile management
export async function createUserProfile(user) {
    if (!user) return null;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
        // Create new user profile
        const userData = {
            profile: {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'Founder',
                photoURL: user.photoURL || null,
                joinDate: serverTimestamp(),
                lastActive: serverTimestamp()
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
                connectionsMA de: 0,
                eventsAttended: 0
            },
            settings: {
                notifications: true,
                privacy: 'public',
                theme: 'light'
            }
        };
        
        try {
            await setDoc(userRef, userData);
            console.log('✅ User profile created successfully');
            
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
        await updateDoc(userRef, {
            'profile.lastActive': serverTimestamp()
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
export async function getUserProfile(userId) {
    if (!userId) return null;
    
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
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
export async function updateUserProfile(userId, updates) {
    if (!userId || !updates) return false;
    
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updates);
        console.log('✅ Profile updated successfully');
        return true;
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        return false;
    }
}

// Experience and leveling system
export async function awardExperience(userId, points, reason) {
    if (!userId || !points) return false;
    
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) return false;
        
        const currentData = userSnap.data();
        const currentXP = currentData.passport.experience || 0;
        const newXP = currentXP + points;
        const newLevel = calculateLevel(newXP);
        const oldLevel = currentData.passport.level || 1;
        
        // Update user XP and level
        await updateDoc(userRef, {
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

// Check-in system
export async function recordCheckIn(userId, venueId, location) {
    if (!userId || !venueId) return false;
    
    try {
        // Create check-in record
        const checkInData = {
            userId: userId,
            venueId: venueId,
            timestamp: serverTimestamp(),
            location: location || null
        };
        
        const checkInRef = await addDoc(collection(db, 'checkIns'), checkInData);
        
        // Update user stats
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        
        // Calculate streak
        const lastCheckIn = userData.passport.lastCheckIn;
        const currentStreak = calculateStreak(lastCheckIn, userData.passport.currentStreak);
        const longestStreak = Math.max(currentStreak, userData.passport.longestStreak || 0);
        
        // Update passport data
        await updateDoc(userRef, {
            'passport.totalCheckIns': increment(1),
            'passport.currentStreak': currentStreak,
            'passport.longestStreak': longestStreak,
            'passport.lastCheckIn': serverTimestamp()
        });
        
        // Award check-in XP
        await awardExperience(userId, 10, 'venue_checkin');
        
        // Check for achievements
        const totalCheckIns = (userData.passport.totalCheckIns || 0) + 1;
        if (totalCheckIns === 1) {
            await addAchievement(userId, 'first_checkin');
        }
        
        if (currentStreak === 7) {
            await addAchievement(userId, 'streak_week');
        } else if (currentStreak === 30) {
            await addAchievement(userId, 'streak_month');
        }
        
        // Record activity
        await recordActivity(userId, 'venue_checkin', {
            venueId: venueId,
            checkInId: checkInRef.id,
            streak: currentStreak
        });
        
        console.log('✅ Check-in recorded successfully');
        return { checkInId: checkInRef.id, currentStreak, totalCheckIns };
    } catch (error) {
        console.error('❌ Error recording check-in:', error);
        return false;
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
export async function addAchievement(userId, achievementKey) {
    if (!userId || !achievementKey) return false;
    
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) return false;
        
        const currentAchievements = userSnap.data().passport.achievements || [];
        
        // Check if already has achievement
        if (currentAchievements.includes(achievementKey)) {
            console.log('User already has this achievement');
            return false;
        }
        
        // Add achievement
        await updateDoc(userRef, {
            'passport.achievements': arrayUnion(achievementKey)
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
        const activityData = {
            userId: userId,
            type: type,
            data: data,
            timestamp: serverTimestamp()
        };
        
        await addDoc(collection(db, 'activities'), activityData);
        console.log(`📝 Activity recorded: ${type}`);
    } catch (error) {
        console.error('Error recording activity:', error);
    }
}

// Session management
export async function initializeUserSession(user) {
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
    const user = auth.currentUser;
    if (!user) {
        console.error('No user logged in');
        return;
    }
    
    const result = await awardExperience(user.uid, points, 'debug_award');
    console.log('Debug XP award result:', result);
};

window.debugUnlockAchievement = async (achievementKey) => {
    const user = auth.currentUser;
    if (!user) {
        console.error('No user logged in');
        return;
    }
    
    const result = await addAchievement(user.uid, achievementKey);
    console.log('Debug achievement unlock result:', result);
};

console.log('✅ User management system loaded');
