import * as firebase from "firebase-admin/app";
import "firebase-admin/auth";
import "firebase-admin/firestore";

const { privateKey } = JSON.parse(process.env.PRIVATE_KEY);

if (!firebase.getApps().length) {
    firebase.initializeApp({
        credential: firebase.cert({
            projectId: process.env.PROJECT_ID,
            privateKey: privateKey,
            clientEmail: process.env.CLIENT_EMAIL,
        }),
    });
}

export default firebase;
