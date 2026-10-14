import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as Location from "expo-location";
import axios from "axios";
import { useAuth } from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppConfig from "../AppConfig";
import { useNavigation } from "@react-navigation/native";
import requests from "../Services/httpservice";

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const { user, isInNotificationFlow, notRightnow } = useAuth();
  const navigation = useNavigation();

  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [nearbyData, setNearbyData] = useState(null);
  const [isAppearModalVisible, setIsAppearModalVisible] = useState(false);
  const [isClockModalVisible, setIsClockModalVisible] = useState(false);

  // Define distance threshold in kilometers
  const distanceThreshold = 0.002; // 2 meters

  // Memoize the getDistance function to prevent recreation on every render
  const getDistance = useCallback((coord1, coord2) => {
    const earthRadius = 6371; // Radius of the Earth in kilometers

    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const dLat = toRadians(coord2.latitude - coord1.latitude);
    const dLon = toRadians(coord2.longitude - coord1.longitude);

    const lat1 = toRadians(coord1.latitude);
    const lat2 = toRadians(coord2.latitude);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c; // Distance in kilometers
  }, []);

  const saveUserLocation = useCallback(
    async (locationData) => {
      if (!user?.user?.email) {
        return;
      }

      const body = {
        email: user.user.email,
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      };

      try {
        const response = await requests.post(
          `${AppConfig.ApiUrl}api/v1/users/saveLocation`,
          body
        );
      } catch (err) {
        console.error("Error saving user location:", err);
        setError(err);
      }
    },
    [user]
  );

  const getNearbyUsers = useCallback(async () => {
    if (!user?.user?._id) {
      return;
    }

    try {
      const response = await requests.get(
        `${AppConfig.ApiUrl}api/v1/users/${user.user._id}/nearby`
      );
      const filteredData = response.filter(
        (el) => el?._id && !notRightnow.includes(el._id)
      );
      setNearbyData(filteredData);
    } catch (err) {
      console.error("Error fetching nearby users:", err);
      setError(err);
    }
  }, [user, notRightnow]);

  useEffect(() => {
    if (nearbyData && nearbyData?.length > 0 && !isInNotificationFlow) {
      if (!isAppearModalVisible && !isClockModalVisible) {

        navigation.navigate("Notification", {
          screen: "InitialNotification",
          params: { latestNearBy: nearbyData[0] },
        });
      }
    }
  }, [nearbyData, isInNotificationFlow, navigation, isAppearModalVisible, isClockModalVisible]);

  useEffect(() => {
    let previousLocation = null;
    let locationSubscription = null;

    const handleLocationUpdate = async (newLocation) => {
      setLocation(newLocation);
      try {
        await AsyncStorage.setItem("newLocation", JSON.stringify(newLocation));
      } catch (storageError) {
        console.error("Error saving location to AsyncStorage:", storageError);
      }

      if (previousLocation) {
        const distance = getDistance(
          previousLocation.coords,
          newLocation.coords
        );
        if (distance >= distanceThreshold) {
          await saveUserLocation(newLocation);
          previousLocation = newLocation;
        }
      } else {
        previousLocation = newLocation;
      }
    };

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          setError(new Error("Location permission not granted"));
          return;
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced, // Reduced accuracy for better performance
            timeInterval: 5000, // 5 seconds
            distanceInterval: 5, // 5 meters
          },
          handleLocationUpdate
        );
      } catch (err) {
        console.error("Error starting location tracking:", err);
        setError(err);
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [getDistance, saveUserLocation]);

  // Throttle fetching nearby users to avoid excessive API calls
  useEffect(() => {
    if (!location) return;

    const fetchNearby = setTimeout(() => {
      console.log("useruseruser: ", user);
      if (user?.user?.user_type === "individual") {
        getNearbyUsers();
      }
    }, 5000); // Fetch every 5 seconds after location update

    return () => clearTimeout(fetchNearby);
  }, [location, getNearbyUsers]);

  const contextValue = useMemo(
    () => ({
      location,
      error,
      nearbyData,
      saveUserLocation,
      getNearbyUsers,
      isAppearModalVisible,
      setIsAppearModalVisible,
      isClockModalVisible,
      setIsClockModalVisible
    }),
    [location, error, nearbyData, saveUserLocation, getNearbyUsers, isAppearModalVisible, setIsAppearModalVisible, isClockModalVisible,
      setIsClockModalVisible]
  );

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};
