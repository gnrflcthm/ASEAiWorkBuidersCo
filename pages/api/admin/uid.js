import withCSRF from "@/lib/middlewares/withCSRF";
import cookie from "cookie";

import "firebase-admin.config";
import { getAuth } from "firebase-admin/auth";

const handler = async (req, res) => {
    let sessionCookie = cookie.parse(req.headers.cookie).session;

    try {
        let token = await getAuth().verifySessionCookie(sessionCookie, true);
        res.status(200).json({ uid: token.user_id });
    } catch (err) {
        console.log(err);
        res.status(418).json({ msg: "Invalid Session Cookie" });
    } finally {
        res.end();
    }
};

export default withCSRF(handler);
