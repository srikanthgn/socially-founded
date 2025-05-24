// PWA Registration Script
// Add this to the bottom of your HTML files or include as a separate file

// Register service worker when the page loads
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
                
                // Subscribe to push notifications if supported
                if ('PushManager' in window) {
                    checkNotificationPermission();
                }
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Check notification permission and subscribe if granted
function checkNotificationPermission() {
    if (Notification.permission === 'granted') {
        subscribeToPushNotifications();
    } else if (Notification.permission !== 'denied') {
        // Wait for user interaction before requesting permission
        document.addEventListener('click', requestNotificationPermission, { once: true });
    }
}

// Request notification permission
function requestNotificationPermission() {
    Notification.requestPermission()
        .then(permission => {
            if (permission === 'granted') {
                subscribeToPushNotifications();
            }
        });
}

// Subscribe to push notifications
function subscribeToPushNotifications() {
    navigator.serviceWorker.ready
        .then(registration => {
            // This would typically communicate with your server
            // to get the public key for VAPID
            const publicKey = 'YOUR_PUBLIC_VAPID_KEY';
            
            // Convert public key to UInt8Array
            const applicationServerKey = urlBase64ToUint8Array(publicKey);
            
            // Subscribe the user
            return registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });
        })
        .then(subscription => {
            // Send subscription to server
            console.log('User subscribed to push notifications');
            
            // This would typically send the subscription to your server
            // return sendSubscriptionToServer(subscription);
        })
        .catch(error => {
            console.error('Failed to subscribe to push notifications:', error);
        });
}

// Helper function to convert base64 to UInt8Array for VAPID
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
}

// Add installation prompt handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Create and show a custom install button if desired
    showInstallButton();
});

// Show custom install button
function showInstallButton() {
    // Check if there's already an install button
    let installButton = document.getElementById('pwa-install-button');
    
    // If the button doesn't exist yet, create it
    if (!installButton) {
        installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.classList.add('install-button');
        installButton.textContent = 'Install App';
        
        // Style the button
        installButton.style.position = 'fixed';
        installButton.style.bottom = '20px';
        installButton.style.right = '20px';
        installButton.style.backgroundColor = '#003554';
        installButton.style.color = 'white';
        installButton.style.padding = '10px 15px';
        installButton.style.borderRadius = '8px';
        installButton.style.fontFamily = 'Poppins, sans-serif';
        installButton.style.fontWeight = '500';
        installButton.style.fontSize = '14px';
        installButton.style.border = 'none';
        installButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        installButton.style.zIndex = '1000';
        installButton.style.display = 'none'; // Hide initially
        
        // Add it to the body
        document.body.appendChild(installButton);
        
        // Add event listener
        installButton.addEventListener('click', installPWA);
    }
    
    // Show the button after 30 seconds
    setTimeout(() => {
        installButton.style.display = 'block';
        
        // Hide after 20 seconds if not clicked
        setTimeout(() => {
            if (installButton.style.display !== 'none') {
                installButton.style.display = 'none';
            }
        }, 20000);
    }, 30000);
}

// Install the PWA
function installPWA() {
    // Hide the install button
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
        installButton.style.display = 'none';
    }
    
    // Show the install prompt
    if (deferredPrompt) {
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
                
                // Show the button again after dismissal
                setTimeout(() => {
                    if (installButton) {
                        installButton.style.display = 'block';
                    }
                }, 300000); // Show again after 5 minutes
            }
            
            // Clear the deferred prompt variable
            deferredPrompt = null;
        });
    }
}

// Track installation status
window.addEventListener('appinstalled', (event) => {
    console.log('SociallyFounded was installed');
    
    // Hide the install button if it exists
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
        installButton.style.display = 'none';
    }
    
    // Clear the deferred prompt variable
    deferredPrompt = null;
    
    // Log installation event to analytics if available
    // Log installation event to analytics if available
if (typeof gtag === 'function') {
    gtag('event', 'pwa_install', {
        'event_category': 'pwa',
        'event_label': 'install',
        'value': 1
    });
}
}); 
// Check for updates to the service worker
function checkForServiceWorkerUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.addEventListener('updatefound', () => {
                // A new service worker is being installed
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available, show update notification
                        showUpdateNotification();
                    }
                });
            });
        });
    }
}

// Run the update check periodically
checkForServiceWorkerUpdates();
setInterval(checkForServiceWorkerUpdates, 3600000); // Check every hour

// Show a notification when an update is available
function showUpdateNotification() {
    // Create update notification element
    let updateNotification = document.getElementById('pwa-update-notification');
    
    // If the notification doesn't exist yet, create it
    if (!updateNotification) {
        updateNotification = document.createElement('div');
        updateNotification.id = 'pwa-update-notification';
        
        // Style the notification
        updateNotification.style.position = 'fixed';
        updateNotification.style.bottom = '20px';
        updateNotification.style.left = '50%';
        updateNotification.style.transform = 'translateX(-50%)';
        updateNotification.style.backgroundColor = 'white';
        updateNotification.style.color = '#003554';
        updateNotification.style.padding = '15px 20px';
        updateNotification.style.borderRadius = '8px';
        updateNotification.style.fontFamily = 'Poppins, sans-serif';
        updateNotification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        updateNotification.style.zIndex = '1001';
        updateNotification.style.display = 'flex';
        updateNotification.style.alignItems = 'center';
        updateNotification.style.gap = '10px';
        updateNotification.style.borderTop = '3px solid #003554';
        
        // Add content
        updateNotification.innerHTML = `
            <div>
                <div style="font-weight: 600; margin-bottom: 5px;">New version available</div>
                <div style="font-size: 14px;">Refresh to update SociallyFounded</div>
            </div>
            <button id="update-button" style="background-color: #003554; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-family: inherit; font-weight: 500;">Update</button>
            <button id="dismiss-button" style="background: none; border: none; padding: 8px 10px; cursor: pointer; font-family: inherit; color: #666;">Later</button>
        `;
        
        // Add it to the body
        document.body.appendChild(updateNotification);
        
        // Add event listeners
        document.getElementById('update-button').addEventListener('click', () => {
            window.location.reload();
        });
        
        document.getElementById('dismiss-button').addEventListener('click', () => {
            updateNotification.style.display = 'none';
        });
    } else {
        // Show the notification if it already exists
        updateNotification.style.display = 'flex';
    }
}

