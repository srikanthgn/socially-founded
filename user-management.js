// user-management.js
// Complete user profile and passport management system
// Updated: June 4, 2025 - Added social sharing event emitters

// Achievement definitions
const ACHIEVEMENTS = {
    founding_member: {
        id: 'founding_member',
        name: 'Founding Member',
        description: 'Welcome to SociallyFounded!',
        icon: '🚀',
        category: 'milestone',
        condition: (userData) => true // Always unlocked for new users
    },
    first_checkin: {
        id: 'first_checkin',
        name: 'First Steps',
        description: 'Complete your first check-in',
        icon: '👣',
        category: 'checkin',
        condition: (userData) => userData.passport?.totalCheckIns >= 1
    },
    week_warrior: {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        category: 'streak',
        condition: (userData) => userData.passport?.streak >= 7
    },
    monthly_master: {
        id: 'monthly_master',
        name: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: '💎',
        category: 'streak',
        condition: (userData) => userData.passport?.streak >= 30
    },
    rising_founder: {
        id: 'rising_founder',
        name: 'Rising Founder',
        description: 'Reach Level 2',
        icon: '📈',
        category: 'level',
        condition: (userData) => userData.passport?.level >= 2
    },
    veteran_builder: {
        id: 'veteran_builder',
        name: 'Veteran Builder',
        description: 'Reach Level 5',
        icon: '⭐',
        category: 'level',
        condition: (userData) => userData.passport?.level >= 5
    },
    social_butterfly: {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Make 10 connections',
        icon: '🦋',
        category: 'social',
        condition: (userData) => userData.stats?.connectionsMade >= 10
    },
    venue_explorer: {
        id: 'venue_explorer',
        name: 'Venue Explorer',
        description: 'Visit 5 different venues',
        icon: '🗺️',
        category: 'exploration',
        condition: (userData) => userData.stats?.venuesVisited >= 5
    }
};

// Level calculation function
function calculateLevel(experience) {
    if (experience < 100) return 1;
    if (experience < 300) return 2;
    if (experience < 600) return 3;
    if (experience < 1000) return 4;
    
    // Level 5 and beyond: every 500 XP
    return Math.floor((experience - 1000) / 500) + 5;
}

// Event emitter for level ups (NEW FUNCTION FOR SOCIAL SHARING)
function emitLevelUpEvent(oldLevel, newLevel) {
    window.dispatchEvent(new CustomEvent('levelUp', {
        detail: { oldLevel, newLevel, level: newLevel }
    }));
}

// Event emitter for achievements (NEW FUNCTION FOR SOCIAL SHARING)
function emitAchievementEvent(achievement) {
    window.dispatchEvent(new CustomEvent('achievementUnlocked', {
        detail: achievement
    }));
}

// Create or update user profile
async function createUserProfile(user) {
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(user.uid);
    
    try {
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            // Generate unique passport ID
            const passportId = generatePassportId();
            
            const userData = {
                profile: {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || '',
                    photoURL: user.photoURL || '',
                    joinDate: firebase.firestore.FieldValue.serverTimestamp()
                },
                passport: {
                    id: passportId,
                    level: 1,
                    experience: 0,
                    totalCheckIns: 0,
                    streak: 0,
                    lastCheckIn: null,
                    achievements: ['founding_member'] // Start with founding member achievement
                },
                stats: {
                    ideasRegistered: 0,
                    venuesVisited: 0,
                    connectionsMade: 0
                }
            };
            
            await userRef.set(userData);
            console.log('User profile created:', passportId);
            
            // Emit founding member achievement event
            emitAchievementEvent({
                key: 'founding_member',
                name: 'Founding Member',
                icon: '🚀'
            });
            
            return userData;
        } else {
            console.log('User profile already exists');
            return userDoc.data();
        }
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

// Generate unique passport ID
function generatePassportId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `SF-${timestamp}-${random}`;
}

// Award experience points
async function awardExperience(userId, points, reason = '') {
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(userId);
    
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        const currentXP = userData.passport?.experience || 0;
        const currentLevel = userData.passport?.level || 1;
        const newXP = currentXP + points;
        const newLevel = calculateLevel(newXP);
        
        // Update user XP and level
        await userRef.update({
            'passport.experience': newXP,
            'passport.level': newLevel
        });
        
        // Check if level increased (UPDATED WITH EVENT EMITTER)
        if (newLevel > currentLevel) {
            console.log(`Level up! ${currentLevel} → ${newLevel}`);
            
            // Emit level up event for social sharing
            emitLevelUpEvent(currentLevel, newLevel);
            
            // Check for level-based achievements
            await checkAndUnlockAchievements(userId);
        }
        
        // Log activity
        await logActivity(userId, 'xp_earned', {
            points,
            reason,
            newTotal: newXP,
            newLevel
        });
        
        console.log(`Awarded ${points} XP to user ${userId}. Total: ${newXP}`);
        return { newXP, newLevel, leveledUp: newLevel > currentLevel };
        
    } catch (error) {
        console.error('Error awarding experience:', error);
        throw error;
    }
}

