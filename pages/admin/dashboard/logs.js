import { useState, useEffect } from "react";

import cookie from "cookie";

import useAdmin from "@/lib/useAdmin";

import LoadingOverlay from "@/components/loadingOverlay";
import AdminHeader from "@/components/adminHeader";

import {
    useToast,
    Heading,
    VStack,
    Box,
    Flex,
    Text,
    Button,
    Skeleton,
} from "@chakra-ui/react";

import "firebase.config";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    limit,
    startAfter,
    orderBy,
    doc,
    limitToLast,
    endAt,
    getDoc,
} from "firebase/firestore";

import { BsCaretLeftFill, BsCaretRightFill } from "react-icons/bs";

import { Scrollbars } from "react-custom-scrollbars-2";
import { AnimatePresence } from "framer-motion";
import BaseModal from "@/components/baseModal";

const fetchUser = async (userID) => {
    const db = getFirestore();
    const d = await getDoc(doc(db, "admin", userID));
    return d.data();
};

const LogDetailsModal = ({ log, close }) => {
    const [user, setUser] = useState(null);
    useEffect(async () => {
        setUser(await fetchUser(log.adminId));
    });
    return (
        <Flex
            borderRadius={["none", "md"]}
            bg={"white"}
            w={["full", "50vw"]}
            p={4}
            position={"relative"}
            flexDir={"column"}
        >
            <Heading
                as={"h1"}
                fontSize={"lg"}
                textAlign={"center"}
                color={"black"}
                w={"full"}
            >
                {log.action}
            </Heading>
            <Text m={0} fontWeight={"medium"}>
                Performed By:
            </Text>
            <Skeleton isLoaded={user} mb={2}>
                {user && (
                    <Text m={0}>{`${user.lastName},  ${user.firstName}`}</Text>
                )}
            </Skeleton>
            <Text m={0} fontWeight={"medium"}>
                Performed On:
            </Text>
            <Text m={0} mb={2}>
                {log.date.toDate().toUTCString()}
            </Text>
            <Text m={0} fontWeight={"medium"}>
                Status:
            </Text>
            <Text m={0} mb={2}>
                {log.status}
            </Text>
            <Button
                w={"full"}
                borderRadius={"md"}
                bg={"#031579"}
                onClick={close}
                color={"white"}
                border={"none"}
                outline={"none"}
                _hover={{ bg: "#49e3ef", color: "black" }}
            >
                Close
            </Button>
        </Flex>
    );
};

export default function AuditLogs({ csrfToken, sessionCookie }) {
    const [admin, loading, error] = useAdmin(csrfToken, sessionCookie);
    const [logs, setLogs] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState({});

    const toast = useToast();
    const pageSize = 10;

    useEffect(async () => {
        let db = getFirestore();
        let q = query(
            collection(db, "auditLogs"),
            orderBy("date", "desc"),
            limit(pageSize)
        );
        let documents = await getDocs(q);
        setLogs(documents);
    }, []);

    const nextPage = async () => {
        let db = getFirestore();
        let q = query(
            collection(db, "auditLogs"),
            orderBy("date", "desc"),
            startAfter(logs.docs[logs.docs.length - 1]),
            limit(pageSize)
        );
        let documents = await getDocs(q);
        if (documents.docs.length === 0) {
            return;
        }
        setLogs(documents);
    };

    const prevPage = async () => {
        let db = getFirestore();
        let q = query(
            collection(db, "auditLogs"),
            orderBy("date", "desc"),
            endAt(logs.docs[0]),
            limitToLast(pageSize)
        );
        let documents = await getDocs(q);
        if (documents.docs.length === 0) {
            return;
        }
        setLogs(documents);
    };

    const showDetails = (log) => {
        setSelectedLog(log);
        setShowDetailsModal(true);
    };

    if (admin) {
        return (
            <Box minH={"100vh"} bg={"#DDD"}>
                <AdminHeader admin={admin} csrfToken={csrfToken} />
                <Heading
                    as="h1"
                    fontSize={["xl", "2xl"]}
                    flex={2}
                    color={"black"}
                    my={4}
                    textAlign={"center"}
                >
                    Audit Logs
                </Heading>
                <Box px={[0, 10]}>
                    <Scrollbars style={{ height: "68vh" }}>
                        <VStack w={"full"}>
                            {logs &&
                                logs.docs
                                    .map((val) => ({
                                        ...val.data(),
                                        id: val.id,
                                    }))
                                    .map((log) => (
                                        <Flex
                                            w={"full"}
                                            bg={"white"}
                                            justifyContent={"space-between"}
                                            alignItems={"center"}
                                            key={"id"}
                                            px={2}
                                            py={1}
                                            borderRadius={"md"}
                                            onClick={() => showDetails(log)}
                                            cursor={"pointer"}
                                            _hover={{ bg: "gray.100" }}
                                        >
                                            <VStack
                                                color={"black"}
                                                justifyContent={"center"}
                                                alignItems={"start"}
                                                spacing={1}
                                            >
                                                <Heading
                                                    as={"h1"}
                                                    m={0}
                                                    fontSize={["md", "lg"]}
                                                >
                                                    {log.action}
                                                </Heading>
                                                <Text
                                                    fontWeight={"normal"}
                                                    fontSize={["sm", "md"]}
                                                    mt={"0px"}
                                                >
                                                    {log.date
                                                        .toDate()
                                                        .toUTCString()}
                                                </Text>
                                            </VStack>
                                            <Text
                                                m={0}
                                                color={`${
                                                    log.status.toLowerCase() ===
                                                    "success"
                                                        ? "green.500"
                                                        : "red.500"
                                                }`}
                                            >
                                                {log.status}
                                            </Text>
                                        </Flex>
                                    ))}
                        </VStack>
                    </Scrollbars>
                    <Flex justifyContent={"center"} py={3}>
                        <Button
                            onClick={() => prevPage()}
                            bg={"transparent"}
                            border={"none"}
                            outline={"none"}
                            _hover={{ color: "#031579" }}
                        >
                            <BsCaretLeftFill />
                            Previous Page
                        </Button>
                        <Button
                            onClick={() => nextPage()}
                            bg={"transparent"}
                            border={"none"}
                            outline={"none"}
                            _hover={{ color: "#031579" }}
                        >
                            Next Page
                            <BsCaretRightFill />
                        </Button>
                    </Flex>
                </Box>
                <AnimatePresence>
                    {showDetailsModal && (
                        <BaseModal>
                            <LogDetailsModal
                                log={selectedLog}
                                close={() => {
                                    setShowDetailsModal(false);
                                    setSelectedLog({});
                                }}
                            />
                        </BaseModal>
                    )}
                </AnimatePresence>
            </Box>
        );
    } else {
        return <LoadingOverlay />;
    }
}

export function getServerSideProps({ req }) {
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
