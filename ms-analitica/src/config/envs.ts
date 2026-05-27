import "dotenv/config";
import * as env from "env-var";

const isDocker = process.env.DB_HOST === "db-fococero";

export const envs = {
  PORT: env.get("PORT").required().asPortNumber(),
  NODE_ENV: env.get("NODE_ENV").default("development").asString(),
  INTERNAL_SECRET_TOKEN: env.get("INTERNAL_SECRET_TOKEN").required().asString(),
  API_GATEWAY_URL: env.get("API_GATEWAY_URL").required().asString(),
  EUREKA_HOST: env.get("EUREKA_HOST").default("localhost").asString(),
  DB_USER: env.get("DB_USER").required().asString(),
  DB_PASSWORD: env.get("DB_PASSWORD").required().asString(),
  DB_NAME: env.get("DB_NAME").required().asString(),
  DB_HOST: env
    .get(isDocker ? "DB_HOST" : "DB_HOST_LOCAL")
    .required()
    .asString(),
  DB_PORT: env
    .get(isDocker ? "DB_PORT" : "DB_PORT_LOCAL")
    .required()
    .asPortNumber(),

  REDIS_HOST: env
    .get(isDocker ? "REDIS_HOST" : "REDIS_HOST_LOCAL")
    .required()
    .asString(),
  REDIS_PORT: env
    .get(isDocker ? "REDIS_PORT" : "REDIS_PORT_LOCAL")
    .required()
    .asPortNumber(),

  RABBITMQ_URL: env
    .get(isDocker ? "RABBITMQ_URL" : "RABBITMQ_URL_LOCAL")
    .default("amqp://localhost")
    .asString(),
} as const;
