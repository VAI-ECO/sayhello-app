import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useLocation } from "../Context/LocationContext";
import { I18nextProvider } from "react-i18next";
import { initI18n, LANGUAGE_PREFERENCE } from "../Context/i18n.js";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import DrawerNavigator from "./DrawerNavigator.jsx";

function AppNavigation() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const { user, isInNotificationFlow, notRightnow } = useAuth();
  const { location } = useLocation();
  const navigation = useNavigation();
  const [nearbyData, setNearbyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  return (
    <>
      {/* <I18nextProvider i18n={i18n}> */}
      <DrawerNavigator />
      <Toast />
      {/* </I18nextProvider> */}
    </>
  );
}

export default AppNavigation;
