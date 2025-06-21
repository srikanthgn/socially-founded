// SociallyFounded Firebase Integration
const firebaseConfig = {
  apiKey: "AIzaSyAkYSmo9aGyF9IDKXej9p_j6FZfV0SCNG0",
  authDomain: "sociallyfounded-df98f.firebaseapp.com",
  projectId: "sociallyfounded-df98f",
  storageBucket: "sociallyfounded-df98f.firebasestorage.app",
  messagingSenderId: "994533610259",
  appId: "1:994533610259:web:fe740378a4c000211e40e6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let userProfile = null;

// When user logs in
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    console.log('✅ User authenticated:', user.uid);
    await loadUserProfile(user.uid);
    await initializeDashboard();
  } else {
    console.log('❌ User not authenticated, redirecting...');
    window.location.href = '/welcome/login.html';
  }
});

// Load user profile
async function loadUserProfile(userId) {
  try {
    console.log('🔄 Loading user profile...');
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      userProfile = userDoc.data();
      console.log('✅ User profile loaded:', userProfile);
    } else {
      userProfile = await createNewUserProfile(userId);
      console.log('✅ New user profile created:', userProfile);
    }
    
    updateDashboardDisplay();
    hideLoadingOverlay();
  } catch (error) {
    console.error('❌ Error loading profile:', error);
    hideLoadingOverlay();
  }
}

// Create new user
async function createNewUserProfile(userId) {
  const passportId = `SF-${Math.floor(1000000 + Math.random() * 9000000)}-AE`;
  
  const newProfile = {
    uid: userId,
    passportId: passportId,
    displayName: currentUser.displayName || 'Community Member',
    email: currentUser.email,
    
    sfPassport: {
      id: passportId,
      level: 1,
      tier: "Navy"
    },
    
    communities: {},
    
    gamification: {
      sfPoints: 100,
      brainstormCredits: 3,
      achievements: ["Welcome to SociallyFounded"]
    },
    
    analytics: {
      totalVenueCheckIns: 0,
      dianaInteractions: 0
    }
  };
  
  await db.collection('users').doc(userId).set(newProfile);
  return newProfile;
}

