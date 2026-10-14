import Constants from 'expo-constants';

const AppConfig = {
  ApiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5020/",
  SocketBaseUrl: process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:5020/",
  ApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "",
  STRIPE_PUBLIC_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY || "",
};

export default AppConfig;
