// firebase-init.js
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJBSfx2w7mdqzWeBz3D0YEYXv8jkYkLpc",
    authDomain: "sociallyfounded.firebaseapp.com",
    projectId: "sociallyfounded",
    storageBucket: "sociallyfounded.appspot.com",
    messagingSenderId: "944659986684",
    appId: "1:944659986684:web:d088055c072f89cf670c19",
    measurementId: "G-LXEPXVDX3G"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase initialized successfully!");
