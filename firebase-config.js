// firebase-config.js
// Firebase Configuration for SociallyFounded - CDN Version

// Import Firebase from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    GoogleAuthProvider, 
    OAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdaZa0TmP3pJ6qd7gmZEKsl9PEHTE2pMU",
  authDomain: "sociallyfounded-df98f.firebaseapp.com",
  projectId: "sociallyfounded-df98f",
  storageBucket: "sociallyfounded-df98f.firebasestorage.app",
  messagingSenderId: "994533610259",
  appId: "1:994533610259:web:fe740378a4c000211e40e6",
  measurementId: "G-EY0BZE30Q0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Configure Google provider
googleProvider.setCustomParameters({
  'display': 'popup'
});

// Configure Apple provider
appleProvider.setCustomParameters({
  'locale': 'en'
});

// Export Firebase functions for use in other modules
export {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp
};

export default app;
