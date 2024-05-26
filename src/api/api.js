import axios from "axios";
import { message } from "antd";

const instance = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Add a response interceptor
instance.interceptors.response.use(
  (config) => {
    console.log("🚀 ~ config:", config);
    if (config.config.method !== "get") {
      message.success(config.data.message);
    }
    return config.data;
  },
  (error) => {
    message.error(error.response.data.message);
  }
);

export default instance;
