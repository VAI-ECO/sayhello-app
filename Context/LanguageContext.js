import React, { createContext, useState } from "react";
import i18n from "./i18n"; // Assuming your i18n.js file is set up correctly

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(i18n.locale);

  const changeLanguage = (languageCode) => {
    i18n.locale = languageCode; // Set the new language
    setLocale(languageCode); // Update the locale in state
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
