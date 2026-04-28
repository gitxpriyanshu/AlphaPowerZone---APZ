import { Request, Response } from 'express';
import { addressService } from '../services/address.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  const result = await addressService.list(req.user!.id!);
  return res.status(200).json(new ApiResponse(200, result, 'Addresses fetched successfully'));
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const result = await addressService.create(req.user!.id!, req.body);
  return res.status(201).json(new ApiResponse(201, result, 'Address created successfully'));
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await addressService.update(req.user!.id!, id as string, req.body);
  return res.status(200).json(new ApiResponse(200, result, 'Address updated successfully'));
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await addressService.delete(req.user!.id!, id as string);
  return res.status(200).json(new ApiResponse(200, null, 'Address deleted successfully'));
});

export const setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await addressService.setDefault(req.user!.id!, id as string);
  return res.status(200).json(new ApiResponse(200, null, 'Default address updated'));
});
