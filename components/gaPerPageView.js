import React, { useState, useEffect } from "react";
import { addDays } from "date-fns";
import CustomDatePicker from "./gaDatePicker";
import { queryReport } from "@/lib/queryReport";
import { StyledTable } from "./gaStyles";

import { Flex, Heading, Text, VStack, Box } from "@chakra-ui/react";

const PageviewsReport = (props) => {
    const [reportData, setReportData] = useState([]);
    const [startDate, setStartDate] = useState(addDays(new Date(), -10));
    const [endDate, setEndDate] = useState(new Date());
    const [totalPages, setTotalPages] = useState(0);

    const displayResults = (response) => {
        const queryResult = response.result.reports[0].data.rows;
        setTotalPages(queryResult.length);
        const total = response.result.reports[0].data.totals[0].values[0];
        let newReportData = [];
        queryResult.forEach((row, idx) => {
            if (idx < 10) {
                let tempObj = {
                    path: row.dimensions[0],
                    views: row.metrics[0].values[0],
                    perc: `${parseFloat(
                        (row.metrics[0].values[0] / total) * 100
                    ).toFixed(1)}%`,
                };
                newReportData.push(tempObj);
            }
        });
        setReportData(newReportData);
    };

    useEffect(() => {
        const request = {
            viewID: props.viewID,
            startDate,
            endDate,
            metrics: "ga:pageviews",
            dimensions: ["ga:pagePath"],
            orderBy: {
                fieldName: "ga:pageViews",
                order: "DESCENDING",
            },
            filter: "ga:pagePath!@localhost/",
        };
        setTimeout(
            () =>
                queryReport(request)
                    .then((resp) => displayResults(resp))
                    .catch((error) => console.error(error)),
            1000
        );
    }, [startDate, endDate]);

    return (
        <Box mb={"20"} w={["90vw", "80vw"]} mx={"auto"}>
            <VStack justifyContent={"center"} alignItems={"center"}>
                <Heading>Top 10 Pages by Views</Heading>
                <Text>{`Total pages - ${totalPages}`}</Text>
            </VStack>
            <Flex
                justifyContent={"center"}
                flexDir={"column"}
                maxW={["90vw", "80vw"]}
                border={"1px"}
                borderRadius={"md"}
                p={2}
                bg={"white"}
            >
                <Flex
                    flexDir={["column", "row"]}
                    justifyContent={["start", "center"]}
                    alignItems={"center"}
                    mb={2}
                >
                    <CustomDatePicker
                        placeholder={"Start date"}
                        date={startDate}
                        handleDateChange={(date) => setStartDate(date)}
                    />
                    <CustomDatePicker
                        placeholder={"End date"}
                        date={endDate}
                        handleDateChange={(date) => setEndDate(date)}
                    />
                </Flex>
                {reportData.length && (
                    <Flex
                        justiyContent={"center"}
                        alignItems={"center"}
                        w={"full"}
                    >
                        <StyledTable>
                            <table
                                className={`table table-light table-striped table-hover table-responsive`}
                            >
                                <thead className={`text-center`}>
                                    <tr>
                                        <th>Page</th>
                                        <th>Views</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody className={`text-center`}>
                                    {reportData.map((row, id) => (
                                        <tr key={id}>
                                            <td>{row.path}</td>
                                            <td>{row.views}</td>
                                            <td>{row.perc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </StyledTable>
                    </Flex>
                )}
            </Flex>
        </Box>
    );
};

export default PageviewsReport;
