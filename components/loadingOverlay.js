export default function LoadingOverlay() {
    return (
        <div
            style={styles}
            className="d-flex justify-content-center align-items-center"
        >
            <span className="spinner-border d-block"></span>
        </div>
    );
}

const styles = {
    position: "absolute",
    width: "100vw",
    height: "100vh",
    top: 0,
    left: 0,
    background: "#CCCCCCE1",
};
