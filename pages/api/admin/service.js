import audit from "@/lib/adminAudit";
import withCSRF from "@/lib/middlewares/withCSRF";

import cloudinary from "cloudinary.config";

import "firebase-admin.config";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import cookie from "cookie";

const PAGE = "Services";

const handler = async (req, res) => {
    if (req.method === "POST") {
        let { id, imageURL } = req.body;

        let splitURL = imageURL.split("/");
        let publicId = splitURL[splitURL.length - 1].split(".")[0];

        let status = "Success";
        let sessionCookie = cookie.parse(req.headers.cookie).session;
        let { uid } = await getAuth().verifySessionCookie(sessionCookie);

        try {
            let db = getFirestore();

            await cloudinary.v2.uploader.destroy(
                `services/${publicId}`,
                {
                    invalidate: true,
                },
                async (err, result) => {
                    await db.doc(`services/${id}`).delete();
                }
            );
            res.status(200).json({ msg: "Success" });
        } catch (err) {
            status = "Error";
            console.log(err);
            res.status(418).json({ msg: "Error in deleting service." });
        } finally {
            await audit("Delete", uid, status, PAGE);
        }
    } else {
        res.status(404).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
