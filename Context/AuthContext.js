import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthServices from "../Services/authService"; // Import AuthServices to execute API calls
import { useNavigation } from "@react-navigation/native";
import LocationContextService from "../Services/LocationContextService";
import axios from "axios";
import AppConfig from "../AppConfig";
import Toast from "react-native-toast-message";
import requests from "../Services/httpservice";
import { Platform } from "react-native";
// import { useLocation } from "./LocationContext";

// ========================================
// DEV BYPASS - TEMPORARY FOR WEB PREVIEW
// Remove this flag before production!
// ========================================
const DEV_BYPASS_LOGIN = Platform.OS === 'web'; // Only activate on web preview

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // const { location } = useLocation();

  const [user, setUser] = useState(null);
  const [isInNotificationFlow, setIsInNotificationFlow] = useState(false);
  const [notRightnow, setnotRightNow] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ========================================
        // DEV BYPASS - TEMPORARY FOR WEB PREVIEW
        // ========================================
        if (DEV_BYPASS_LOGIN) {
          console.log('[DEV BYPASS] Auto-logging in for web preview...');
          const mockUserData = {
            token: 'dev_bypass_token_web_preview_only',
            user: {
              _id: 'web_preview_user_123',
              email: 'webpreview@example.com',
              name: 'Web Preview User',
              firstName: 'Web',
              lastName: 'Preview',
              phone: '+1234567890',
              profileImage: null,
              Status: 'Active',
              isEmailVerified: true,
              createdAt: new Date().toISOString(),
            }
          };
          await AsyncStorage.setItem("userData", JSON.stringify(mockUserData));
          setUser(mockUserData);
          setIsLoading(false);
          return;
        }
        // ========================================
        // END DEV BYPASS
        // ========================================

        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      let login_body = {
        email: email,
        password: password,
      };
      const response = await AuthServices.SignIn(login_body);
      const userData = response;

      
      if (userData?.user?.Status === "User Deleted the account") {
        Toast.show({
          type: "error",
          text1: "This Account is deleted by the user",
        });
        return;
      }

      setUser(userData);

      if (userData) {
        let dataToken = await AsyncStorage.getItem("expoPushToken");
        let dataDeviceToken = await AsyncStorage.getItem("expoPushTokenDevice");


        const user_id = userData?.user?._id;
        const body = {
          notificationToken: dataDeviceToken,
          notificaionExpoToken: dataToken,
        };
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        // await AsyncStorage.setItem("authToken",JSON.stringify(userData?.token));


        AuthServices.SaveNotification(user_id, body)
          .then(async (res) => {
            let unParsedLocation = await AsyncStorage.getItem("newLocation");
            console.log("unParsedLocation: ", unParsedLocation)
            let newLocation = JSON.parse(unParsedLocation);

            if (newLocation) {
              let body = {
                email: userData?.user?.email,
                latitude: newLocation?.coords?.latitude,
                longitude: newLocation?.coords?.longitude,
              };
              console.log("body in authcontext is :", body)
              requests
                .post(`${AppConfig.ApiUrl}api/v1/users/saveLocation`, body)
                .then((res) => 
                  console.log("response",res)
              )
                .catch((err) => console.log("err in savelocation, ", err));
            }
          })
          .catch((err) => console.log("err in savig notification", err));
      }

      return userData;
    } catch (error) {
      console.log(error.message);
      throw new Error(error);
    }
  };

  const signUp = async (user_data) => {
    try {
      const userData = user_data;

      setUser(userData);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.log("error", error);
      throw new Error(error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      // await AsyncStorage.removeItem('authToken')
      setUser(null);
      setnotRightNow([]);
      setIsInNotificationFlow(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateUser = async (updates) => {
    try {
      if (!user || !user.user) {
        throw new Error("User data not found or corrupted.");
      }

      // Create a new user object with updated fields
      const updatedUser = {
        ...user,
        user: {
          ...user.user,
          ...updates,
        },
      };

      console.log("Updated user data: ", JSON.stringify(updatedUser));

      // Store the updated user data back into AsyncStorage
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

      // Update the state with the new user data
      setUser(updatedUser);
    } catch (error) {
      console.log("Error updating user", error);
    }
  };

  const replaceUser = async (newUserData) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(newUserData));
      setUser(newUserData);
    } catch (error) {
      console.log("error replacing user", error);
    }
  };

  const startNotificationFlow = () => {
    setIsInNotificationFlow(true);
  };

  const endNotificationFlow = () => {
    setIsInNotificationFlow(false);
  };
  const addIdToNotRightNow = (id) => {
    setnotRightNow((prevIds) => {
      if (!prevIds.includes(id)) {
        const updatedIds = [...prevIds, id];

        return updatedIds;
      } else {
        return prevIds;
      }
    });
  };

  const values = {
    user,
    notRightnow,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser,
    isInNotificationFlow,
    startNotificationFlow,
    endNotificationFlow,
    addIdToNotRightNow,
    replaceUser,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
