// venue-system.js - Complete Venue Management System for SociallyFounded

console.log('venue-system.js loading...');

// Global venue data
let allVenues = [];
let filteredVenues = [];

// Initialize the venue system
function initializeVenueSystem() {
    console.log('Venue system initialized');
    
    // Check authentication
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('User authenticated, loading venues');
            loadVenuesFromFirestore(); // Changed function name to avoid recursion
        } else {
            console.log('User not authenticated');
            showAuthPrompt();
        }
    });
}

// Load venues from Firestore (renamed to avoid recursion)
function loadVenuesFromFirestore() {
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
function addVenue() {
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
            loadVenuesFromFirestore(); // Use the correct function name
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
window.loadVenues = loadVenuesFromFirestore; // Fix the function reference
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
