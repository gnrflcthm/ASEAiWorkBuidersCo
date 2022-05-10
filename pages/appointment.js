import { useState, useEffect } from "react";

import styles from "@/styles/appointment.module.css";
import Calendar from "react-calendar";
import ClientLayout from "layout/client-layout";
import AppointmentModal from "@/components/appointmentModal";
import BaseModal from "@/components/baseModal";
import OTPModal from "@/components/otpModal";
import CancelAppoinmentModal from "@/components/cancelAppointmentModal";

import "firebase.config";
import {
    RecaptchaVerifier,
    getAuth,
    signInWithPhoneNumber,
} from "firebase/auth";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import axios from "axios";

import { useToast } from "@chakra-ui/react";

import { AnimatePresence } from "framer-motion";

const getTakenSlots = async (date) => {
    let slots = [];
    let dateString = `${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date
        .getDate()
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    let db = getFirestore();
    let q = query(
        collection(db, "appointments"),
        where("appointmentDate", "==", dateString)
    );
    let data = await getDocs(q);
    data.forEach((snapshot) => {
        slots.push(snapshot.data().appointmentTime);
    });
    return slots;
};

export default function Appointment({ csrfToken }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showCancelAppointmentModal, setShowCancelAppointmentModal] =
        useState(false);
    const [appointmentData, setAppointmentData] = useState({});
    const [takenSlots, setTakenSlots] = useState([]);
    const [mode, setMode] = useState("request");
    const [cancelStatus, setCancelStatus] = useState("");
    const [currentPhone, setCurrentPhone] = useState("");

    const toast = useToast();

    const disableDate = (date) => {
        let today = new Date();
        return (
            new Date(date) < new Date(today.setDate(today.getDate() + 1)) ||
            [0, 6].includes(date.getDay())
        );
    };

    const isToday = (date) => {
        let today = new Date();
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    };

    useEffect(() => {
        switch (selectedDate.getDay()) {
            case 5:
                setSelectedDate(
                    (date) => new Date(date.setDate(date.getDate() + 3))
                );
                break;
            case 4:
                setSelectedDate(
                    (date) => new Date(date.setDate(date.getDate() + 4))
                );
                break;
            default:
                setSelectedDate(
                    (date) => new Date(date.setDate(date.getDate() + 2))
                );
                break;
        }
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

    useEffect(async () => {
        setTakenSlots(await getTakenSlots(selectedDate));
    }, [selectedDate]);

    const submitAppointment = (data) => {
        setShowAppointmentModal(false);
        setMode("request");
        setShowOTPModal(true);
        setAppointmentData(data);
    };

    const submitPin = (pin) => {
        window.confirmationResult
            .confirm(pin)
            .then(async () => {
                if (mode === "request") {
                    let res = await axios.post(
                        "/api/appointment",
                        { ...appointmentData },
                        {
                            headers: {
                                "xsrf-token": csrfToken,
                            },
                        }
                    );
                    if (res.status === 200) {
                        setShowOTPModal(false);
                        toast({
                            title: "You Have Set An Appointment",
                            description:
                                "The contractor will notify you in a while.",
                            status: "success",
                            duration: 4000,
                        });
                    }
                } else if (mode === "cancel") {
                    setShowOTPModal(false);
                    setCancelStatus("cancellation");
                    setShowCancelAppointmentModal(true);
                }
            })
            .catch((err) => console.log(err))
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
            appointmentData.mobile,
            window.recaptchaVerifier
        ).then((res) => (window.confirmationResult = res));
    };

    const verifyPhoneForCancel = (phoneNum) => {
        setMode("cancel");
        setShowCancelAppointmentModal(false);
        setShowOTPModal(true);
        setCurrentPhone(phoneNum);
    };

    return (
        <div
            className={`d-flex flex-column justify-content-around align-items-stretch justify-content-md-between  ${styles.appointment}`}
        >
            <div id="recaptchaContainer" style={{ visibility: "hidden" }}></div>
            <div
                className={`d-flex justify-content-center align-items-center py-4 ${styles.header}`}
            >
                <h2>Available Dates</h2>
            </div>
            <div
                className={`row justify-content-around align-items-stretch mx-0 mx-md-5 flex-wrap-reverse flex-md-no-wrap my-2 ${styles.body}`}
            >
                <div
                    className={`col-10 col-md-6 d-flex justify-content-center align-items-center align-self-center p-4 ${styles.calendarContainer}`}
                >
                    <Calendar
                        value={selectedDate}
                        onChange={setSelectedDate}
                        tileDisabled={({ date }) => disableDate(date)}
                    />
                </div>
                <div
                    className={`col-10 col-md-4 d-flex flex-column justify-content-center align-items-stretch mb-2 p-0 ${styles.appointmentDetails}`}
                >
                    <div className={`p-4 ${styles.selectedDate}`}>
                        <h4 className={`mb-3`}>Available Slots</h4>
                        <h5 className={`mb-3`}>{5 - takenSlots.length}</h5>
                        <h4 className={`mb-3`}>Selected Date</h4>
                        <h5 className={`mb-3`}>
                            {selectedDate.toLocaleDateString()}
                        </h5>
                        <button
                            className={`btn w-100 ${styles.requestAppointment}`}
                            onClick={() => setShowAppointmentModal(true)}
                            disabled={
                                takenSlots.length === 5 ||
                                [0, 6].includes(selectedDate.getDay())
                            }
                        >
                            {takenSlots.length === 5
                                ? "No Slots Available"
                                : [0, 6].includes(selectedDate.getDay()) ||
                                  isToday(selectedDate)
                                ? "Unavailable"
                                : "Request An Appointment"}
                        </button>
                        <a
                            className={`btn-link text-danger mt-2 d-block ${styles.cancelAppointment}`}
                            onClick={() => {
                                setCancelStatus("validation");
                                setShowCancelAppointmentModal(true);
                            }}
                        >
                            Cancel Appointment
                        </a>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {(showAppointmentModal || showOTPModal) && (
                    <BaseModal>
                        {showAppointmentModal &&
                            !showOTPModal &&
                            !showCancelAppointmentModal && (
                                <AppointmentModal
                                    takenSlots={takenSlots}
                                    selectedDate={selectedDate}
                                    close={() => setShowAppointmentModal(false)}
                                    submitAppointment={submitAppointment}
                                />
                            )}
                        {showOTPModal &&
                            !showAppointmentModal &&
                            !showCancelAppointmentModal && (
                                <OTPModal
                                    onPinSubmit={submitPin}
                                    onResendPin={resendPin}
                                />
                            )}
                        {showCancelAppointmentModal &&
                            !showAppointmentModal &&
                            !showOTPModal && (
                                <CancelAppoinmentModal
                                    status={cancelStatus}
                                    onPhoneSubmit={verifyPhoneForCancel}
                                    close={() => {
                                        setShowCancelAppointmentModal(false);
                                    }}
                                    verifiedPhone={currentPhone}
                                />
                            )}
                    </BaseModal>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showCancelAppointmentModal && (
                    <BaseModal>
                        {showCancelAppointmentModal &&
                            !showAppointmentModal &&
                            !showOTPModal && (
                                <CancelAppoinmentModal
                                    status={cancelStatus}
                                    onPhoneSubmit={verifyPhoneForCancel}
                                    close={() => {
                                        setShowCancelAppointmentModal(false);
                                    }}
                                    verifiedPhone={currentPhone}
                                />
                            )}
                    </BaseModal>
                )}
            </AnimatePresence>
        </div>
    );
}

export async function getServerSideProps({ req, res }) {
    const csrfToken = process.env.CSRF_SECRET;

    return {
        props: { csrfToken },
    };
}

Appointment.Layout = ClientLayout;