// Record venue check-in
async function recordCheckIn(userId, venueId, location = null) {
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(userId);
    
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        const now = new Date();
        const lastCheckIn = userData.passport?.lastCheckIn?.toDate();
        
        // Calculate streak
        let newStreak = 1;
        if (lastCheckIn) {
            const daysSinceLastCheckIn = Math.floor((now - lastCheckIn) / (1000 * 60 * 60 * 24));
            if (daysSinceLastCheckIn === 1) {
                // Consecutive day - continue streak
                newStreak = (userData.passport?.streak || 0) + 1;
            } else if (daysSinceLastCheckIn === 0) {
                // Same day - maintain streak but don't increment
                newStreak = userData.passport?.streak || 1;
            }
            // If daysSinceLastCheckIn > 1, streak resets to 1
        }
        
        // Create check-in record
        const checkInData = {
            userId,
            venueId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            location: location || null
        };
        
        await db.collection('checkIns').add(checkInData);
        
        // Update user stats
        const totalCheckIns = (userData.passport?.totalCheckIns || 0) + 1;
        const venuesVisited = userData.stats?.venuesVisited || 0;
        
        await userRef.update({
            'passport.totalCheckIns': totalCheckIns,
            'passport.streak': newStreak,
            'passport.lastCheckIn': firebase.firestore.FieldValue.serverTimestamp(),
            'stats.venuesVisited': venuesVisited + 1
        });
        
        // Award XP for check-in
        await awardExperience(userId, 10, 'Venue check-in');
        
        // Check for achievements
        await checkAndUnlockAchievements(userId);
        
        // Log activity
        await logActivity(userId, 'checkin', {
            venueId,
            totalCheckIns,
            streak: newStreak
        });
        
        return {
            success: true,
            totalCheckIns,
            streak: newStreak,
            xpAwarded: 10
        };
        
    } catch (error) {
        console.error('Error recording check-in:', error);
        throw error;
    }
}

// Check and unlock achievements (UPDATED WITH EVENT EMITTER)
async function checkAndUnlockAchievements(userId) {
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(userId);
    
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;
        
        const userData = userDoc.data();
        const currentAchievements = userData.passport?.achievements || [];
        const newAchievements = [];
        
        // Check each achievement
        for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
            if (!currentAchievements.includes(key) && achievement.condition(userData)) {
                newAchievements.push(key);
                console.log(`Achievement unlocked: ${achievement.name}`);
                
                // Emit achievement event for social sharing
                emitAchievementEvent({
                    key: key,
                    name: achievement.name,
                    icon: achievement.icon
                });
            }
        }
        
        // Update achievements if any new ones
        if (newAchievements.length > 0) {
            const updatedAchievements = [...currentAchievements, ...newAchievements];
            await userRef.update({
                'passport.achievements': updatedAchievements
            });
            
            // Award XP for each achievement
            for (const achievement of newAchievements) {
                await awardExperience(userId, 50, `Achievement: ${ACHIEVEMENTS[achievement].name}`);
            }
        }
        
        return newAchievements;
        
    } catch (error) {
        console.error('Error checking achievements:', error);
    }
}

// Add achievement manually (for testing or special cases)
async function addAchievement(userId, achievementKey) {
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(userId);
    
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        const currentAchievements = userData.passport?.achievements || [];
        
        if (!currentAchievements.includes(achievementKey) && ACHIEVEMENTS[achievementKey]) {
            const updatedAchievements = [...currentAchievements, achievementKey];
            await userRef.update({
                'passport.achievements': updatedAchievements
            });
            
            console.log(`Achievement added: ${ACHIEVEMENTS[achievementKey].name}`);
            
            // Emit achievement event for social sharing (ADDED)
            emitAchievementEvent({
                key: achievementKey,
                name: ACHIEVEMENTS[achievementKey].name,
                icon: ACHIEVEMENTS[achievementKey].icon
            });
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error adding achievement:', error);
        throw error;
    }
}

// Log user activity
async function logActivity(userId, type, data) {
    const db = firebase.firestore();
    
    try {
        await db.collection('activities').add({
            userId,
            type,
            data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Get user data
async function getUserData(userId) {
    const db = firebase.firestore();
    
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Initialize user session
async function initializeUserSession(user) {
    if (!user) return;
    
    try {
        // Create profile if doesn't exist
        await createUserProfile(user);
        
        // Update last login
        const db = firebase.firestore();
        await db.collection('users').doc(user.uid).update({
            'profile.lastLogin': firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('User session initialized');
        
    } catch (error) {
        console.error('Error initializing user session:', error);
    }
}

// Export functions for use in other files
window.createUserProfile = createUserProfile;
window.awardExperience = awardExperience;
window.recordCheckIn = recordCheckIn;
window.getUserData = getUserData;
window.initializeUserSession = initializeUserSession;
window.ACHIEVEMENTS = ACHIEVEMENTS;

// Debug functions for testing
window.debugAwardXP = async (points) => {
    const user = firebase.auth().currentUser;
    if (user) {
        const result = await awardExperience(user.uid, points, 'Debug XP');
        console.log('Debug XP awarded:', result);
    } else {
        console.log('No user logged in');
    }
};

window.debugUnlockAchievement = async (achievementKey) => {
    const user = firebase.auth().currentUser;
    if (user) {
        await addAchievement(user.uid, achievementKey);
        console.log('Debug achievement unlocked:', achievementKey);
    } else {
        console.log('No user logged in');
    }
};
