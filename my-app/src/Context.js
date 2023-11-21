import { createContext, useState } from 'react';

export const Data = createContext();

const DataProvider = ({children}) => {
    const [data, setData] = useState({Hello: "World"});

    return (
        <Data.Provider value={{
            data, setData        
        }}>
            {children}
        </Data.Provider>
    )
}

export default DataProvider;