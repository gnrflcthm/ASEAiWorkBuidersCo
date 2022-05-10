import { useState, useEffect } from "react";

import cookie from "cookie";
import axios from "axios";

import useAdmin from "@/lib/useAdmin";

import HiddenID from "@/components/hiddenId";
import LoadingOverlay from "@/components/loadingOverlay";
import AdminHeader from "@/components/adminHeader";
import ActionButton from "@/components/actionButton";

import styles from "@/styles/adminDashboardBase.module.css";
import BaseModal from "@/components/baseModal";

import {
    Progress,
    useToast,
    Box,
    Flex,
    VStack,
    Heading,
    Text,
    Button,
    HStack,
    Image,
} from "@chakra-ui/react";
import { BsTrashFill } from "react-icons/bs";
import { GrClose } from "react-icons/gr";

import { AnimatePresence } from "framer-motion";

import "firebase.config";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    limit,
    orderBy,
} from "firebase/firestore";
import PromptModal from "@/components/prompt";
import { Scrollbars } from "react-custom-scrollbars-2";

const ServiceModal = ({ close, toast, reload }) => {
    const [serviceName, setServiceName] = useState("");
    const [serviceImage, setServiceImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let status = "Success";
        let db = getFirestore();
        let formData = new FormData();
        formData.append(
            "upload_preset",
            process.env.CLOUDINARY_SERVICES_PRESET
        );
        formData.append("file", serviceImage);
        try {
            let res = await axios.post(
                process.env.CLOUDINARY_UPLOAD_URL,
                formData,
                {
                    onUploadProgress: ({ loaded, total }) => {
                        setProgress(Math.round((loaded * 100) / total));
                    },
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
            let imageURL = res.data.secure_url;
            let resVal = await addDoc(collection(db, "services"), {
                serviceName,
                serviceImage: imageURL,
            });
            if (resVal) {
                setLoading(false);
                toast({
                    title: "Success",
                    description: "Service successfully added.",
                    duration: 1500,
                });
            }
        } catch (err) {
            status = "Error";
            console.error(err);
            toast({
                title: "Error",
                status: "error",
                description: "Error in adding service.",
                duration: 1500,
            });
        } finally {
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Add",
                    status,
                    page: "Services",
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
            reload();
            close();
        }
    };

    return (
        <div className={`p-4 col-10 col-md-5 ${styles.modalContainer}`}>
            <div className={`${styles.modalHeader}`}>
                <h2>Add Service</h2>
                <GrClose className={`${styles.closeModal}`} onClick={close} />
            </div>
            <form onSubmit={submit}>
                <div className={`mb-1`}>
                    <label>Service Name</label>
                    <input
                        type="text"
                        className={`form-control`}
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Enter service name"
                    />
                </div>
                <div className={`mb-1`}>
                    <label>Add File</label>
                    <input
                        type="file"
                        className={`form-control`}
                        onChange={(e) => setServiceImage(e.target.files[0])}
                        accept={"image/*"}
                    />
                </div>
                {loading ? (
                    <div className={`mt-2 w-100 text-center`}>
                        <p>Uploading</p>
                        <Progress value={progress} />
                    </div>
                ) : (
                    <button
                        className={`btn btn-primary w-100 mt-2`}
                        type="submit"
                    >
                        Add
                    </button>
                )}
            </form>
        </div>
    );
};

export default function Services({ csrfToken, sessionCookie }) {
    const [admin, loading, error] = useAdmin(csrfToken, sessionCookie);
    const [services, setServices] = useState([]);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
        useState(false);
    const [deleteQueue, setDeleteQueue] = useState({});
    const toast = useToast();
    const pageSize = 10;

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        let db = getFirestore();
        let q = query(collection(db, "services"), orderBy("serviceName"));
        let documents = await getDocs(q);
        setServices(documents);
    };

    const onDelete = (id, imageURL) => {
        setDeleteQueue({ id, imageURL });
        setShowDeleteConfirmationModal(true);
    };

    const deleteService = async () => {
        let { id, imageURL } = deleteQueue;
        try {
            let res = await axios.post(
                "/api/admin/service",
                { ex: "Delete", id, imageURL },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
            if (res.status === 200) {
                toast({
                    title: "Success",
                    description: "Service deleted successfully",
                    status: "success",
                    duration: 1500,
                });
                await loadServices();
            }
        } catch (err) {
            console.log(err);
            toast({
                title: "Error",
                description: "An unexpected error has occured.",
                status: "error",
                duration: 1500,
            });
        }
    };

    if (admin) {
        return (
            <Box minH={"100vh"} bg={"#DDD"}>
                <AdminHeader admin={admin} csrfToken={csrfToken} />
                <Flex
                    flexDir={["row", "column"]}
                    justifyContent={["space-between", "start"]}
                    alignItems={["center"]}
                    px={[2, 10]}
                    mb={5}
                    mt={3}
                >
                    <Heading
                        as="h1"
                        fontSize={["xl", "2xl"]}
                        flex={2}
                        textAlign={"left"}
                        color={"black"}
                        m={0}
                    >
                        Services
                    </Heading>
                    <Flex
                        justifyContent={"end"}
                        alignItems={"center"}
                        alignSelf={["initial", "end"]}
                    >
                        <Button
                            px={2}
                            py={1}
                            bg={"#031579"}
                            outline={"none"}
                            border={"none"}
                            color={"white"}
                            _hover={{ bg: "#49E3EF", color: "black" }}
                            onClick={() => setShowServiceModal(true)}
                        >
                            Add Service
                        </Button>
                    </Flex>
                </Flex>
                <Box px={[0, 10]}>
                    <Scrollbars style={{ height: "68vh" }}>
                        <VStack w={"full"} my={2}>
                            {services.docs
                                .map((doc) => ({ ...doc.data(), id: doc.id }))
                                .map((service) => (
                                    <Flex
                                        justifyContent={"space-between"}
                                        alignItems={"center"}
                                        bg={"white"}
                                        w={"full"}
                                        borderRadius={["none", "md"]}
                                        key={service.id}
                                        overflow={"hidden"}
                                    >
                                        <HStack>
                                            <Box
                                                as={"a"}
                                                display={"block"}
                                                href={service.serviceImage}
                                                target={"_blank"}
                                                objectFit={"cover"}
                                                h={20}
                                                w={20}
                                                overflow={"hidden"}
                                            >
                                                <Image
                                                    src={service.serviceImage}
                                                    h={"full"}
                                                />
                                            </Box>
                                            <Heading
                                                as={"h1"}
                                                color={"black"}
                                                fontSize={["lg", "xl"]}
                                                m={0}
                                            >
                                                {service.serviceName}
                                            </Heading>
                                        </HStack>
                                        <Button
                                            mr={3}
                                            bg={"transparent"}
                                            border={"none"}
                                            outline={"none"}
                                            color={"red.500"}
                                            onClick={() =>
                                                onDelete(
                                                    service.id,
                                                    service.serviceImage
                                                )
                                            }
                                        >
                                            <BsTrashFill />
                                        </Button>
                                    </Flex>
                                ))}
                        </VStack>
                    </Scrollbars>
                </Box>
                <AnimatePresence>
                    {(showServiceModal || showDeleteConfirmationModal) && (
                        <BaseModal>
                            {showServiceModal && (
                                <ServiceModal
                                    close={() => setShowServiceModal(false)}
                                    toast={toast}
                                    reload={loadServices}
                                />
                            )}
                            {showDeleteConfirmationModal && (
                                <PromptModal
                                    prompt={"You Are About To Delete A Service"}
                                    subPrompt={
                                        "Are you sure you want to continue?"
                                    }
                                    acceptText={"Return"}
                                    rejectText={"Delete Service"}
                                    onAccept={() =>
                                        setShowDeleteConfirmationModal(false)
                                    }
                                    onReject={() => {
                                        deleteService(deleteQueue, toast);
                                        setDeleteQueue({});
                                        setShowDeleteConfirmationModal(false);
                                    }}
                                />
                            )}
                        </BaseModal>
                    )}
                </AnimatePresence>
            </Box>
        );
    } else {
        return <LoadingOverlay />;
    }
}

export function getServerSideProps({ req, res }) {
    const cookies = cookie.parse(req.headers.cookie || "");
    const csrfToken = process.env.CSRF_SECRET;

    if (cookies.session) {
        return {
            props: { csrfToken, sessionCookie: cookies.session },
        };
    } else {
        return {
            redirect: {
                destination: "/admin/login?session=expired",
            },
        };
    }
}
