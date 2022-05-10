import { Tooltip } from "@chakra-ui/react";

export default function ActionButton({
    icon,
    tooltip,
    onClick,
    color,
    placement,
}) {
    const Icon = icon;
    return (
        <Tooltip label={tooltip} placement={placement || "top"} hasArrow>
            <div
                className={`mx-2`}
                onClick={onClick}
                style={{ cursor: "pointer" }}
            >
                <Icon color={color} />
            </div>
        </Tooltip>
    );
}
