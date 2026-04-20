import { Response } from 'express';

export const successResponse = (
    res: Response,
    data: unknown,
    message = 'Success',
    status = 200,
) => {
    res.status(status).json({
        ok: true,
        status,
        message,
        data,
    });
};
