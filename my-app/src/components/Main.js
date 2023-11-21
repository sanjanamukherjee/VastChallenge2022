import React from "react";
import BaseMap from "./charts/BaseMap";
import Candle from "./charts/Candle";
import ParallelAxis from "./charts/ParallelAxis";
import PieChart from "./charts/PieChart";
import SocialNetwork from "./charts/SocialNetwork";
import Innovative from "./charts/Innovative";

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
            <Innovative/>
        </div>
    )
}

export default MainComponent;