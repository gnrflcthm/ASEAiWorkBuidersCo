import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { addDays, format } from "date-fns";
import CustomDatePicker from "./gaDatePicker";
import { queryReport } from "@/lib/queryReport";
import { formatDate, transformToDate } from "@/lib/utils";
import { Chart as ChartJS } from "chart.js/auto";
import { colors } from "./gaStyles";

import { Box, Flex, VStack, Heading, Text } from "@chakra-ui/react";

const SourcesReport = (props) => {
    const INITIAL_STATE = {
        labels: [],
        datasets: [],
    };
    const [reportData, setReportData] = useState(INITIAL_STATE);
    const [startDate, setStartDate] = useState(addDays(new Date(), -10));
    const [endDate, setEndDate] = useState(new Date());
    const [totalSources, setTotalSources] = useState(0);

    const transformAPIData = (data) => {
        let transformedData = [];
        let datesArray = [];
        data.forEach((row) => {
            transformedData.push({
                date: formatDate(row.dimensions[1]),
                source: row.dimensions[0],
                visits: row.metrics[0].values[0],
            });
            datesArray.push(transformToDate(row.dimensions[1]));
        });
        return [transformedData, datesArray];
    };

    const groupDataBySource = (data) => {
        return data.reduce((r, a) => {
            r[a.source] = r[a.source] || [];
            r[a.source].push(a);
            return r;
        }, Object.create(null));
    };

    const sortSourcesByTotalVisits = (data) => {
        let sumedVisits = [];
        for (let [key, value] of Object.entries(data)) {
            const sumOfVisits = value.reduce((a, b) => {
                return a + parseInt(b.visits);
            }, 0);
            sumedVisits.push({
                source: key,
                visits: sumOfVisits,
            });
        }
        return sumedVisits.sort((a, b) => b.visits - a.visits);
    };

    const createDataForChart = (datesArray, sumedVisits, groupedBySource) => {
        datesArray.sort((a, b) => {
            return new Date(a) - new Date(b);
        });
        const datesFormatted = datesArray.map((date) =>
            format(new Date(date), "MMM. d, yyyy")
        );
        const uniqueDates = [...new Set(datesFormatted)];
        let datasetsArray = [];
        let i = 0;
        sumedVisits.forEach((item, id) => {
            if (id < 5) {
                const label = item.source;
                const backgroundColor = colors[i + 3];
                i++;
                let data = [];
                uniqueDates.forEach((date) => {
                    const row = groupedBySource[item.source].find(
                        (item) => item.date === date
                    );
                    if (row) {
                        data.push(parseInt(row.visits));
                    } else {
                        data.push(0);
                    }
                });
                datasetsArray.push({
                    label,
                    backgroundColor,
                    data,
                });
            }
        });
        return { labels: uniqueDates, data: datasetsArray };
    };

    const displayResults = (response) => {
        const queryResult = response.result.reports[0].data.rows;

        const data = transformAPIData(queryResult);
        let transformedData = data[0];
        let datesArray = data[1];

        const groupedBySource = groupDataBySource(transformedData);
        setTotalSources(Object.keys(groupedBySource).length);

        const sumedVisits = sortSourcesByTotalVisits(groupedBySource);

        const dataForChart = createDataForChart(
            datesArray,
            sumedVisits,
            groupedBySource
        );

        setReportData({
            ...reportData,
            labels: dataForChart.labels,
            datasets: dataForChart.data,
        });
    };

    const options = {
        tooltips: {
            displayColors: true,
            callbacks: {
                mode: "x",
            },
        },
        maintainAspectRatio: false,
        legend: { position: "bottom" },
        plugins: {
            datalabels: {
                font: {
                    size: 0,
                },
            },
        },
    };

    const data = {
        labels: reportData.labels,
        datasets: reportData.datasets,
    };

    useEffect(() => {
        const request = {
            viewID: props.viewID,
            startDate,
            endDate,
            metrics: "ga:users",
            dimensions: ["ga:source", "ga:date"],
        };
        setTimeout(
            () =>
                queryReport(request)
                    .then((resp) => displayResults(resp))
                    .catch((error) => console.error(error)),
            1100
        );
    }, [startDate, endDate]);

    return (
        <Box mb={"20"} w={["90vw", "80vw"]}>
            <VStack justifyContent={"center"} alignItems={"center"}>
                <Heading>Top 5 Sources of Visits</Heading>
                <Text>{`Total sources - ${totalSources}`}</Text>
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
                {reportData && (
                    <Flex justifyContent={"center"} w={"full"}>
                        <Bar
                            data={data}
                            width={100}
                            height={250}
                            options={options}
                        />
                    </Flex>
                )}
            </Flex>
        </Box>
    );
};

export default SourcesReport;
