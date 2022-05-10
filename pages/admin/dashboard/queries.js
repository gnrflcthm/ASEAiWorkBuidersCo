import AdminHeader from "@/components/adminHeader";
import cookie from "cookie";
import { useState, useEffect } from "react";

import useAdmin from "@/lib/useAdmin";
import LoadingOverlay from "@/components/loadingOverlay";
import { BsFillTrashFill, BsFillCheckCircleFill } from "react-icons/bs";
import PromptModal from "@/components/prompt";

import { AnimatePresence } from "framer-motion";

import {
    useToast,
    Box,
    Flex,
    VStack,
    Heading,
    Text,
    Button,
    Input,
    Spinner,
} from "@chakra-ui/react";

import "firebase.config";
import {
    getFirestore,
    collection,
    query,
    getDocs,
    doc,
    deleteDoc,
    where,
    orderBy,
    limit,
    updateDoc,
} from "firebase/firestore";

import { Scrollbars } from "react-custom-scrollbars-2";
import BaseModal from "@/components/baseModal";
import axios from "axios";

async function getQueries() {
    let data = [];
    let db = getFirestore();
    let queryRef = collection(db, "queries");
    let q = query(queryRef, orderBy("dateAdded", "asc"));
    let querySnaphot = await getDocs(q);
    querySnaphot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
    });
    return data;
}

async function getFieldNames() {
    let db = getFirestore();
    let queryRef = collection(db, "queries");
    let q = query(queryRef, limit(1));
    let fieldNames = [];
    let dataDoc;
    let querySnaphot = await getDocs(q);
    querySnaphot.forEach((doc) => {
        dataDoc = doc.data();
    });

    if (dataDoc) {
        Object.keys(dataDoc).forEach(function (key) {
            fieldNames.push(key);
        });
    }
    return fieldNames;
}

const QueryDetailsModal = ({ query, close }) => {
    return (
        <Flex
            bg={"white"}
            borderRadius={["none", "md"]}
            p={4}
            w={["full", "50vw"]}
            maxH={["70vh", "60vh"]}
            flexDir={"column"}
            justifyContent={"space-around"}
        >
            <Text
                color={"blackAlpha.700"}
                fontWeight={"semibold"}
                fontSize={["xs", "sm"]}
            >
                From: {query.name}
            </Text>
            <Text
                color={"blackAlpha.700"}
                fontWeight={"semibold"}
                fontSize={["xs", "sm"]}
            >
                Contact: {query.mobile}
            </Text>
            {query.email && (
                <Text
                    color={"blackAlpha.700"}
                    fontWeight={"semibold"}
                    fontSize={["xs", "sm"]}
                >
                    Contact: {query.email}
                </Text>
            )}
            <Scrollbars autoHeight>
                <Text
                    fontWeight={"semibold"}
                    fontSize={["sm", "md"]}
                    w={"full"}
                >
                    {query.message}
                </Text>
            </Scrollbars>
            <Text
                color={"blackAlpha.700"}
                fontWeight={"semibold"}
                fontSize={["xs", "sm"]}
            >
                Sent At: {query.dateAdded.toDate().toUTCString()}
            </Text>
            <Button
                w={"full"}
                color={"white"}
                onClick={close}
                bg={"#031579"}
                py={2}
                border={"none"}
                outline={"none"}
                _hover={{ bg: "#49E3EF", color: "black" }}
            >
                Close
            </Button>
        </Flex>
    );
};