// Join community
async function joinCommunity(communityType) {
  console.log('🎯 Attempting to join community:', communityType);
  
  if (!currentUser || !userProfile) {
    showError('Please wait for your profile to load.');
    return;
  }

  if (userProfile.communities[communityType]) {
    showMessage(`You're already part of the ${communityType} community!`, 'info');
    return;
  }
  
  try {
    const communityData = {
      type: communityType,
      active: true,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const updateData = {
      [`communities.${communityType}`]: communityData,
      'gamification.sfPoints': firebase.firestore.FieldValue.increment(10)
    };
    
    await db.collection('users').doc(currentUser.uid).update(updateData);
    
    // Update local profile
    userProfile.communities[communityType] = communityData;
    userProfile.gamification.sfPoints += 10;
    
    if (communityType === 'entrepreneur') {
      showMessage('🚀 Welcome to the Entrepreneur Community! You now have access to DIANA AI!', 'success');
    } else {
      showMessage(`🎉 Welcome to the ${communityType} Community! You earned 10 SF Points.`, 'success');
    }
    
    updateDashboardDisplay();
    console.log('✅ Successfully joined community:', communityType);
    
  } catch (error) {
    console.error('❌ Error joining community:', error);
    showError('Failed to join community. Please try again.');
  }
}

// Check into venue
async function checkInToVenue(venueId) {
  console.log('📍 Checking into venue:', venueId);
  
  if (!currentUser || !userProfile) {
    showError('Please wait for your profile to load.');
    return;
  }

  const venues = {
    'coffee-lab-business-bay': 'The Coffee Lab',
    'innovation-hub-difc': 'Innovation Hub DIFC',
    'alserkal-art-district': 'Alserkal Art District'
  };
  
  const venueName = venues[venueId] || 'Unknown Venue';
  
  try {
    const checkInData = {
      userId: currentUser.uid,
      venueId: venueId,
      venueName: venueName,
      checkInTime: firebase.firestore.FieldValue.serverTimestamp(),
      sfPointsEarned: 2
    };
    
    await db.collection('checkins').add(checkInData);
    
    await db.collection('users').doc(currentUser.uid).update({
      'gamification.sfPoints': firebase.firestore.FieldValue.increment(2),
      'analytics.totalVenueCheckIns': firebase.firestore.FieldValue.increment(1)
    });
    
    // Update local profile
    userProfile.gamification.sfPoints += 2;
    userProfile.analytics.totalVenueCheckIns += 1;
    
    showMessage(`✅ Checked in at ${venueName}! You earned 2 SF Points.`, 'success');
    updateDashboardDisplay();
    console.log('✅ Successfully checked in to venue:', venueId);
    
  } catch (error) {
    console.error('❌ Error checking in:', error);
    showError('Check-in failed. Please try again.');
  }
}

// Talk to DIANA
async function sendDianaMessage(message) {
  console.log('🤖 Sending message to DIANA:', message);
  
  if (!currentUser || !userProfile) {
    return { success: false, error: 'Please wait for your profile to load.' };
  }

  if (userProfile.gamification.brainstormCredits <= 0) {
    return { success: false, error: 'No DIANA credits remaining!' };
  }
  
  try {
    const conversation = [
      { role: 'system', content: 'You are DIANA.' },
      { role: 'user', content: message }
    ];
    
    const response = await fetch('/api/diana-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await currentUser.getIdToken()}`
      },
      body: JSON.stringify({
        conversation: conversation,
        userId: currentUser.uid,
        userProfile: userProfile
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      await db.collection('users').doc(currentUser.uid).update({
        'gamification.brainstormCredits': firebase.firestore.FieldValue.increment(-1),
        'analytics.dianaInteractions': firebase.firestore.FieldValue.increment(1)
      });
      
      userProfile.gamification.brainstormCredits -= 1;
      userProfile.analytics.dianaInteractions += 1;
      updateDashboardDisplay();
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ DIANA error:', error);
    return { success: false, error: 'Sorry, I\'m having trouble connecting right now.' };
  }
}

// Update display
function updateDashboardDisplay() {
  console.log('🔄 Updating dashboard display...');
  
  if (!userProfile) {
    console.log('⚠️ No user profile to display');
    return;
  }
  
  // Update header info
  const passportElement = document.getElementById('passport-display');
  const pointsElement = document.getElementById('points-display');
  const creditsElement = document.getElementById('diana-credits');
  
  if (passportElement) passportElement.textContent = userProfile.sfPassport.id;
  if (pointsElement) pointsElement.textContent = `${userProfile.gamification.sfPoints} SF Points`;
  if (creditsElement) creditsElement.textContent = `${userProfile.gamification.brainstormCredits} daily brainstorms available`;
  
  // Update welcome message
  const welcomeTitle = document.querySelector('.welcome-title');
  if (welcomeTitle && userProfile.displayName) {
    welcomeTitle.textContent = `Welcome back, ${userProfile.displayName.split(' ')[0]}!`;
  }
  
  // Update community cards
  const communityCards = document.querySelectorAll('.community-card');
  communityCards.forEach(card => {
    const communityType = card.getAttribute('data-community');
    const button = card.querySelector('.join-button');
    
    if (userProfile.communities && userProfile.communities[communityType]) {
      console.log(`✅ User is in ${communityType} community - updating card`);
      
      // Add joined styling
      card.classList.add('joined');
      button.textContent = `✓ Active in ${communityType.charAt(0).toUpperCase() + communityType.slice(1)}`;
      button.style.background = '#2ECC71';
      button.style.color = '#FFFFFF';
      
      // Special styling for entrepreneur community
      if (communityType === 'entrepreneur') {
        card.style.background = 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)';
        card.style.color = '#FFFFFF';
        button.style.background = '#FFFFFF';
        button.style.color = '#2ECC71';
      }
    }
  });
  
  console.log('✅ Dashboard display updated');
}

// Initialize dashboard
async function initializeDashboard() {
  updateDashboardDisplay();
  console.log('✅ Dashboard initialized');
}

// Hide loading screen
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Show messages
function showMessage(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 15px 20px;
    border-radius: 10px; color: white; z-index: 3000; font-weight: 500;
    background: ${type === 'success' ? '#2ECC71' : type === 'error' ? '#E74C3C' : '#3498DB'};
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
  showMessage(message, 'error');
}

// Make functions available globally
window.joinCommunity = joinCommunity;
window.checkInToVenue = checkInToVenue;
window.sendDianaMessage = sendDianaMessage;

console.log('🚀 Firebase integration loaded successfully');
