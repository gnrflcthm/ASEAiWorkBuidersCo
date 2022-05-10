import withCSRF from "@/lib/middlewares/withCSRF";

import "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import audit from "@/lib/adminAudit";

import cookie from "cookie";

const PAGE = "User Accounts";

const handler = async (req, res) => {
    if (req.method === "POST") {
        let {
            ex,
            id,
            firstName,
            lastName,
            email,
            contact,
            address,
            accountType,
        } = req.body;
        let session = cookie.parse(req.headers.cookie).session;
        let admin = await getAuth().verifySessionCookie(session);
        let status = "Success";
        try {
            let db = getFirestore();
            if (["add", "edit"].includes(ex)) {
                let result = await db.doc(`admin/${id}`).set({
                    firstName,
                    lastName,
                    email,
                    contact,
                    address,
                    accountType,
                });
                if (result) {
                    res.status(200).json({ msg: "Success" });
                } else {
                    status = "Error";
                    res.status(500).json({ msg: "Error" });
                }
            } else if (ex === "delete") {
                let auth = getAuth();
                await auth.deleteUser(id);
                await db.doc(`admin/${id}`).delete();
                res.status(200).json({ msg: "User Deleted" });
            } else if (ex === "reset") {
                let auth = getAuth();
                await auth.updateUser(id, {
                    password: process.env.DEFAULT_ADMIN_PASSWORD,
                });
                res.status(200).json({ msg: "Password Reset Successfully" });
            } else {
                status = "Error";
                res.status(400).json({ msg: "Invalid Method" });
            }
        } catch (err) {
            res.status(500).json({ msg: "Error has occured." });
            console.log(err);
            status = "Error";
        } finally {
            audit(ex, admin.uid, status, PAGE);
        }
    } else {
        res.status(404).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
