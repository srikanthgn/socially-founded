// venue-system.js - Core Venue System Functions
// Add this file to your SociallyFounded project

// ===== GLOBAL VARIABLES =====
let currentUserLocation = null;
let nearbyVenues = [];
let userCheckIns = [];
let currentCheckIn = null;

// ===== LOCATION SERVICES =====

// Request user location permission and get current position
async function requestLocationPermission() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by this browser', 'error');
        return null;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });

        currentUserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
        };

        console.log('Location obtained:', currentUserLocation);
        return currentUserLocation;
    } catch (error) {
        console.error('Error getting location:', error);
        showToast('Unable to get your location. You can still add venues manually.', 'warning');
        return null;
    }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}

// ===== VENUE CRUD OPERATIONS =====

// Add a new venue
async function addVenue(venueData) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast('Please sign in to add venues', 'error');
        return null;
    }

    try {
        // Check if user is Level 2+ (simplified for now - just check if user exists)
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            showToast('Please complete your profile first', 'error');
            return null;
        }

        // Check for duplicate venues within 50m
        const nearbyExisting = await findNearbyVenues(
            venueData.location.lat, 
            venueData.location.lng, 
            0.05 // 50m radius
        );

        if (nearbyExisting.length > 0) {
            showToast('A venue already exists at this location', 'warning');
            return null;
        }

        // Prepare venue document
        const venueDoc = {
            name: venueData.name,
            type: venueData.type,
            description: venueData.description || '',
            address: venueData.address,
            location: new firebase.firestore.GeoPoint(venueData.location.lat, venueData.location.lng),
            city: venueData.city || '',
            country: venueData.country || '',
            amenities: venueData.amenities || [],
            photos: venueData.photos || [],
            operatingHours: venueData.operatingHours || getDefaultOperatingHours(),
            addedBy: user.uid,
            status: 'pending',
            verificationCount: 0,
            totalCheckIns: 0,
            uniqueVisitors: [],
            averageRating: 0,
            ratingCount: 0,
            averageDwellTime: 0,
            subscriptionTier: 'free',
            subscriptionExpiry: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            verifiedAt: null
        };

        // Add to Firestore
        const docRef = await firebase.firestore().collection('venues').add(venueDoc);
        
        // Award XP to user for adding venue
        await awardExperience(user.uid, 50, 'venue_added');
        
        // Log activity
        await logActivity(user.uid, 'venue_added', {
            venueId: docRef.id,
            venueName: venueData.name
        });

        showToast('Venue added successfully! You earned 50 XP.', 'success');
        return docRef.id;

    } catch (error) {
        console.error('Error adding venue:', error);
        showToast('Error adding venue. Please try again.', 'error');
        return null;
    }
}

// Get default operating hours
function getDefaultOperatingHours() {
    return {
        monday: { open: "07:00", close: "22:00", closed: false },
        tuesday: { open: "07:00", close: "22:00", closed: false },
        wednesday: { open: "07:00", close: "22:00", closed: false },
        thursday: { open: "07:00", close: "22:00", closed: false },
        friday: { open: "07:00", close: "22:00", closed: false },
        saturday: { open: "08:00", close: "23:00", closed: false },
        sunday: { open: "08:00", close: "21:00", closed: false }
    };
}

// Find venues near a location
async function findNearbyVenues(lat, lng, radiusKm = 10) {
    try {
        // Calculate approximate bounds for the query
        const bounds = calculateBounds(lat, lng, radiusKm);
        
        const venuesRef = firebase.firestore().collection('venues');
        const query = venuesRef
            .where('location', '>=', new firebase.firestore.GeoPoint(bounds.south, bounds.west))
            .where('location', '<=', new firebase.firestore.GeoPoint(bounds.north, bounds.east))
            .orderBy('location')
            .limit(100);

        const snapshot = await query.get();
        const venues = [];

        snapshot.forEach(doc => {
            const venueData = doc.data();
            const distance = calculateDistance(
                lat, lng,
                venueData.location.latitude,
                venueData.location.longitude
            );

            // Filter by actual distance (since bounds are approximate)
            if (distance <= radiusKm * 1000) {
                venues.push({
                    id: doc.id,
                    ...venueData,
                    distance: Math.round(distance)
                });
            }
        });

        // Sort by distance
        venues.sort((a, b) => a.distance - b.distance);
        return venues;

    } catch (error) {
        console.error('Error finding nearby venues:', error);
        return [];
    }
}

// Calculate bounds for geo query
function calculateBounds(lat, lng, radiusKm) {
    const latDelta = radiusKm / 111.32; // Approximate km per degree of latitude
    const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));

    return {
        north: lat + latDelta,
        south: lat - latDelta,
        east: lng + lngDelta,
        west: lng - lngDelta
    };
}

