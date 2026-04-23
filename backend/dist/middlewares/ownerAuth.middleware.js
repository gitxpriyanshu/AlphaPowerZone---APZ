import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import prisma from '../config/database.js';
/**
 * Middleware to verify Owner JWT
 */
export const verifyOwnerJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers['x-owner-token']?.toString() || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            throw new ApiError(401, 'Unauthorized owner request');
        }
        const decodedToken = jwt.verify(token, env.JWT_SECRET);
        if (decodedToken.role !== 'owner') {
            throw new ApiError(403, 'Forbidden: Owner access only');
        }
        const owner = await prisma.owner.findUnique({
            where: { id: decodedToken.id },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
        if (!owner) {
            throw new ApiError(401, 'Invalid access token');
        }
        req.owner = owner;
        next();
    }
    catch (error) {
        throw new ApiError(401, 'Invalid access token');
    }
});
