import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { BackHandler, Platform } from "react-native";
import * as Location from "expo-location";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { AuthProvider } from "./Context/AuthContext";
import { LocationProvider } from "./Context/LocationContext";

import "react-native-reanimated";
import "react-native-gesture-handler";

import AppNavigation from "./navigation/AppNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreenComponent from "./Screens/SplashScreen";
import { StripeProvider } from "@stripe/stripe-react-native";
import { LanguageProvider } from "./Context/LanguageContext";
import { STRIPE_PUBLIC_KEY } from "@env";
import * as Linking from 'expo-linking';
import { Provider } from "react-redux";
import { store } from "./features";
import LocationPermissionModal from "./Component/LocationPermissionModal";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://288c5b4f4ea7dbd818bf851cadf1ba43@o4509261250428928.ingest.us.sentry.io/4509272353931264',
  sendDefaultPii: true,
  profilesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  tracesSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.mobileReplayIntegration(
    {maskAllText: false,
    maskAllImages: false,
    maskAllVectors: false}
  )],
});

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const prefix = Linking.createURL("/");

function App() {
  const linking = {
    // prefixes: [
    //   "https://say-hello.atlassian.net/jira/software/projects/SH/boards/1",
    // ],
    prefixes: ['https://say-hello-882cc.web.app/', 'sayhello://'],
    // config: {
    //   screens: {
    //     SignUp: {
    //       path: 'SignUp/:referalcode',
    //     },
    //   },
    // },
};


  const [isFontLoaded, setFontLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Location
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Notification
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [showPermissionInfoModal, setShowPermissionInfoModal] = useState(false); // Modal state

  useEffect(() => {
    const backAction = () => {
      if (showPermissionInfoModal) {
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      backHandler.remove();
    };
  }, [showPermissionInfoModal]);

  useEffect(() => {
    const checkPermission = async () => {
      let { status } = await Location.getForegroundPermissionsAsync();
      console.log('====================================');
      console.log("Location :", status);
      console.log('====================================');
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
      else {
        setShowPermissionInfoModal(true);
      }
    };

    checkPermission();


    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => { });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        "Roboto-Regular": require("./assets/font/Roboto-Regular.ttf"),
        "Roboto-Bold": require("./assets/font/Roboto-Bold.ttf"),
        Dreaming: require("./assets/font/Dreaming.ttf"),
        "Inter-Regular": require("./assets/interfont/Inter-Regular.otf"),
        "Assistant-Regular": require("./assets/assistant/Assistant-Regular.ttf"),
        "Stay Dreaming": require("./assets/Dreaming/StayDreaming.otf"),
      });

      setFontLoaded(true);
      await SplashScreen.hideAsync();
      setTimeout(() => {
        setShowSplash(false);
      }, 2000);
    };

    loadFont();
  }, []);

  if (!isFontLoaded || showSplash) {
    return <SplashScreenComponent />;
  }

  const handlePermissionClose = () => {
    BackHandler.exitApp();
  };

  const handlePermissionConfirm = async () => {
    setShowPermissionInfoModal(false);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } else {
      setShowPermissionInfoModal(false);
    }
  };

  return (
    <>
      {showPermissionInfoModal ? (

        <LocationPermissionModal
          visible={showPermissionInfoModal}
          onClose={handlePermissionClose}
          onConfirm={handlePermissionConfirm}
        />
      ) : (


        <Provider store={store}>
          <LanguageProvider>
            <StripeProvider publishableKey={STRIPE_PUBLIC_KEY}>
              <AuthProvider>
                <NavigationContainer linking={linking}>
                  <LocationProvider>
                    <AppNavigation />
                  </LocationProvider>
                  <StatusBar style="dark" backgroundColor="#fff" />
                </NavigationContainer>
              </AuthProvider>
            </StripeProvider>
            {/* </RootSiblingParent> */}
          </LanguageProvider>
          <Toast />
        </Provider>
      )}


    </>
  );
}

export default Sentry.wrap(App);

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    try {
      const existingToken = await AsyncStorage.getItem("expoPushToken");
      const existingTokenDevice = await AsyncStorage.getItem(
        "expoPushTokenDevice"
      );

      if (!existingToken || !existingTokenDevice) {
        const projectId = "5bb28858-ded5-4c0c-8330-597451787450";

        if (!projectId) {
          throw new Error("Project ID not found");
        }

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        let tokenDevice = (await Notifications.getDevicePushTokenAsync()).data;

        await AsyncStorage.setItem("expoPushToken", token);
        await AsyncStorage.setItem("expoPushTokenDevice", tokenDevice);
      } else {
        console.log("Token already exists in AsyncStorage");
        token = existingToken;
      }
    } catch (e) {
      token = `${e}`;
      console.log("Error in generating token: ", e);
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}