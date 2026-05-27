import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers['x-correlation-id'];
    const correlationId = Array.isArray(header) ? header[0] : header || uuidv4();

    req.correlationId = correlationId;

    res.setHeader('X-Correlation-ID', correlationId);

    next();
};
