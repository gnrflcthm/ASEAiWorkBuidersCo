import { Tooltip } from "@chakra-ui/react";

import { BsFillEyeFill } from "react-icons/bs";

export default function HiddenID({ id, toast }) {
    return (
        <Tooltip hasArrow label={id} placement="top">
            <div
                className={`position-relative d-flex justify-content-center align-items-center`}
                onClick={() => {
                    navigator.clipboard.writeText(id);
                    toast({
                        description: "ID copied to clipboard",
                        duration: 1500,
                    });
                }}
            >
                <BsFillEyeFill />
            </div>
        </Tooltip>
    );
}
