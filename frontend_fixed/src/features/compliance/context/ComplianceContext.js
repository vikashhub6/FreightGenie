// features/compliance/context/ComplianceContext.js
import { createContext, useContext, useState } from "react";

const ComplianceContext = createContext();

export const ComplianceProvider = ({ children }) => {
  const [compliance, setCompliance] = useState(null);

  return (
    <ComplianceContext.Provider value={{ compliance, setCompliance }}>
      {children}
    </ComplianceContext.Provider>
  );
};

export const useComplianceContext = () => useContext(ComplianceContext);
