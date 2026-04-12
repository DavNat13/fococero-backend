import { envs } from '../config/envs';

const colors = {
    INFO: '\x1b[36m', // Cyan
    SUCCESS: '\x1b[32m', // Verde
    WARN: '\x1b[33m', // Amarillo
    ERROR: '\x1b[31m', // Rojo
    DEBUG: '\x1b[35m', // Magenta
    RESET: '\x1b[0m',
    DIM: '\x1b[2m', // Grisáceo
};

export class Logger {
    private static formatMessage(level: keyof typeof colors, message: string, context?: string) {
        const timestamp = new Date().toISOString();
        const color = colors[level];
        const ctxStr = context ? `\x1b[33m[${context}]\x1b[0m ` : '';

        if (envs.NODE_ENV === 'production') {
            return JSON.stringify({ timestamp, level, context, message });
        }

        return `${colors.DIM}${timestamp}${colors.RESET} ${color}[${level}]${colors.RESET} ${ctxStr}${message}`;
    }

    static info(message: string, context: string = 'App') {
        console.log(this.formatMessage('INFO', message, context));
    }

    static success(message: string, context: string = 'App') {
        console.log(this.formatMessage('SUCCESS', message, context));
    }

    static warn(message: string, context: string = 'App') {
        console.warn(this.formatMessage('WARN', message, context));
    }

    static error(message: string, error?: unknown, context: string = 'App') {
        console.error(this.formatMessage('ERROR', message, context));
        if (error && envs.NODE_ENV !== 'production') {
            console.error(error);
        }
    }
}
