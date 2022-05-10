import "firebase-admin.config";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const addDocument = async (modeTxt, adminIdTxt, statusTxt, page) => {
    let db = getFirestore();
    let result = await db.collection("auditLogs").add({
        action: `${modeTxt.toUpperCase()} at ${page.toUpperCase()} Page`,
        adminId: adminIdTxt,
        date: Timestamp.now(),
        status: statusTxt,
    });
    if (result) {
        console.log("Logged");
    } else {
        console.log("Error Logging");
        throw "Error Logging";
    }
};

const audit = async (mode, adminId, status, page) => {
    try {
        await addDocument(mode, adminId, status, page);
    } catch (err) {
        console.log(err);
    }
};

export default audit;
