import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, secretKey } = req.body;

  if (!email || !password || !secretKey) {
    throw new ApiError(400, "Email, password, and Owner Passkey are required");
  }

  const OWNER_SECRET_KEY = process.env.OWNER_SECRET_KEY || "AlphaPowerZone@2026_SecureAdmin!";
  if (secretKey !== OWNER_SECRET_KEY) {
    throw new ApiError(401, "Invalid Owner Passkey");
  }

  const existingOwner = await prisma.owner.findUnique({
    where: { email },
  });

  if (!existingOwner) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, existingOwner.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    { id: existingOwner.id, role: 'owner' },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {
      owner: {
        id: existingOwner.id,
        name: existingOwner.name,
        email: existingOwner.email,
        role: 'owner'
      },
      token
    }, "Login successful"));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logout successful"));
});
