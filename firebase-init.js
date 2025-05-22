// firebase-init.js
// Initialize Firebase using CDN scripts instead of modules

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Auth providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
const appleProvider = new firebase.auth.OAuthProvider('apple.com');

// Make them available globally
window.auth = auth;
window.db = db;
window.storage = storage;
window.googleProvider = googleProvider;
window.appleProvider = appleProvider;
