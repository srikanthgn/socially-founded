// user-management.js
// Digital Passport User Management System
// Create this file in your root directory


import { 
    auth, 
    db,
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    onAuthStateChanged
} from './firebase-config.js';    

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

// Create user profile when they first sign up
export async function createUserProfile(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        // Only create if user doesn't exist
        if (!userSnap.exists()) {
            const userData = {
                // Basic profile
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                joinDate: serverTimestamp(),
                
                // Passport data
                passport: {
                    id: generatePassportId(),
                    level: 1,
                    experience: 0,
                    totalCheckIns: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    achievements: ['founding_member'], // First achievement
                    createdAt: serverTimestamp()
                },
                
                // User stats
                stats: {
                    ideasRegistered: 0,
                    venuesVisited: 0,
                   connectionsMade: 0,
                    hoursLogged: 0
                },
                
                // User preferences
                preferences: {
                    notifications: true,
                    publicProfile: true,
                    shareLocation: true
                }
            };
            
            await setDoc(userRef, userData);
            console.log('✅ User profile created:', user.uid);
            return userData;
        } else {
            // Return existing user data
            return userSnap.data();
        }
    } catch (error) {
        console.error('❌ Error creating user profile:', error);
        throw error;
    }
}

// Get user profile data
export async function getUserProfile(uid) {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            console.warn('⚠️ User profile not found:', uid);
            return null;
        }
    } catch (error) {
        console.error('❌ Error getting user profile:', error);
        throw error;
    }
}

// Update user profile
export async function updateUserProfile(uid, updates) {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        console.log('✅ User profile updated:', uid);
    } catch (error) {
        console.error('❌ Error updating user profile:', error);
        throw error;
    }
}

// ============================================
// PASSPORT SYSTEM
// ============================================

// Generate unique passport ID
function generatePassportId() {
    const prefix = 'SF';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}

// Calculate user level based on experience points
function calculateLevel(experience) {
    // Level 1: 0-99 XP
    // Level 2: 100-299 XP  
    // Level 3: 300-599 XP
    // Level 4: 600-999 XP
    // Level 5+: 1000+ XP (every 500 XP = new level)
    
    if (experience < 100) return 1;
    if (experience < 300) return 2;
    if (experience < 600) return 3;
    if (experience < 1000) return 4;
    return Math.floor((experience - 1000) / 500) + 5;
}

// Award experience points and update level
export async function awardExperience(uid, points, reason) {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const currentXP = userData.passport.experience || 0;
            const newXP = currentXP + points;
            const newLevel = calculateLevel(newXP);
            const leveledUp = newLevel > userData.passport.level;
            
            // Update passport data
            const updates = {
                'passport.experience': newXP,
                'passport.level': newLevel,
                updatedAt: serverTimestamp()
            };
            
            // If leveled up, add achievement
            if (leveledUp) {
                const achievements = userData.passport.achievements || [];
                achievements.push(`level_${newLevel}`);
                updates['passport.achievements'] = achievements;
            }
            
            await updateDoc(userRef, updates);
            
            // Log the XP gain
            await logActivity(uid, 'xp_gained', {
                points,
                reason,
                newTotal: newXP,
                leveledUp,
                newLevel: leveledUp ? newLevel : null
            });
            
            console.log(`✅ Awarded ${points} XP to ${uid} for: ${reason}`);
            return { newXP, newLevel, leveledUp };
        }
    } catch (error) {
        console.error('❌ Error awarding experience:', error);
        throw error;
    }
}

// ============================================
// CHECK-IN SYSTEM
// ============================================

