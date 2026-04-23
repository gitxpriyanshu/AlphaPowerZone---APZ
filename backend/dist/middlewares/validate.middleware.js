import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
/**
 * Middleware to validate request body using Zod
 */
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path[err.path.length - 1],
                    message: err.message,
                }));
                next(new ApiError(400, 'Validation failed', errors));
            }
            else {
                next(error);
            }
        }
    };
};
