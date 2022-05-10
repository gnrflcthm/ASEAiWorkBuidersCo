import cookie from "cookie";
import "firebase-admin.config";
import { getAuth } from "firebase-admin/auth";

const withSessionCookie = (handler) => {
    return async (req, res) => {
        let cookies = cookie.parse(req.headers.cookie);
        let sessionCookie = cookies.session;

        if (sessionCookie) {
            getAuth()
                .verifySessionCookie(sessionCookie, true)
                .then((decodedToken) => {
                    console.log(decodedToken);
                });
        }

        return handler(req, res);
    };
};

export default withSessionCookie;
