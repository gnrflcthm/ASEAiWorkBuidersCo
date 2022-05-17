import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "./adminHeader.module.css";
import navStyles from "@/styles/adminDashboard.module.css";
import { BsXLg, BsFillPersonFill } from "react-icons/bs";
import { FaBars } from "react-icons/fa";

import UpdatePasswordModal from "./updatePasswordModal";

import {
    useToast,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    chakra,
    Text,
} from "@chakra-ui/react";
import axios from "axios";
import ActionButton from "./actionButton";
import { AnimatePresence, motion, isValidMotionProp } from "framer-motion";
import { updatePassword } from "firebase/auth";
import BaseModal from "./baseModal";

const MotionBox = chakra(motion.div, {
    shouldForwardProp: (prop) => isValidMotionProp(prop) || prop === "children",
});

const routes = {
    Dashboard: "/admin/dashboard",
    Users: "/admin/dashboard/users",
    "Audit Logs": "/admin/dashboard/logs",
    Appointments: "/admin/dashboard/appointments",
    Services: "/admin/dashboard/services",
    Queries: "/admin/dashboard/queries",
    "Website Content": "/admin/dashboard/content",
};

function AdminNav({ isSuperAdmin, hide, currentRoute }) {
    return (
        <MotionBox
            initial={{ x: -150 }}
            animate={{ x: 0 }}
            exit={{ x: -150 }}
            display={"flex"}
            flexDir={"column"}
            justifyContent={"start"}
            alignItems={"stretch"}
            position={"fixed"}
            top={0}
            left={0}
            py={5}
            h={"100vh"}
            bg={"#031579"}
            zIndex={"popover"}
        >
            <Flex justifyContent={"end"} mb={5} px={2}>
                <ActionButton
                    icon={BsXLg}
                    color={"#FFF"}
                    onClick={() => hide()}
                />
            </Flex>
            {Object.keys(routes).map((key) => {
                if (!isSuperAdmin && ["Users", "Audit Logs"].includes(key))
                    return;
                return (
                    <Link href={routes[key]} key={key}>
                        <Text
                            color={"white"}
                            p={4}
                            textDecor={"none"}
                            _hover={{ bg: "whiteAlpha.400" }}
                            cursor={"pointer"}
                            bg={`${
                                currentRoute === routes[key]
                                    ? "whiteAlpha.400"
                                    : ""
                            }`}
                            m={0}
                        >
                            {key}
                        </Text>
                    </Link>
                );
            })}
            <Text
                as={"a"}
                color={"white"}
                p={4}
                textDecor={"none"}
                _hover={{ bg: "whiteAlpha.400", color: "white" }}
                cursor={"pointer"}
                href="/api/admin/manual"
                target={"_blank"}
                m={0}
            >
                User Manual
            </Text>
        </MotionBox>
    );
}

export default function AdminHeader({ admin, csrfToken }) {
    const router = useRouter();
    const [showNav, setShowNav] = useState(false);
    const [showUpdatePasswordModal, setShowUpdatePasswordModal] =
        useState(false);
    const toast = useToast();

    const signOut = async () => {
        await axios.get("/api/admin/invalidate", {
            headers: { "xsrf-token": csrfToken },
        });
        router.push("/admin/");
    };

    return (
        <>
            <Flex
                className={`py-4 ${styles.header}`}
                justifyContent={"space-between"}
                alignItems={"center"}
                px={[2, 5]}
                position={"sticky"}
                top={0}
                zIndex={"dropdown"}
                bg={"#031579"}
            >
                <ActionButton
                    icon={FaBars}
                    onClick={() => setShowNav(true)}
                    color={"#FFF"}
                />
                <Menu>
                    <MenuButton
                        className={`d-flex justify-content-between align-items center ${styles.profileBtn}`}
                    >
                        <BsFillPersonFill />
                        <span className={`ms-2`}>
                            {admin.firstName} {admin.lastName}
                        </span>
                    </MenuButton>
                    <MenuList>
                        <MenuItem
                            className={`${styles.menuItem}`}
                            onClick={() => setShowUpdatePasswordModal(true)}
                        >
                            Update Password
                        </MenuItem>
                        <MenuItem
                            className={`${styles.menuItem}`}
                            onClick={signOut}
                        >
                            Sign Out
                        </MenuItem>
                    </MenuList>
                </Menu>
                <AnimatePresence>
                    {showNav && (
                        <AdminNav
                            isSuperAdmin={admin.accountType === "super-admin"}
                            hide={() => setShowNav(false)}
                            currentRoute={router.pathname}
                        />
                    )}
                </AnimatePresence>
            </Flex>
            <AnimatePresence>
                {showUpdatePasswordModal && (
                    <BaseModal>
                        <UpdatePasswordModal
                            admin={admin}
                            close={() => setShowUpdatePasswordModal(false)}
                            changeSuccess={() =>
                                toast({
                                    title: "Password Changed Successfully",
                                    status: "success",
                                    duration: 1500,
                                })
                            }
                        />
                    </BaseModal>
                )}
            </AnimatePresence>
        </>
    );
}
