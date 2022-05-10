import { useState, useEffect } from "react";
import { Link } from "react-scroll";
import Image from "next/image";

import styles from "@/styles/home.module.css";

import logo from "@/assets/company-logo.png";
import floorPlan from "@/assets/floorPlanPic.png";
import calendar from "@/assets/calendar.png";
import calculator from "@/assets/calculator.png";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/router";

import ImagePreview from "@/components/imagePreview";
import ClientLayout from "layout/client-layout";

import "firebase.config";
import { getFirestore, getDoc, doc } from "firebase/firestore";

import { motion, AnimatePresence } from "framer-motion";

import { Scrollbars } from "react-custom-scrollbars-2";

const ShowcaseItem = ({ imageUrl, previewImage, smallScreen }) => {
    const transform = (imageURL) => {
        let edgeIndex = imageURL.indexOf("works");
        let startEnd = imageURL.indexOf("upload");
        let end = imageURL.substring(edgeIndex);
        let start = imageURL.substring(0, startEnd + 7);
        return `${start}ar_16:9,c_crop/${end}`;
    };

    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            onClick={() => previewImage(imageUrl)}
            className={`d-flex flex-column justify-content-center align-items-stretch text-center m-2 ${styles.workShowcaseItem}`}
        >
            <img src={transform(imageUrl)} />
        </motion.div>
    );
};

const OfferItem = ({ data, image }) => {
    const { title, description, iconUrl } = data;
    return (
        <div
            className={`my-3 my-md-0 d-flex flex-column justify-content-start align-items-center p-3 text-center ${styles.offersContentItem}`}
        >
            <div className={`${styles.offersImageWrapper}`}>
                <img src={iconUrl} />
            </div>
            <h4>{title}</h4>
            <Scrollbars style={{ height: 300 }} autoHide>
                {description.map((text, i) => (
                    <p key={i}>{text}</p>
                ))}
            </Scrollbars>
        </div>
    );
};

