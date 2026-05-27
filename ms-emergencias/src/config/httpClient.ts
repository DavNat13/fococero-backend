import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { envs } from './envs';

declare module 'axios' {
    interface InternalAxiosRequestConfig {
        metadata?: { startTime: number };
    }
    interface AxiosResponse {
        duration_ms?: number;
    }
}

const isIdempotentMethod = (method?: string): boolean => {
    return ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'].includes(
        (method || 'GET').toUpperCase(),
    );
};

const retryDelay = (retryCount: number): number => {
    const baseDelay = Math.min(1000 * 2 ** retryCount, 10000);
    return baseDelay + Math.random() * 1000;
};

export const externalHttpClient: AxiosInstance = axios.create({
    timeout: envs.AXIOS_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

axiosRetry(externalHttpClient, {
    retries: envs.MAX_RETRIES,
    retryDelay,
    retryCondition: (error) => {
        return (
            (axiosRetry.isNetworkOrIdempotentRequestError(error) &&
                isIdempotentMethod(error.config?.method)) ||
            (error.response?.status ? error.response.status >= 500 : false)
        );
    },
});

externalHttpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.metadata = { startTime: Date.now() };

    if (config.params?.correlation_id) {
        config.headers['X-Correlation-ID'] = config.params.correlation_id;
    }

    return config;
});

externalHttpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        const startTime = response.config.metadata?.startTime;
        if (startTime) response.duration_ms = Date.now() - startTime;
        return response;
    },
    (error) => {
        const startTime = error.config?.metadata?.startTime;
        if (startTime) error.duration_ms = Date.now() - startTime;
        return Promise.reject(error);
    },
);

export const httpClient: AxiosInstance = axios.create({
    timeout: envs.AXIOS_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

axiosRetry(httpClient, {
    retries: envs.MAX_RETRIES,
    retryDelay,
    retryCondition: (error) => {
        return (
            (axiosRetry.isNetworkOrIdempotentRequestError(error) &&
                isIdempotentMethod(error.config?.method)) ||
            (error.response?.status ? error.response.status >= 500 : false)
        );
    },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers['X-Internal-Token'] = envs.INTERNAL_SECRET_TOKEN;
    config.metadata = { startTime: Date.now() };

    if (config.params?.correlation_id) {
        config.headers['X-Correlation-ID'] = config.params.correlation_id;
    }

    return config;
});

httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        const startTime = response.config.metadata?.startTime;
        if (startTime) response.duration_ms = Date.now() - startTime;
        return response;
    },
    (error) => {
        const startTime = error.config?.metadata?.startTime;
        if (startTime) error.duration_ms = Date.now() - startTime;
        return Promise.reject(error);
    },
);
