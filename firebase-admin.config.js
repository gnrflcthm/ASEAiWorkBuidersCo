import * as firebase from "firebase-admin/app";
import "firebase-admin/auth";
import "firebase-admin/firestore";

if (!firebase.getApps().length) {
    firebase.initializeApp({
        credential: firebase.cert({
            projectId: process.env.PROJECT_ID,
            privateKey: process.env.PRIVATE_KEY,
            clientEmail: process.env.CLIENT_EMAIL,
        }),
    });
}

export default firebase;
