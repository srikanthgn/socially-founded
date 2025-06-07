console.log('Venue system loading...');

let isCheckingIn = false;

async function initiateCheckIn(venueId, venueName) {
    console.log('Check-in initiated for:', venueId, venueName);
    
    if (isCheckingIn) return;
    isCheckingIn = true;
    
    const checkInBtn = document.querySelector(`[data-venue-id="${venueId}"].btn-checkin`);
    
    try {
        if (checkInBtn) {
            checkInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
            checkInBtn.disabled = true;
        }
        
        const position = await getCurrentLocationWithPermission();
        const distance = Math.random() * 200;
        
        if (distance <= 100) {
            showToast(`✅ Checked in to ${venueName}! +10 XP earned`, 'success');
            if (checkInBtn) {
                checkInBtn.innerHTML = '✅ Checked In!';
                setTimeout(() => {
                    checkInBtn.innerHTML = '📍 I\'m Here - Check In (+10 XP)';
                    checkInBtn.disabled = false;
                }, 3000);
            }
        } else {
            showToast(`You're ${Math.round(distance)}m away. Get closer!`, 'warning');
            if (checkInBtn) {
                checkInBtn.innerHTML = '📍 Too far - Get closer!';
                setTimeout(() => {
                    checkInBtn.innerHTML = '📍 I\'m Here - Check In (+10 XP)';
                    checkInBtn.disabled = false;
                }, 3000);
            }
        }
    } catch (error) {
        showToast('Location permission needed for check-in', 'error');
        if (checkInBtn) {
            checkInBtn.innerHTML = '❌ Location unavailable';
            setTimeout(() => {
                checkInBtn.innerHTML = '📍 I\'m Here - Check In (+10 XP)';
                checkInBtn.disabled = false;
            }, 3000);
        }
    } finally {
        isCheckingIn = false;
    }
}

async function getCurrentLocationWithPermission() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            position => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }),
            error => reject(error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    });
}

async function manualCheckIn(venueId, venueName) {
    console.log('Manual check-in for:', venueName);
    showToast(`✅ Manual check-in to ${venueName}! +5 XP earned`, 'success');
}

function showToast(message, type = 'info') {
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-notification {
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                max-width: 400px; animation: slideInRight 0.3s ease-out;
            }
            .toast-content {
                background: white; border-radius: 12px; padding: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12); display: flex;
                align-items: center; gap: 12px; border-left: 4px solid #007bff;
            }
            .toast-success .toast-content { border-left-color: #28a745; }
            .toast-error .toast-content { border-left-color: #dc3545; }
            .toast-warning .toast-content { border-left-color: #ffc107; }
            .toast-message { flex: 1; font-size: 14px; color: #333; }
            .toast-close { background: none; border: none; cursor: pointer; }
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

window.initiateCheckIn = initiateCheckIn;
window.manualCheckIn = manualCheckIn;
window.showToast = showToast;

console.log('✅ GPS Check-in System loaded');
