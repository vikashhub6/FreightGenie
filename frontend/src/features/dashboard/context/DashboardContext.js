// features/dashboard/context/DashboardContext.js
import { createContext, useContext, useState } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [shipments, setShipments] = useState([]);

  return (
    <DashboardContext.Provider value={{ shipments, setShipments }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => useContext(DashboardContext);
