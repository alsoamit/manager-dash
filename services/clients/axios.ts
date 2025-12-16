import fetchToken from "@/utils/fetchToken";
import axios, { AxiosRequestHeaders, AxiosInstance } from "axios";

export interface IAuthServerError {
  msg: string;
  status: number;
}

function createAuthClient(baseURL: string): AxiosInstance {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use(
    async (config) => {
      const token = await fetchToken();
      if (token) {
        config.headers = {
          ...(config.headers ?? {}),
          Authorization: `Bearer ${token}`,
        } as AxiosRequestHeaders;
      }

      const isFormData = config.data instanceof FormData;
      if (!isFormData) {
        config.headers = {
          ...(config.headers ?? {}),
          "Content-Type": "application/json",
        } as AxiosRequestHeaders;
      } else {
        if (config.headers) {
          delete (config.headers as any)["Content-Type"];
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
}

export const server = createAuthClient(process.env.NEXT_PUBLIC_API_URL!);

export default server;
