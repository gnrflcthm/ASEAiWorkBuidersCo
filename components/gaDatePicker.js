import React from "react";
import DatePicker from "react-datepicker";
import { DatepickerLabel, DatepickerWrapper } from "./gaStyles";

import { Flex, Text } from "@chakra-ui/react";

import "react-datepicker/dist/react-datepicker.css";

const CustomDatePicker = (props) => {
    return (
        <Flex
            flexDir={"column"}
            justifyContent={"start"}
            alignItems={"center"}
            mx={2}
            mb={2}
        >
            <Text m={0} fontWeight={"medium"}>
                {props.placeholder}
            </Text>
            <DatePicker
                selected={props.date}
                onChange={props.handleDateChange}
                maxDate={new Date()}
                dateFormat="MMM dd, yyyy"
                className="picker"
            />
        </Flex>
    );
};

export default CustomDatePicker;
