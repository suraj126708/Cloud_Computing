import axios from "axios";
const local_api = "http://localhost:5000";
// const production_api = ''

const token = localStorage.getItem("canva_token");

const api = axios.create({
  baseURL: local_api,
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
  // withCredentials is removed because this app stores the token in localStorage
  // and does not use cookies. Sending credentials requires the server to
  // return a non-wildcard Access-Control-Allow-Origin header when
  // credentials mode is 'include'. Removing this avoids CORS preflight failures.
});

export default api;
