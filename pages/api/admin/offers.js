import cookie from "cookie";

import withCSRF from "@/lib/middlewares/withCSRF";

import cloudinary from "cloudinary.config";

import "firebase-admin.config";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import audit from "@/lib/adminAudit";

const PAGE = "Home/Offers";

const handler = async (req, res) => {
    if (req.method === "POST") {
        let { iconUrl, title, description } = req.body;

        let splitURL = iconUrl.split("/");
        let publicId = splitURL[splitURL.length - 1].split(".")[0];

        let session = cookie.parse(req.headers.cookie).session;
        let { uid } = await getAuth().verifySessionCookie(session);

        let status = "Success";
        try {
            let db = getFirestore();

            await cloudinary.v2.uploader.destroy(
                `offers/${publicId}`,
                {
                    invalidate: true,
                },
                async (err, result) => {
                    if (err) {
                        status = "Error";
                        return;
                    }
                    await db.doc("dataContent/home").update({
                        offers: FieldValue.arrayRemove({
                            iconUrl,
                            title,
                            description,
                        }),
                    });
                }
            );
            res.status(200).json({ msg: "Success" });
        } catch (err) {
            console.log(err);
            status = "Error";
            res.status(418).json({ msg: "Error" });
        } finally {
            await audit("Delete", uid, status, PAGE);
        }
    } else {
        res.status(404).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
