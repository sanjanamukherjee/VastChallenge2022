import React from "react";
import BaseMap from "./charts/BaseMap";
import Candle from "./charts/Candle";
import ParallelAxis from "./charts/ParallelAxis";
import PieChart from "./charts/PieChart";
import SocialNetwork from "./charts/SocialNetwork";
import Beeswarm from "./charts/Beeswarm";
import Spider from "./charts/Spider";

import GlobalFilter from "./GlobalFilter";

const MainComponent = () => {
    return (
        <div className="main-component" style={{ display: "flex", flexDirection: "column" }}>
            <GlobalFilter />
            <div className="heading-text" style={{ marginTop: "10%" }}>Business Landscape Analysis</div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: "20px" }}>
                <Beeswarm />
            </div>
            <div className="heading-text" style={{ marginTop: "100px" }}>Exploring Real Estate of the city</div>
            <div style={{ display: "flex", flexDirection: "row", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "20px", alignItems: "center", marginTop: "20px" }}>
                <BaseMap />
                <Candle />
            </div>
            <div className="heading-text" style={{ marginTop: "100px" }}>Discovering Demographic Relationships</div>
            <div style={{ borderRadius: "20px", alignItems: "center", margin: "10px", marginTop: "20px" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <ParallelAxis />
                    <PieChart />
                </div>
                <SocialNetwork />
            </div>
            {/* <Spider/> */}

        </div>
    )
}

export default MainComponent;
