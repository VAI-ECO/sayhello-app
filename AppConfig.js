import Constants from 'expo-constants';

const AppConfig = {
  ApiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.sayhello.world/",
  SocketBaseUrl: process.env.EXPO_PUBLIC_SOCKET_URL || "https://api.sayhello.world/",
  ApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "",
  STRIPE_PUBLIC_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY || "",
};

export default AppConfig;
