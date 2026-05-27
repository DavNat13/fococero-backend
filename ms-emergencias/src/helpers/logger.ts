import pino from 'pino';
import { envs } from '../config/envs';

const pinoLogger = pino({
    level: envs.NODE_ENV === 'test' ? 'silent' : 'info',
    transport:
        envs.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
});

export class Logger {
    static info(message: string, context: string = 'App') {
        pinoLogger.info({ context }, message);
    }

    static success(message: string, context: string = 'App') {
        pinoLogger.info({ context }, `✅ ${message}`);
    }

    static warn(message: string, context: string = 'App') {
        pinoLogger.warn({ context }, message);
    }

    static error(message: string, error?: unknown, context: string = 'App') {
        pinoLogger.error({ context, err: error }, message);
    }
}
