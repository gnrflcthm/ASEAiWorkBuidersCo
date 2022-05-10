import { useState, useEffect } from "react";

import axios from "axios";

import "firebase.config";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import fetchDataContentFrom from "./fetchDataContentFrom";

import ActionButton from "@/components/actionButton";
import BaseModal from "@/components/baseModal";

import {
    SkeletonText,
    Progress,
    Box,
    Flex,
    Text,
    Button,
} from "@chakra-ui/react";

import { BsTrashFill } from "react-icons/bs";
import { GrClose } from "react-icons/gr";

import styles from "@/styles/adminDashboardBase.module.css";
import { AnimatePresence } from "framer-motion";

import { Scrollbars } from "react-custom-scrollbars-2";

const ShowcaseModal = ({ toast, close, reload }) => {
    const [showcaseImage, setShowcaseImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setUploading(true);
        let status = "Success";
        let db = getFirestore();
        let formData = new FormData();
        formData.append("upload_preset", process.env.CLOUDINARY_WORKS_PRESET);
        formData.append("file", showcaseImage);
        try {
            let res = await axios.post(
                process.env.CLOUDINARY_UPLOAD_URL,
                formData,
                {
                    onUploadProgress: ({ loaded, total }) => {
                        setProgress(Math.round((loaded * 100) / total));
                    },
                }
            );
            let imageURL = res.data.secure_url;
            let d = doc(db, "dataContent", "home");
            await updateDoc(d, {
                works: arrayUnion(imageURL),
            });
            toast({
                title: "Successs",
                description: "Work Successfully added",
                duration: 1200,
                status: "success",
            });
            reload();
        } catch (err) {
            console.log(err);
            status = "Error";
            toast({
                title: "An Error Has Occured",
                duration: 1200,
                status: "error",
            });
        } finally {
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Add",
                    status,
                    page: "Home/Work Showcase",
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
            close();
        }
    };

    return (
        <div className={`p-4 col-10 col-md-5 ${styles.modalContainer}`}>
            <div className={`${styles.modalHeader}`}>
                <h2>Add Work</h2>
                <GrClose className={`${styles.closeModal}`} onClick={close} />
            </div>
            <div>
                <form onSubmit={submit}>
                    <input
                        type="file"
                        className={`form-control`}
                        onChange={(e) => setShowcaseImage(e.target.files[0])}
                    />
                    {uploading ? (
                        <div className={`mt-2 w-100 text-center`}>
                            <p>Uploading</p>
                            <Progress value={progress} />
                        </div>
                    ) : (
                        <button
                            className={`btn btn-primary w-100 mt-2`}
                            type="submit"
                        >
                            Add Work
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

const OffersModal = ({ mode, data, toast, close, reload }) => {
    const [offerIcon, setOfferIcon] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (mode === "edit") {
            setTitle(data.title);
            setDescription(data.description.join("\n\n"));
        }
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setUploading(true);
        let status = "Success";
        let db = getFirestore();
        let formData = new FormData();
        formData.append("upload_preset", process.env.CLOUDINARY_OFFERS_PRESET);
        formData.append("file", offerIcon);
        try {
            let res = await axios.post(
                process.env.CLOUDINARY_UPLOAD_URL,
                formData,
                {
                    onUploadProgress: ({ loaded, total }) => {
                        setProgress(Math.round((loaded * 100) / total));
                    },
                }
            );
            let iconUrl = res.data.secure_url;
            let d = doc(db, "dataContent", "home");
            await updateDoc(d, {
                offers: arrayUnion({
                    iconUrl,
                    title,
                    description: description
                        .trim()
                        .split("\n")
                        .map((val) => val.trim())
                        .filter((val) => val !== ""),
                }),
            });
            toast({
                title: "Success",
                description: "Offer successfully added",
                duration: 1200,
                status: "success",
            });
            reload();
        } catch (err) {
            console.log(err);
            status = "Error";
            toast({
                title: "An Error Has Occured",
                duration: 1200,
                status: "error",
            });
        } finally {
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Add",
                    status,
                    page: "Home/Offers",
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
            close();
        }
    };

    return (
        <div className={`p-4 col-10 col-md-5 ${styles.modalContainer}`}>
            <div className={`${styles.modalHeader}`}>
                <h2>Add Offer</h2>
                <GrClose className={`${styles.closeModal}`} onClick={close} />
            </div>
            <div>
                <form onSubmit={submit}>
                    <div className={`mb-2`}>
                        <label>Title</label>
                        <input
                            type={"text"}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`form-control`}
                            placeholder="Enter offer title"
                            required
                        />
                    </div>
                    <div className={`mb-2`}>
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`form-control`}
                            rows={6}
                            placeholder="Enter offer description"
                            required
                        />
                    </div>
                    <input
                        type="file"
                        className={`form-control`}
                        onChange={(e) => setOfferIcon(e.target.files[0])}
                        required
                    />
                    {uploading ? (
                        <div className={`mt-2 w-100 text-center`}>
                            <p>Uploading</p>
                            <Progress value={progress} />
                        </div>
                    ) : (
                        <button
                            className={`btn btn-primary w-100 mt-2`}
                            type="submit"
                        >
                            Add Offer
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default function HomePanel({ toast, csrfToken }) {
    const [data, loading, error, reload] = fetchDataContentFrom("home");
    const [showcaseItems, setShowcaseItems] = useState([]);
    const [offers, setOffers] = useState([]);
    const [showAddShowcaseModal, setShowAddShowcaseModal] = useState(false);
    const [showAddOfferModal, setShowAddOfferModal] = useState(false);

    useEffect(() => {
        if (data) {
            setShowcaseItems(data.works);
            setOffers(data.offers);
        }
    }, [data]);

    const deleteWork = async (url, index) => {
        try {
            let res = await axios.post(
                "/api/admin/works",
                { imageURL: url },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
            if (res.status === 200) {
                toast({
                    title: "Successs",
                    description: "Work Successfully Deleted",
                    duration: 1200,
                    status: "success",
                });
            }
            setTimeout(() => reload(), 1000);
        } catch (err) {
            console.log(err);
            toast({
                title: "An Error Has Occured",
                duration: 1200,
                status: "error",
            });
        }
    };

    const deleteOffer = async (val) => {
        try {
            let { iconUrl, description, title } = val;
            let res = await axios.post(
                "/api/admin/offers",
                {
                    iconUrl,
                    title,
                    description: description
                        .map((val) => val.trim())
                        .filter((val) => val !== ""),
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
            if (res.status === 200) {
                toast({
                    title: "Successs",
                    description: "Work Successfully Deleted",
                    duration: 1200,
                    status: "success",
                });
            }
            setTimeout(() => reload(), 1000);
        } catch (err) {
            console.log(err);
            toast({
                title: "An Error Has Occured",
                duration: 1200,
                status: "error",
            });
        }
    };

    return (
        <Box p={4} h={"full"}>
            <Text fontWeight={"bold"} m={0}>
                Work Showcase
            </Text>
            <SkeletonText
                mb={"2"}
                noOfLines={5}
                spacing="4"
                isLoaded={data}
                maxH={"35vh"}
                overflowY={"auto"}
                w={"full"}
            >
                {data && (
                    <Scrollbars autoHeight>
                        {showcaseItems.map((val, i) => (
                            <Flex
                                w={"full"}
                                key={i}
                                my={2}
                                bg={"white"}
                                alignItems={"center"}
                                overflow={"hidden"}
                                borderRadius={"md"}
                            >
                                <Box
                                    h={10}
                                    px={10}
                                    bgPos={"center"}
                                    bgRepeat={"no-repeat"}
                                    bgSize={"cover"}
                                    bgImage={`url(${val})`}
                                ></Box>
                                <Flex
                                    justifyContent={"space-between"}
                                    flex={1}
                                    px={4}
                                >
                                    <Text as={"a"} href={val} target={"_blank"}>
                                        View
                                    </Text>
                                    <ActionButton
                                        icon={BsTrashFill}
                                        color={"red"}
                                        tooltip={"Delete Offer"}
                                        placement={"top-start"}
                                        onClick={() => deleteWork(val, i)}
                                    />
                                </Flex>
                            </Flex>
                        ))}
                    </Scrollbars>
                )}
            </SkeletonText>
            <Text fontWeight={"bold"} m={0}>
                Offers
            </Text>
            <SkeletonText
                mb={"2"}
                noOfLines={5}
                spacing="4"
                isLoaded={data}
                maxH={"35vh"}
                overflowY={"auto"}
                w={"full"}
            >
                {data && (
                    <Scrollbars autoHeight>
                        {offers.map((val, i) => (
                            <Flex
                                key={i}
                                alignItems={"center"}
                                bg={"white"}
                                borderRadius={"md"}
                                my={2}
                                overflow={"hidden"}
                            >
                                <Box
                                    h={10}
                                    w={10}
                                    bgPos={"center"}
                                    bgRepeat={"no-repeat"}
                                    bgSize={"cover"}
                                    bgImage={`url(${val.iconUrl})`}
                                ></Box>
                                <Flex
                                    justifyContent={"space-between"}
                                    px={4}
                                    flex={1}
                                >
                                    <Text m={0}>{val.title}</Text>
                                    <ActionButton
                                        icon={BsTrashFill}
                                        color={"red"}
                                        tooltip={"Delete Work"}
                                        placement={"top-start"}
                                        onClick={() => deleteOffer(val)}
                                    />
                                </Flex>
                            </Flex>
                        ))}
                    </Scrollbars>
                )}
            </SkeletonText>
            <Flex justifyContent={"end"}>
                <Button
                    flex={[1, "initial"]}
                    color={"white"}
                    bg={"#031579"}
                    _hover={{ bg: "white", color: "black" }}
                    onClick={() => setShowAddShowcaseModal(true)}
                    mr={2}
                    border={"none"}
                    outline={"none"}
                >
                    Add Work
                </Button>
                <Button
                    flex={[1, "initial"]}
                    color={"white"}
                    bg={"#031579"}
                    _hover={{ bg: "white", color: "black" }}
                    onClick={() => setShowAddOfferModal(true)}
                    border={"none"}
                    outline={"none"}
                >
                    Add Offer
                </Button>
            </Flex>
            <AnimatePresence>
                {(showAddShowcaseModal || showAddOfferModal) && (
                    <BaseModal>
                        {showAddShowcaseModal && (
                            <ShowcaseModal
                                toast={toast}
                                close={() => setShowAddShowcaseModal(false)}
                                reload={() => reload()}
                            />
                        )}
                        {showAddOfferModal && (
                            <OffersModal
                                toast={toast}
                                close={() => setShowAddOfferModal(false)}
                                reload={() => reload()}
                            />
                        )}
                    </BaseModal>
                )}
            </AnimatePresence>
        </Box>
    );
}
