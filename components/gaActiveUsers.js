import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { addDays } from "date-fns";
import { ChartWrapper } from "./gaStyles";
import CustomDatePicker from "./gaDatePicker";
import { queryReport } from "@/lib/queryReport";
import { formatDate } from "@/lib/utils";

import { Heading, Text, VStack, Box, Flex } from "@chakra-ui/react";

const DayVisitsReport = (props) => {
    const INITIAL_STATE = {
        labels: [],
        values: [],
    };
    const [reportData, setReportData] = useState(INITIAL_STATE);
    const [startDate, setStartDate] = useState(addDays(new Date(), -10));
    const [endDate, setEndDate] = useState(new Date());
    const [average, setAverage] = useState(0);

    const displayResults = (response) => {
        const queryResult = response.result.reports[0].data.rows;
        const total = response.result.reports[0].data.totals[0].values[0];
        setAverage(parseInt(total / response.result.reports[0].data.rowCount));
        let labels = [];
        let values = [];
        queryResult.forEach((row) => {
            labels.push(formatDate(row.dimensions[0]));
            values.push(row.metrics[0].values[0]);
        });
        setReportData({
            ...reportData,
            labels,
            values,
        });
    };

    const data = {
        labels: reportData.labels,
        datasets: [
            {
                label: `${props.title} per day`,
                fill: false,
                lineTension: 0.3,
                borderColor: "#35213d",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "#375751",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: reportData.values,
            },
        ],
    };

    const options = {
        scales: {
            yAxes: [
                {
                    ticks: {
                        suggestedMin: 0,
                    },
                },
            ],
            xAxes: [
                {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7,
                    },
                },
            ],
        },
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        plugins: {
            datalabels: {
                font: {
                    size: 0,
                },
            },
        },
    };

    useEffect(() => {
        const request = {
            viewID: props.viewID,
            startDate,
            endDate,
            metrics: props.metric,
            dimensions: ["ga:date"],
        };
        queryReport(request)
            .then((resp) => displayResults(resp))
            .catch((error) => console.error(error));
    }, [startDate, endDate]);

    return (
        <Box mb={"20"} mt={"10"}>
            <VStack color={"black"} mb={2}>
                <Heading m={0}>{`${props.title} per day`}</Heading>
                <Text m={"-1.5"}>{`Average - ${average} ${props.title}`}</Text>
            </VStack>
            <Flex
                justifyContent={"center"}
                flexDir={"column"}
                maxW={"85vw"}
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
                {reportData && (
                    <ChartWrapper>
                        <Line
                            data={data}
                            options={options}
                            width={100}
                            height={250}
                        />
                    </ChartWrapper>
                )}
            </Flex>
        </Box>
    );
};

export default DayVisitsReport;