// Record a venue check-in
export async function recordCheckIn(uid, venueData, location = null) {
    try {
        // Create check-in record
        const checkInData = {
            userId: uid,
            venueId: venueData.id,
            venueName: venueData.name,
            venueAddress: venueData.address,
            location: location,
            timestamp: serverTimestamp(),
            duration: null, // Will be updated on check-out
            status: 'active'
        };
        
        // Add to check-ins collection
        const checkInRef = await addDoc(collection(db, 'checkIns'), checkInData);
        
        // Update user stats
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const totalCheckIns = (userData.passport.totalCheckIns || 0) + 1;
            
            // Calculate streak (simplified for now)
            const currentStreak = await calculateStreak(uid);
            const longestStreak = Math.max(currentStreak, userData.passport.longestStreak || 0);
            
            // Update user data
            await updateDoc(userRef, {
                'passport.totalCheckIns': totalCheckIns,
                'passport.currentStreak': currentStreak,
                'passport.longestStreak': longestStreak,
                'passport.lastCheckIn': serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            // Award XP for check-in
            await awardExperience(uid, 10, `Check-in at ${venueData.name}`);
            
            // Check for achievements
            await checkStreakAchievements(uid, currentStreak);
        }
        
        console.log('✅ Check-in recorded:', checkInRef.id);
        return checkInRef.id;
        
    } catch (error) {
        console.error('❌ Error recording check-in:', error);
        throw error;
    }
}

// Calculate current streak
async function calculateStreak(uid) {
    try {
        // Get recent check-ins
        const checkInsRef = collection(db, 'checkIns');
        const q = query(
            checkInsRef,
            where('userId', '==', uid),
            orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const checkIns = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Calculate consecutive days (simplified logic)
        let streak = 0;
        const today = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        for (let i = 0; i < checkIns.length; i++) {
            const checkInDate = checkIns[i].timestamp.toDate();
            const daysDiff = Math.floor((today - checkInDate) / oneDayMs);
            
            if (daysDiff === i) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    } catch (error) {
        console.error('❌ Error calculating streak:', error);
        return 0;
    }
}

// Check and award streak achievements
async function checkStreakAchievements(uid, streak) {
    const achievements = [];
    
    if (streak >= 7) achievements.push('streak_week');
    if (streak >= 30) achievements.push('streak_month');
    if (streak >= 100) achievements.push('streak_100');
    
    if (achievements.length > 0) {
        await addAchievements(uid, achievements);
    }
}

// Add achievements to user profile
export async function addAchievements(uid, newAchievements) {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const currentAchievements = userData.passport.achievements || [];
            
            // Add only new achievements
            const uniqueAchievements = [...new Set([...currentAchievements, ...newAchievements])];
            
            await updateDoc(userRef, {
                'passport.achievements': uniqueAchievements,
                updatedAt: serverTimestamp()
            });
            
            console.log('✅ Achievements added:', newAchievements);
        }
    } catch (error) {
        console.error('❌ Error adding achievements:', error);
        throw error;
    }
}

// ============================================
// ACTIVITY LOGGING
// ============================================

// Log user activity
export async function logActivity(uid, type, data = {}) {
    try {
        const activityData = {
            userId: uid,
            type: type,
            data: data,
            timestamp: serverTimestamp()
        };
        
        await addDoc(collection(db, 'activities'), activityData);
    } catch (error) {
        console.error('❌ Error logging activity:', error);
    }
}

// ============================================
// USER SESSION MANAGEMENT
// ============================================

// Initialize user session and passport
export function initializeUserSession() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Get or create user profile
                    const userData = await createUserProfile(user);
                    
                    // Update UI with user data
                    updateUIWithUserData(userData);
                    
                    console.log('✅ User session initialized:', user.uid);
                    resolve({ user, userData });
                } catch (error) {
                    console.error('❌ Error initializing user session:', error);
                    resolve({ user: null, userData: null });
                }
            } else {
                // User signed out
                updateUIForSignedOutUser();
                resolve({ user: null, userData: null });
            }
        });
        
        // Return unsubscribe function
        return unsubscribe;
    });
}

// Update UI with user data
function updateUIWithUserData(userData) {
    // Update passport display
    const passportSection = document.getElementById('passport-section');
    if (passportSection) {
        passportSection.style.display = 'block';
        
        // Update passport details
        updatePassportDisplay(userData);
    }
    
    // Hide signup form
    const signupForm = document.getElementById('join-form');
    if (signupForm) {
        signupForm.style.display = 'none';
    }
    
    // Show user profile section
    const userSection = document.getElementById('user-profile-section');
    if (userSection) {
        userSection.style.display = 'block';
        updateUserProfileDisplay(userData);
    }
}

// Update UI for signed out user  
function updateUIForSignedOutUser() {
    // Hide passport
    const passportSection = document.getElementById('passport-section');
    if (passportSection) {
        passportSection.style.display = 'none';
    }
    
    // Show signup form
    const signupForm = document.getElementById('join-form');
    if (signupForm) {
        signupForm.style.display = 'block';
    }
    
    // Hide user profile
    const userSection = document.getElementById('user-profile-section');
    if (userSection) {
        userSection.style.display = 'none';
    }
}

// Update passport display
function updatePassportDisplay(userData) {
    const passport = userData.passport;
    
    // Update passport ID
    const passportId = document.getElementById('passport-id');
    if (passportId) passportId.textContent = passport.id;
    
    // Update level
    const level = document.getElementById('passport-level');
    if (level) level.textContent = passport.level;
    
    // Update XP
    const xp = document.getElementById('passport-xp');
    if (xp) xp.textContent = passport.experience;
    
    // Update check-ins
    const checkIns = document.getElementById('passport-checkins');
    if (checkIns) checkIns.textContent = passport.totalCheckIns;
    
    // Update streak
    const streak = document.getElementById('passport-streak');
    if (streak) streak.textContent = passport.currentStreak;
}

// Update user profile display
function updateUserProfileDisplay(userData) {
    // Update avatar
    const avatar = document.getElementById('user-avatar');
    if (avatar && userData.photoURL) {
        avatar.src = userData.photoURL;
    }
    
    // Update name
    const name = document.getElementById('user-name');
    if (name) name.textContent = userData.displayName || 'Anonymous Founder';
    
    // Update member since
    const memberSince = document.getElementById('member-since');
    if (memberSince && userData.joinDate) {
        const date = userData.joinDate.toDate();
        memberSince.textContent = date.toLocaleDateString();
    }
}

// Export initialization function for easy setup
export { initializeUserSession as default };
