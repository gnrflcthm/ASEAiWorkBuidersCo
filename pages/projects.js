import styles from "../styles/projects.module.css";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientLayout from "layout/client-layout";
import { useInView } from "react-intersection-observer";

import "firebase.config";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import { Scrollbars } from "react-custom-scrollbars-2";

function Project({ year, projects, index }) {
    const [descriptionPosition, setDescriptionPosition] = useState({});
    const [yearPosition, setYearPosition] = useState({});
    const [ref, inView] = useInView();

    useEffect(() => {
        if (Boolean(index % 2)) {
            setDescriptionPosition({
                right: 50,
            });
            setYearPosition({
                left: 50,
            });
        } else {
            setDescriptionPosition({
                left: 50,
            });
            setYearPosition({
                right: 50,
            });
        }
    }, []);

    return (
        <div className={`${styles.projectItem}`}>
            <div className={`${styles.dotWrapper}`} ref={ref}>
                <h4 style={{ ...yearPosition }}>{year}</h4>
                <div className={`${styles.dot}`}></div>
                <AnimatePresence>
                    {inView && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`${styles.project}`}
                            style={{ ...descriptionPosition }}
                        >
                            <Scrollbars autoHeight>
                                {projects.map((val, i) => (
                                    <div
                                        className={`my-2 ${styles.projectItemContent}`}
                                    >
                                        <h5>{val.title}</h5>
                                        <p>{val.description}</p>
                                    </div>
                                ))}
                            </Scrollbars>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className={`${styles.lineWrapper}`}>
                <div className={`${styles.line}`}></div>
            </div>
        </div>
    );
}

function ProjectTimeline({ data }) {
    const [years, setYears] = useState(
        data
            .map((val) => val.year)
            .filter((val, i, self) => self.indexOf(val) === i)
            .sort((a, b) => a - b)
    );

    return (
        <div className={`${styles.projectTimeline}`}>
            <h2 className={`${styles.endPoints}`}>Start</h2>
            <div className={`${styles.lineWrapper}`}>
                <div className={`${styles.line}`}></div>
            </div>
            {years.map((year, i) => {
                let projects = data.filter((val) => val.year === year);
                return (
                    <Project
                        key={year}
                        year={year}
                        projects={projects}
                        index={i}
                    />
                );
            })}
            <h2 className={`${styles.endPoints}`}>Current</h2>
        </div>
    );
}

export default function Projects({ data }) {
    return (
        <div className={`${styles.projects}`}>
            <div
                className={`d-flex justify-content-center align-items-center position-relative ${styles.projectsHeader}`}
            >
                <h2>Our Projects</h2>
            </div>
            <ProjectTimeline data={data} />
        </div>
    );
}

export async function getServerSideProps() {
    let snapshot = await getDoc(doc(getFirestore(), "dataContent", "projects"));
    let data = snapshot.data();
    return {
        props: { data: data.content },
    };
}

Projects.Layout = ClientLayout;
