const withTrailingSlash = (url) => `${url.replace(/\/+$/, '')}/`;
const AppConfig = {
  ApiUrl: withTrailingSlash(process.env.EXPO_PUBLIC_API_URL || "http://localhost:5020/"),
  SocketBaseUrl: withTrailingSlash(process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL || "http://localhost:5020/"),
  ApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || "",
  STRIPE_PUBLIC_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY || "",
};

export default AppConfig;
