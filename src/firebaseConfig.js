import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyA74I3FfbRjPgNhyUkrPtMSCWWngzZCWa0",
    authDomain: "restym-e4f1a.firebaseapp.com",
    databaseURL: "https://restym-e4f1a-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "restym-e4f1a",
    storageBucket: "restym-e4f1a.firebasestorage.app",
    messagingSenderId: "912802481384",
    appId: "1:912802481384:web:e41e186542b45ebff0b55d",
    measurementId: "G-62TEL1EP9T"
};


const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);