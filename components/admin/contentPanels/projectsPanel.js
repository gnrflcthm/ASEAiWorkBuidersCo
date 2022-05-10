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
    VStack,
    Spinner,
} from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";

import { Scrollbars } from "react-custom-scrollbars-2";

function ProjectModal({ addProject, close }) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const submit = (e) => {
        e.preventDefault();
        addProject({ title, description, year });
        close();
    };

    return (
        <div className={`p-4 col-10 col-md-5 ${styles.modalContainer}`}>
            <div className={`${styles.modalHeader}`}>
                <h2>Add Project</h2>
                <GrClose className={`${styles.closeModal}`} onClick={close} />
            </div>
            <div className={`${styles.modalBody}`}>
                <form onSubmit={submit}>
                    <div className={`my-2`}>
                        <label>Title</label>
                        <input
                            type={"text"}
                            className={`form-control`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter project title"
                            required
                        />
                    </div>
                    <div className={`my-2`}>
                        <label>Description</label>
                        <textarea
                            type={"text"}
                            className={`form-control`}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter project description"
                        />
                    </div>
                    <div className={`my-2`}>
                        <label>Year</label>
                        <input
                            type={"number"}
                            className={`form-control`}
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            required
                        />
                    </div>
                    <button
                        className={`btn btn-primary w-100 mt-2`}
                        type={"submit"}
                    >
                        Add Project
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ProjectsPanel({ toast, csrfToken }) {
    const [data, loading, error] = fetchDataContentFrom("projects");
    const [years, setYears] = useState([]);
    const [projects, setProjects] = useState([]);
    const [showAddProjectModal, setShowAddProjectModal] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (data) {
            setProjects(data.content);
        }
    }, [data]);

    useEffect(() => {
        if (data) {
            setYears(
                projects
                    .map((val) => val.year)
                    .filter((val, i, arr) => arr.indexOf(val) === i)
                    .sort((a, b) => a - b)
            );
        }
    }, [projects]);

    const addProject = (projectData) => {
        setProjects((val) => [...val, projectData]);
        setYears(
            projects
                .map((val) => val.year)
                .filter((val, i, arr) => arr.indexOf(val) === i)
                .sort((a, b) => a - b)
        );
    };

    const deleteProject = (val) => {
        setProjects((projectData) =>
            projectData.filter(
                (project) => JSON.stringify(project) !== JSON.stringify(val)
            )
        );
    };

    const save = async () => {
        setSaving(true);
        let status = "Success";
        let db = getFirestore();
        let document = doc(db, "dataContent", "projects");
        try {
            await updateDoc(document, {
                content: projects,
            });
            toast({
                title: "Success",
                description: "Projects has been updated successfully",
                status: "success",
                duration: 1500,
            });
        } catch (err) {
            status = "Error";
            console.log(err);
        } finally {
            setSaving(false);
            await axios.post(
                "/api/admin/log",
                {
                    mode: "Update",
                    status,
                    page: "Projects",
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
        <Box p={4} h={"full"}>
            <Text m={0} fontWeight={"bold"}>
                Projects
            </Text>
            <SkeletonText
                mb={"2"}
                noOfLines={5}
                spacing="4"
                isLoaded={data}
                maxH={"60vh"}
                overflowY={"auto"}
                w={"full"}
                bg={"white"}
                px={2}
                borderRadius={"md"}
            >
                <Scrollbars style={{ height: "60vh" }}>
                    {data &&
                        years.map((year) => (
                            <VStack
                                key={year}
                                alignItems={"stretch"}
                                spacing={1}
                            >
                                <Text
                                    m={0}
                                    mb={2}
                                    mt={4}
                                    fontWeight={"semibold"}
                                >
                                    {year}
                                </Text>
                                {projects
                                    .filter((val) => val.year === year)
                                    .map((val, i) => (
                                        <Flex
                                            key={i}
                                            justifyContent={"space-between"}
                                            alignItems={"center"}
                                            p={2}
                                            border={"1px"}
                                            borderRadius={"md"}
                                            borderColor={"gray.300"}
                                        >
                                            <Box flex={1}>
                                                <Text m={0} fontWeight={"bold"}>
                                                    {val.title}
                                                </Text>
                                                <Text m={0}>
                                                    {val.description}
                                                </Text>
                                            </Box>
                                            <ActionButton
                                                icon={BsTrashFill}
                                                color={"red"}
                                                tooltip={"Delete Question"}
                                                placement={"top-start"}
                                                onClick={() =>
                                                    deleteProject(val)
                                                }
                                            />
                                        </Flex>
                                    ))}
                            </VStack>
                        ))}
                </Scrollbars>
            </SkeletonText>
            <Flex justifyContent={"end"} my={2}>
                <Button
                    flex={[1, "initial"]}
                    color={"white"}
                    bg={"#031579"}
                    border={"none"}
                    outline={"none"}
                    onClick={() => setShowAddProjectModal(true)}
                    _hover={{ bg: "white", color: "black" }}
                >
                    Add Project
                </Button>
                <Button
                    flex={[1, "initial"]}
                    color={"white"}
                    bg={"green.500"}
                    border={"none"}
                    outline={"none"}
                    onClick={save}
                    ml={2}
                    _hover={{ bg: "white", color: "black" }}
                >
                    {saving ? <Spinner /> : "Save"}
                </Button>
            </Flex>
            <AnimatePresence>
                {showAddProjectModal && (
                    <BaseModal>
                        {showAddProjectModal && (
                            <ProjectModal
                                close={() => setShowAddProjectModal(false)}
                                addProject={addProject}
                            />
                        )}
                    </BaseModal>
                )}
            </AnimatePresence>
        </Box>
    );
}
