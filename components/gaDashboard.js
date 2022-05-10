import React, { useState } from "react";
import SourcesReport from "./gaPageviews";
import PageviewsReport from "./gaPerPageView";
import DayVisitsReport from "./gaActiveUsers";

const Dashboard = () => {
    //const viewID = process.env.GA_VIEW_ID;//
    const viewID = "263993063";
    return (
        <>
            <>
                <DayVisitsReport
                    metric={"ga:users"}
                    title={"Users"}
                    viewID={viewID}
                />
                <PageviewsReport viewID={viewID} />
                <SourcesReport viewID={viewID} />
            </>
        </>
    );
};

export default Dashboard;
