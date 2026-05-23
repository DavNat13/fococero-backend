// import Eureka from 'eureka-js-client';
// import { envs } from './envs';

// ==========================================
// 📡 Cliente Eureka para Service Discovery
// ==========================================
// Configuracion para registrar el microservicio
// en el servidor Eureka de FocoCero

// export const initEurekaClient = (appName: string, port: number) => {
//     const eurekaClient = new Eureka({
//         instance: {
//             instanceId: `${appName}:${port}`,
//             app: appName.toUpperCase(),
//             hostName: process.env.HOST || 'localhost',
//             ipAddr: '127.0.0.1',
//             port: {
//                 '$': port,
//                 '@enabled': true,
//             },
//             vipAddress: appName,
//             dataCenterInfo: {
//                 '@class': 'com.netflix.app.dataCenters.LocalDataCenterInfo',
//                 name: 'MyOwn',
//             },
//         },
//         eureka: {
//             host: envs.EUREKA_HOST,
//             port: envs.EUREKA_PORT,
//             fetchRegistry: true,
//             registerWithEureka: true,
//             heartbeatInterval: 30000,
//         },
//     });

//     eurekaClient.on('registered', () => {
//         console.log(`📡 ${appName} registrado en Eureka`);
//     });

//     eurekaClient.on('deregistered', () => {
//         console.log(`📡 ${appName} deregistrado de Eureka`);
//     });

//     eurekaClient.start((err: Error) => {
//         if (err) {
//             console.error('❌ Error al iniciar Eureka Client:', err);
//         } else {
//             console.log(`✅ ${appName} conectado a Eureka en ${envs.EUREKA_HOST}:${envs.EUREKA_PORT}`);
//         }
//     });

//     return eurekaClient;
// };