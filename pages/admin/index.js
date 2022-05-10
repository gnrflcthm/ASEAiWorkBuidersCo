import cookie from "cookie";
import LoadingOverlay from "@/components/loadingOverlay";

export default function Admin() {
    return <LoadingOverlay />;
}

export async function getServerSideProps({ req }) {
    require("firebase-admin.config");
    const { getAuth } = require("firebase-admin/auth");

    let cookies = cookie.parse(req.headers.cookie || "");
    try {
        if (cookies.session) {
            let decodedToken = await getAuth().verifySessionCookie(
                cookies.session,
                true
            );
            if (decodedToken) {
                return {
                    redirect: {
                        destination: "/admin/dashboard",
                    },
                };
            }
        }
    } catch (err) {
        console.log(err);
    }
    return {
        redirect: {
            destination: "/admin/login",
        },
    };
}
