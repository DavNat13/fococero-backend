import { Eureka } from 'eureka-js-client';
import { envs } from './envs';
import { Logger } from '../helpers/logger';

export const eurekaClient = new Eureka({
    instance: {
        app: 'ms-emergencias',
        hostName: process.env.HOSTNAME || 'ms-emergencias',
        ipAddr: '127.0.0.1',
        // Usamos el puerto desde nuestras envs estandarizadas
        statusPageUrl: `http://${process.env.HOSTNAME || 'ms-emergencias'}:${envs.PORT}/health`,
        port: {
            '$': envs.PORT,
            '@enabled': true,
        },
        vipAddress: 'ms-emergencias',
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

// Helper para inicializar con logs estandarizados
export const initEureka = () => {
    eurekaClient.start((error) => {
        if (error) {
            Logger.error('❌ Error al registrar ms-emergencias en Eureka:', error);
        } else {
            Logger.info('✅ ms-emergencias registrado exitosamente en Eureka Server');
        }
    });
};