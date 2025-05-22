// Digital Passport JavaScript
// Create a new file called passport-script.js and link it in the passport.html file

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}-content`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Passport cover animation
    const passportCover = document.querySelector('.passport-cover');
    if (passportCover) {
        passportCover.addEventListener('mousemove', (e) => {
            const boundingRect = passportCover.getBoundingClientRect();
            const centerX = boundingRect.left + boundingRect.width / 2;
            const centerY = boundingRect.top + boundingRect.height / 2;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Calculate rotation based on mouse position
            const rotateY = (mouseX - centerX) / 20;
            const rotateX = (centerY - mouseY) / 20;
            
            // Apply rotation (limited range)
            passportCover.style.transform = `rotateY(${Math.min(20, Math.max(-5, rotateY))}deg) rotateX(${Math.min(10, Math.max(-10, rotateX))}deg)`;
        });
        
        // Reset rotation when mouse leaves
        passportCover.addEventListener('mouseleave', () => {
            passportCover.style.transform = 'rotateY(5deg) rotateX(0deg)';
        });
    }
    
    // Check-in button functionality
    const checkInButton = document.querySelector('.action-button');
    if (checkInButton) {
        checkInButton.addEventListener('click', () => {
            // In the actual implementation, this would trigger geolocation
            // and venue proximity detection. For the prototype, we'll show a mock dialog.
            showCheckInDialog();
        });
    }
    
    // Show check-in dialog
    function showCheckInDialog() {
        // Create modal container
        const modal = document.createElement('div');
        modal.classList.add('check-in-modal');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '1000';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.classList.add('check-in-modal-content');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.borderRadius = '12px';
        modalContent.style.padding = '30px';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '400px';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        
        // Add content to modal
        modalContent.innerHTML = `
            <h2 style="font-size: 24px; font-weight: 600; color: #003554; margin-bottom: 20px; text-align: center;">Nearby Venues</h2>
            <p style="text-align: center; margin-bottom: 20px;">Select a venue to check in:</p>
            
            <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
                <div class="venue-option" style="padding: 15px; border-radius: 8px; background-color: #F5F5F5; display: flex; align-items: center; gap: 15px; cursor: pointer;">
                    <div style="width: 50px; height: 50px; background-color: #003554; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white;">
                        <div style="width: 30px; height: 30px; background-color: rgba(255,255,255,0.3); border-radius: 50%;"></div>
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #003554; margin-bottom: 5px;">Innovation Café</div>
                        <div style="font-size: 14px; color: #555;">50 meters away</div>
                    </div>
                </div>
                
                <div class="venue-option" style="padding: 15px; border-radius: 8px; background-color: #F5F5F5; display: flex; align-items: center; gap: 15px; cursor: pointer;">
                    <div style="width: 50px; height: 50px; background-color: #003554; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white;">
                        <div style="width: 30px; height: 30px; background-color: rgba(255,255,255,0.3); border-radius: 50%;"></div>
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #003554; margin-bottom: 5px;">CoWork Hub</div>
                        <div style="font-size: 14px; color: #555;">120 meters away</div>
                    </div>
                </div>
                
                <div class="venue-option" style="padding: 15px; border-radius: 8px; background-color: #F5F5F5; display: flex; align-items: center; gap: 15px; cursor: pointer;">
                    <div style="width: 50px; height: 50px; background-color: #003554; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white;">
                        <div style="width: 30px; height: 30px; background-color: rgba(255,255,255,0.3); border-radius: 50%;"></div>
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #003554; margin-bottom: 5px;">Tech Brew Coffee</div>
                        <div style="font-size: 14px; color: #555;">200 meters away</div>
                    </div>
                </div>
            </div>
            
            <p style="text-align: center; margin-bottom: 10px;">Not seeing your venue?</p>
            <button id="discover-more" style="display: block; width: 100%; padding: 10px; border: 1px solid #003554; background: none; border-radius: 6px; color: #003554; font-weight: 500; cursor: pointer; margin-bottom: 20px;">Discover More Venues</button>
            
            <div style="text-align: center;">
                <button id="cancel-check-in" style="padding: 10px 20px; background: none; border: none; color: #777; cursor: pointer;">Cancel</button>
            </div>
        `;
        
        // Add modal to body
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners
        const venueOptions = modal.querySelectorAll('.venue-option');
        venueOptions.forEach(option => {
            option.addEventListener('click', () => {
                const venueName = option.querySelector('div > div:first-child').textContent;
                processCheckIn(venueName);
                document.body.removeChild(modal);
            });
        });
        
        const cancelButton = document.getElementById('cancel-check-in');
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        const discoverMoreButton = document.getElementById('discover-more');
        discoverMoreButton.addEventListener('click', () => {
            alert('This would open the venue discovery map in the real app.');
        });
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // Process check-in (mock implementation)
    function processCheckIn(venueName) {
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.style.position = 'fixed';
        successMessage.style.bottom = '30px';
        successMessage.style.left = '50%';
        successMessage.style.transform = 'translateX(-50%)';
        successMessage.style.backgroundColor = '#d4edda';
        successMessage.style.color = '#155724';
        successMessage.style.padding = '15px 25px';
        successMessage.style.borderRadius = '8px';
        successMessage.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        successMessage.style.zIndex = '999';
        successMessage.style.fontSize = '16px';
        successMessage.style.fontWeight = '500';
        successMessage.style.transition = 'all 0.3s ease';
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'translateX(-50%) translateY(20px)';
        
        // Add message content
        successMessage.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 20px;">✓</div>
                <div>Successfully checked in at ${venueName}!</div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(successMessage);
        
        // Animate in
        setTimeout(() => {
            successMessage.style.opacity = '1';
            successMessage.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            successMessage.style.opacity = '0';
            successMessage.style.transform = 'translateX(-50%) translateY(20px)';
            
            setTimeout(() => {
                document.body.removeChild(successMessage);
                
                // Update the UI to reflect the new check-in
                updateCheckInUI(venueName);
            }, 300);
        }, 3000);
    }
    
    // Update UI after check-in (mock implementation)
    function updateCheckInUI(venueName) {
        // Add a new check-in to the timeline
        const checkInsTimeline = document.querySelector('.check-ins-timeline');
        if (checkInsTimeline) {
            // Get current time
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Create new check-in element
            const newCheckIn = document.createElement('div');
            newCheckIn.classList.add('check-in');
            newCheckIn.innerHTML = `
                <div class="check-in-dot"></div>
                <div class="check-in-line"></div>
                <div class="check-in-card">
                    <div class="check-in-venue">${venueName}</div>
                    <div class="check-in-time">Today, ${timeString}</div>
                    <div class="check-in-duration">Duration: Just now</div>
                </div>
            `;
            
            // Insert at the beginning of the timeline
            checkInsTimeline.insertBefore(newCheckIn, checkInsTimeline.firstChild);
            
            // Update the check-in count
            const checkInCount = document.querySelector('.stat:nth-child(1) .stat-value');
            if (checkInCount) {
                const currentCount = parseInt(checkInCount.textContent);
                checkInCount.textContent = (currentCount + 1).toString();
            }
        }
    }
    
    // Initialize user data
    initializeUserData();
    
    // Initialize user data (in a real app, this would come from a server)
    function initializeUserData() {
        // Set user name
        const userData = {
            name: "John Doe",
            passportId: "SF-2025-001234",
            issueDate: "MAY 21, 2025"
        };
        
        // Update passport fields
        document.getElementById('holder-name').textContent = userData.name;
        document.getElementById('passport-id').textContent = userData.passportId;
        document.getElementById('issue-date').textContent = userData.issueDate;
        
        // Set avatar initials based on name
        const avatarPlaceholder = document.querySelector('.avatar-placeholder');
        if (avatarPlaceholder && userData.name) {
            const nameParts = userData.name.split(' ');
            if (nameParts.length >= 2) {
                avatarPlaceholder.textContent = nameParts[0][0] + nameParts[1][0];
            } else {
                avatarPlaceholder.textContent = nameParts[0][0];
            }
        }
    }
});
