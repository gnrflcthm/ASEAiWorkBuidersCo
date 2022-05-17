import { useState } from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    Input,
    Button,
    IconButton,
    useToast,
    Spinner,
} from "@chakra-ui/react";
import { GrClose } from "react-icons/gr";

import "firebase.config";
import {
    getAuth,
    signInWithEmailAndPassword,
    updatePassword,
    signOut,
} from "firebase/auth";

export default function UpdatePasswordModal({ admin, close, changeSuccess }) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const changePassword = () => {
        setLoading(true);
        if (newPassword !== confirmPassword) {
            setError("Passwords Does Not Match.");
            setLoading(false);
            return;
        }
        const auth = getAuth();
        signInWithEmailAndPassword(auth, admin.email, oldPassword)
            .then(() => {
                updatePassword(auth.currentUser, newPassword);
                signOut(auth);
                changeSuccess();
                close();
            })
            .catch((e) => {
                setError("Incorrect Old Password.");
            })
            .finally(() => {
                setLoading(false);
            });
    };
    return (
        <Flex
            flexDir={"column"}
            bg={"white"}
            p={"8"}
            borderRadius={"md"}
            w={["90vw", "40vw"]}
        >
            <Box position={"relative"}>
                <Heading fontSize={"2xl"} my={"2"}>
                    Change Password
                </Heading>
                <IconButton
                    icon={<GrClose />}
                    onClick={close}
                    bg={"transparent"}
                    border={"none"}
                    outline={"none"}
                    position={"absolute"}
                    top={"0"}
                    right={"0"}
                />
            </Box>
            <Box my={"2"}>
                <Text mb={"2"}>Old Password</Text>
                <Input
                    type={"password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
            </Box>
            <Box my={"2"}>
                <Text mb={"2"}>New Password</Text>
                <Input
                    type={"password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </Box>
            <Box my={"2"}>
                <Text mb={"2"}>Confirm Password</Text>
                <Input
                    type={"password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </Box>
            {error && (
                <Text m={0} fontSize={"sm"} color={"red"}>
                    {error}
                </Text>
            )}
            <Button
                mt={"2"}
                onClick={() => changePassword()}
                border={"none"}
                outline={"none"}
                bg={"#031579"}
                color={"white"}
                _hover={{
                    color: "black",
                    bg: "#49E3EF",
                }}
                disabled={loading}
            >
                {loading ? <Spinner /> : "Change Password"}
            </Button>
        </Flex>
    );
}
