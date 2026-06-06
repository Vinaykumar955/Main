import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { AppError, type AppErrorCode } from "@/lib/errors";
import { useAuthStore } from "@/store/authStore";

interface ErrorBody {
  message?: string;
  code?: AppErrorCode;
  errors?: unknown;
}

const codeMap: Record<number, AppErrorCode> = {
  400: "VALIDATION",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "RATE_LIMITED",
};

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      throw new AppError({ code: "ABORTED", message: "Request cancelled" });
    }
    if (error.code === "ECONNABORTED") {
      throw new AppError({ code: "TIMEOUT", message: "Request timed out" });
    }
    if (!error.response) {
      throw new AppError({ code: "NETWORK", message: "Network unavailable" });
    }

    const { status, data } = error.response;
    const code = data?.code ?? codeMap[status] ?? "SERVER";
    const message = data?.message ?? error.message ?? "Request failed";

    if (status === 401) {
      useAuthStore.getState().signOut();
    }

    throw new AppError({ code, message, status, details: data?.errors });
  },
);

/**
 * Typed fetcher — accepts a URL + config, unwraps the data envelope.
 */
export async function fetcher<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api.request<T>(config);
  return response.data;
}

export type { AxiosRequestConfig };
