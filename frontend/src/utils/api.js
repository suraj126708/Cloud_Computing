import axios from "axios";
// const local_api = "https://mi3w6bx3f6.execute-api.us-east-1.amazonaws.com/dev/";
const local_api = "http://localhost:3000/";
// const production_api = ''

const api = axios.create({
  baseURL: local_api,
  // withCredentials is removed because this app stores the token in localStorage
  // and does not use cookies. Sending credentials requires the server to
  // return a non-wildcard Access-Control-Allow-Origin header when
  // credentials mode is 'include'. Removing this avoids CORS preflight failures.
});

// Add request interceptor to dynamically set the Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("canva_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Ensure Content-Type is set for JSON requests (if not already set)
  if (
    config.data &&
    typeof config.data === "object" &&
    !(config.data instanceof FormData)
  ) {
    if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
      config.headers["Content-Type"] = "application/json";
    }
  }

  // Log request details
  console.log("=== API REQUEST ===");
  console.log("URL:", config.baseURL + config.url);
  console.log("Method:", config.method?.toUpperCase());
  console.log("Headers:", config.headers);
  console.log("Data:", config.data);
  console.log("==================");

  return config;
});

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log("=== API RESPONSE SUCCESS ===");
    console.log("URL:", response.config.url);
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("Data:", response.data);
    console.log("Headers:", response.headers);
    console.log("============================");
    return response;
  },
  (error) => {
    // Log error response
    console.error("=== API RESPONSE ERROR ===");
    console.error("URL:", error.config?.url);
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Error Data:", error.response?.data);
    console.error("Error Headers:", error.response?.headers);
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    console.error("==========================");
    return Promise.reject(error);
  }
);

export default api;
