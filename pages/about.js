import { useState } from "react";

import styles from "../styles/about.module.css";
import ClientLayout from "layout/client-layout";

import "firebase.config";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import { AnimatePresence, motion } from "framer-motion";
import ImagePreview from "@/components/imagePreview";
import BaseModal from "@/components/baseModal";

export default function About({ data }) {
    const { about, mission, vision, certifications } = data;
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [imageSource, setImageSource] = useState(false);

    return (
        <div className={`${styles.about}`}>
            <div
                className={`d-flex justify-content-center align-items-center ${styles.aboutHeader}`}
            >
                <h2>About the Company</h2>
            </div>
            <motion.div
                className={`p-4 ps-1 ${styles.companyProfile}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div
                    className={`d-flex flex-column justify-content-start align-items-center ${styles.companyProfileDecor}`}
                >
                    <div className={styles.dot}></div>
                    <div className={styles.line}></div>
                </div>
                <div className={`${styles.companyProfileContent}`}>
                    {about.map((content, i) => (
                        <p key={i}>{content}</p>
                    ))}
                </div>
            </motion.div>
            <motion.div
                className={`p-4 m-4 ${styles.mission}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2>Mission</h2>

                {mission.map((content, i) => (
                    <p key={i}>{content}</p>
                ))}
            </motion.div>
            <motion.div
                className={`p-4 m-4 ${styles.vision}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2>Vision</h2>
                {vision.map((content, i) => (
                    <p key={i}>{content}</p>
                ))}
            </motion.div>
            <div className={`pb-3 ${styles.certifications}`}>
                <div
                    className={`d-flex justify-content-center align-items-center ${styles.certificationsHeader}`}
                >
                    <h2>Certifications</h2>
                </div>
                <div
                    className={`row m-0 justify-content-around align-items-center ${styles.certificationsBody}`}
                >
                    {certifications.map((val) => (
                        <div
                            key={val}
                            className={`col-3 d-flex justify-content-center align-items-center mb-3`}
                        >
                            <motion.img
                                whileHover={{ scale: 1.1 }}
                                onClick={() => {
                                    setShowImagePreview(true);
                                    setImageSource(val);
                                }}
                                src={val}
                                style={{
                                    width: "75%",
                                    cursor: "pointer",
                                    alignSelf: "center",
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <AnimatePresence>
                {showImagePreview && (
                    <BaseModal>
                        <ImagePreview
                            imageSrc={imageSource}
                            close={() => setShowImagePreview(false)}
                        />
                    </BaseModal>
                )}
            </AnimatePresence>
        </div>
    );
}

About.Layout = ClientLayout;

export async function getServerSideProps() {
    let snapshot = await getDoc(doc(getFirestore(), "dataContent", "about"));
    let data = snapshot.data();
    return {
        props: { data },
    };
}
