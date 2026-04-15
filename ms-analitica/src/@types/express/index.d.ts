import "express";

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      internalToken?: string;
      user?: {
        id: string;
        rol: "ADMIN" | "OPERADOR" | "ANALISTA" | "SISTEMA";
        jurisdiccion?: string;
      };
    }
  }
}
