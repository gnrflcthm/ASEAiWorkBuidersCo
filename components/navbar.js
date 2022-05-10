import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaBars } from "react-icons/fa";
import logo from "../assets/company-logo.png";
import styles from "./navbar.module.css";

import ReactGA from "react-ga";

ReactGA.initialize("UA-219515195-2");

export const routes = {
    "/home": "Home",
    "/about": "About Us",
    "/services": "Services",
    "/projects": "Projects",
    "/faqs": "FAQs",
    "/contact": "Contact Us",
};

export default function Navbar() {
    const nav = useRef(null);
    const router = useRouter();
    const [currentRoute, setCurrentRoute] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [showNav, setShowNav] = useState(false);

    const initGA = () => {
        const handleRouteChange = (url, { shallow }) => {
            ReactGA.pageview(url);
        };

        router.events.on("routeChangeComplete", handleRouteChange);

        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
        };
    };

    useEffect(() => {
        const scroll = () => {
            if (nav.current !== null) {
                setScrolled(nav.current.offsetTop > 16);
            }
        };
        const resize = (e) => {
            if (e.currentTarget.innerWidth > 768) {
                setShowNav(false);
            }
        };
        initGA();
        window.addEventListener("scroll", scroll);
        window.addEventListener("resize", resize);
        return () => {
            window.removeEventListener("scroll", scroll);
            window.removeEventListener("scroll", resize);
        };
    }, []);

    useEffect(() => {
        setCurrentRoute(router.pathname);
    }, [router.pathname]);

    return (
        <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`d-flex sticky-top flex-row justify-content-between align-items-center py-2 px-4 
                ${styles.navbar} 
                ${
                    ["/", "/home"].includes(currentRoute) &&
                    !scrolled &&
                    !showNav &&
                    styles.navHome
                }`}
            ref={nav}
        >
            <div
                className={`d-flex flex-row justify-content-between align-items-center ${styles.companyTitle}`}
            >
                <Link href="/home" passHref>
                    <span>
                        <Image
                            src={logo}
                            width={50}
                            height={50}
                            className={`${styles.companyLogo}`}
                        />
                    </span>
                </Link>
                <Link href="/home">
                    <h2 className={`${styles.companyName}`}>
                        ASEA iWork Builders Co.
                    </h2>
                </Link>
            </div>
            <div className={`d-none d-md-block`}>
                {Object.keys(routes).map((route, idx) => (
                    <Link href={route} key={idx}>
                        <a
                            className={`mx-2 ${
                                currentRoute === route ? styles.activeRoute : ""
                            } ${styles.navRoute}`}
                            onClick={() => setShowNav(false)}
                        >
                            {routes[route]}
                        </a>
                    </Link>
                ))}
            </div>
            <FaBars
                className={`d-md-none h2 m-0`}
                onClick={() => setShowNav(!showNav)}
                style={{ cursor: "pointer" }}
            />
            <AnimatePresence>
                {showNav && (
                    <motion.div
                        initial={{ top: 0, opacity: 0 }}
                        animate={{ top: "100%", opacity: 1 }}
                        exit={{
                            top: 0,
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                            },
                        }}
                        className={`d-flex flex-column justify-content-start align-items-center d-md-none position-absolute ${styles.navRoutes}`}
                    >
                        {Object.keys(routes).map((route, idx) => (
                            <Link href={route} key={idx}>
                                <a
                                    className={`h6 py-2 w-100 ${
                                        currentRoute === route
                                            ? styles.activeRouteSM
                                            : ""
                                    } ${styles.navRoute}`}
                                    onClick={() => setShowNav(false)}
                                >
                                    {routes[route]}
                                </a>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <div
                className={`${styles.navAccent} ${
                    ["/", "/home"].includes(currentRoute)
                        ? scrolled
                            ? styles.showAccent
                            : styles.hideAccent
                        : styles.showAccent
                }`}
            ></div>
        </motion.nav>
    );
}
