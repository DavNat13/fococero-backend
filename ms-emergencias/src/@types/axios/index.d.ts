import 'axios';

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        metadata?: { startTime: number };
    }
    export interface AxiosResponse {
        duration_ms?: number;
    }
    export interface AxiosError {
        duration_ms?: number;
    }
}
