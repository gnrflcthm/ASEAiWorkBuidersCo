const withCSRF = (handler) => {
    return async (req, res) => {
        let token = req.headers["xsrf-token"];
        if (!token) {
            res.status(401).json({ msg: "Missing Token" });
        } else if (token !== process.env.CSRF_SECRET) {
            res.status(401).json({ msg: "Invalid Token" });
        } else {
            handler(req, res);
        }
    };
};

export default withCSRF;
