import styles from "./sampleCalculator.module.css";
import { useState, useEffect } from "react";

import { Tooltip } from "@chakra-ui/react";

const finishes = {
    basic: {
        base: 18000,
        description:
            "A starting point for budget houses that is livable during development. The skeleton and muscle structures of the house are roughly made, and the surface is still uneven and irregular.",
    },
    standard: {
        base: 22000,
        description:
            "A semi-finished house with more room for adjustments. It includes tile fixtures and divisions inside. Perfect for those who still haven’t finalized their ideal home.",
    },
    "mid-end": {
        base: 27000,
        description:
            "A finished product which comes in the vinyl, ceramic/homogenous tiles, and an installed cabinet. It has sophisticated rooms with a much well-known look. ",
    },
    "high-end": {
        base: 38000,
        description:
            "More than just a finished house. It is a luxurious house with built-in mechanical features such as security door locks and a fire alarm feature. ",
    },
};

const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
});

export default function SampleCalculator() {
    const [finishType, setFinishType] = useState("basic");
    const [floorArea, setFloorArea] = useState(0);
    const [estimatedPrice, setEstimatedPrice] = useState("");

    useEffect(() => {
        setEstimatedPrice(
            `${
                isNaN(floorArea)
                    ? ""
                    : formatter.format(floorArea * finishes[finishType].base)
            }`
        );
    }, [finishType, floorArea]);

    return (
        <div
            className={`d-flex flex-column justify-content-center align-items-center ${styles.sampleCalculator}`}
        >
            <div className={`col-md-8`}>
                <div
                    className={`d-flex justify-content-center align-items-center ${styles.sampleCalculatorHeader}`}
                >
                    <h2>Sample Floor Area Calculation</h2>
                </div>
                <div className={`${styles.sampleCalculatorBody}`}>
                    <div
                        className={`d-flex flex-column justify-content-center text-center my-3 ${styles.finishType}`}
                    >
                        <h5>Choose Your Finish Type</h5>
                        <div
                            className={`d-flex justify-content-around align-items-center ${styles.finishSelect}`}
                        >
                            {Object.keys(finishes).map((val, idx) => (
                                <Tooltip
                                    label={finishes[val].description}
                                    placement={"top"}
                                    hasArrow
                                >
                                    <button
                                        className={`${styles.finishValue} ${
                                            val === finishType
                                                ? styles.activeFinish
                                                : ""
                                        }`}
                                        key={idx}
                                        onClick={() => setFinishType(val)}
                                    >
                                        {val}
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                    <div
                        className={`d-flex justify-content-start align-items-center ${styles.floorArea}`}
                    >
                        <h4>Enter your Total Floor Area:</h4>
                        <input
                            type="number"
                            value={floorArea}
                            onChange={(e) =>
                                setFloorArea(parseInt(e.target.value))
                            }
                            placeholder="entered value is in sqm"
                        />
                    </div>
                    <div
                        className={`d-flex justify-content-start align-items-center ${styles.estimatedPrice}`}
                    >
                        <h4>Estimated Price:</h4>
                        <input
                            type="text"
                            value={estimatedPrice}
                            readOnly={true}
                        />
                    </div>

                    <div
                        className={`d-flex justify-content-start align-items-center my-2 ${styles.disclaimer}`}
                    >
                        <h5>
                            Disclaimer: This sample price estimation is an
                            approximation and is not guaranteed for the actual
                            price. The estimate is based on the square meter per
                            area only and the actual cost may change depending
                            on the project specified by the client.
                        </h5>
                    </div>
                </div>
            </div>
        </div>
    );
}