// Get a single venue by ID
async function getVenue(venueId) {
    try {
        const doc = await firebase.firestore().collection('venues').doc(venueId).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting venue:', error);
        return null;
    }
}

// ===== CHECK-IN SYSTEM =====

// Check in to a venue
async function checkInToVenue(venueId, userLocation = null) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast('Please sign in to check in', 'error');
        return null;
    }

    try {
        // Check if user is already checked in somewhere
        if (currentCheckIn && currentCheckIn.isActive) {
            showToast('Please check out of your current venue first', 'warning');
            return null;
        }

        // Get venue details
        const venue = await getVenue(venueId);
        if (!venue) {
            showToast('Venue not found', 'error');
            return null;
        }

        // Validate location if provided
        let distanceFromVenue = 0;
        if (userLocation) {
            distanceFromVenue = calculateDistance(
                userLocation.lat, userLocation.lng,
                venue.location.latitude, venue.location.longitude
            );

            // Allow manual override if distance is > 150m but < 1km
            if (distanceFromVenue > 150 && distanceFromVenue < 1000) {
                const confirmed = confirm(`You're ${Math.round(distanceFromVenue)}m from ${venue.name}. Check in anyway?`);
                if (!confirmed) return null;
            } else if (distanceFromVenue >= 1000) {
                showToast('You must be closer to the venue to check in', 'error');
                return null;
            }
        }

        // Check for recent check-in to same venue (prevent spam)
        const recentCheckIns = await firebase.firestore()
            .collection('checkIns')
            .where('userId', '==', user.uid)
            .where('venueId', '==', venueId)
            .where('checkInTime', '>', new Date(Date.now() - 30 * 60 * 1000)) // Last 30 minutes
            .get();

        if (!recentCheckIns.empty) {
            showToast('You already checked in recently', 'warning');
            return null;
        }

        // Calculate current streak
        const currentStreak = await calculateUserStreak(user.uid);

        // Create check-in document
        const checkInDoc = {
            userId: user.uid,
            venueId: venueId,
            checkInTime: firebase.firestore.FieldValue.serverTimestamp(),
            checkOutTime: null,
            dwellTime: null,
            userLocation: userLocation ? new firebase.firestore.GeoPoint(userLocation.lat, userLocation.lng) : null,
            distanceFromVenue: Math.round(distanceFromVenue),
            method: userLocation ? 'auto' : 'manual',
            xpAwarded: 10,
            streakDay: currentStreak + 1,
            isActive: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Add check-in to Firestore
        const checkInRef = await firebase.firestore().collection('checkIns').add(checkInDoc);
        
        // Update venue analytics
        await updateVenueAnalytics(venueId, user.uid, 'checkin');
        
        // Award XP
        await awardExperience(user.uid, 10, 'venue_checkin');
        
        // Update user streak
        await updateUserStreak(user.uid, currentStreak + 1);
        
        // Log activity
        await logActivity(user.uid, 'venue_checkin', {
            venueId: venueId,
            venueName: venue.name,
            checkInId: checkInRef.id
        });

        // Set current check-in
        currentCheckIn = {
            id: checkInRef.id,
            ...checkInDoc,
            venueName: venue.name,
            isActive: true
        };

        showToast(`Checked in to ${venue.name}! +10 XP`, 'success');
        return checkInRef.id;

    } catch (error) {
        console.error('Error checking in:', error);
        showToast('Error checking in. Please try again.', 'error');
        return null;
    }
}

// Check out of current venue
async function checkOutOfVenue(checkInId = null) {
    const user = firebase.auth().currentUser;
    if (!user) return null;

    try {
        // Find active check-in
        const activeCheckInId = checkInId || (currentCheckIn ? currentCheckIn.id : null);
        if (!activeCheckInId) {
            showToast('No active check-in found', 'warning');
            return null;
        }

        // Get check-in document
        const checkInDoc = await firebase.firestore().collection('checkIns').doc(activeCheckInId).get();
        if (!checkInDoc.exists) {
            showToast('Check-in not found', 'error');
            return null;
        }

        const checkInData = checkInDoc.data();
        const checkInTime = checkInData.checkInTime.toDate();
        const checkOutTime = new Date();
        const dwellTime = Math.round((checkOutTime - checkInTime) / (1000 * 60)); // Minutes

        // Update check-in document
        await firebase.firestore().collection('checkIns').doc(activeCheckInId).update({
            checkOutTime: firebase.firestore.FieldValue.serverTimestamp(),
            dwellTime: dwellTime,
            isActive: false
        });

        // Update venue analytics
        await updateVenueAnalytics(checkInData.venueId, user.uid, 'checkout', dwellTime);

        // Clear current check-in
        currentCheckIn = null;

        // Show rating prompt after a short delay
        setTimeout(() => {
            showRatingPrompt(checkInData.venueId, activeCheckInId, dwellTime);
        }, 2000);

        showToast(`Checked out! You stayed for ${dwellTime} minutes.`, 'success');
        return activeCheckInId;

    } catch (error) {
        console.error('Error checking out:', error);
        showToast('Error checking out. Please try again.', 'error');
        return null;
    }
}

