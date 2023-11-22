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
        <div>
            <GlobalFilter/>
            <BaseMap/>
            <Candle/>
            <ParallelAxis/>
            <PieChart/>
            <SocialNetwork/>
            <Beeswarm/>
            <Spider/>
        </div>
    )
}

export default MainComponent;
