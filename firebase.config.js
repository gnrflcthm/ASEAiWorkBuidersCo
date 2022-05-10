import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAl4XESz5BRc-2tfJiJC-0Jo85h2Hq-nZc",
    authDomain: "asea-dev.firebaseapp.com",
    projectId: "asea-dev",
    storageBucket: "asea-dev.appspot.com",
    messagingSenderId: "249961649717",
    appId: "1:249961649717:web:4f73068faf07eb334e437c",
    measurementId: "G-LM8ZX6T685",
};

if (!firebase.getApps().length) firebase.initializeApp(firebaseConfig);

export default firebase;
