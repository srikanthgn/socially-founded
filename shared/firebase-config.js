// 🔥 ATOMIC SERVICE: Firebase Configuration Only
// File: shared/firebase-config.js
// Purpose: Single-responsibility Firebase setup
// Dependencies: Firebase CDN scripts

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkYSmo9aGyF9IDKXej9p_j6FZfV0SCNG0",
    authDomain: "sociallyfounded-df98f.firebaseapp.com",
    projectId: "sociallyfounded-df98f",
    storageBucket: "sociallyfounded-df98f.firebasestorage.app",
    messagingSenderId: "994533610259",
    appId: "1:994533610259:web:fe740378a4c000211e40e6",
    measurementId: "G-EY0BZE30Q0"
};

// Initialize Firebase when script loads
(function initializeFirebase() {
    console.log('🔥 Firebase: Initializing configuration...');
    
    // Check if Firebase is loaded from CDN
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase: Firebase SDK not loaded. Please include Firebase CDN scripts.');
        return;
    }
    
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        window.db = firebase.firestore();
        
        // Initialize Auth
        window.auth = firebase.auth();
        
        // Initialize Analytics (optional)
        if (firebase.analytics) {
            window.analytics = firebase.analytics();
        }
        
        console.log('✅ Firebase: Initialized successfully');
        console.log('✅ Firestore: Database ready');
        console.log('✅ Auth: Authentication ready');
        
        // Dispatch event for other scripts
        window.dispatchEvent(new Event('firebaseReady'));
        
    } catch (error) {
        console.error('❌ Firebase: Initialization failed', error);
    }
})();

// Global Firebase ready check function
window.waitForFirebase = function() {
    return new Promise((resolve) => {
        if (window.db && window.auth) {
            resolve();
        } else {
            window.addEventListener('firebaseReady', resolve, { once: true });
        }
    });
};
