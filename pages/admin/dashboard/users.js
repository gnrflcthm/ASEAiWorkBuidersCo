import { useRouter } from "next/router";

import AdminHeader from "@/components/adminHeader";
import cookie from "cookie";
import { useState, useEffect } from "react";

import axios from "axios";

import useAdmin from "@/lib/useAdmin";
import styles from "@/styles/adminDashboardBase.module.css";
import LoadingOverlay from "@/components/loadingOverlay";
import HiddenID from "@/components/hiddenId";
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    VStack,
    Box,
    Text,
    Heading,
    Flex,
    Button,
} from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";

import { GrClose } from "react-icons/gr";
import { FaEllipsisV } from "react-icons/fa";
import { BsCaretLeftFill, BsCaretRightFill } from "react-icons/bs";

import "firebase.config";
import {
    getFirestore,
    collection,
    query,
    getDocs,
    orderBy,
    startAfter,
    limit,
    endAt,
    limitToLast,
} from "firebase/firestore";

import {
    createUserWithEmailAndPassword,
    getAuth,
    signOut,
} from "firebase/auth";

import BaseModal from "@/components/baseModal";
import PromptModal from "@/components/prompt";
import { Scrollbars } from "react-custom-scrollbars-2";

function UserModal({ mode, data, toast, close, reload, csrfToken }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [superAdmin, setSuperAdmin] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === "edit") {
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setEmail(data.email);
            setContact(data.contact);
            setAddress(data.address);
        }
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (mode === "add") {
            try {
                let userCred = await createUserWithEmailAndPassword(
                    getAuth(),
                    email,
                    process.env.DEFAULT_ADMIN_PASSWORD
                );
                let id = userCred.user.uid;
                let res = await axios.post(
                    "/api/admin/users",
                    {
                        ex: mode,
                        id,
                        firstName,
                        lastName,
                        email,
                        contact,
                        address,
                        accountType: superAdmin ? "super-admin" : "admin",
                    },
                    {
                        headers: {
                            "xsrf-token": csrfToken,
                        },
                    }
                );
                if (res.status === 200) {
                    await signOut(getAuth());
                    toast({
                        title: "Success",
                        description: "User has successfully been created.",
                        duration: 1200,
                    });
                    close();
                }
            } catch (err) {
                console.log(err);
                toast({
                    title: "An Error Has Occurred",
                    status: "error",
                    duration: 1200,
                });
                close();
            }
        } else if (mode === "edit") {
            let res = await axios.post(
                "/api/admin/users",
                {
                    ex: mode,
                    id: data.id,
                    firstName,
                    lastName,
                    email,
                    contact,
                    address,
                    accountType: data.accountType,
                },
                {
                    headers: {
                        "xsrf-token": csrfToken,
                    },
                }
            );
            if (res.status === 200) {
                toast({
                    title: "Success",
                    description: "User updated successfully",
                    duration: 1200,
                });
                close();
            }
        }
        reload();
    };
    return (
        <div
            className={`p-4 col-10 col-md-5 ${styles.modalContainer}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={`${styles.modalHeader}`}>
                <h2>{mode === "add" ? "Add" : "Edit"} User</h2>
                <GrClose className={`${styles.closeModal}`} onClick={close} />
            </div>
            <form onSubmit={submit}>
                <div className={`mb-1`}>
                    <label>First Name</label>
                    <input
                        type="text"
                        className={`form-control`}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter user first name"
                    />
                </div>
                <div className={`mb-1`}>
                    <label>Last Name</label>
                    <input
                        type="text"
                        className={`form-control`}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter user last name"
                    />
                </div>
                <div className={`mb-1`}>
                    <label>Email</label>
                    <input
                        type="email"
                        className={`form-control`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={mode === "edit"}
                        placeholder="Enter user email address"
                    />
                </div>
                <div className={`mb-1`}>
                    <label>Contact</label>
                    <input
                        type="tel"
                        className={`form-control`}
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Enter user mobile no."
                    />
                </div>
                <div className={`mb-1`}>
                    <label>Address</label>
                    <input
                        type="text"
                        className={`form-control`}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter user address"
                    />
                </div>
                {mode === "add" && (
                    <div className={`my-2`}>
                        <div class="form-check form-switch">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                value={superAdmin}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setSuperAdmin(e.target.value);
                                }}
                            />
                            <label class="form-check-label">
                                Super Administrator
                            </label>
                        </div>
                    </div>
                )}
                <button className={`btn btn-primary w-100 mt-2`} type="submit">
                    {loading ? (
                        <span className="spinner-border"></span>
                    ) : (
                        <span>{mode === "add" ? "Add" : "Save"} User</span>
                    )}
                </button>
            </form>
        </div>
    );
}

export default function UserAccounts({ csrfToken, sessionCookie }) {
    const router = useRouter();
    const [admin, loading, error] = useAdmin(csrfToken, sessionCookie);
    const [adminData, setAdminData] = useState([]);
    const toast = useToast();
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [userModalMode, setUserModalMode] = useState("add");
    const [currentUser, setCurrentUser] = useState({});
    const pageSize = 10;

    const loadAdminData = async () => {
        let db = getFirestore();
        let q = query(
            collection(db, "admin"),
            orderBy("firstName"),
            limit(pageSize)
        );
        let documents = await getDocs(q);
        setAdminData(documents);
    };

    useEffect(async () => {
        await loadAdminData();
    }, []);

    const nextPage = async () => {
        let db = getFirestore();
        let q = query(
            collection(db, "admin"),
            orderBy("firstName"),
            startAfter(adminData.docs[adminData.docs.length - 1]),
            limit(pageSize)
        );
        let documents = await getDocs(q);
        if (documents.docs.length === 0) {
            return;
        }
        setAdminData(documents);
    };
    const prevPage = async () => {
        let db = getFirestore();
        let q = query(
            collection(db, "admin"),
            orderBy("firstName"),
            endAt(adminData.docs[0]),
            limitToLast(pageSize)
        );
        let documents = await getDocs(q);
        if (documents.docs.length === 0) {
            return;
        }
        setAdminData(documents);
    };

    const showModal = (mode, id) => {
        setUserModalMode(mode);
        if (id !== -1) {
            setCurrentUser(
                adminData.docs
                    .map((val) => ({ ...val.data(), id: val.id }))
                    .filter((ad) => ad.id === id)[0]
            );
        }
        setShowUserModal(true);
    };

    const deleteUser = async () => {
        let res = await axios.post(
            "/api/admin/users",
            {
                ex: "delete",
                ...currentUser,
            },
            {
                headers: {
                    "xsrf-token": csrfToken,
                },
            }
        );
        if (res.status === 200) {
            toast({
                title: "User Deleted Successfully",
                status: "success",
                duration: 1500,
            });
        } else {
            toast({
                title: "Error",
                description: "An error occured while deleting the user",
                status: "error",
                duration: 1500,
            });
        }
        setCurrentUser({});
        await loadAdminData();
    };

    const resetPassword = async (adminUser) => {
        try {
            await axios.post(
                "/api/admin/users",
                {
                    ex: "reset",
                    ...adminUser,
                },
                {
                    headers: {
                        "xsrf-token": csrfToken,
                    },
                }
            );
            toast({
                title: "Password Reset Successfully",
                status: "success",
                duration: 1500,
            });
        } catch (err) {
            console.log(err);
            toast({
                title: "Error",
                description:
                    "An error occured while resetting the user's password.",
                status: "error",
                duration: 1500,
            });
        }
    };

    if (admin?.accountType === "admin") {
        router.push("/admin/dashboard");
        return <LoadingOverlay />;
    }

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
                        Admin Accounts
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
                            onClick={() => showModal("add", -1)}
                        >
                            Add Admin
                        </Button>
                    </Flex>
                </Flex>
                <Box px={[0, 10]}>
                    <Scrollbars style={{ height: "68vh" }}>
                        <VStack w={"full"} my={2}>
                            {adminData.docs
                                .map((doc) => ({
                                    ...doc.data(),
                                    id: doc.id,
                                }))
                                .map((user) => (
                                    <Flex
                                        justifyContent={"space-between"}
                                        alignItems={"center"}
                                        bg={"white"}
                                        w={"full"}
                                        px={5}
                                        py={"2"}
                                        borderRadius={["none", "md"]}
                                        key={user.id}
                                    >
                                        <VStack
                                            textAlign={"left"}
                                            flex={3}
                                            alignItems={"start"}
                                        >
                                            <Flex
                                                justifyContent={"space-between"}
                                                alignItems={"center"}
                                            >
                                                <Heading
                                                    color="black"
                                                    as="h1"
                                                    fontSize={["lg", "xl"]}
                                                    fontWeight={"semibold"}
                                                    m={0}
                                                >
                                                    {`${user.lastName}, ${user.firstName}`}
                                                </Heading>
                                                <Box ml={3}>
                                                    <HiddenID
                                                        id={user.id}
                                                        toast={toast}
                                                    />
                                                </Box>
                                            </Flex>
                                            <Text
                                                color={"gray.500"}
                                                fontSize={["sm", "md"]}
                                                fontWeight={"normal"}
                                                mt={"-1.5"}
                                            >
                                                {user.email}
                                            </Text>
                                        </VStack>
                                        <Text
                                            m={0}
                                            flex={2}
                                            textAlign={["right", "center"]}
                                            mr={[1, 0]}
                                        >
                                            {user.accountType}
                                        </Text>
                                        <Flex justifyContent={"end"}>
                                            <Menu>
                                                <MenuButton
                                                    bg={"none"}
                                                    border={"none"}
                                                    verticalAlign={"super"}
                                                >
                                                    <FaEllipsisV />
                                                </MenuButton>
                                                <MenuList>
                                                    <MenuItem
                                                        className={`${styles.menuItem}`}
                                                        onClick={() =>
                                                            showModal(
                                                                "edit",
                                                                user.id
                                                            )
                                                        }
                                                    >
                                                        Edit User
                                                    </MenuItem>
                                                    <MenuItem
                                                        className={`${styles.menuItem}`}
                                                        onClick={() =>
                                                            resetPassword(user)
                                                        }
                                                    >
                                                        Reset Password
                                                    </MenuItem>
                                                    {user.id !== admin.id && (
                                                        <MenuItem
                                                            className={`${styles.menuItem}`}
                                                            color={"red.500"}
                                                            onClick={() => {
                                                                setShowDeleteUserModal(
                                                                    true
                                                                );
                                                                setCurrentUser(
                                                                    user
                                                                );
                                                            }}
                                                        >
                                                            Delete User
                                                        </MenuItem>
                                                    )}
                                                </MenuList>
                                            </Menu>
                                        </Flex>
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
                            <span>
                                <BsCaretLeftFill />
                                Previous Page
                            </span>
                        </Button>
                        <Button
                            onClick={() => nextPage()}
                            bg={"transparent"}
                            border={"none"}
                            outline={"none"}
                            _hover={{ color: "#031579" }}
                        >
                            <span>
                                Next Page
                                <BsCaretRightFill />
                            </span>
                        </Button>
                    </Flex>
                </Box>

                <AnimatePresence>
                    {(showUserModal || showDeleteUserModal) && (
                        <BaseModal>
                            {showUserModal && (
                                <UserModal
                                    toast={toast}
                                    mode={userModalMode}
                                    data={currentUser}
                                    close={() => setShowUserModal(false)}
                                    reload={loadAdminData}
                                    csrfToken={csrfToken}
                                />
                            )}
                            {showDeleteUserModal && (
                                <PromptModal
                                    prompt={"You are about to delete a user."}
                                    subPrompt={"Would you like to proceed?"}
                                    acceptText={"Return"}
                                    rejectText={"Delete User"}
                                    onAccept={() =>
                                        setShowDeleteUserModal(false)
                                    }
                                    onReject={() => {
                                        deleteUser();
                                        setShowDeleteUserModal(false);
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
