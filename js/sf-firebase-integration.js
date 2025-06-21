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
    await loadUserProfile(user.uid);
    await initializeDashboard();
  } else {
    window.location.href = '/welcome/login.html';
  }
});

// Load user profile
async function loadUserProfile(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      userProfile = userDoc.data();
    } else {
      userProfile = await createNewUserProfile(userId);
    }
    
    updateDashboardDisplay();
    hideLoadingOverlay();
  } catch (error) {
    console.error('Error loading profile:', error);
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
  if (!currentUser || !userProfile) {
    showError('Please wait for your profile to load.');
    return;
  }

  if (userProfile.communities[communityType]) {
    showMessage(`You're already part of the ${communityType} community!`, 'info');
    return;
  }
  
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
  
  userProfile.communities[communityType] = communityData;
  userProfile.gamification.sfPoints += 10;
  
  if (communityType === 'entrepreneur') {
    showMessage('🚀 Welcome to the Entrepreneur Community! You now have access to DIANA AI!', 'success');
  } else {
    showMessage(`🎉 Welcome to the ${communityType} Community! You earned 10 SF Points.`, 'success');
  }
  
  updateDashboardDisplay();
}

// Check into venue
async function checkInToVenue(venueId) {
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
  
  userProfile.gamification.sfPoints += 2;
  userProfile.analytics.totalVenueCheckIns += 1;
  
  showMessage(`✅ Checked in at ${venueName}! You earned 2 SF Points.`, 'success');
  updateDashboardDisplay();
}

// Talk to DIANA
async function sendDianaMessage(message) {
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
    return { success: false, error: 'Sorry, I\'m having trouble connecting right now.' };
  }
}

// Update display
function updateDashboardDisplay() {
  if (!userProfile) return;
  
  document.getElementById('passport-display').textContent = userProfile.sfPassport.id;
  document.getElementById('points-display').textContent = `${userProfile.gamification.sfPoints} SF Points`;
  document.getElementById('diana-credits').textContent = `${userProfile.gamification.brainstormCredits} daily brainstorms available`;

  // Force update community cards display
setTimeout(() => {
  console.log('🔄 Force updating display...', userProfile);
  if (userProfile && userProfile.communities) {
    Object.keys(userProfile.communities).forEach(communityType => {
      console.log(`✅ User is in ${communityType} community`);
    });
  }
}, 1000);
  
  // Update community cards

// Update community cards
const communityCards = document.querySelectorAll('.community-card');
communityCards.forEach(card => {
  const communityType = card.getAttribute('data-community');
  const button = card.querySelector('.join-button');
  
  if (userProfile.communities && userProfile.communities[communityType]) {
    // User is already in this community
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
  

// Initialize dashboard
async function initializeDashboard() {
  updateDashboardDisplay();
  console.log('✅ Dashboard ready!');
}

// Hide loading screen
function hideLoadingOverlay() {
  document.getElementById('loading-overlay').style.display = 'none';
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

// Make functions available
window.joinCommunity = joinCommunity;
window.checkInToVenue = checkInToVenue;
window.sendDianaMessage = sendDianaMessage;
