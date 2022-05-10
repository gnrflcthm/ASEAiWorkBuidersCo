import withCSRF from "@/lib/middlewares/withCSRF";
import "firebase-admin.config";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const handler = async (req, res) => {
    if (req.method === "POST") {
        let { mobile, name, email, message, status } = req.body;
        const db = getFirestore();
        if (req.method === "POST") {
            try {
                await db.collection("queries").add({
                    mobile,
                    name,
                    email,
                    message,
                    status,
                    dateAdded: Timestamp.now(),
                });
                res.status(200).json({ msg: "Query Sent" });
            } catch (err) {
                res.status(404).json({ msg: err.toString() });
            }
        } else {
            return res.status(404).json({ msg: "Not Found!" });
        }
    } else {
        return res.status(404).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