export default function Queries({ csrfToken, sessionCookie }) {
    const [admin, loading, error] = useAdmin(csrfToken, sessionCookie);
    const [queryData, setQueryData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [field, setFieldNames] = useState([]);
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [deleteItem, setDeleteItem] = useState("");
    const [currentQuery, setCurrentQuery] = useState({});
    const [showQueryDetails, setShowQueryDetails] = useState(false);
    const [exporting, setExporting] = useState(false);

    const toast = useToast();

    useEffect(async () => {
        setQueryData(await getQueries());
        setFieldNames(await getFieldNames());
    }, []);

    const reload = async () => {
        setQueryData(await getQueries());
    };

    const setAnswered = async (id) => {
        let status = "Success";
        try {
            let db = getFirestore();
            let docRef = doc(db, "queries", id);
            await updateDoc(docRef, {
                status: "answered",
            });
            toast({
                title: "Successfully Updated Query",
                status: "success",
                duration: 1200,
            });
            reload();
        } catch (err) {
            (status = "Error"), console.log(err);
        } finally {
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Update",
                    status,
                    page: "Queries",
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
        }
    };

    const searchQuery = async (value) => {
        /* to improve:
        1. IGNORE-Case sens
        2. Search that doeasn't rely on start->end
        3. Search Date by date (tinatry ko maghanap now)
        */
        let data = [];
        let db = getFirestore();

        for (let i = 0; i < field.length; i++) {
            //Loop all fieldNames
            let q = query(
                collection(db, "queries"),
                where(field[i], ">=", value),
                where(field[i], "<=", value + "\uf8ff"),
                orderBy(field[i])
            );
            let querySnaphot = await getDocs(q);
            querySnaphot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() }); //push all results
            });
        }

        if (value.trim().length === 0) {
            reload();
        } else {
            setQueryData(data);
            if (data.length === 0) {
                toast({
                    title: "No results found",
                    description: "",
                    duration: 1200,
                });
            }
        }
        return data; //Option lang getting the data
    };

    const deleteQuery = async (id) => {
        let status = "Success";
        try {
            let db = getFirestore();
            await deleteDoc(doc(db, "queries", id));
            toast({
                title: "Success",
                description: "Deleted query successfully",
                duration: 1200,
            });
            reload();
        } catch (err) {
            console.log(err);
            status = "Error";
        } finally {
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Delete",
                    status,
                    page: "Queries",
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
            setShowDeletePrompt(false);
        }
    };

    const viewQuery = (query) => {
        setCurrentQuery(query);
        setShowQueryDetails(true);
    };

    if (error) console.log(error);

    const exportData = () => {
        setExporting(true);
        try {
            console.log(exporting);
            axios({
                url: "/api/admin/reports",
                method: "POST",
                data: {
                    report: "queries",
                },
                responseType: "blob",
                headers: {
                    "XSRF-Token": csrfToken,
                },
            }).then((res) => {
                let filename = res.headers["content-disposition"]
                    .split(";")[1]
                    .split("=")[1]
                    .trim();
                let url = window.URL.createObjectURL(new Blob([res.data]));
                let link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                setExporting(false);
            });
        } catch (err) {
            console.log(err);
        }
    };

    if (admin) {
        return (
            <Box minH={"100vh"} bg={"#DDD"}>
                <AdminHeader admin={admin} csrfToken={csrfToken} />
                <Flex
                    flexDir={"column"}
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
                        Queries
                    </Heading>
                    <Flex
                        mt={"4"}
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
                            mr={4}
                            _hover={{ bg: "#49E3EF", color: "black" }}
                            onClick={() => exportData()}
                            disabled={exporting}
                        >
                            <Flex
                                justifyContent={"space-between"}
                                alignItems={"center"}
                            >
                                <Text display={"block"} m={0}>
                                    {exporting
                                        ? "Generating Report"
                                        : "Download Data"}
                                </Text>
                                {exporting && (
                                    <Spinner display={"block"} ml={2} />
                                )}
                            </Flex>
                        </Button>
                        <Box
                            display={"flex"}
                            justifyContent={"center"}
                            alignItems={"center"}
                            alignSelf={"end"}
                        >
                            <Input
                                type="text"
                                placeholder="Search Here"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                bg={"white"}
                                borderRadius={"md"}
                                borderRightRadius={["md", "none"]}
                            />
                            <Button
                                onClick={() => searchQuery(searchText)}
                                display={["none", "block"]}
                                borderRadius={"md"}
                                borderLeftRadius={"none"}
                                textAlign={"center"}
                                border={"transparent"}
                                outline={"none"}
                                minW={"unset"}
                                bg={"#031579"}
                                color={"white"}
                                _hover={{ bg: "#49E3EF", color: "black" }}
                            >
                                Search
                            </Button>
                        </Box>
                    </Flex>
                </Flex>
                <Box px={[0, 10]}>
                    <Scrollbars style={{ height: "68vh" }}>
                        <VStack w={"full"} my={2}>
                            {queryData.map((query) => (
                                <Flex
                                    justifyContent={"space-between"}
                                    alignItems={"center"}
                                    bg={"white"}
                                    w={"full"}
                                    px={5}
                                    py={"2"}
                                    borderRadius={["none", "md"]}
                                    key={query.id}
                                    onClick={() => viewQuery(query)}
                                    cursor={"pointer"}
                                    _hover={{ bg: "gray.100" }}
                                >
                                    <VStack alignItems={"start"} spacing={1}>
                                        <Text
                                            m={0}
                                            color={"blackAlpha.700"}
                                            fontWeight={"semibold"}
                                            textOverflow={"ellipsis"}
                                            overflow={"hidden"}
                                            whiteSpace={"nowrap"}
                                            maxH={"md"}
                                            maxW={"60vw"}
                                            fontSize={["xs", "sm"]}
                                        >
                                            From: {query.name} ({query.mobile})
                                        </Text>
                                        <Text
                                            fontWeight={"semibold"}
                                            textOverflow={"ellipsis"}
                                            overflow={"hidden"}
                                            whiteSpace={"nowrap"}
                                            maxH={"md"}
                                            maxW={"60vw"}
                                            fontSize={["sm", "md"]}
                                        >
                                            {query.message}
                                        </Text>
                                        <Text
                                            color={"blackAlpha.700"}
                                            fontWeight={"semibold"}
                                            fontSize={["xs", "sm"]}
                                        >
                                            Sent At:{" "}
                                            {query.dateAdded
                                                .toDate()
                                                .toUTCString()}
                                        </Text>
                                        <Text
                                            color={
                                                query.status === "answered"
                                                    ? "green.500"
                                                    : "red.500"
                                            }
                                            fontSize={["xs", "sm"]}
                                            fontWeight={"bold"}
                                        >
                                            {query.status}
                                        </Text>
                                    </VStack>
                                    <Flex>
                                        {query.status === "unanswered" && (
                                            <Button
                                                color={"green.500"}
                                                border={"none"}
                                                bg={"transparent"}
                                                outline={"none"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAnswered(query.id);
                                                }}
                                            >
                                                <BsFillCheckCircleFill />
                                            </Button>
                                        )}
                                        <Button
                                            color={"red.500"}
                                            border={"none"}
                                            bg={"transparent"}
                                            outline={"none"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteQuery(query.id);
                                            }}
                                        >
                                            <BsFillTrashFill />
                                        </Button>
                                    </Flex>
                                </Flex>
                            ))}
                        </VStack>
                        {/* status, actions, email */}
                    </Scrollbars>
                </Box>
                <AnimatePresence>
                    {(showDeletePrompt || showQueryDetails) && (
                        <BaseModal>
                            {showDeletePrompt && !showQueryDetails && (
                                <PromptModal
                                    prompt={"Are You Sure You Want To Proceed"}
                                    acceptText={"Return"}
                                    rejectText={"Delete"}
                                    onAccept={() => setShowDeletePrompt(false)}
                                    onReject={() => {
                                        deleteQuery(deleteItem);
                                        setDeleteItem("");
                                    }}
                                />
                            )}
                            {showQueryDetails && !showDeletePrompt && (
                                <QueryDetailsModal
                                    query={currentQuery}
                                    close={() => {
                                        setCurrentQuery({});
                                        setShowQueryDetails(false);
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
