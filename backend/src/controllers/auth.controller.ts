import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

/**
 * Generate Access and Refresh Tokens
 */
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: '7d', // 7 days as requested for access
  });

  const refreshToken = jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: '30d', // 30 days as requested for refresh
  });

  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existedUser = await prisma.user.findUnique({ where: { email } });
  if (existedUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    }
  });

  // Add default role for frontend compatibility
  const userWithRole = { ...user, role: 'user' as const };

  const { accessToken, refreshToken } = generateTokens(user.id);

  return res
    .status(201)
    .json(new ApiResponse(201, { user: userWithRole, token: accessToken, refreshToken }, 'User registered successfully'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      password: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  const { password: _pwd, ...rest } = user;
  const loggedInUser = { ...rest, role: 'user' as const };

  return res
    .status(200)
    .json(new ApiResponse(200, { user: loggedInUser, token: accessToken, refreshToken }, 'User logged in successfully'));
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, env.JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decodedToken.id } });

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    return res
      .status(200)
      .json(new ApiResponse(200, { token: accessToken, refreshToken: newRefreshToken }, 'Access token refreshed'));
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { ...req.user, role: 'user' as const }, 'User profile fetched successfully'));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;
  const userId = req.user!.id!;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      phone: true,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { ...updatedUser, role: 'user' as const }, 'Profile updated successfully'));
});
