import withCSRF from "@/lib/middlewares/withCSRF";

import cloudinary from "cloudinary.config";

import "firebase-admin.config";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import cookie from "cookie";

import audit from "@/lib/adminAudit";

const handler = async (req, res) => {
    if (req.method === "POST") {
        let { imageURL } = req.body;

        let splitURL = imageURL.split("/");
        let publicId = splitURL[splitURL.length - 1].split(".")[0];

        let status = "Success";

        let session = cookie.parse(req.headers.cookie).session;
        let { uid } = await getAuth().verifySessionCookie(session);

        try {
            let db = getFirestore();

            await cloudinary.v2.uploader.destroy(
                `works/${publicId}`,
                {
                    invalidate: true,
                },
                async (err, result) => {
                    await db.doc("dataContent/home").update({
                        works: FieldValue.arrayRemove(imageURL),
                    });
                }
            );
            res.status(200).json({ msg: "Success" });
        } catch (err) {
            console.log(err);
            status = "Error";
            res.status(400).json({ msg: "Error" });
        } finally {
            await audit("Delete", uid, status, "Home/Work Showcase");
        }
    } else {
        res.status(404).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
