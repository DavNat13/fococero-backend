import { Request, Response } from 'express';
import { pool } from '../config/db';
import { successResponse } from '../helpers/handleResponse';
import { asyncHandler } from '../helpers/asyncHandler';

export class HealthController {
    static check = asyncHandler(async (_req: Request, res: Response) => {
        await pool.query('SELECT 1'); // Verifica conexión real
        return successResponse(res, { uptime: process.uptime() }, 'ms-emergencias is healthy');
    });
}
