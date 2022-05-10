import { useState } from "react";

import useAdmin from "@/lib/useAdmin";
import cookie from "cookie";

import AdminHeader from "@/components/adminHeader";
import LoadingOverlay from "@/components/loadingOverlay";

import { Scrollbars } from "react-custom-scrollbars-2";

import {
    HomePanel,
    AboutPanel,
    ProjectsPanel,
    FAQPanel,
    ContactPanel,
} from "@/components/admin/contentPanels";

import { Flex, useToast, Button } from "@chakra-ui/react";

const ButtonTab = ({ onClick, children, isActive }) => {
    return (
        <Button
            onClick={onClick}
            color={isActive ? "black" : "white"}
            bg={isActive ? "white" : "#031579"}
            border={"none"}
            outline={"none"}
            borderRadius="none"
            _hover={{ bg: "white", color: "black" }}
            flex={1}
        >
            {children}
        </Button>
    );
};

const PanelView = ({ current, toast, csrfToken }) => {
    switch (current) {
        case "home":
            return <HomePanel toast={toast} csrfToken={csrfToken} />;
        case "about":
            return <AboutPanel toast={toast} csrfToken={csrfToken} />;
        case "projects":
            return <ProjectsPanel toast={toast} csrfToken={csrfToken} />;
        case "faqs":
            return <FAQPanel toast={toast} csrfToken={csrfToken} />;
        case "contacts":
            return <ContactPanel toast={toast} csrfToken={csrfToken} />;
    }
};

export default function Content({ csrfToken, sessionCookie }) {
    const [admin, loading, error] = useAdmin(csrfToken, sessionCookie);
    const [current, setCurrent] = useState("home");
    const toast = useToast();

    if (loading) {
        return <LoadingOverlay />;
    }
    if (admin) {
        return (
            <Flex
                maxH={"100vh"}
                minH={"100vh"}
                bg={"#DDD"}
                flexDir={"column"}
                overflow={"hidden"}
            >
                <AdminHeader admin={admin} csrfToken={csrfToken} />
                <Flex position={"sticky"} top={"0"} overflowx={"auto"}>
                    <ButtonTab
                        isActive={current === "home"}
                        onClick={() => setCurrent("home")}
                    >
                        Home
                    </ButtonTab>
                    <ButtonTab
                        isActive={current === "about"}
                        onClick={() => setCurrent("about")}
                    >
                        About Us
                    </ButtonTab>
                    <ButtonTab
                        isActive={current === "projects"}
                        onClick={() => setCurrent("projects")}
                    >
                        Projects
                    </ButtonTab>
                    <ButtonTab
                        isActive={current === "faqs"}
                        onClick={() => setCurrent("faqs")}
                    >
                        FAQs
                    </ButtonTab>
                    <ButtonTab
                        isActive={current === "contacts"}
                        onClick={() => setCurrent("contacts")}
                    >
                        Contacts
                    </ButtonTab>
                </Flex>
                <Flex flex={"1"} overflow={"hidden"} alignItems={"stretch"}>
                    <Scrollbars style={{ height: "auto" }}>
                        <PanelView
                            current={current}
                            toast={toast}
                            csrfToken={csrfToken}
                        />
                    </Scrollbars>
                </Flex>
            </Flex>
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
