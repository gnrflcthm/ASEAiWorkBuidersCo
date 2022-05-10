import { useState, useEffect } from "react";

import cookie from "cookie";
import axios from "axios";

import useAdmin from "@/lib/useAdmin";

import LoadingOverlay from "@/components/loadingOverlay";
import AdminHeader from "@/components/adminHeader";

import {
    useToast,
    Box,
    Flex,
    Heading,
    Text,
    Button,
    VStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Spinner,
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
    endAt,
    limitToLast,
    where,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

import {
    BsCaretLeftFill,
    BsCaretRightFill,
    BsFillTrashFill,
    BsFillCheckCircleFill,
} from "react-icons/bs";

import { FaEllipsisV } from "react-icons/fa";

import { Scrollbars } from "react-custom-scrollbars-2";

export default function Appointments({ csrfToken, sessionCookie }) {
    const [admin, loading, error] = useAdmin(csrfToken, sessionCookie);
    const [appointmentData, setAppointmentData] = useState([]);
    const [statusMode, setStatusMode] = useState("pending");
    const [exporting, setExporting] = useState(false);
    const toast = useToast();
    const pageSize = 10;

    useEffect(async () => {
        await loadCurrentAppointments();
    }, []);

    const loadCurrentAppointments = async () => {
        setStatusMode("pending");
        let db = getFirestore();
        let q = query(
            collection(db, "appointments"),
            where("status", "==", "pending"),
            orderBy("appointmentDate", "asc"),
            orderBy("appointmentTime", "asc"),
            limit(pageSize)
        );
        let documents = await getDocs(q);
        setAppointmentData(documents);
    };

    const loadFinishedAppointments = async () => {
        setStatusMode("completed");
        let db = getFirestore();
        let q = query(
            collection(db, "appointments"),
            where("status", "==", "completed"),
            orderBy("appointmentDate", "desc"),
            orderBy("appointmentTime", "desc"),
            limit(pageSize)
        );
        let documents = await getDocs(q);
        setAppointmentData(documents);
    };

    const nextPage = async () => {
        let db = getFirestore();
        let q = query(
            collection(db, "appointments"),
            where("status", "==", statusMode),
            orderBy("appointmentDate", "asc"),
            orderBy("appointmentTime", "asc"),
            startAfter(appointmentData.docs[appointmentData.docs.length - 1]),
            limit(pageSize)
        );
        let documents = await getDocs(q);
        if (documents.docs.length === 0) {
            return;
        }
        setAppointmentData(documents);
    };

    const prevPage = async () => {
        let db = getFirestore();
        let q = query(
            collection(db, "appointments"),
            where("status", "==", statusMode),
            orderBy("appointmentDate", "asc"),
            orderBy("appointmentTime", "asc"),
            endAt(appointmentData.docs[0]),
            limitToLast(pageSize)
        );
        let documents = await getDocs(q);
        if (documents.docs.length === 0) {
            return;
        }
        setAppointmentData(documents);
    };

    const handleLoadData = () => {
        if (statusMode === "pending") {
            loadFinishedAppointments();
        } else {
            loadCurrentAppointments();
        }
    };

    const completeAppointment = async (id) => {
        let status = "Success";
        try {
            let db = getFirestore();
            let docRef = doc(db, "appointments", id);
            await updateDoc(docRef, {
                status: "completed",
            });
            toast({
                title: "Success",
                description: "Successfully completed an appointment.",
                status: "success",
                duration: 1500,
            });
            loadCurrentAppointments();
        } catch (err) {
            console.log(err);
            status = "Error";
            toast({
                title: "An Error Has Occured",
                status: "error",
                duration: 1500,
            });
        } finally {
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Update",
                    status,
                    page: "Appointments",
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
        }
    };

    const deleteAppointment = async (id) => {
        let status = "Success";
        try {
            let db = getFirestore();
            let docRef = doc(db, "appointments", id);
            await deleteDoc(docRef);
            toast({
                title: "Success",
                description: "Successfully deleted an appointment.",
                status: "success",
                duration: 1500,
            });
            loadCurrentAppointments();
        } catch (err) {
            console.log(err);
            status = "Error";
            toast({
                title: "An Error Has Occured",
                status: "error",
                duration: 1500,
            });
        } finally {
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Delete",
                    status,
                    page: "Appointments",
                },
                {
                    headers: {
                        "XSRF-Token": csrfToken,
                    },
                }
            );
        }
    };

    const exportData = () => {
        setExporting(true);
        try {
            axios({
                url: "/api/admin/reports",
                method: "POST",
                data: {
                    report: "appointments",
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
                        {statusMode === "pending"
                            ? "Current Appointments"
                            : "Finished Appointments"}
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
                            mr={2}
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
                        <Button
                            px={2}
                            py={1}
                            bg={"#031579"}
                            outline={"none"}
                            border={"none"}
                            color={"white"}
                            _hover={{ bg: "#49E3EF", color: "black" }}
                            onClick={handleLoadData}
                        >
                            {statusMode === "pending"
                                ? "Finished Appointments"
                                : "Current Appointments"}
                        </Button>
                    </Flex>
                </Flex>
                <Box px={[0, 10]}>
                    <Scrollbars style={{ height: "68vh" }}>
                        <VStack w={"full"} my={2}>
                            {appointmentData &&
                                appointmentData.docs
                                    .map((val) => ({
                                        ...val.data(),
                                        id: val.id,
                                    }))
                                    .map((appointment) => (
                                        <Flex
                                            justifyContent={"space-between"}
                                            alignItems={"center"}
                                            bg={"white"}
                                            w={"full"}
                                            px={5}
                                            py={"2"}
                                            borderRadius={["none", "md"]}
                                            key={appointment.id}
                                        >
                                            <VStack
                                                textAlign={"left"}
                                                flex={3}
                                                alignItems={"start"}
                                            >
                                                <Heading
                                                    as="h1"
                                                    color={"black"}
                                                    fontSize={["lg", "xl"]}
                                                    m={0}
                                                    fontWeight={"semibold"}
                                                >
                                                    {`${appointment.firstName} ${appointment.lastName}`}
                                                </Heading>
                                                <Text
                                                    fontSize={["sm", "md"]}
                                                    color={"blackAlpha.700"}
                                                >
                                                    {appointment.contact}
                                                </Text>
                                                {appointment.email.trim() !==
                                                    "" && (
                                                    <Text
                                                        fontSize={["sm", "md"]}
                                                        color={"blackAlpha.700"}
                                                    >
                                                        {appointment.email}
                                                    </Text>
                                                )}
                                            </VStack>
                                            <Flex
                                                textAlign={"right"}
                                                flex={2}
                                                alignItems={"end"}
                                                justifyContent={"center"}
                                                mr={[2, 5]}
                                                flexDir={"column"}
                                            >
                                                <Text
                                                    m={0}
                                                    fontSize={["sm", "md"]}
                                                    fontWeight={"semibold"}
                                                >
                                                    {
                                                        appointment.appointmentDate
                                                    }
                                                </Text>
                                                <Text
                                                    m={0}
                                                    fontSize={["sm", "md"]}
                                                    fontWeight={"semibold"}
                                                >
                                                    {
                                                        appointment.appointmentTime
                                                    }
                                                </Text>
                                            </Flex>
                                            <Flex justifyContent={"end"}>
                                                <Menu>
                                                    <MenuButton
                                                        bg={"none"}
                                                        border={"none"}
                                                        verticalAlign={"super"}
                                                    >
                                                        <FaEllipsisV />
                                                    </MenuButton>
                                                    <MenuList shadow={"md"}>
                                                        {appointment.status ===
                                                            "pending" && (
                                                            <MenuItem
                                                                display={"flex"}
                                                                justifyContent={
                                                                    "space-between"
                                                                }
                                                                border={"none"}
                                                                bg={"white"}
                                                                color={
                                                                    "green.500"
                                                                }
                                                                onClick={() =>
                                                                    completeAppointment(
                                                                        appointment.id
                                                                    )
                                                                }
                                                            >
                                                                Complete
                                                                Appointment
                                                                <BsFillCheckCircleFill />
                                                            </MenuItem>
                                                        )}

                                                        <MenuItem
                                                            display={"flex"}
                                                            justifyContent={
                                                                "space-between"
                                                            }
                                                            border={"none"}
                                                            bg={"white"}
                                                            color={"red.500"}
                                                            onClick={() =>
                                                                deleteAppointment(
                                                                    appointment.id
                                                                )
                                                            }
                                                        >
                                                            Delete Appointment
                                                            <BsFillTrashFill />
                                                        </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Flex>
                                        </Flex>
                                    ))}
                        </VStack>
                    </Scrollbars>
                </Box>
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
