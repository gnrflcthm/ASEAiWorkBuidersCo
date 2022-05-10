import { useState, useEffect } from "react";

import styles from "./otpModal.module.css";
import { HStack, PinInput, PinInputField } from "@chakra-ui/react";

import { motion } from "framer-motion";

export default function OTPModal({ onPinSubmit, onResendPin }) {
    const [timer, setTimer] = useState(30);
    const [activeResend, setActiveResend] = useState(false);
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval = setInterval(() => {
            setTimer((val) => {
                if (val === 1) clearInterval(interval);
                return val - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if (timer === 0) setActiveResend(true);
    }, [timer]);

    const resetPin = () => {
        setTimer(30);
        setActiveResend(false);
        let interval = setInterval(() => {
            setTimer((val) => {
                if (val === 1) clearInterval(interval);
                return val - 1;
            });
        }, 1000);
        onResendPin();
    };

    function submitPin() {
        setLoading(true);
        onPinSubmit(pin);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`col-10 col-md-5 p-5 ${styles.modalContainer}`}
        >
            <div className={`mb-3 ${styles.modalHeader}`}>
                <h3>Enter OTP</h3>
            </div>
            <div className={`${styles.modalBody}`}>
                <HStack justifyContent="space-around" marginBottom={"1.5rem"}>
                    <PinInput
                        type="number"
                        onChange={(val) => setPin(val)}
                        value={pin}
                    >
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                    </PinInput>
                </HStack>
                <div
                    className={`d-flex justify-content-center align-items-center w-100`}
                >
                    <a
                        className={`btn btn-link ${
                            !activeResend && "disabled"
                        } text-center`}
                        onClick={resetPin}
                    >
                        Resend Code {!activeResend && `(${timer})`}
                    </a>
                </div>
                <button
                    className={`btn w-100 ${styles.submitBtn}`}
                    onClick={submitPin}
                >
                    {loading ? (
                        <span className="spinner-border"></span>
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>
        </motion.div>
    );
}
