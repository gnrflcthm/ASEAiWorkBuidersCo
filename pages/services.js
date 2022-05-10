import Image from "next/image";
import styles from "../styles/services.module.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ClientLayout from "layout/client-layout";

import "firebase.config";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";

const ServiceItem = ({ service }) => {
    const transform = (imageURL) => {
        let edgeIndex = imageURL.indexOf("services");
        let startEnd = imageURL.indexOf("upload");
        let end = imageURL.substring(edgeIndex);
        let start = imageURL.substring(0, startEnd + 7);
        return `${start}c_fill,h_300,w_500/${end}`;
    };

    return (
        <div
            className={`d-flex flex-column justify-content-center align-items-stretch text-center m-2 pb-2 ${styles.serviceItem}`}
        >
            <div className={`${styles.imageWrapper}`}>
                <Image
                    src={transform(service.serviceImage)}
                    width={500}
                    height={300}
                />
            </div>
            <h4>{service.serviceName}</h4>
        </div>
    );
};

export default function Services({ data }) {
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        rows: 2,
    };
    return (
        <div
            className={`d-flex flex-column justify-content-between align-items-stretch ${styles.services}`}
        >
            <div
                className={`d-flex justify-content-center align-items-center position-relative ${styles.servicesHeader}`}
            >
                <h2>Our Services</h2>
            </div>
            <div className={`${styles.servicesContent}`}>
                <Slider {...settings}>
                    {data.map((service) => (
                        <ServiceItem service={service} key={service.id} />
                    ))}
                </Slider>
            </div>
        </div>
    );
}

export async function getServerSideProps() {
    let data = [];
    let snapshots = await getDocs(
        query(collection(getFirestore(), "services"))
    );
    snapshots.forEach((doc) => data.push({ ...doc.data(), id: doc.id }));
    return {
        props: { data },
    };
}

Services.Layout = ClientLayout;
