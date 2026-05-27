import 'express';

declare module 'express' {
    interface Request {
        correlationId?: string;
        signal?: AbortSignal;
    }
}
