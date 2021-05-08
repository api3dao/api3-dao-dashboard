import React, { createContext, useState, useMemo, useContext } from 'react';
import { initialSettableChainData, initialChainData } from './state';

export const ChainDataContext = createContext(initialSettableChainData);

const ChainDataContextProvider: React.FC = ({ children }) => {
  const [chainData, setChainData] = useState(initialChainData);

  const settableChainData = useMemo(
    () => ({
      ...chainData,
      setChainData,
    }),
    [chainData, setChainData]
  );

  return <ChainDataContext.Provider value={settableChainData}>{children}</ChainDataContext.Provider>;
};

export default ChainDataContextProvider;

export const useChainData = () => useContext(ChainDataContext);
