import axios from "axios";
export const BASE_URL = "https://plum-village.azurewebsites.net/api";
export default axios.create({
  baseURL: BASE_URL,
});
export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
  withCredentials: true,
});
