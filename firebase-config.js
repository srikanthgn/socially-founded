// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCdaZa0TmP3pJ6qd7gmZEKsI9PEHTE2pMU",
    authDomain: "sociallyfounded-df98f.firebaseapp.com",
    projectId: "sociallyfounded-df98f",
    storageBucket: "sociallyfounded-df98f.appspot.com",
    messagingSenderId: "994533610259",
    appId: "1:994533610259:web:d7c9a8c3f9a9e9e9e9e9e9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("✅ Firebase initialized successfully");
