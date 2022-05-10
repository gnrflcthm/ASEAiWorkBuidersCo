import { useState, useEffect } from "react";

import axios from "axios";

import "firebase.config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import fetchDataContentFrom from "./fetchDataContentFrom";

import ActionButton from "@/components/actionButton";

import { BsTrashFill } from "react-icons/bs";

import {
    SkeletonText,
    Input,
    Box,
    Flex,
    Text,
    Button,
    Select,
    Spinner,
} from "@chakra-ui/react";

import { motion, Reorder } from "framer-motion";

export default function ContactPanel({ toast, csrfToken }) {
    const [data, loading, error] = fetchDataContentFrom("contact");
    const [address, setAddress] = useState("");
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState("");
    const [email, setEmail] = useState([]);
    const [socials, setSocials] = useState([]);
    const [newSocialValue, setNewSocialValue] = useState("");
    const [newSocialType, setNewSocialType] = useState("Facebook");
    const [newSocialOtherType, setNewSocialOtherType] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (data) {
            setAddress(data.address);
            setContacts(data.contactNum);
            setEmail(data.email);
            setSocials(data.socials.map((val, i) => ({ ...val, id: i })));
        }
    }, [data]);

    const addContact = () => {
        setContacts((val) => [...val, newContact]);
        setNewContact("");
    };

    const deleteContact = (index) => {
        setContacts((val) => val.filter((_, i) => i !== index));
    };

    const addSocial = () => {
        setSocials((val) => [
            ...val,
            {
                id: Math.max(...socials.map((val) => val.id)) + 1,
                type: newSocialType,
                value: newSocialValue,
                others: newSocialType === "Other" ? newSocialOtherType : "",
            },
        ]);
        setNewSocialType("");
        setNewSocialValue("");
    };

    const deleteSocial = (index) => {
        setSocials((val) => val.filter((_, i) => i !== index));
    };

    const save = async () => {
        setSaving(true);
        let status = "Success";
        let db = getFirestore();
        let document = doc(db, "dataContent", "contact");
        try {
            await updateDoc(document, {
                address: address.trim(),
                contactNum: contacts,
                email: email.trim(),
                socials: socials.map((val) => ({
                    type: val.type,
                    value: val.value,
                    others: val.others,
                })),
            });
            setSaving(false);
            toast({
                title: "Success",
                description: "Contact Details have been updated successfully.",
                status: "success",
                duration: 1500,
            });
        } catch (err) {
            console.log(err);
            status = "Error";
        } finally {
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Update",
                    status,
                    page: "Contacts",
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
            <motion.div layoutScroll>
                <Text m={0} fontWeight={"bold"}>
                    Address
                </Text>
                <SkeletonText my="2" noOfLines={5} spacing="4" isLoaded={data}>
                    {data && (
                        <Input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            bg={"white"}
                            borderBottom={"2px"}
                            borderRadius={"none"}
                            borderBottomColor={"#031579"}
                            _hover={{ borderColor: "#031579" }}
                        />
                    )}
                </SkeletonText>
                <Text m={0} fontWeight={"bold"}>
                    Contacts
                </Text>
                <SkeletonText my="2" noOfLines={5} spacing="4" isLoaded={data}>
                    {data && (
                        <Reorder.Group
                            values={contacts}
                            onReorder={setContacts}
                            as="div"
                        >
                            {contacts.map((contact, i) => (
                                <Reorder.Item
                                    key={contact}
                                    value={contact}
                                    as="div"
                                >
                                    <Flex
                                        justifyContent={"space-between"}
                                        alignItems={"center"}
                                        px={3}
                                        bg={"white"}
                                        my={1}
                                        borderRadius={"md"}
                                    >
                                        <Text m={0} py={2}>
                                            {contact}
                                        </Text>
                                        <ActionButton
                                            icon={BsTrashFill}
                                            color={"red"}
                                            tooltip={"Delete Contact"}
                                            placement={"top-start"}
                                            onClick={() => deleteContact(i)}
                                        />
                                    </Flex>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}
                    <Flex>
                        <Input
                            type="text"
                            borderRightRadius={"none"}
                            bg={"white"}
                            value={newContact}
                            onChange={(e) => setNewContact(e.target.value)}
                            placeholder={"+631234567890"}
                        />
                        <Button
                            onClick={addContact}
                            bg={"#031579"}
                            color={"white"}
                            borderLeftRadius={"none"}
                            border={"none"}
                            outline={"none"}
                            _hover={{ bg: "white", color: "black" }}
                        >
                            Add Contact
                        </Button>
                    </Flex>
                </SkeletonText>
                <Text m={0} fontWeight={"bold"}>
                    Email
                </Text>
                <SkeletonText my="2" noOfLines={5} spacing="4" isLoaded={data}>
                    {data && (
                        <Input
                            type="text"
                            borderRightRadius={"none"}
                            bg={"white"}
                            className={`form-control`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    )}
                </SkeletonText>
                <Text m={0} fontWeight={"bold"}>
                    Social Media
                </Text>
                <SkeletonText my="2" noOfLines={5} spacing="4" isLoaded={data}>
                    {data && (
                        <Reorder.Group
                            values={socials}
                            onReorder={setSocials}
                            as="div"
                        >
                            {socials.map((social, i) => (
                                <Reorder.Item
                                    key={social.id}
                                    value={social}
                                    as="div"
                                >
                                    <Flex
                                        justifyContent={"space-between"}
                                        alignItems={"center"}
                                        px={3}
                                        bg={"white"}
                                        my={1}
                                        borderRadius={"md"}
                                    >
                                        <Text m={"0"} py={2}>
                                            {social.type}
                                            {social.type === "Other" &&
                                                `(${social.others})`}{" "}
                                            : {social.value}
                                        </Text>
                                        <ActionButton
                                            icon={BsTrashFill}
                                            color={"red"}
                                            tooltip={"Delete Contact"}
                                            placement={"top-start"}
                                            onClick={() => deleteSocial(i)}
                                        />
                                    </Flex>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}
                    {newSocialType === "Other" && (
                        <Input
                            type="text"
                            bg={"white"}
                            value={newSocialOtherType}
                            onChange={(e) =>
                                setNewSocialOtherType(e.target.value)
                            }
                            placeholder={`Social Media Type eg. WhatsApp, Viber`}
                        />
                    )}
                    <Flex flexDir={["column", "row"]}>
                        <Input
                            flex={"2"}
                            type="text"
                            bg={"white"}
                            display={"block"}
                            py={2}
                            borderRightRadius={["md", "none"]}
                            borderBottomRadius={["none", "initial"]}
                            value={newSocialValue}
                            onChange={(e) => setNewSocialValue(e.target.value)}
                            placeholder={`Social Media Link`}
                        />
                        <Flex flexDir={["column", "row"]} flex={"2"}>
                            <Select
                                placeholder="Type"
                                bg={"white"}
                                borderRadius={"none"}
                                onChange={(e) =>
                                    setNewSocialType(e.target.value)
                                }
                            >
                                <option value={`Facebook`}>Facebook</option>
                                <option value={`Twitter`}>Twitter</option>
                                <option value={`Instagram`}>Instagram</option>
                                <option value={`YouTube`}>YouTube</option>
                                <option value={`LinkedIn`}>LinkedIn</option>
                                <option value={`Other`}>Other</option>
                            </Select>
                            <Button
                                onClick={addSocial}
                                bg={"#031579"}
                                color={"white"}
                                display={"block"}
                                borderTopRadius={["none", "initial"]}
                                borderLeftRadius={["md", "none"]}
                                border={"none"}
                                outline={"none"}
                                w={"full"}
                                _hover={{ bg: "white", color: "black" }}
                            >
                                Add Social
                            </Button>
                        </Flex>
                    </Flex>
                </SkeletonText>
            </motion.div>
            <Flex flexDir={"column"}>
                <Button
                    my={2}
                    alignSelf={["stretch", "end"]}
                    bg={"green.500"}
                    color={"white"}
                    border={"none"}
                    outline={"none"}
                    _hover={{ bg: "white", color: "black" }}
                    disabled={saving}
                    onClick={save}
                >
                    {saving ? <Spinner /> : "Save Contacts"}
                </Button>
            </Flex>
        </Box>
    );
}
