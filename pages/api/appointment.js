import withCSRF from "@/lib/middlewares/withCSRF";

import "firebase-admin.config";
import { getFirestore } from "firebase-admin/firestore";

const handler = async (req, res) => {
    if (req.method === "POST") {
        let { firstName, lastName, email, contact, schedule, selectedDate } =
            req.body;
        let db = getFirestore();

        let appointmentTime = schedule;
        try {
            await db.collection("appointments").add({
                firstName,
                lastName,
                email,
                contact,
                appointmentDate: selectedDate,
                appointmentTime,
                status: "pending",
            });
            return res.status(200).json({ msg: "Success" });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ msg: err });
        }
    } else {
        return res.status(404).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
