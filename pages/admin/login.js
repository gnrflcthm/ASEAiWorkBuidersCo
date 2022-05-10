import { useRouter } from "next/router";
import { useState } from "react";

import styles from "@/styles/adminLogin.module.css";
import logoText from "@/assets/company-logo-text.jpg";
import LoadingOverlay from "@/components/loadingOverlay";

import Image from "next/image";
import { FaLock, FaUserAlt } from "react-icons/fa";

import "firebase.config";
import { signInWithEmailAndPassword, getAuth, signOut } from "firebase/auth";

import axios from "axios";
import cookie from "cookie";

import { motion } from "framer-motion";

export default function AdminLogin({ csrfToken }) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [invalidCreds, setInvalidCreds] = useState(false);

    const login = (e) => {
        e.preventDefault();
        e.target.blur();
        setLoading(true);
        signInWithEmailAndPassword(getAuth(), email, password)
            .then((userCredentials) =>
                userCredentials.user.getIdToken(true).then(async (idToken) => {
                    await axios.post(
                        "/api/admin/login",
                        { uid: idToken },
                        {
                            headers: {
                                "xsrf-token": csrfToken,
                            },
                            withCredentials: true,
                        }
                    );
                    await signOut(getAuth());
                    setRedirecting(true);
                    router.push("/admin/");
                })
            )
            .catch((err) => {
                console.log(err);
                setInvalidCreds(true);
                setPassword("");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div
            className={`d-flex flex-column justify-content-center align-items-center ${styles.adminLogin}`}
        >
            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`mb-4`}
            >
                Administrator Login
            </motion.h2>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`px-4 py-4 col-10 col-md-5 ${styles.loginContainer}`}
            >
                <div
                    className={`w-100 d-flex justify-content-center mb-2 ${styles.imagewrapper}`}
                >
                    <Image src={logoText} width={100} height={100} />
                </div>
                <form onSubmit={login} onFocus={() => setInvalidCreds(false)}>
                    <label>Email</label>
                    <div className={`input-group mb-2`}>
                        <span className={`input-group-text`}>
                            <FaLock />
                        </span>
                        <input
                            type="email"
                            className={`form-control ${
                                invalidCreds && "is-invalid"
                            }`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="samplename@dlsu.edu.ph"
                            disabled={loading || redirecting}
                        />
                    </div>
                    <label>Password</label>
                    <div className={`mb-3`}>
                        <div className={`input-group`}>
                            <span className={`input-group-text`}>
                                <FaUserAlt />
                            </span>
                            <input
                                type="password"
                                className={`form-control ${
                                    invalidCreds && "is-invalid"
                                }`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="*********"
                                disabled={loading || redirecting}
                            />
                        </div>
                        {invalidCreds && (
                            <small className="text-danger">
                                Invalid Credentials
                            </small>
                        )}
                    </div>
                    <button
                        type="submit"
                        className={`btn w-100 ${styles.signInBtn}`}
                        disabled={loading || redirecting}
                    >
                        Sign In
                    </button>
                </form>
            </motion.div>
            {(loading || redirecting) && <LoadingOverlay />}
        </div>
    );
}

export async function getServerSideProps({ req }) {
    const sessionCookie = cookie.parse(req.headers.cookie || "");
    const csrfToken = process.env.CSRF_SECRET;
    if (sessionCookie.session) {
        return {
            redirect: {
                destination: "/admin/",
            },
        };
    } else {
        return {
            props: { csrfToken },
        };
    }
}
