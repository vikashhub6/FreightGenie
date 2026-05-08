// features/exporter/context/ExporterContext.js
import { createContext, useContext, useState } from "react";

const ExporterContext = createContext();

export const ExporterProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({ name: "", company: "", phone: "", address: "" });
  const [files, setFiles] = useState([]);

  return (
    <ExporterContext.Provider value={{ step, setStep, details, setDetails, files, setFiles }}>
      {children}
    </ExporterContext.Provider>
  );
};

export const useExporterContext = () => useContext(ExporterContext);
