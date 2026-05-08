// features/email/context/EmailContext.js
import { createContext, useContext, useState } from "react";

const EmailContext = createContext();

export const EmailProvider = ({ children }) => {
  const [emailDraft, setEmailDraft] = useState({ subject: "", body: "" });

  return (
    <EmailContext.Provider value={{ emailDraft, setEmailDraft }}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmailContext = () => useContext(EmailContext);
