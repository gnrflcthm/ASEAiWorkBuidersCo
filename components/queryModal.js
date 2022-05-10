import { useState } from "react";

import styles from "./queryModal.module.css";
import { motion } from "framer-motion";

import { GrClose } from "react-icons/gr";

import "firebase.config";
import { getAuth, signInWithPhoneNumber } from "firebase/auth";

export default function QueryModal({ close, onQuerySubmit }) {
    const [processing, setProcessing] = useState(false);
    const [mobile, setMobile] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const [invalidMobile, setInvalidMobile] = useState(false);

    function submitQuery(e) {
        e.preventDefault();
        setProcessing(true);

        signInWithPhoneNumber(
            getAuth(),
            `+63${mobile}`,
            window.recaptchaVerifier
        )
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                onQuerySubmit({ mobile: `+63${mobile}`, name, email, message });
            })
            .catch((err) => {
                console.log(err);
                setInvalidMobile(true);
            })
            .finally(() => {
                setProcessing(false);
            });
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`col-10 col-md-5 p-5 ${styles.modalContainer}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div>
                <div className={`text-center ${styles.modalHeader}`}>
                    <h3>Inquiry Form</h3>
                    <GrClose className={`${styles.closeBtn}`} onClick={close} />
                </div>

                <div className={`${styles.modalBody}`}>
                    <form
                        onSubmit={submitQuery}
                        onFocus={() => setInvalidMobile(false)}
                    >
                        <div className={`${styles.formGroup}`}>
                            <label>
                                Mobile No.
                                <span style={{ color: `red` }}> *</span>
                            </label>
                            <div className={`input-group`}>
                                <span className={`input-group-text`}>+63</span>
                                <input
                                    type="tel"
                                    className={`form-control ${
                                        invalidMobile && "is-invalid"
                                    }`}
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    placeholder="Enter your mobile number"
                                />
                            </div>
                        </div>
                        <div className={`${styles.formGroup}`}>
                            <label>
                                Name
                                <span style={{ color: `red` }}> *</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className={`${styles.formGroup}`}>
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
                        <div className={`${styles.formGroup}`}>
                            <label>
                                Message
                                <span style={{ color: `red` }}> *</span>
                            </label>
                            <textarea
                                className={`form-control`}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter the question you want to ask"
                            ></textarea>
                        </div>
                        <button
                            className={`btn w-100 ${styles.submitBtn}`}
                            type="submit"
                        >
                            {processing ? (
                                <span className="spinner-border"></span>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
