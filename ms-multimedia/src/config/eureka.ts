import { Eureka } from 'eureka-js-client';
import { envs } from './envs';
import { logger } from './logger';

export const eurekaClient = new Eureka({
    instance: {
        app: 'ms-multimedia',
        hostName: process.env.HOSTNAME || 'ms-multimedia',
        ipAddr: '127.0.0.1',
        statusPageUrl: `http://${process.env.HOSTNAME || 'ms-multimedia'}:${envs.PORT}/health`,
        port: {
            '$': envs.PORT as number,
            '@enabled': true,
        },
        vipAddress: 'ms-multimedia',
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
        host: process.env.EUREKA_HOST || 'eureka-server',
        port: parseInt(process.env.EUREKA_PORT || '8761', 10),
        servicePath: '/eureka/apps/',
    },
});

export const initEureka = (): void => {
    eurekaClient.start((error) => {
        if (error) {
            logger.error('❌ [EUREKA] Fallo crítico en el registro:', error.message);
        } else {
            logger.info('✅ [EUREKA] Microservicio registrado en la malla con éxito.');
        }
    });
};