import { motion } from "framer-motion";
import styles from "./baseModal.module.css";

function BackDrop({ children, close }) {
    return (
        <motion.div
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`d-flex justify-content-center align-items-center ${styles.backdrop}`}
        >
            {children}
        </motion.div>
    );
}

export default function BaseModal({ children, close }) {
    return <BackDrop close={close}>{children}</BackDrop>;
}
