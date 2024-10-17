import { axiosPrivate } from "../api/axios";

let requestIntercept: number | null = null;
let responseIntercept: number | null = null;
const cleanupInterceptors = () => {
  if (requestIntercept !== null) {
    axiosPrivate.interceptors.request.eject(requestIntercept);
    requestIntercept = null;
  }

  if (responseIntercept !== null) {
    axiosPrivate.interceptors.response.eject(responseIntercept);
    responseIntercept = null;
  }
};

const useAxios = () => {
  cleanupInterceptors();

  const storedAuth = localStorage.getItem("auth");
  const initialAuth = storedAuth ? JSON.parse(storedAuth) : {};

  requestIntercept = axiosPrivate.interceptors.request.use(
    (config) => {
      if (!config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${initialAuth?.accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  responseIntercept = axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      //const prevRequest = error?.config;
      // if (error?.response?.status === 403 && !prevRequest?.sent) {
      //   prevRequest.sent = true;
      //   const newAccessToken = await refresh();
      //   prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      //   return axiosPrivate(prevRequest);
      // }
      //console.log("axios error", error);
      //showErrorAlert(error.message);
      return Promise.reject(error);
    }
  );

  return axiosPrivate;
};
export default useAxios;