// Handle offline status changes
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    
    // Create or get offline notification element
    let offlineNotification = document.getElementById('offline-notification');
    
    if (!offlineNotification) {
        offlineNotification = document.createElement('div');
        offlineNotification.id = 'offline-notification';
        
        // Style the notification
        offlineNotification.style.position = 'fixed';
        offlineNotification.style.top = '0';
        offlineNotification.style.left = '0';
        offlineNotification.style.right = '0';
        offlineNotification.style.padding = '10px';
        offlineNotification.style.textAlign = 'center';
        offlineNotification.style.fontFamily = 'Poppins, sans-serif';
        offlineNotification.style.fontWeight = '500';
        offlineNotification.style.fontSize = '14px';
        offlineNotification.style.zIndex = '2000';
        offlineNotification.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        // Add to the body
        document.body.appendChild(offlineNotification);
    }
    
    // Update notification based on online status
    if (!isOnline) {
        // Show offline message
        offlineNotification.textContent = 'You are offline. Some features may be limited.';
        offlineNotification.style.backgroundColor = '#f8d7da';
        offlineNotification.style.color = '#721c24';
        offlineNotification.style.transform = 'translateY(0)';
        offlineNotification.style.opacity = '1';
    } else {
        // Show back online message then hide
        offlineNotification.textContent = 'You are back online!';
        offlineNotification.style.backgroundColor = '#d4edda';
        offlineNotification.style.color = '#155724';
        offlineNotification.style.transform = 'translateY(0)';
        offlineNotification.style.opacity = '1';
        
        // Hide after 3 seconds
        setTimeout(() => {
            offlineNotification.style.transform = 'translateY(-100%)';
            offlineNotification.style.opacity = '0';
        }, 3000);
    }
}

// Initial status check
updateOnlineStatus();

// Handle page lifecycle events for better PWA experience
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page is visible again, check for updates
        checkForServiceWorkerUpdates();
        
        // Refresh data if needed
        if (typeof refreshData === 'function') {
            refreshData();
        }
    }
});

// Placeholder for data refresh function
function refreshData() {
    // This would be implemented based on the app's data needs
    console.log('Data refresh triggered on page visibility');
}

// Add to homescreen guidance for iOS (which doesn't support beforeinstallprompt)
function showIOSInstallInstructions() {
    // Check if it's iOS but not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (isIOS && !isStandalone && !localStorage.getItem('iosInstallShown')) {
        // Create the instruction tooltip
        let iosTooltip = document.createElement('div');
        iosTooltip.id = 'ios-install-tooltip';
        
        // Style the tooltip
        iosTooltip.style.position = 'fixed';
        iosTooltip.style.bottom = '20px';
        iosTooltip.style.left = '50%';
        iosTooltip.style.transform = 'translateX(-50%)';
        iosTooltip.style.backgroundColor = 'white';
        iosTooltip.style.borderRadius = '12px';
        iosTooltip.style.boxShadow = '0 4px 20px rgba(0, 53, 84, 0.2)';
        iosTooltip.style.padding = '15px';
        iosTooltip.style.maxWidth = '300px';
        iosTooltip.style.textAlign = 'center';
        iosTooltip.style.zIndex = '1002';
        iosTooltip.style.fontFamily = 'Poppins, sans-serif';
        iosTooltip.style.display = 'none'; // Hidden initially
        
        // Add content
        iosTooltip.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: 600; color: #003554;">Install SociallyFounded</div>
            <div style="margin-bottom: 15px; font-size: 14px; color: #444;">
                Tap <span style="font-size: 18px;">⎙</span> and then "Add to Home Screen" to install
            </div>
            <button id="ios-tooltip-close" style="background: none; border: none; font-size: 14px; color: #003554; font-weight: 500; cursor: pointer;">Got it</button>
        `;
        
        // Add to the body
        document.body.appendChild(iosTooltip);
        
        // Show after a delay
        setTimeout(() => {
            iosTooltip.style.display = 'block';
        }, 60000); // Show after 1 minute
        
        // Close button functionality
        document.getElementById('ios-tooltip-close').addEventListener('click', () => {
            iosTooltip.style.display = 'none';
            
            // Don't show again for a week
            localStorage.setItem('iosInstallShown', Date.now());
        });
        
        // Set a reminder to show again after a week
        const clearShownFlagAfterWeek = () => {
            const lastShown = localStorage.getItem('iosInstallShown');
            if (lastShown && Date.now() - parseInt(lastShown) > 7 * 24 * 60 * 60 * 1000) {
                localStorage.removeItem('iosInstallShown');
            }
        };
        
        // Check when the page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                clearShownFlagAfterWeek();
            }
        });
    }
}

// Run iOS install check after page load
if (document.readyState === 'complete') {
    showIOSInstallInstructions();
} else {
    window.addEventListener('load', showIOSInstallInstructions);
}