// Update venue analytics
async function updateVenueAnalytics(venueId, userId, action, dwellTime = null) {
    try {
        const venueRef = firebase.firestore().collection('venues').doc(venueId);
        
        if (action === 'checkin') {
            await venueRef.update({
                totalCheckIns: firebase.firestore.FieldValue.increment(1),
                uniqueVisitors: firebase.firestore.FieldValue.arrayUnion(userId),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else if (action === 'checkout' && dwellTime) {
            // Get current average to calculate new average
            const venueDoc = await venueRef.get();
            const venueData = venueDoc.data();
            const currentAvg = venueData.averageDwellTime || 0;
            const totalCheckIns = venueData.totalCheckIns || 0;
            
            // Calculate new average dwell time
            const newAvg = totalCheckIns > 0 ? 
                ((currentAvg * (totalCheckIns - 1)) + dwellTime) / totalCheckIns : 
                dwellTime;

            await venueRef.update({
                averageDwellTime: Math.round(newAvg),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Check if venue should be verified (3+ unique visitors)
        const venueDoc = await venueRef.get();
        const venueData = venueDoc.data();
        if (venueData.status === 'pending' && venueData.uniqueVisitors.length >= 3) {
            await venueRef.update({
                status: 'verified',
                verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Award bonus XP to venue creator
            await awardExperience(venueData.addedBy, 100, 'venue_verified');
        }

    } catch (error) {
        console.error('Error updating venue analytics:', error);
    }
}

// ===== HELPER FUNCTIONS =====

// Calculate user's current check-in streak
async function calculateUserStreak(userId) {
    try {
        // Get user's check-ins from last 30 days, ordered by date
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const checkInsSnapshot = await firebase.firestore()
            .collection('checkIns')
            .where('userId', '==', userId)
            .where('checkInTime', '>', thirtyDaysAgo)
            .orderBy('checkInTime', 'desc')
            .get();

        if (checkInsSnapshot.empty) return 0;

        // Group check-ins by date
        const checkInsByDate = {};
        checkInsSnapshot.forEach(doc => {
            const checkInTime = doc.data().checkInTime.toDate();
            const dateString = checkInTime.toDateString();
            checkInsByDate[dateString] = true;
        });

        // Calculate consecutive days
        let streak = 0;
        let currentDate = new Date();
        
        while (streak < 100) { // Max streak to check
            const dateString = currentDate.toDateString();
            if (checkInsByDate[dateString]) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    } catch (error) {
        console.error('Error calculating streak:', error);
        return 0;
    }
}

// Update user streak in profile
async function updateUserStreak(userId, newStreak) {
    try {
        await firebase.firestore().collection('users').doc(userId).update({
            'passport.streak': newStreak
        });
        
        // Check for streak achievements
        if (newStreak === 7) {
            await addAchievement(userId, 'streak_week');
        } else if (newStreak === 30) {
            await addAchievement(userId, 'streak_month');
        } else if (newStreak === 100) {
            await addAchievement(userId, 'streak_century');
        }
    } catch (error) {
        console.error('Error updating streak:', error);
    }
}

// Show rating prompt modal
function showRatingPrompt(venueId, checkInId, dwellTime) {
    // This will be implemented in the UI components
    // For now, just log that rating should be requested
    console.log(`Rating prompt for venue ${venueId}, check-in ${checkInId}, dwell time ${dwellTime} minutes`);
    
    // Create a simple rating interface
    const shouldRate = confirm('Would you like to rate your experience at this venue?');
    if (shouldRate) {
        // Open rating modal (to be implemented)
        console.log('Opening rating modal...');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 16px;
                z-index: 1000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                min-width: 300px;
                max-width: 400px;
            }
            .toast.show {
                transform: translateX(0);
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .toast-success { border-left: 4px solid #10B981; }
            .toast-error { border-left: 4px solid #EF4444; }
            .toast-warning { border-left: 4px solid #F59E0B; }
            .toast-info { border-left: 4px solid #3B82F6; }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Export functions for use in other files
window.venueSystem = {
    requestLocationPermission,
    addVenue,
    findNearbyVenues,
    getVenue,
    checkInToVenue,
    checkOutOfVenue,
    calculateDistance,
    showToast
};
