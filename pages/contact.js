import { useState } from "react";

import styles from "../styles/contact.module.css";
import {
    BsFacebook,
    BsTwitter,
    BsInstagram,
    BsYoutube,
    BsLinkedin,
    BsShare,
    BsTelephoneFill,
    BsFillPinMapFill,
    BsFillEnvelopeFill,
} from "react-icons/bs";
import ClientLayout from "layout/client-layout";

import "firebase.config";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const socialIcons = {
    Facebook: BsFacebook,
    Twitter: BsTwitter,
    Instagram: BsInstagram,
    YouTube: BsYoutube,
    LinkedIn: BsLinkedin,
    Other: BsShare,
};

function ContactItem({ icon, text, isLink, linkHref, _target }) {
    const Icon = icon;
    return (
        <li>
            <Icon className={styles.contactIcon} />
            {isLink ? (
                <a href={linkHref} target={_target}>
                    {text}
                </a>
            ) : (
                text
            )}
        </li>
    );
}

function ContactDetails({ data }) {
    const { email, contactNum, address, socials } = data;
    return (
        <div
            className={`col-12 col-md-6 d-flex flex-column justify-content-around align-items-start my-3 my-md-0 ${styles.contactDetails}`}
        >
            <h2 className={`text-center text-md-start w-100`}>
                You may contact us through our contact information below:
            </h2>
            <ul>
                <ContactItem icon={BsFillPinMapFill} text={address} />
                {contactNum.map((val, i) => (
                    <ContactItem icon={BsTelephoneFill} text={val} key={i} />
                ))}
                <ContactItem
                    icon={BsFillEnvelopeFill}
                    text={email}
                    linkHref={`mailto:${email}`}
                    isLink
                />
            </ul>

            <div
                className={`w-100 d-flex justify-content-around align-items-center mt-3 ${styles.socMeds}`}
            >
                {socials.map((val, i) => {
                    let Icon = socialIcons[val.type];
                    return (
                        <a
                            href={val.value}
                            target={"_blank"}
                            className={`${styles.socMedLink}`}
                        >
                            <Icon />
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

export default function Contact({ data }) {
    const [screenSize, setScreenSize] = useState({});
    const [smallScreen, setSmallScreen] = useState(false);

    return (
        <div
            className={`row justify-content-around align-items-center px-0 px-md-5 w-100 m-0 position-relative ${styles.contactPage}`}
        >
            <ContactDetails data={data} />
            <div
                className={`col-12 col-md-5 my-3 my-md-0 ${styles.contactLocation}`}
            >
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241.4737216380387!2d121.01749798599144!3d14.451377754608217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397ce3cafcaf4ff%3A0xf7013b7749339bb!2sTeodoro%20Evangelista%2C%20Para%C3%B1aque%2C%20Kalakhang%20Maynila!5e0!3m2!1sen!2sph!4v1646396408597!5m2!1sen!2sph"
                    allowfullscreen={false}
                    height={400}
                    width={500}
                    className={`w-100`}
                    loading="lazy"
                ></iframe>
            </div>
        </div>
    );
}

export async function getServerSideProps() {
    let snapshot = await getDoc(doc(getFirestore(), "dataContent", "contact"));
    let data = snapshot.data();
    return {
        props: {
            data,
        },
    };
}

Contact.Layout = ClientLayout;
