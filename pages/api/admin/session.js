import "firebase-admin.config";
import { getAuth } from "firebase-admin/auth";

import withCSRF from "@/lib/middlewares/withCSRF";

const handler = async (req, res) => {
    if (req.method === "POST") {
        let sessionCookie = req.body.sessionCookie;

        let decodedToken = await getAuth().verifySessionCookie(
            sessionCookie,
            true
        );

        if (decodedToken) {
            return res.status(200).json({ valid: true });
        } else {
            return res.status(401).json({ valid: false });
        }
    } else {
        return res.status(404).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
