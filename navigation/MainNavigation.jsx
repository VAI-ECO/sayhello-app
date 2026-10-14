import React, { useEffect, useState } from "react";
import { useLocation } from "../Context/LocationContext";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../Context/AuthContext";
import TabNavigator from "./TabNavigator";

const MainNavigation = () => {
  const { nearbyData } = useLocation();
  const { user } = useAuth();

  const navigation = useNavigation();
  // const router = useRoute();

  useEffect(() => {
    if (user !== null) {
      console.log("User is not available");
    }
  }, []);

  return <TabNavigator />;
};

export default MainNavigation;
