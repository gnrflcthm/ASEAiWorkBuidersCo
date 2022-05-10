import cookie from "cookie";
import Script from "next/script";

import LoadingOverlay from "@/components/loadingOverlay";
import AdminHeader from "@/components/adminHeader";

import styles from "@/styles/adminDashboard.module.css";

import useAdmin from "@/lib/useAdmin";

import { renderButton, initAuth } from "@/lib/googleAnalytics";

import { useState, useEffect } from "react";
import Dashboard from "@/components/gaDashboard";

export default function AdminDashboard({ csrfToken, sessionCookie }) {
    const [admin, loading, error] = useAdmin(csrfToken, sessionCookie);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const loadGapi = () => {
        window.gapi.load("auth2", () => {
            initAuth();
            if (!window.gapi.auth2.getAuthInstance().isSignedIn.get())
                renderButton();
            setIsSignedIn(window.gapi.auth2.getAuthInstance().isSignedIn.get());
            window.gapi.auth2.getAuthInstance().isSignedIn.listen((state) => {
                setIsSignedIn(state);
            });
            setLoaded(true);
        });
    };

    useEffect(() => {
        if (window.gapi) {
            loadGapi();
        }
    }, [loaded]);

    if (error) console.log(error);

    if (admin) {
        return (
            <div className={`d-flex flex-column ${styles.adminDashboard}`}>
                <AdminHeader
                    admin={admin}
                    csrfToken={csrfToken}
                    showNav={() => setShowNav(true)}
                />

                <div
                    className={`d-flex flex-column justify-content-center align-items-center ${styles.dashboardBody}`}
                >
                    <div className={`${isSignedIn && "align-self-start"}`}>
                        <div id="signin-button"></div>
                    </div>
                    {isSignedIn && (
                        <div
                            className={`d-flex flex-column align-items-center`}
                        >
                            <Dashboard />
                        </div>
                    )}
                </div>

                <Script
                    src="https://apis.google.com/js/client:platform.js"
                    strategy="afterInteractive"
                    onLoad={() => loadGapi()}
                />
            </div>
        );
    }
    return <LoadingOverlay />;
}

export function getServerSideProps({ req, res }) {
    const cookies = cookie.parse(req.headers.cookie || "");
    const csrfToken = process.env.CSRF_SECRET;

    if (cookies.session) {
        return {
            props: { csrfToken, sessionCookie: cookies.session },
        };
    } else {
        return {
            redirect: {
                destination: "/admin/login?session=expired",
            },
        };
    }
}
