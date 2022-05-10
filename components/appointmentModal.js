import styles from "./appointmentModal.module.css";

import { useState, useEffect } from "react";

import { GrClose } from "react-icons/gr";

import "firebase.config";
import { signInWithPhoneNumber, getAuth, signOut } from "firebase/auth";

import {
    Alert,
    AlertIcon,
    Box,
    Heading,
    Text,
    Flex,
    Button,
} from "@chakra-ui/react";

import { Scrollbars } from "react-custom-scrollbars-2";

import { AnimatePresence } from "framer-motion";
import BaseModal from "@/components/baseModal";

import termsAndConditions from "@/assets/terms.json";

const timeSelect = {
    "10:00": "10:00 AM",
    "12:00": "12:00 PM",
    "14:00": "2:00 PM",
    "16:00": "4:00 PM",
    "18:00": "6:00 PM",
};

const TermsAndConditionsModal = ({ close }) => {
    return (
        <Flex
            flexDir={"column"}
            bg="white"
            w={["90vw", "40vw"]}
            p={8}
            borderRadius={"md"}
        >
            <Heading fontSize={["xl", "2xl"]}>Terms and Conditions</Heading>
            <Box as={Scrollbars} autoHeight my={2}>
                {termsAndConditions.map((val) => (
                    <Text>{val}</Text>
                ))}
            </Box>
            <Button
                onClick={close}
                color={"white"}
                bg={"#031579"}
                border={"none"}
                outline={"none"}
                borderRadius={"md"}
                _hover={{
                    bg: "#49E3EF",
                    color: "black",
                }}
            >
                Close
            </Button>
        </Flex>
    );
};

export default function AppointmentModal({
    takenSlots,
    selectedDate,
    close,
    submitAppointment,
}) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [contact, setContact] = useState("");
    const [schedule, setSchedule] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [noSchedule, setNoSchedule] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);

    useEffect(() => {
        let computed = Object.keys(timeSelect).filter(
            (val) => !takenSlots.includes(val)
        );
        setAvailableSlots(computed);
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (schedule.trim() === "") {
            setNoSchedule(true);
            return;
        }
        try {
            let confirmationResult = await signInWithPhoneNumber(
                getAuth(),
                `+63${contact}`,
                window.recaptchaVerifier
            );
            window.confirmationResult = confirmationResult;
            submitAppointment({
                firstName,
                lastName,
                email,
                contact: `+63${contact}`,
                schedule,
                selectedDate: `${(selectedDate.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${selectedDate
                    .getDate()
                    .toString()
                    .padStart(2, "0")}/${selectedDate.getFullYear()}`,
            });
        } catch (err) {
            console.log(err);
        } finally {
            signOut(getAuth());
        }
        setLoading(false);
    };

    return (
        <div
            className={`col-10 col-md-6 p-4 ${styles.modalContainer}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={`${styles.modalHeader}`}>
                <h2>Set Appointment</h2>
                <GrClose className={`${styles.closeBtn}`} onClick={close} />
            </div>
            <form className={`row ${styles.modalBody}`} onSubmit={submit}>
                <div className="col-12 col-md-6">
                    <div className={`mb-2`}>
                        <label>First Name</label>
                        <span style={{ color: "red" }}> *</span>
                        <input
                            type="text"
                            className={`form-control`}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            placeholder="Enter your first name"
                        />
                    </div>
                    <div className={`mb-2`}>
                        <label>Last Name</label>
                        <span style={{ color: "red" }}> *</span>
                        <input
                            type="text"
                            className={`form-control`}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            placeholder="Enter your last name"
                        />
                    </div>
                    <div className={`mb-2`}>
                        <label>
                            Email - <i>Optional</i>
                        </label>
                        <input
                            type="email"
                            className={`form-control`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                        />
                    </div>
                    <div className={`mb-2`}>
                        <label>Mobile No.</label>
                        <span style={{ color: "red" }}> *</span>
                        <div className={`input-group`}>
                            <span className={`input-group-text`}>+63</span>
                            <input
                                type="tel"
                                className={`form-control`}
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                required
                                pattern="[0-9]{10}"
                                maxLength="10"
                                placeholder="Enter your mobile number"
                            />
                        </div>
                    </div>
                    <div className={`mb-2`}>
                        <label>SelectedDate</label>
                        <input
                            type="text"
                            className={`form-control`}
                            readOnly
                            value={selectedDate.toDateString()}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className={`mb-2`}>
                        <label>Time Slot</label>
                        <span style={{ color: "red" }}> *</span>
                        {noSchedule && (
                            <Alert status="warning">
                                <AlertIcon />
                                Please Select A Time Slot
                            </Alert>
                        )}
                        <div
                            onChange={(e) => {
                                setSchedule(e.target.value);
                                setNoSchedule(false);
                            }}
                        >
                            {Object.keys(timeSelect).map((key, i) => (
                                <div className={`form-check`} key={i}>
                                    <input
                                        class="form-check-input"
                                        type="radio"
                                        name="schedule"
                                        value={key}
                                        disabled={takenSlots.includes(key)}
                                    />
                                    <label class="form-check-label">
                                        {timeSelect[key]}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        className={`w-100 mt-3 btn ${styles.setAppointmentBtn}`}
                        type="submit"
                    >
                        {loading ? (
                            <span className={`spinner-border`}></span>
                        ) : (
                            "Set Appointment"
                        )}
                    </button>
                    <small class="d-block mt-2 text-center">
                        By setting an appointment, you are agreeing to our{" "}
                        <button
                            type="button"
                            onClick={() => setShowTermsAndConditions(true)}
                            className="btn-link text-primary border-0 d-inline"
                            style={{
                                background: "transparent",
                                outline: "none",
                            }}
                        >
                            Terms and Conditions
                        </button>
                    </small>
                </div>
            </form>
            <AnimatePresence>
                {showTermsAndConditions && (
                    <BaseModal>
                        <TermsAndConditionsModal
                            close={() => setShowTermsAndConditions(false)}
                        />
                    </BaseModal>
                )}
            </AnimatePresence>
        </div>
    );
}
