import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDGYSYxCXZPWbYQcIMVEy32beW2wJLDK5c",
    authDomain: "hastane-randevu-sistemi-f33cf.firebaseapp.com",
    databaseURL:
        "https://hastane-randevu-sistemi-f33cf-default-rtdb.firebaseio.com/",
    projectId: "hastane-randevu-sistemi-f33cf",
    storageBucket:
        "hastane-randevu-sistemi-f33cf.firebasestorage.app",
    messagingSenderId: "328428428236",
    appId: "1:328428428236:web:0c466a81c6e29e96cc5b69"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth };