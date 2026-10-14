import axios from "axios";
import AppConfig from "../AppConfig";
const instance = axios.create({
  baseURL: `${AppConfig.ApiUrl}`,
  timeout: 1000000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
const responseBody = (response) => response.data;
const requests = {
  get: (url, body, headers) =>
    instance.get(url, body, headers).then(responseBody),
  post: (url, body) => instance.post(url, body).then(responseBody),
  put: (url, body, headers) =>
    instance.put(url, body, headers).then(responseBody),
  patch: (url, body) => instance.patch(url, body).then(responseBody),
  delete: (url) => instance.delete(url).then(responseBody),
};
export default requests;