// src/config/eureka.client.ts
import { Eureka } from 'eureka-js-client';
import { logger } from './logger';

export const initEurekaClient = (appName: string, port: number) => {
  const eurekaHost = process.env.EUREKA_HOST || 'localhost';
  
  const instanceHost = eurekaHost === 'localhost' ? 'localhost' : appName;

  const client = new Eureka({
    instance: {
      app: appName.toUpperCase(),
      hostName: instanceHost, 
      ipAddr: instanceHost,   
      statusPageUrl: `http://${instanceHost}:${port}/health`, // Actualizado a tu endpoint real
      port: {
        '$': port,
        '@enabled': true,
      },
      vipAddress: appName,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    eureka: {
      host: eurekaHost,
      port: 8761,
      servicePath: '/eureka/apps/',
      maxRetries: 10,
      requestRetryDelay: 2000,
    },
  });

  client.start((error) => {
    if (error) {
      logger.error(`[Eureka Error] ${appName} falló al conectar con ${eurekaHost}:8761 -> ${error.message}`);
    } else {
      logger.info(`[Eureka Success] ${appName} registrado exitosamente en la malla.`);
    }
  });

  process.on('SIGINT', () => {
    client.stop(() => process.exit());
  });

  return client;
};