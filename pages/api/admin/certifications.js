import audit from "@/lib/adminAudit";
import withCSRF from "@/lib/middlewares/withCSRF";

import cloudinary from "cloudinary.config";

import "firebase-admin.config";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import cookie from "cookie";

const PAGE = "About/Certification";

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
                `certifications/${publicId}`,
                {
                    invalidate: true,
                },
                async (err, result) => {
                    await db.doc("dataContent/about").update({
                        certifications: FieldValue.arrayRemove(imageURL),
                    });
                }
            );
            res.status(200).json({
                msg: "Certification Deleted Successfully.",
            });
        } catch (err) {
            console.log(err);
            status = "Error";
            res.status(400).json({ msg: "Error Deleting Asset" });
        } finally {
            await audit("Delete", uid, status, PAGE);
        }
    } else {
        res.status(404).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
