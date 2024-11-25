import pino from 'pino';

const baseLogger = pino({
    level: process.env['LOG_LEVEL'] || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'yyyy-mm-dd HH:MM:ss'
        }
    }
});

export const logger = (context: string) => baseLogger.child({ context });
export default baseLogger;
