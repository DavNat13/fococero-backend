// api-gateway/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";
import { envs } from "../config/envs"; // Importamos envs para verificar el entorno

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "🚨 Acceso Denegado: Credenciales de acceso no proporcionadas.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  // 🟢 PUENTE PARA DESARROLLO (Master Token)
  // Si estamos en desarrollo y el token coincide, inyectamos los datos directamente
  if (envs.NODE_ENV === "development" && token === "fococero_test_token") {
    req.headers["x-user-id"] = "master_admin_uid";
    req.headers["x-user-email"] = "comandante@fococero.cl";
    req.headers["x-user-role"] = "ADMIN";
    return next(); // Abrimos la puerta maestra
  }

  try {
    // Verificación criptográfica real con Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Inyectamos los datos en las cabeceras para los microservicios internos
    req.headers["x-user-id"] = decodedToken.uid;
    req.headers["x-user-email"] = decodedToken.email;
    req.headers["x-user-role"] = decodedToken.role || "user";

    next();
  } catch (error) {
    console.warn(`⚠️ Intento de acceso fallido: Token inválido o expirado.`);
    res.status(403).json({
      success: false,
      message: "🚨 Acceso Denegado: Sesión expirada o token inválido.",
    });
    return;
  }
};
