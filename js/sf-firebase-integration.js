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
    userProfile.gamification.sfPoints +=
