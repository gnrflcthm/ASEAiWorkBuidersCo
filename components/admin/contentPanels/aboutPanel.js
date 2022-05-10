import { useState, useEffect, useRef } from "react";

import axios from "axios";

import "firebase.config";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import fetchDataContentFrom from "./fetchDataContentFrom";

import styles from "@/styles/adminDashboardBase.module.css";

import ActionButton from "@/components/actionButton";
import BaseModal from "@/components/baseModal";

import { BsTrashFill, BsFillPencilFill, BsCameraFill } from "react-icons/bs";
import { GrClose } from "react-icons/gr";

import {
    SkeletonText,
    Progress,
    Box,
    Flex,
    Text,
    Button,
    Textarea,
    Spinner,
    IconButton,
    Input,
    FormControl,
} from "@chakra-ui/react";

import { AnimatePresence } from "framer-motion";
import { Scrollbars } from "react-custom-scrollbars-2";

const CertificationModal = ({ toast, close, reload, csrfToken }) => {
    const [certification, setCertification] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setUploading(true);

        let status = "Success";
        let db = getFirestore();
        let formData = new FormData();
        formData.append(
            "upload_preset",
            process.env.CLOUDINARY_CERTIFICATIONS_PRESET
        );
        formData.append("file", certification);
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
            let d = doc(db, "dataContent", "about");
            await updateDoc(d, {
                certifications: arrayUnion(imageURL),
            });

            close();
            toast({
                title: "Successs",
                description: "Certification successfully added",
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
                    page: "About/Certification",
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
        <Box p={5} w={["40vw"]} bg={"white"} borderRadius={"md"}>
            <Box position={"relative"} mb={3}>
                <Text m={0} fontSize={"xl"} fontWeight={"bold"} pt={1}>
                    Add Certification
                </Text>
                <IconButton
                    icon={<GrClose />}
                    onClick={close}
                    position={"absolute"}
                    top={0}
                    right={0}
                    color={"black"}
                    bg={"transparent"}
                    border={"none"}
                    outline={"none"}
                    p={0}
                />
            </Box>
            <Box as="form" onSubmit={submit}>
                <Box
                    position={"relative"}
                    borderRadius={"md"}
                    textAlign={"center"}
                    border={"2px"}
                    borderColor={"gray.300"}
                    color={"gray.500"}
                    py={4}
                    _hover={{ borderColor: "#031579", color: "#031579" }}
                    cursor={"pointer"}
                    borderStyle={"dashed"}
                    transition={"all 0.2s ease"}
                >
                    <Input
                        cursor={"pointer"}
                        type="file"
                        onChange={(e) => {
                            setCertification(e.target.files[0]);
                            console.log(e.target.files[0]);
                        }}
                        accept={"image/*"}
                        opacity={"0"}
                        left={0}
                        top={0}
                        h={"full"}
                        position={"absolute"}
                        pointerEvents={"all"}
                    />
                    <Text fontWeight={"semibold"} m={0} cursor={"pointer"}>
                        {certification ? (
                            `Selected File: ${certification.name}`
                        ) : (
                            <>
                                Upload Image{" "}
                                <Box as={BsCameraFill} ml={2}></Box>
                            </>
                        )}
                    </Text>
                </Box>
                {uploading ? (
                    <Box mt={2} w={"full"} textAlign={"center"}>
                        <Text>Uploading</Text>
                        <Progress value={progress} />
                    </Box>
                ) : (
                    <Button
                        border={"1px"}
                        borderColor={"transparent"}
                        outline={"none"}
                        bg={"#031579"}
                        color={"white"}
                        _hover={{
                            bg: "white",
                            color: "black",
                            borderColor: "black",
                        }}
                        w={"full"}
                        mt={3}
                        type="submit"
                    >
                        Add Certification
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default function AboutPanel({ toast, csrfToken }) {
    const [data, loading, error, reload] = fetchDataContentFrom("about");
    const [saving, setSaving] = useState(false);
    const [aboutData, setAboutData] = useState();
    const [missionData, setMissionData] = useState("");
    const [visionData, setVisionData] = useState("");
    const [certifications, setCertifications] = useState([]);
    const [showAddCertificationModal, setShowAddCertificationModal] =
        useState(false);

    const about = useRef(null);
    const mission = useRef(null);
    const vision = useRef(null);

    useEffect(() => {
        if (data) {
            setAboutData(data.about.join("\n\n"));
            setMissionData(data.mission.join("\n\n"));
            setVisionData(data.vision.join("\n\n"));
            setCertifications(data.certifications);
        }
    }, [data]);

    const save = async () => {
        setSaving(true);
        let status = "Success";
        let db = getFirestore();
        let document = doc(db, "dataContent", "about");
        try {
            await updateDoc(document, {
                about: aboutData
                    .trim()
                    .split("\n")
                    .filter((val) => val.trim() !== ""),
                mission: missionData
                    .trim()
                    .split("\n")
                    .filter((val) => val.trim() !== ""),
                vision: visionData
                    .trim()
                    .split("\n")
                    .filter((val) => val.trim() !== ""),
            });
            setSaving(false);
            toast({
                title: "Success",
                description: "About Content has been updated successfully.",
                status: "success",
                duration: 1500,
            });
        } catch (err) {
            status = "Error";
            console.log(err);
        } finally {
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Update",
                    status,
                    page: "About",
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
        }
    };

    const deleteCertification = async (url) => {
        try {
            let res = await axios.post(
                "/api/admin/certifications",
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

    return (
        <Box p={4}>
            <Text
                fontWeight={"bold"}
                m={0}
                color={"#031579"}
                mb={2}
                cursor={"pointer"}
                onClick={() => about.current?.focus()}
            >
                About Us
                <Text fontSize={"sm"} display={"inline-block"} m={0} ml={1}>
                    <BsFillPencilFill />
                </Text>
            </Text>
            <SkeletonText mb={"2"} noOfLines={5} spacing="4" isLoaded={data}>
                {data && (
                    <Textarea
                        rows="5"
                        value={aboutData}
                        onChange={(e) => setAboutData(e.target.value)}
                        bg={"white"}
                        focusBorderColor={"#031579"}
                        ref={about}
                    />
                )}
            </SkeletonText>
            <Text
                fontWeight={"bold"}
                m={0}
                color={"#031579"}
                mb={2}
                cursor={"pointer"}
                onClick={() => mission.current?.focus()}
            >
                Mission
                <Text fontSize={"sm"} display={"inline-block"} m={0} ml={1}>
                    <BsFillPencilFill />
                </Text>
            </Text>
            <SkeletonText mb={"2"} noOfLines={5} spacing="4" isLoaded={data}>
                {data && (
                    <Textarea
                        rows="5"
                        value={missionData}
                        onChange={(e) => setMissionData(e.target.value)}
                        bg={"white"}
                        focusBorderColor={"#031579"}
                        ref={mission}
                    />
                )}
            </SkeletonText>
            <Text
                fontWeight={"bold"}
                m={0}
                color={"#031579"}
                mb={2}
                cursor={"pointer"}
                onClick={() => vision.current?.focus()}
            >
                Vision
                <Text fontSize={"sm"} display={"inline-block"} m={0} ml={1}>
                    <BsFillPencilFill />
                </Text>
            </Text>
            <SkeletonText mb={"2"} noOfLines={5} spacing="4" isLoaded={data}>
                {data && (
                    <Textarea
                        rows="5"
                        value={visionData}
                        onChange={(e) => setVisionData(e.target.value)}
                        bg={"white"}
                        focusBorderColor={"#031579"}
                        ref={vision}
                    />
                )}
            </SkeletonText>
            <Text fontWeight={"bold"} m={0}>
                Certifications
            </Text>
            <SkeletonText mb={"2"} noOfLines={5} spacing="4" isLoaded={data}>
                {data && (
                    <Scrollbars autoHeight>
                        {certifications.map((val, i) => (
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
                                    bgImage={`url(${val})`}
                                ></Box>
                                <Flex
                                    justifyContent={"space-between"}
                                    px={4}
                                    flex={1}
                                >
                                    <Text as={"a"} href={val} target={"_blank"}>
                                        View
                                    </Text>
                                    <ActionButton
                                        icon={BsTrashFill}
                                        color={"red"}
                                        tooltip={"Delete Work"}
                                        placement={"top-start"}
                                        onClick={() => deleteCertification(val)}
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
                    border={"none"}
                    outline={"none"}
                    color={"white"}
                    bg={"#031579"}
                    onClick={() => setShowAddCertificationModal(true)}
                >
                    Add Certification
                </Button>
                <Button
                    flex={[1, "initial"]}
                    border={"none"}
                    outline={"none"}
                    color={"white"}
                    bg={"green.500"}
                    onClick={save}
                    ml={2}
                >
                    {saving ? <Spinner /> : "Save About"}
                </Button>
            </Flex>
            <AnimatePresence>
                {showAddCertificationModal && (
                    <BaseModal>
                        <CertificationModal
                            close={() => setShowAddCertificationModal(false)}
                            reload={reload}
                            toast={toast}
                            csrfToken={csrfToken}
                        />
                    </BaseModal>
                )}
            </AnimatePresence>
        </Box>
    );
}
