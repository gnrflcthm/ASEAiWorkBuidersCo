import { useEffect, useState } from "react";

import {
    Box,
    Text,
    Flex,
    Input,
    Button,
    IconButton,
    Spinner,
    Heading,
    useToast,
} from "@chakra-ui/react";

import { GrClose } from "react-icons/gr";

import "firebase.config";
import { signInWithPhoneNumber, getAuth } from "firebase/auth";
import {
    getFirestore,
    getDocs,
    query,
    collection,
    where,
    deleteDoc,
    doc,
} from "firebase/firestore";

const CancelAppointmentModal = ({
    status,
    onPhoneSubmit,
    close,
    verifiedPhone,
}) => {
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState("");
    const [appointments, setAppointments] = useState([]);
    const [currentCancel, setCurrentCancel] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const toast = useToast();

    const submitPhone = async () => {
        setLoading(true);
        try {
            let auth = getAuth();
            let confirmationResult = await signInWithPhoneNumber(
                auth,
                `+63${phone}`,
                window.recaptchaVerifier
            );
            window.confirmationResult = confirmationResult;
            onPhoneSubmit(phone);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(async () => {
        if (status === "cancellation") {
            await checkAppointments();
        }
    }, []);

    const checkAppointments = async () => {
        setIsFetching(true);
        let db = getFirestore();
        let q = query(
            collection(db, "appointments"),
            where("contact", "==", `+63${verifiedPhone}`)
        );
        let docs = await getDocs(q);
        setAppointments(docs.docs);
        setIsFetching(false);
    };

    const deleteAppointment = (id) => {
        console.log(id);
        let db = getFirestore();
        deleteDoc(doc(db, `appointments/${id}`))
            .then(async () => {
                toast({
                    title: "Successfully Cancelled Appointment",
                    status: "success",
                    duration: 1500,
                });
                await checkAppointments();
            })
            .catch((err) => {
                console.log(err);
                toast({
                    title: "Error",
                    description: "Error in cancelling appointment.",
                    status: "error",
                    duration: 1500,
                });
            });
    };

    if (status === "validation") {
        return (
            <Box
                bg={"white"}
                borderRadius={"lg"}
                px={4}
                py={6}
                position={"relative"}
                w={["80vw", "40vw"]}
            >
                <Text
                    color={"black"}
                    fontWeight={"bold"}
                    mb={4}
                    fontSize={"xl"}
                >
                    Enter Phone Number:
                </Text>
                <IconButton
                    icon={<GrClose />}
                    position={"absolute"}
                    top={2}
                    right={2}
                    p={0}
                    bg={"transparent"}
                    border={"none"}
                    outline={"none"}
                    onClick={close}
                />
                <Flex alignItems={"center"}>
                    <Text
                        borderLeftRadius={"md"}
                        borderRightRadius={"none"}
                        color={"black"}
                        m={0}
                        bg={"gray.300"}
                        h={"full"}
                        p={2}
                    >
                        +63
                    </Text>
                    <Input
                        flex={1}
                        p={2}
                        borderLeftRadius={"none"}
                        borderRightRadius={"md"}
                        type="tel"
                        pattern="[0-9]{10}"
                        maxLength="10"
                        borderColor={"gray.500"}
                        placeholder={"9123456789"}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </Flex>
                <Button
                    onClick={submitPhone}
                    mt={4}
                    w={"full"}
                    border={"none"}
                    outline={"none"}
                    bg={"#031579"}
                    color={"white"}
                    _hover={{ bg: "#49E3EF", color: "black" }}
                >
                    {loading ? <Spinner /> : "Check For Appointments"}
                </Button>
            </Box>
        );
    } else if (status === "cancellation") {
        return (
            <Flex
                flexDir={"column"}
                justifyContent={"space-between"}
                alignItems={"stretch"}
                bg={"white"}
                borderRadius={"lg"}
                px={4}
                py={6}
                position={"relative"}
                w={["80vw", "50vw"]}
            >
                <Heading
                    color={"black"}
                    fontSize={"2xl"}
                    mx={10}
                    textAlign={"center"}
                    mb={4}
                >
                    {appointments
                        ? "Appointments"
                        : "You Haven't Set Any Appointments"}
                </Heading>
                {isFetching && (
                    <Flex justifyContent={"center"} alignItems={"center"}>
                        <Spinner color="gray.500" />
                    </Flex>
                )}
                <Box mt={2}>
                    {appointments?.length === 0 && (
                        <Text
                            color={"gray.500"}
                            display={"block"}
                            textAlign={"center"}
                        >
                            You haven't set any appointments.
                        </Text>
                    )}
                    {appointments &&
                        appointments
                            .map((doc) => ({ ...doc.data(), id: doc.id }))
                            .map((appointment) => (
                                <Flex
                                    mb={2}
                                    justifyContent={"space-between"}
                                    alignItems={"center"}
                                    key={appointment.id}
                                >
                                    <Box flex={"1"}>
                                        <Text
                                            color={"black"}
                                            flex={1}
                                            whiteSpace={"nowrap"}
                                            m={0}
                                        >
                                            {`${appointment.lastName}, ${appointment.firstName}`}
                                        </Text>
                                        <Text
                                            flex={2}
                                            color={"black"}
                                            whiteSpace={"nowrap"}
                                            m={0}
                                        >
                                            {`${appointment.appointmentDate} ${appointment.appointmentTime}`}
                                        </Text>
                                    </Box>
                                    <Button
                                        ml={5}
                                        border={"none"}
                                        outline={"none"}
                                        color={"white"}
                                        bg={"red.500"}
                                        onClick={() => {
                                            setCurrentCancel(appointment.id);
                                            deleteAppointment(appointment.id);
                                        }}
                                    >
                                        {currentCancel === appointment.id ? (
                                            <Spinner />
                                        ) : (
                                            "Cancel"
                                        )}
                                    </Button>
                                </Flex>
                            ))}
                </Box>
                <Button
                    mt={4}
                    alignSelf={"end"}
                    border={"none"}
                    outline={"none"}
                    color={"white"}
                    bg={"#031579"}
                    _hover={{ bg: "#49E3EF", color: "black" }}
                    onClick={() => close()}
                >
                    Return
                </Button>
            </Flex>
        );
    }
};

export default CancelAppointmentModal;
