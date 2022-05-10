import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

import BaseModal from "@/components/baseModal";
import QueryModal from "@/components/queryModal";
import OTPModal from "@/components/otpModal";
import styles from "@/styles/faqs.module.css";
import ClientLayout from "layout/client-layout";

import {
    Accordion,
    AccordionButton,
    AccordionItem,
    AccordionIcon,
    AccordionPanel,
    Box,
    useToast,
} from "@chakra-ui/react";

import "firebase.config";
import {
    RecaptchaVerifier,
    getAuth,
    signInWithPhoneNumber,
} from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import axios from "axios";

function QueryContainer({ header, data }) {
    return (
        <div className={`mb-3 ${styles.queryContainer}`}>
            <h2>{header}</h2>
            <Accordion allowMultiple={true} allowToggle={true}>
                {data.map((val, i) => (
                    <AccordionItem key={i}>
                        <h2>
                            <AccordionButton
                                color={"#FFF"}
                                bg={"transparent"}
                                border={"1px solid #FFFFFF55"}
                                borderRadius={"0.2rem"}
                                fontWeight={"bold"}
                                _hover={{ bg: "transparent" }}
                            >
                                <Box flex={1} textAlign="left">
                                    {val.query}
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4} pl={12}>
                            {val.answer}
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

export default function FAQ({ csrfToken, faqData }) {
    const [showQueryModal, setShowQueryModal] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [queryData, setQueryData] = useState({});

    const toast = useToast();

    useEffect(() => {
        window.recaptchaVerifier = new RecaptchaVerifier(
            "recaptchaContainer",
            {
                size: "invisible",
            },
            getAuth()
        );
        return () => {
            window.recaptchaVerifier = null;
        };
    }, []);

    const submitQuery = (data) => {
        setShowQueryModal(false);
        setShowOTPModal(true);
        setQueryData(data);
    };

    const submitPin = (pin) => {
        window.confirmationResult
            .confirm(pin)
            .then(async () => {
                let res = await axios.post(
                    "/api/query",
                    {
                        ...queryData,
                        dateAdded: new Date(),
                        status: "unanswered",
                    },
                    {
                        headers: {
                            "xsrf-token": csrfToken,
                        },
                    }
                );
                if (res.status === 200) {
                    setShowOTPModal(false);
                    toast({
                        title: "Your Query Has Been Sent",
                        description: "Thank you for reaching out to us.",
                        status: "success",
                        duration: 3000,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                toast({
                    title: "An Error Has Occured.",
                    description: "Please try again later.",
                    status: "error",
                    duration: 3000,
                });
                setShowOTPModal(false);
            })
            .finally(() => {
                window.recaptchaVerifier
                    .render()
                    .then((id) => grecaptcha.reset(id));
            });
    };

    const resendPin = () => {
        window.recaptchaVerifier.render().then((id) => grecaptcha.reset(id));
        signInWithPhoneNumber(
            getAuth(),
            queryData.mobile,
            window.recaptchaVerifier
        ).then((res) => (window.confirmationResult = res));
    };

    useEffect(() => {
        document.body.style.overflowY =
            showQueryModal || showOTPModal ? "hidden" : "scroll";
    }, [showQueryModal, showOTPModal]);

    return (
        <div
            className={`d-flex flex-column justify-content-between align-items-stretch ${styles.faqs}`}
        >
            <div id="recaptchaContainer" style={{ visibility: "hidden" }}></div>
            <div
                className={`d-flex justify-content-center align-items-center py-4 mb-3 ${styles.header}`}
            >
                <h2>Frequently Asked Questions</h2>
            </div>
            <div className={`py-3 px-2 px-md-5 ${styles.body}`}>
                <QueryContainer
                    header="Construction Questions"
                    data={faqData.constructionQuestions}
                />
                <QueryContainer
                    header="Services Questions"
                    data={faqData.serviceQuestions}
                />
            </div>
            <div className={`py-1 ${styles.footer}`}>
                <a
                    className={`d-block text-center py-1 ${styles.queryLink}`}
                    onClick={() => setShowQueryModal(true)}
                >
                    Have questions not on the FAQs? Click me to ask a question.
                </a>
            </div>
            <AnimatePresence>
                {(showQueryModal || showOTPModal) && (
                    <BaseModal>
                        <AnimatePresence exitBeforeEnter>
                            {showQueryModal && !showOTPModal && (
                                <QueryModal
                                    close={() => setShowQueryModal(false)}
                                    onQuerySubmit={submitQuery}
                                />
                            )}
                            {showOTPModal && !showQueryModal && (
                                <OTPModal
                                    onPinSubmit={submitPin}
                                    onResendPin={resendPin}
                                />
                            )}
                        </AnimatePresence>
                    </BaseModal>
                )}
            </AnimatePresence>
        </div>
    );
}

export async function getServerSideProps() {
    const csrfToken = process.env.CSRF_SECRET;
    let snapshot = await getDoc(doc(getFirestore(), "dataContent", "faqs"));
    let faqData = snapshot.data();
    return {
        props: { csrfToken, faqData },
    };
}

FAQ.Layout = ClientLayout;
