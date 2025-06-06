// Firebase configuration
// This file should be loaded AFTER the Firebase SDKs are loaded

// Wait for Firebase to be available
(function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.log('Firebase not yet available, waiting...');
        setTimeout(initializeFirebase, 100);
        return;
    }

    console.log('Firebase SDK available, initializing...');

    const firebaseConfig = {
        apiKey: "AIzaSyAkYSmo9aGyF9IDKXej9p_j6FZfV0SCNG0",
        authDomain: "sociallyfounded-df98f.firebaseapp.com",
        projectId: "sociallyfounded-df98f",
        storageBucket: "sociallyfounded-df98f.appspot.com",
        messagingSenderId: "994533610259",
        appId: "1:994533610259:web:d7c9a8c3f9a9e9e9e9e9e9"
    };

    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        // Initialize services
        const auth = firebase.auth();
        const db = firebase.firestore();
        //const storage = firebase.storage();

        // Make services globally available
        window.auth = auth;
        window.db = db;

        console.log("✅ Firebase initialized successfully");
        
        // Dispatch custom event to notify other scripts
        window.dispatchEvent(new CustomEvent('firebaseReady'));
        
    } catch (error) {
        console.error("❌ Firebase initialization failed:", error);
    }
})();
