import React, { useContext } from "react";

import { Data } from "../../Context";

const SocialNetwork = () => {
    const { data } = useContext(Data);
    return (
        <div>
            Social Network Chart
            {console.log(data)}
        </div>
    )
}

export default SocialNetwork;