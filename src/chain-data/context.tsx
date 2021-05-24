import React, { createContext, useState, useMemo, useContext } from 'react';
import { initialSettableChainData, initialChainData, SettableChainData } from './state';

export const ChainDataContext = createContext(initialSettableChainData);

const ChainDataContextProvider: React.FC = ({ children }) => {
  const [chainData, setChainData] = useState(initialChainData);

  const loggableSetChainData = useMemo(() => {
    // TODO: require an argument to simplify debugging and who is the caller of the function
    const setter: SettableChainData['setChainData'] = (reason, dataOrCallback) => {
      setChainData((oldChainData) => {
        const newChainData = typeof dataOrCallback === 'function' ? dataOrCallback(oldChainData) : dataOrCallback;
        const updatedChainData = { ...oldChainData, ...newChainData };

        if (process.env.NODE_ENV === 'development') {
          console.group(reason);
          console.info(updatedChainData);
          console.groupEnd();
        }

        return updatedChainData;
      });
    };

    return setter;
  }, []);

  return (
    <ChainDataContext.Provider value={{ ...chainData, setChainData: loggableSetChainData }}>
      {children}
    </ChainDataContext.Provider>
  );
};

export default ChainDataContextProvider;

export const useChainData = () => useContext(ChainDataContext);
