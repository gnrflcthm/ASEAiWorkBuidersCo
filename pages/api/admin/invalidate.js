import withCSRF from "@/lib/middlewares/withCSRF";
import cookie from "cookie";

const handler = async (req, res) => {
    if (req.method === "GET") {
        res.setHeader(
            "Set-Cookie",
            cookie.serialize("session", "", {
                httpOnly: true,
                sameSite: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 0,
            })
        );
        res.status(200).json({ msg: "Logged Out" });
    } else {
        res.status(400).json({ msg: "Not Found!" });
    }
};

export default withCSRF(handler);
