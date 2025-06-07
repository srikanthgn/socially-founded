// venue-system.js - Complete Venue Management System for SociallyFounded

console.log('venue-system.js loading...');

// Global venue data
let allVenues = [];
let filteredVenues = [];
let firebaseReady = false;

// Wait for Firebase to be ready
function waitForFirebase() {
    return new Promise((resolve) => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            firebaseReady = true;
            resolve();
        } else {
            // Listen for the firebaseReady event
            window.addEventListener('firebaseReady', () => {
                firebaseReady = true;
                resolve();
            });
            
            // Also poll in case event was missed
            const checkFirebase = () => {
                if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                    firebaseReady = true;
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        }
    });
}

// Initialize the venue system
async function initializeVenueSystem() {
    console.log('Venue system initializing...');
    
    // Wait for Firebase to be ready
    await waitForFirebase();
    console.log('Firebase ready, continuing venue system initialization');
    
    // Check authentication
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('User authenticated, loading venues');
            loadVenuesFromFirestore();
        } else {
            console.log('User not authenticated');
            showAuthPrompt();
        }
    });
}

// Load venues from Firestore
function loadVenuesFromFirestore() {
    if (!firebaseReady) {
        console.log('Firebase not ready, cannot load venues');
        return;
    }

    const loadingState = document.getElementById('loadingState');
    const venuesGrid = document.getElementById('venuesGrid');
    const emptyState = document.getElementById('emptyState');
    
    // Show loading
    if (loadingState) loadingState.style.display = 'flex';
    if (venuesGrid) venuesGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    
    // Get venues from Firestore
    firebase.firestore().collection('venues')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get()
        .then(function(querySnapshot) {
            const venues = [];
            querySnapshot.forEach(function(doc) {
                venues.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            allVenues = venues;
            filteredVenues = venues;
            
            // Hide loading
            if (loadingState) loadingState.style.display = 'none';
            
            if (venues.length > 0) {
                displayVenues(venues);
                if (venuesGrid) venuesGrid.style.display = 'grid';
            } else {
                if (emptyState) emptyState.style.display = 'block';
            }
        })
        .catch(function(error) {
            console.error('Error loading venues:', error);
            if (loadingState) loadingState.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        });
}

// Display venues in the grid
function displayVenues(venues) {
    const venuesGrid = document.getElementById('venuesGrid');
    if (!venuesGrid) return;
    
    venuesGrid.innerHTML = venues.map(venue => `
        <div class="venue-card" onclick="openVenueDetail('${venue.id}')">
            <div class="venue-image">
                <i class="fas fa-${getVenueIcon(venue.type)}"></i>
                ${venue.status ? `<div class="venue-badge ${venue.status}">${venue.status}</div>` : ''}
            </div>
            <div class="venue-info">
                <div class="venue-name">${venue.name}</div>
                <div class="venue-type">${venue.type}</div>
                <div class="venue-rating">
                    <div class="stars">
                        ${generateStars(venue.averageRating || 0)}
                    </div>
                    <div class="rating-text">
                        ${venue.averageRating ? `${venue.averageRating.toFixed(1)} (${venue.ratingCount || 0} reviews)` : 'No reviews yet'}
                    </div>
                </div>
                <div class="venue-amenities">
                    ${(venue.amenities || []).slice(0, 3).map(amenity => 
                        `<span class="amenity-tag">${amenity}</span>`
                    ).join('')}
                </div>
                <div class="venue-stats">
                    <div class="venue-stat">
                        <div class="stat-number">${venue.totalCheckIns || 0}</div>
                        <div class="stat-label">Check-ins</div>
                    </div>
                    <div class="venue-stat">
                        <div class="stat-number">${venue.uniqueVisitors ? venue.uniqueVisitors.length : 0}</div>
                        <div class="stat-label">Visitors</div>
                    </div>
                    <div class="venue-stat">
                        <div class="stat-number">${Math.round(venue.averageDwellTime || 0)}m</div>
                        <div class="stat-label">Avg Stay</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Get icon for venue type
function getVenueIcon(type) {
    const icons = {
        'cafe': 'coffee',
        'restaurant': 'utensils',
        'coworking': 'building',
        'library': 'book',
        'hotel': 'bed',
        'park': 'tree'
    };
    return icons[type] || 'map-marker-alt';
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Handle adding a new venue
async function addVenue() {
    if (!firebaseReady) {
        showToast('Firebase not ready, please try again', 'error');
        return;
    }

    const form = document.getElementById('addVenueForm');
    if (!form) return;
    
    const formData = new FormData(form);
    
    // Get amenities
    const amenities = [];
    const amenityCheckboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    amenityCheckboxes.forEach(checkbox => {
        amenities.push(checkbox.value);
    });
    
    // Prepare venue data
    const venueData = {
        name: formData.get('venueName') || document.getElementById('venueName').value,
        type: formData.get('venueType') || document.getElementById('venueType').value,
        address: formData.get('venueAddress') || document.getElementById('venueAddress').value,
        description: formData.get('venueDescription') || document.getElementById('venueDescription').value || '',
        amenities: amenities,
        status: 'pending',
        addedBy: firebase.auth().currentUser.uid,
        totalCheckIns: 0,
        uniqueVisitors: [],
        averageRating: 0,
        ratingCount: 0,
        averageDwellTime: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Get current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            venueData.location = new firebase.firestore.GeoPoint(
                position.coords.latitude,
                position.coords.longitude
            );
            
            submitVenue(venueData);
        }, function(error) {
            console.log('Geolocation error:', error);
            // Submit without location
            submitVenue(venueData);
        });
    } else {
        // Submit without location
        submitVenue(venueData);
    }
}

// Submit venue to Firestore
function submitVenue(venueData) {
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding venue...';
    }
    
    firebase.firestore().collection('venues').add(venueData)
        .then(function(docRef) {
            console.log('Venue added with ID:', docRef.id);
            
            // Award XP to user
            if (typeof awardExperience === 'function') {
                awardExperience(50, 'venue_add');
            }
            
            // Show success message
            showToast('Venue added successfully! You earned 50 XP.', 'success');
            
            // Close modal and refresh venues
            closeAddVenueModal();
            loadVenuesFromFirestore();
        })
        .catch(function(error) {
            console.error('Error adding venue:', error);
            showToast('Error adding venue. Please try again.', 'error');
        })
        .finally(function() {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Venue (Earn 50 XP!)';
            }
        });
}

// Show authentication prompt
function showAuthPrompt() {
    const venuesGrid = document.getElementById('venuesGrid');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    
    if (loadingState) loadingState.style.display = 'none';
    if (venuesGrid) venuesGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    
    const emptyTitle = document.querySelector('#emptyState h3');
    const emptyText = document.querySelector('#emptyState p');
    
    if (emptyTitle) emptyTitle.textContent = 'Sign in to discover venues';
    if (emptyText) emptyText.textContent = 'Create your account to find amazing workspaces and add your favorite spots.';
}

// Filter venues
function filterVenues() {
    const searchInput = document.getElementById('venueSearch');
    const typeFilter = document.getElementById('typeFilter');
    const distanceFilter = document.getElementById('distanceFilter');
    
    if (!searchInput || !typeFilter || !distanceFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedDistance = distanceFilter.value;
    
    filteredVenues = allVenues.filter(venue => {
        // Search filter
        const matchesSearch = !searchTerm || 
            venue.name.toLowerCase().includes(searchTerm) ||
            venue.address.toLowerCase().includes(searchTerm) ||
            venue.description.toLowerCase().includes(searchTerm);
        
        // Type filter
        const matchesType = !selectedType || venue.type === selectedType;
        
        // Distance filter (placeholder - would need user location)
        const matchesDistance = !selectedDistance; // For now, show all
        
        return matchesSearch && matchesType && matchesDistance;
    });
    
    displayVenues(filteredVenues);
    
    // Show/hide empty state
    const venuesGrid = document.getElementById('venuesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredVenues.length === 0) {
        if (venuesGrid) venuesGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    } else {
        if (venuesGrid) venuesGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
    }
}

// Open venue detail (placeholder for now)
function openVenueDetail(venueId) {
    console.log('Opening venue detail for:', venueId);
    // TODO: Implement venue detail page or modal
    showToast('Venue details coming soon!', 'info');
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s;
    `;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Close add venue modal
function closeAddVenueModal() {
    const modal = document.getElementById('addVenueModal');
    if (modal) {
        modal.classList.remove('show');
        const form = document.getElementById('addVenueForm');
        if (form) form.reset();
    }
}

// Make functions globally available
window.initializeVenueSystem = initializeVenueSystem;
window.loadVenues = loadVenuesFromFirestore;
window.addVenue = addVenue;
window.filterVenues = filterVenues;
window.openVenueDetail = openVenueDetail;
window.closeAddVenueModal = closeAddVenueModal;
window.showToast = showToast;

console.log('venue-system.js loaded successfully');
console.log('Available functions:', {
    initializeVenueSystem: typeof initializeVenueSystem,
    loadVenues: typeof loadVenuesFromFirestore,
    addVenue: typeof addVenue,
    filterVenues: typeof filterVenues
});

// =============================================================================
// GPS CHECK-IN SYSTEM FOR SPRINT 2
// =============================================================================

// Global variables for check-in system
let isCheckingIn = false;
let checkInAttempts = 0;
const MAX_CHECK_IN_ATTEMPTS = 3;

// Main check-in function - triggered by user button tap
async function initiateCheckIn(venueId, venueName) {
    // Prevent multiple simultaneous check-ins
    if (isCheckingIn) {
        console.log('Check-in already in progress');
        return;
    }
    
    isCheckingIn = true;
    checkInAttempts++;
    
    const checkInBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-checkin`);
    const manualBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-manual-checkin`);

    // Start performance monitoring
    if (window.startCheckInTrace) {
        window.startCheckInTrace();
    }

    try {
        // Update UI to show loading
        updateCheckInButton(checkInBtn, 'loading', '<i class="fas fa-spinner fa-spin"></i> Getting location...');

        // Get user location (requires user gesture for iOS PWA)
        const position = await getCurrentLocationWithPermission();
        console.log('User location obtained:', position);

        // For MVP, we'll simulate venue location check
        // In production, this would fetch from Firestore
        const distance = Math.random() * 200; // Simulate 0-200m distance

        console.log(`Simulated distance to venue: ${distance.toFixed(0)}m`);

        if (distance <= 100) {
            // User is close enough - proceed with check-in
            await performSuccessfulCheckIn(venueId, position, venueName, distance);

            // Track success
            if (window.endCheckInTrace) {
                window.endCheckInTrace(true);
            }
        } else {
            // User is too far - show distance and offer manual option
            showDistanceError(distance, venueId, venueName, checkInBtn, manualBtn);

            // Track distance error
            if (window.endCheckInTrace) {
                window.endCheckInTrace(false, 'distance_too_far');
            }
        }

    } catch (error) {
        console.error('Check-in failed:', error);

        // Track location errors
        if (window.trackLocationError) {
            window.trackLocationError(error.code || 'unknown', error.message);
        }

        // Track failure
        if (window.endCheckInTrace) {
            window.endCheckInTrace(false, error.message);
        }

        showLocationError(error, venueId, venueName, checkInBtn, manualBtn);
    } finally {
        isCheckingIn = false;
    }
}

// Location request optimized for iOS PWA
async function getCurrentLocationWithPermission() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported on this device'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                console.log('Location obtained successfully');
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            error => {
                let errorMessage = 'Location request failed';
                let errorCode = 'unknown';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                        errorCode = 'permission_denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable. Please try again.';
                        errorCode = 'position_unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        errorCode = 'timeout';
                        break;
                }
                
                console.error('Geolocation error:', errorCode, errorMessage);
                
                const locationError = new Error(errorMessage);
                locationError.code = errorCode;
                reject(locationError);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000, // 15 seconds - longer for iOS
                maximumAge: 60000 // Cache for 1 minute
            }
        );
    });
}

