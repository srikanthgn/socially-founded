// 🔥 ATOMIC SERVICE: Firebase Configuration Only
// File: shared/firebase-config.js
// Purpose: Single-responsibility Firebase initialization
// Dependencies: None (standalone atomic service)

// Import Firebase v9 SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// PRODUCTION Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkYSmo9aGyF9IDKXej9p_j6FZfV0SCNG0",
    authDomain: "sociallyfounded-df98f.firebaseapp.com",
    projectId: "sociallyfounded-df98f",
    storageBucket: "sociallyfounded-df98f.firebasestorage.app",
    messagingSenderId: "994533610259",
    appId: "1:994533610259:web:fe740378a4c000211e40e6",
    measurementId: "G-EY0BZE30Q0"
};

// Atomic Firebase Service Class
class FirebaseConfigService {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.initializeFirebase();
    }

    // ONLY Firebase initialization - nothing else
    initializeFirebase() {
        try {
            console.log('🔥 Initializing Firebase...');
            
            // Initialize Firebase app
            this.app = initializeApp(firebaseConfig);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
            
            this.initialized = true;
            console.log('✅ Firebase initialized successfully');
            
            // Debug configuration (safe logging)
            console.log('🔧 Firebase Config Loaded:', {
                authDomain: firebaseConfig.authDomain,
                projectId: firebaseConfig.projectId,
                messagingSenderId: firebaseConfig.messagingSenderId
            });
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            this.initialized = false;
            throw new Error(`Firebase initialization failed: ${error.message}`);
        }
    }

    // ONLY getter methods for Firebase instances
    getApp() {
        if (!this.initialized) {
            throw new Error('Firebase not initialized');
        }
        return this.app;
    }

    getDatabase() {
        if (!this.initialized) {
            throw new Error('Firebase not initialized');
        }
        return this.db;
    }

    getAuth() {
        if (!this.initialized) {
            throw new Error('Firebase not initialized');
        }
        return this.auth;
    }

    // ONLY status check
    isInitialized() {
        return this.initialized;
    }
}

// Create global Firebase service instance
let firebaseService = null;

// ONLY Firebase service initialization
function initializeFirebaseService() {
    if (!firebaseService) {
        firebaseService = new FirebaseConfigService();
    }
    return firebaseService;
}

// Export for atomic services
window.SFFirebaseConfig = {
    initialize: initializeFirebaseService,
    getService: () => firebaseService,
    isReady: () => firebaseService?.isInitialized() || false
};

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeFirebaseService();
        console.log('🚀 Firebase Config Service ready');
    } catch (error) {
        console.error('🔥 Firebase Config Service failed:', error);
    }
});

export { initializeFirebaseService, firebaseService };
