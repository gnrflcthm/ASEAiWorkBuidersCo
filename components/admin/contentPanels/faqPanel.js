import { useState, useEffect } from "react";

import axios from "axios";

import "firebase.config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import fetchDataContentFrom from "./fetchDataContentFrom";

import styles from "@/styles/adminDashboardBase.module.css";

import ActionButton from "@/components/actionButton";
import BaseModal from "@/components/baseModal";

import { BsTrashFill } from "react-icons/bs";
import { GrClose } from "react-icons/gr";

import {
    SkeletonText,
    Box,
    Flex,
    Text,
    Button,
    Spinner,
} from "@chakra-ui/react";

import { Scrollbars } from "react-custom-scrollbars-2";

import { AnimatePresence, motion, Reorder } from "framer-motion";

function FAQModal({ addFAQ, close }) {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [type, setType] = useState("Construction");

    const submit = (e) => {
        e.preventDefault();
        addFAQ({ query, answer, type });
        close();
    };

    return (
        <div className={`p-4 col-10 col-md-5 ${styles.modalContainer}`}>
            <div className={`${styles.modalHeader}`}>
                <Text m={"0"} fontWeight={"bold"}>
                    Add FAQ
                </Text>
                <GrClose className={`${styles.closeModal}`} onClick={close} />
            </div>
            <div className={`${styles.modalBody}`}>
                <form onSubmit={submit}>
                    <div className={`my-2`}>
                        <Text m={"0"} fontWeight={"bold"}>
                            Question
                        </Text>
                        <input
                            type={"text"}
                            className={`form-control`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter question"
                            required
                        />
                    </div>
                    <div className={`my-2`}>
                        <Text m={"0"} fontWeight={"bold"}>
                            Answer
                        </Text>
                        <input
                            type={"text"}
                            className={`form-control`}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter answer for the question"
                            required
                        />
                    </div>
                    <div className={`my-2`}>
                        <Text m={"0"} fontWeight={"bold"}>
                            Type
                        </Text>
                        <select
                            className={`form-control`}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="Construction">Construction</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>
                    <button
                        className={`btn btn-primary w-100 mt-2`}
                        type={"submit"}
                    >
                        Add FAQ
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function FAQPanel({ toast, csrfToken }) {
    const [data, loading, error] = fetchDataContentFrom("faqs");
    const [serviceQuestions, setServiceQuestions] = useState([]);
    const [constructionQuestions, setConstructionQuestions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [showFAQModal, setShowFAQModal] = useState(false);

    useEffect(() => {
        if (data) {
            setServiceQuestions(
                data.serviceQuestions.map((val, i) => ({ ...val, id: i }))
            );
            setConstructionQuestions(
                data.constructionQuestions.map((val, i) => ({ ...val, id: i }))
            );
        }
    }, [data]);

    const addFAQ = (val) => {
        let faq = { query: val.query, answer: val.answer };
        if (val.type === "Construction") {
            setConstructionQuestions((val) => [
                ...val,
                { ...faq, id: Math.max(...val.map((_, i) => i)) + 1 },
            ]);
        } else if (val.type === "Service") {
            setServiceQuestions((val) => [
                ...val,
                { ...faq, id: Math.max(...val.map((_, i) => i)) + 1 },
            ]);
        }
    };

    const deleteConstructionQuestion = (index) => {
        setConstructionQuestions((val) => val.filter((_, i) => index !== i));
    };
    const deleteServiceQuestion = (index) => {
        setServiceQuestions((val) => val.filter((_, i) => index !== i));
    };

    const save = async () => {
        setSaving(true);
        let status = "Success";
        let db = getFirestore();
        let document = doc(db, "dataContent", "faqs");
        try {
            await updateDoc(document, {
                constructionQuestions: constructionQuestions.map((val) => ({
                    query: val.query,
                    answer: val.answer,
                })),
                serviceQuestions: serviceQuestions.map((val) => ({
                    query: val.query,
                    answer: val.answer,
                })),
            });
            toast({
                title: "Success",
                description: "FAQs has been updated successfully",
                status: "success",
                duration: 1500,
            });
        } catch (err) {
            console.log(err);
            status = "Error";
        } finally {
            setSaving(false);
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Update",
                    status,
                    page: "FAQs",
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
        }
    };

    return (
        <Box h={"full"} p={4}>
            <motion.div layoutScroll className={`${styles.tabPanel}`}>
                <Text m={"0"} fontWeight={"bold"}>
                    Construction Questions
                </Text>
                <SkeletonText
                    mb={"2"}
                    noOfLines={5}
                    spacing="4"
                    isLoaded={data}
                    overflowY={"auto"}
                    w={"full"}
                    bg={"white"}
                    px={2}
                    borderRadius={"md"}
                >
                    <Scrollbars style={{ height: "30vh" }}>
                        {data && (
                            <Reorder.Group
                                values={constructionQuestions}
                                onReorder={setConstructionQuestions}
                                key={constructionQuestions}
                            >
                                {constructionQuestions.map((val, i) => (
                                    <Reorder.Item key={val.id} value={val}>
                                        <Flex
                                            justifyContent={"space-between"}
                                            alignItems={"center"}
                                            px={"3"}
                                            my={"2"}
                                            py={"2"}
                                            borderRadius={"md"}
                                            bg={"white"}
                                            border={"1px"}
                                            borderColor={"gray.300"}
                                        >
                                            <Flex flexDir={"column"} flex={"1"}>
                                                <Text m={0} fontWeight={"bold"}>
                                                    {val.query}
                                                </Text>
                                                <Text m={0}>{val.answer}</Text>
                                            </Flex>
                                            <ActionButton
                                                icon={BsTrashFill}
                                                color={"red"}
                                                tooltip={"Delete Question"}
                                                placement={"top-start"}
                                                onClick={() =>
                                                    deleteConstructionQuestion(
                                                        i
                                                    )
                                                }
                                            />
                                        </Flex>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        )}
                    </Scrollbars>
                </SkeletonText>
                <Text m={"0"} fontWeight={"bold"}>
                    Service Questions
                </Text>
                <SkeletonText
                    mb={"2"}
                    noOfLines={5}
                    spacing="4"
                    isLoaded={data}
                    overflowY={"auto"}
                    w={"full"}
                    bg={"white"}
                    px={2}
                    borderRadius={"md"}
                >
                    <Scrollbars style={{ height: "30vh" }}>
                        {data && serviceQuestions && (
                            <Reorder.Group
                                values={serviceQuestions}
                                onReorder={setServiceQuestions}
                                key={serviceQuestions}
                            >
                                {serviceQuestions.map((val, i) => (
                                    <Reorder.Item key={val.id} value={val}>
                                        <Flex
                                            justifyContent={"space-between"}
                                            alignItems={"center"}
                                            pl={"3"}
                                            my={"2"}
                                            py={"2"}
                                            pr={"4"}
                                            borderRadius={"md"}
                                            bg={"white"}
                                            border={"1px"}
                                            borderColor={"gray.300"}
                                        >
                                            <Flex flexDir={"column"} flex={"1"}>
                                                <Text m={0} fontWeight={"bold"}>
                                                    {val.query}
                                                </Text>
                                                <Text m={0}>{val.answer}</Text>
                                            </Flex>
                                            <ActionButton
                                                icon={BsTrashFill}
                                                color={"red"}
                                                tooltip={"Delete Question"}
                                                placement={"top-start"}
                                                onClick={() =>
                                                    deleteServiceQuestion   (
                                                        i
                                                    )
                                                }
                                            />
                                        </Flex>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        )}
                    </Scrollbars>
                </SkeletonText>
            </motion.div>
            <Flex justifyContent={"end"} my={2}>
                <Button
                    flex={[1, "initial"]}
                    bg={"#031579"}
                    color={"white"}
                    border={"none"}
                    outline={"none"}
                    onClick={() => setShowFAQModal(true)}
                    _hover={{ bg: "white", color: "black" }}
                >
                    Add FAQ
                </Button>
                <Button
                    flex={[1, "initial"]}
                    bg={"green.500"}
                    color={"white"}
                    border={"none"}
                    outline={"none"}
                    ml={2}
                    disabled={saving}
                    onClick={save}
                    _hover={{ bg: "white", color: "black" }}
                >
                    {saving ? <Spinner /> : "Save"}
                </Button>
            </Flex>
            <AnimatePresence>
                {showFAQModal && (
                    <BaseModal>
                        <FAQModal
                            addFAQ={(val) => addFAQ(val)}
                            close={() => setShowFAQModal(false)}
                        />
                    </BaseModal>
                )}
            </AnimatePresence>
        </Box>
    );
}
