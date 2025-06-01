// firebase-config.js
// Firebase configuration - NO IMPORT STATEMENTS

// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyBrYn3QTQR-Y5BeYzmfKgUmtMaM6LJfRJo",
    authDomain: "sociallyfounded-df98f.firebaseapp.com",
    projectId: "sociallyfounded-df98f",
    storageBucket: "sociallyfounded-df98f.appspot.com",
    messagingSenderId: "246241399920",
    appId: "1:246241399920:web:93c7c8978bbf4037b5e4e5",
    measurementId: "G-W7Q1FRX5RD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

console.log('✅ Firebase initialized successfully');
