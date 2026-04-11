import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // 🛡️ PREVENCIÓN DE SPOOFING: Limpiamos cualquier cabecera maliciosa que intente hacerse pasar por el Gateway
  delete req.headers["x-user-id"];
  delete req.headers["x-user-email"];
  delete req.headers["x-user-role"];

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message:
        "🚨 Acceso Denegado: Credenciales de acceso no proporcionadas o formato inválido.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verificación criptográfica real con Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Inyectamos los datos validados de forma segura para los microservicios
    req.headers["x-user-id"] = decodedToken.uid;

    if (decodedToken.email) {
      req.headers["x-user-email"] = decodedToken.email;
    }

    // Si usas custom claims en Firebase para los roles:
    if (decodedToken.rol) {
      req.headers["x-user-role"] = decodedToken.rol as string;
    }

    next();
  } catch (error: any) {
    const isExpired = error.code === "auth/id-token-expired";
    res.status(401).json({
      success: false,
      message: isExpired
        ? "🚨 Acceso Denegado: Su sesión ha expirado."
        : "🚨 Acceso Denegado: Token inválido o corrupto.",
    });
  }
};
