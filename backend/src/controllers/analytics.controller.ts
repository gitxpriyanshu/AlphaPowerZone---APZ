import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const result = await analyticsService.getOverview();
  return res.status(200).json(new ApiResponse(200, result, 'Overview fetched successfully'));
});

export const getRevenueChart = asyncHandler(async (req: Request, res: Response) => {
  const { period = '30d' } = req.query;
  const result = await analyticsService.getRevenueData(period as string);
  return res.status(200).json(new ApiResponse(200, result, 'Revenue chart data fetched'));
});

export const getTopProducts = asyncHandler(async (req: Request, res: Response) => {
  const { limit } = req.query;
  const result = await analyticsService.getTopProducts(limit ? parseInt(limit as string) : 5);
  return res.status(200).json(new ApiResponse(200, result, 'Top products fetched'));
});

export const getOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await analyticsService.getOrderStatusDistribution();
  return res.status(200).json(new ApiResponse(200, result, 'Order status distribution fetched'));
});

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const result = await analyticsService.getCustomers();
  return res.status(200).json(new ApiResponse(200, result, 'Customers fetched successfully'));
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await analyticsService.getAllOrders();
  return res.status(200).json(new ApiResponse(200, result, 'Orders fetched successfully'));
});
