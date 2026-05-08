// features/shipment/context/ShipmentContext.js
import { createContext, useContext, useState } from "react";

const ShipmentContext = createContext();

export const ShipmentProvider = ({ children }) => {
  const [shipments, setShipments] = useState([]);
  const [activeShipment, setActiveShipment] = useState(null);

  return (
    <ShipmentContext.Provider value={{ shipments, setShipments, activeShipment, setActiveShipment }}>
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipmentContext = () => useContext(ShipmentContext);
