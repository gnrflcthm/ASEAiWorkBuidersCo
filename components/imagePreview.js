import { useEffect, useState } from "react";
import styles from "@/styles/home.module.css";

import BaseModal from "./baseModal";

export default function ImagePreview({ imageSrc, close, smallScreen }) {
    const [size, setSize] = useState({});
    useEffect(() => {
        console.log(smallScreen);
        if (smallScreen) {
            setSize({ width: `80vw` });
        } else {
            setSize({ height: `80vh` });
        }
    }, [smallScreen]);
    return (
        <BaseModal close={() => close()}>
            <div
                className={`p-2 ${styles.imagePreview}`}
                onClick={(e) => e.stopPropagation()}
            >
                <img src={imageSrc} style={size} />
            </div>
        </BaseModal>
    );
}
