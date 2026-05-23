import { Eureka } from 'eureka-js-client';
import { envs } from './envs';

// Configuración centralizada de la instancia
export const eurekaClient = new Eureka({
    instance: {
        app: 'ms-analitica',
        hostName: process.env.HOSTNAME || 'ms-analitica',
        ipAddr: '127.0.0.1',
        // URL de salud configurada en app.ts
        statusPageUrl: `http://${process.env.HOSTNAME || 'ms-analitica'}:${envs.PORT}/health`,
        port: {
            '$': envs.PORT as number,
            '@enabled': true,
        },
        vipAddress: 'ms-analitica',
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

/**
 * Inicializa la conexión con el servidor de descubrimiento.
 * Implementa reintentos automáticos por defecto de la librería.
 */
export const initEureka = (): void => {
    eurekaClient.start((error) => {
        if (error) {
            console.error('❌ [EUREKA] Fallo crítico en el registro:', error.message);
        } else {
            console.log('✅ [EUREKA] Microservicio registrado en la malla con éxito.');
        }
    });
};