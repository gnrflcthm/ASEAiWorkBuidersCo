import withCSRF from "@/lib/middlewares/withCSRF";

import cookie from "cookie";

import "firebase-admin.config";
import { getAuth } from "firebase-admin/auth";

const handler = async (req, res) => {
    if (req.method === "POST") {
        let uid = req.body.uid;

        let expiresIn = 60 * 60 * 24 * 5 * 1000;

        try {
            let sessionCookie = await getAuth().createSessionCookie(uid, {
                expiresIn,
            });
            res.setHeader("Access-Control-Allow-Credentials", true);
            res.setHeader("Access-Control-Allow-Methods", ["POST"]);
            res.setHeader(
                "Set-Cookie",
                cookie.serialize("session", sessionCookie, {
                    maxAge: expiresIn / 1000,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: true,
                    path: "/",
                })
            );
            res.status(200).json({ msg: "Success" });
        } catch (err) {
            res.status(401).json({ msg: "I'm a teapot." });
        }
    } else {
        res.status(404).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