export default function Home({ data }) {
    const [smallScreen, setSmallScreen] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [imageSource, setImageSource] = useState(false);
    const [homeData, setHomeData] = useState({});

    const router = useRouter();
    const workSliderSettings = {
        adaptiveHeight: true,
        dots: true,
        speed: 500,
        infinite: false,
        slidesToShow: smallScreen ? 2 : 4,
        slidesToScroll: 2,
        rows: smallScreen ? 1 : 2,
        dotsClass: `slick-dots ${styles.sliderDots}`,
    };
    const offerSliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        adaptiveHeight: true,
        slidesToShow: smallScreen ? 1 : 3,
        slidesToScroll: 1,
        dotsClass: `slick-dots ${styles.sliderDots}`,
    };

    useEffect(() => {
        setSmallScreen(window.innerWidth <= 768);
        window.addEventListener("resize", (e) => {
            setSmallScreen(e.currentTarget.innerWidth <= 768);
        });
    }, []);

    useEffect(() => {
        if (data) {
            setHomeData(data);
        }
    }, [data]);

    function previewImage(imageUrl) {
        setImageSource(imageUrl);
        setShowImagePreview(true);
    }

    return (
        <div className={`position-relative ${styles.home}`}>
            <div
                className={`w-100 d-flex justify-content-center align-items-center ${styles.hero}`}
            >
                <div
                    className={`d-flex flex-column justify-content-center align-items-center ${styles.heroContent}`}
                >
                    <Image src={logo} height={100} width={100} />
                    <h2 className={`text-center`}>ASEA iWork Builders Co.</h2>
                    <h4 className={`text-center`}>
                        BF Homes Sucat, Paranaque, Philippines
                    </h4>
                    <Link
                        to="work"
                        smooth={true}
                        duration={100}
                        offset={-75}
                        className={`${styles.heroContentWorkButton}`}
                    >
                        View Our Work
                    </Link>
                </div>
            </div>
            <div id="work" className={`row w-100 m-0 ${styles.workShowcase}`}>
                <div
                    className={`col-12 d-flex justify-content-center align-items-center position-relative mb-4 ${styles.workShowcaseHeader}`}
                >
                    <h2>Our Work</h2>
                </div>
                <div
                    className={`col-12 d-flex flex-column justify-content-center align-items-stretch ${styles.workShowcaseContent}`}
                >
                    <Slider {...workSliderSettings} draggable={false}>
                        {homeData.works?.map((url, i) => (
                            <ShowcaseItem
                                imageUrl={url}
                                key={i}
                                previewImage={previewImage}
                            />
                        ))}
                    </Slider>
                </div>
            </div>
            <div
                className={`d-flex flex-column w-100 justify-content-between align-items-stretch ${styles.features}`}
            >
                <div
                    className={`d-flex text-start text-md-start p-4 p-md-0 flex-column-reverse flex-md-row justify-content-md-around justify-content-center align-items-start align-items-md-center ${styles.floorPlannerFeature}`}
                >
                    <div
                        className={`text-center text-md-start ${styles.floorPlannerFeatureDetails}`}
                    >
                        <h2>Have an idea in mind?</h2>
                        <h4>
                            Try out interactive floor plan designer and
                            visualize your idea.
                        </h4>
                        <a
                            target="blank"
                            className={styles.floorButton}
                            href="https://www.coohom.com/pub/market/account/signup"
                        >
                            GO TO INTERACTIVE FLOOR PLANNER
                        </a>
                    </div>
                    <div
                        className={`w-50 d-none d-md-block ${styles.floorPlannerFeatureImageWrapper}`}
                    >
                        <Image
                            src={floorPlan}
                            alt={"Floor Plan"}
                            layout={"responsive"}
                        />
                    </div>
                </div>
                <div
                    className={`d-flex text-end text-md-end p-4 p-md-0 flex-column flex-md-row justify-content-md-around justify-content-center align-items-end align-items-md-center ${styles.appointmentFeature}`}
                >
                    <div
                        className={`w-50 d-none d-md-block ${styles.appointmentFeatureImageWrapper}`}
                    >
                        <Image
                            src={calendar}
                            alt={"Appointment"}
                            layout={"responsive"}
                        />
                    </div>
                    <div
                        className={`text-center text-md-end ${styles.appointmentFeatureDetails}`}
                    >
                        <h2>Want to make an appointment?</h2>
                        <h4>
                            Check if there are available dates to make your
                            appointment.
                        </h4>
                        <button onClick={() => router.push("/appointment")}>
                            Check Available Dates
                        </button>
                    </div>
                </div>
            </div>
            <div
                className={`row m-0 justify-content-center justify-content-md-around align-items-center ${styles.priceCalculator}`}
                style={{
                    maxHeight: smallScreen && "none",
                    height: smallScreen && "100%",
                }}
            >
                <div
                    className={`col-10 col-md-6 d-flex flex-column justify-content-center align-items-center align-items-md-start text-center text-md-start ${styles.priceCalculatorDetails}`}
                >
                    <h2>Want to know our price ranges?</h2>
                    <h4>
                        Try our sample price computation depending on your
                        preferred type of finishes.
                    </h4>
                    <h4>
                        We offer basic, standard, mid-end, and high-end finish
                        prices.
                    </h4>
                    <button onClick={() => router.push("/calculator")}>
                        Go to Sample Price Computation
                    </button>
                </div>
                <div
                    className={`col-4 d-none d-md-block ${styles.priceCalculatorImageWrapper}`}
                >
                    <Image
                        src={calculator}
                        alt={"Floor Plan"}
                        width={290}
                        height={370}
                    />
                </div>
            </div>
            <div
                className={`d-flex flex-column justify-content-between align-items stretch ${styles.offers}`}
                style={{
                    maxHeight: smallScreen && "none",
                    height: smallScreen && "100%",
                }}
            >
                <div
                    className={`d-flex justify-content-center align-items-center position-relative mb-3 ${styles.offersHeader}`}
                >
                    <h2>We Offer</h2>
                </div>
                <div
                    className={`col-12 d-flex flex-column justify-content-center align-items-stretch ${styles.offersContent}`}
                >
                    <Slider {...offerSliderSettings}>
                        {homeData.offers?.map((data, index) => (
                            <OfferItem data={data} key={index} />
                        ))}
                    </Slider>
                </div>
            </div>
            <AnimatePresence>
                {showImagePreview && (
                    <ImagePreview
                        imageSrc={imageSource}
                        smallScreen={smallScreen}
                        close={() => {
                            setShowImagePreview(false);
                            setImageSource("");
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export async function getServerSideProps() {
    let snapshot = await getDoc(doc(getFirestore(), "dataContent", "home"));
    let data = snapshot.data();
    return {
        props: { data },
    };
}

Home.Layout = ClientLayout;
