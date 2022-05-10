import cookie from "cookie";
import { getAuth } from "firebase-admin/auth";
import "firebase-admin.config";

import audit from "@/lib/adminAudit";

import withCSRF from "@/lib/middlewares/withCSRF";

const handler = async (req, res) => {
    if (req.method === "POST") {
        let { mode, status, page } = req.body;
        console.log(mode, status, page);
        let sessionCookie = cookie.parse(req.headers.cookie).session;
        let { uid } = await getAuth().verifySessionCookie(sessionCookie);
        audit(mode, uid, status, page);
        res.status(200).json({ msg: "Logged Successfully" });
    } else {
        res.status(401).json({ msg: "Error: Not Found!" });
    }
};

export default withCSRF(handler);
