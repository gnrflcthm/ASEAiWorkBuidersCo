import styles from "./promptModal.module.css";

export default function PromptModal({
    prompt,
    subPrompt,
    onAccept,
    onReject,
    acceptText,
    rejectText,
}) {
    return (
        <div className={`p-3 col-10 col-md-4 ${styles.modalContainer}`}>
            <div className={`text-start mb-2 ${styles.modalHeader}`}>
                <h4>{prompt}</h4>
                {subPrompt && <p>{subPrompt}</p>}
            </div>
            <div
                className={`${styles.modalBody} d-flex justify-content-end align-items-center mt-2`}
            >
                <button onClick={onReject} className={`btn btn-danger mx-2`}>
                    {rejectText || "No"}
                </button>
                <button onClick={onAccept} className={`btn btn-success mx-2`}>
                    {acceptText || "Yes"}
                </button>
            </div>
        </div>
    );
}