// Successful check-in flow
async function performSuccessfulCheckIn(venueId, position, venueName, distance) {
    try {
        console.log('Recording check-in for venue:', venueId);

        // Simulate XP award (will integrate with real system later)
        const xpAwarded = 10;

        // Show success message
        showToast(`✅ Checked in to ${venueName}! +${xpAwarded} XP earned (${Math.round(distance)}m away)`, 'success');

        // Update button to show success
        const checkInBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-checkin`);
        updateCheckInButton(checkInBtn, 'success', '✅ Checked In!');

        // Reset button after 3 seconds
        setTimeout(() => {
            updateCheckInButton(checkInBtn, 'default', '📍 I\'m Here - Check In (+10 XP)');
        }, 3000);

        // Reset check-in attempts counter
        checkInAttempts = 0;

        console.log('Check-in recorded successfully');

    } catch (error) {
        console.error('Check-in recording failed:', error);
        throw error;
    }
}

// Handle distance error (user too far away)
function showDistanceError(distance, venueId, venueName, checkInBtn, manualBtn) {
    const distanceKm = distance > 1000 ? `${(distance/1000).toFixed(1)}km` : `${Math.round(distance)}m`;
    
    updateCheckInButton(checkInBtn, 'error', `📍 ${distanceKm} away - Get closer!`);

    // Show manual check-in option
    if (manualBtn) {
        manualBtn.style.display = 'block';
    }

    // Show helpful message
    showToast(`You're ${distanceKm} from ${venueName}. Get within 100m to check in automatically.`, 'warning');

    // Reset button after 5 seconds
    setTimeout(() => {
        updateCheckInButton(checkInBtn, 'default', '📍 I\'m Here - Check In (+10 XP)');
        if (manualBtn) {
            manualBtn.style.display = 'none';
        }
    }, 5000);
}

// Handle location error (permission denied, etc.)
function showLocationError(error, venueId, venueName, checkInBtn, manualBtn) {
    updateCheckInButton(checkInBtn, 'error', '❌ Location unavailable');

    // Show manual check-in option
    if (manualBtn) {
        manualBtn.style.display = 'block';
    }

    // Show appropriate error message
    let userMessage = 'Location access is needed to verify your check-in.';
    
    if (error.code === 'permission_denied') {
        userMessage = 'Please enable location access in your browser settings to use GPS check-in.';
    } else if (error.code === 'timeout') {
        userMessage = 'Location request timed out. Please try again.';
    }

    showToast(userMessage, 'error');

    // Reset button after 5 seconds
    setTimeout(() => {
        updateCheckInButton(checkInBtn, 'default', '📍 I\'m Here - Check In (+10 XP)');
    }, 5000);
}

// Manual check-in fallback (reduced XP)
async function manualCheckIn(venueId, venueName) {
    try {
        console.log('Performing manual check-in');

        // Award reduced XP for manual check-in
        const xpAwarded = 5;

        // Show success message
        showToast(`✅ Manual check-in to ${venueName} successful! +${xpAwarded} XP earned`, 'success');

        // Hide manual button
        const manualBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-manual-checkin`);
        if (manualBtn) {
            manualBtn.style.display = 'none';
        }

        // Update main button
        const checkInBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-checkin`);
        updateCheckInButton(checkInBtn, 'success', '✅ Checked In (Manual)');

        // Reset after 3 seconds
        setTimeout(() => {
            updateCheckInButton(checkInBtn, 'default', '📍 I\'m Here - Check In (+10 XP)');
        }, 3000);

        console.log('Manual check-in completed');

    } catch (error) {
        console.error('Manual check-in failed:', error);
        showToast('Manual check-in failed. Please try again.', 'error');
    }
}

// Update check-in button appearance and state
function updateCheckInButton(button, state, text) {
    if (!button) return;

    // Remove all state classes
    button.classList.remove('loading', 'success', 'error');
    
    // Add new state class
    if (state !== 'default') {
        button.classList.add(state);
    }
    
    // Update text
    button.innerHTML = text;
    
    //
