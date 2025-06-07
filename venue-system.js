// SociallyFounded Venue System
console.log('Venue system loading...');

// Global variables for check-in system
let isCheckingIn = false;
let checkInAttempts = 0;
const MAX_CHECK_IN_ATTEMPTS = 3;

// Main check-in function - triggered by user button tap
async function initiateCheckIn(venueId, venueName) {
    console.log('Check-in initiated for:', venueId, venueName);
    
    // Prevent multiple simultaneous check-ins
    if (isCheckingIn) {
        console.log('Check-in already in progress');
        return;
    }
    
    isCheckingIn = true;
    checkInAttempts++;
    
    const checkInBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-checkin`);
    const manualBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-manual-checkin`);

    try {
        // Update UI to show loading
        updateCheckInButton(checkInBtn, 'loading', '<i class="fas fa-spinner fa-spin"></i> Getting location...');

        // Get user location (requires user gesture for iOS PWA)
        const position = await getCurrentLocationWithPermission();
        console.log('User location obtained:', position);

        // For MVP, we'll simulate venue location check
        const distance = Math.random() * 200; // Simulate 0-200m distance

        console.log(`Simulated distance to venue: ${distance.toFixed(0)}m`);

        if (distance <= 100) {
            // User is close enough - proceed with check-in
            await performSuccessfulCheckIn(venueId, position, venueName, distance);
        } else {
            // User is too far - show distance and offer manual option
            showDistanceError(distance, venueId, venueName, checkInBtn, manualBtn);
        }

    } catch (error) {
        console.error('Check-in failed:', error);
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
                timeout: 15000,
                maximumAge: 60000
            }
        );
    });
}

// Successful check-in flow
async function performSuccessfulCheckIn(venueId, position, venueName, distance) {
    try {
        console.log('Recording check-in for venue:', venueId);

        // Simulate XP award
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

        checkInAttempts = 0;
        console.log('Check-in recorded successfully');

    } catch (error) {
        console.error('Check-in recording failed:', error);
        throw error;
    }
}

// Handle distance error
function showDistanceError(distance, venueId, venueName, checkInBtn, manualBtn) {
    const distanceKm = distance > 1000 ? `${(distance/1000).toFixed(1)}km` : `${Math.round(distance)}m`;
    
    updateCheckInButton(checkInBtn, 'error', `📍 ${distanceKm} away - Get closer!`);

    if (manualBtn) {
        manualBtn.style.display = 'block';
    }

    showToast(`You're ${distanceKm} from ${venueName}. Get within 100m to check in automatically.`, 'warning');

    setTimeout(() => {
        updateCheckInButton(checkInBtn, 'default', '📍 I\'m Here - Check In (+10 XP)');
        if (manualBtn) {
            manualBtn.style.display = 'none';
        }
    }, 5000);
}

// Handle location error
function showLocationError(error, venueId, venueName, checkInBtn, manualBtn) {
    updateCheckInButton(checkInBtn, 'error', '❌ Location unavailable');

    if (manualBtn) {
        manualBtn.style.display = 'block';
    }

    let userMessage = 'Location access is needed to verify your check-in.';
    
    if (error.code === 'permission_denied') {
        userMessage = 'Please enable location access in your browser settings to use GPS check-in.';
    } else if (error.code === 'timeout') {
        userMessage = 'Location request timed out. Please try again.';
    }

    showToast(userMessage, 'error');

    setTimeout(() => {
        updateCheckInButton(checkInBtn, 'default', '📍 I\'m Here - Check In (+10 XP)');
    }, 5000);
}

// Manual check-in fallback
async function manualCheckIn(venueId, venueName) {
    try {
        console.log('Performing manual check-in');

        const xpAwarded = 5;
        showToast(`✅ Manual check-in to ${venueName} successful! +${xpAwarded} XP earned`, 'success');

        const manualBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-manual-checkin`);
        if (manualBtn) {
            manualBtn.style.display = 'none';
        }

        const checkInBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-checkin`);
        updateCheckInButton(checkInBtn, 'success', '✅ Checked In (Manual)');

        setTimeout(() => {
            updateCheckInButton(checkInBtn, 'default', '📍 I\'m Here - Check In (+10 XP)');
        }, 3000);

        console.log('Manual check-in completed');

    } catch (error) {
        console.error('Manual check-in failed:', error);
        showToast('Manual check-in failed. Please try again.', 'error');
    }
}

// Update check-in button appearance
function updateCheckInButton(button, state, text) {
    if (!button) return;

    button.classList.remove('loading', 'success', 'error');
    
    if (state !== 'default') {
        button.classList.add(state);
    }
    
    button.innerHTML = text;
    button.disabled = (state === 'loading');
}

// Toast notification system
function showToast(message, type = 'info', duration = 4000) {
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                animation: slideInRight 0.3s ease-out;
            }
            .toast-content {
                background: white;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                display: flex;
                align-items: center;
                gap: 12px;
                border-left: 4px solid #007bff;
            }
            .toast-success .toast-content { border-left-color: #28a745; }
            .toast-error .toast-content { border-left-color: #dc3545; }
            .toast-warning .toast-content { border-left-color: #ffc107; }
            .toast-icon { font-size: 20px; flex-shrink: 0; }
            .toast-message { flex: 1; font-size: 14px; line-height: 1.4; color: #333; }
            .toast-close {
                background: none; border: none; font-size: 18px; cursor: pointer;
                color: #666; padding: 0; width: 24px; height: 24px;
                display: flex; align-items: center; justify-content: center; border-radius: 50%;
            }
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
            }
            @media (max-width: 768px) {
                .toast-notification { top: 10px; right: 10px; left: 10px; max-width: none; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideInRight 0.3s ease-in reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return 'ℹ️';
    }
}

// Make functions globally available
window.initiateCheckIn = initiateCheckIn;
window.manualCheckIn = manualCheckIn;
window.showToast = showToast;

console.log('✅ GPS Check-in System loaded');
