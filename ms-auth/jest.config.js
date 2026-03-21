/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Le decimos a Jest que use ts-jest para traducir el código TypeScript
  preset: 'ts-jest',
  
  // Simulamos un entorno de servidor Node.js
  testEnvironment: 'node',
  
  // Le indicamos dónde buscar los archivos de prueba
  testMatch: ['**/tests/**/*.test.ts'],
  
  // Limpiamos los mocks entre cada prueba para que no se contaminen
  clearMocks: true,
  
  // Muestra el detalle de cada prueba en la consola
  verbose: true
};