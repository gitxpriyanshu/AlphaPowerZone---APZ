import { Request, Response } from 'express';
import { pincodeService } from '../services/pincode.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const lookupPincode = asyncHandler(async (req: Request, res: Response) => {
  const { pincode } = req.params;
  const result = await pincodeService.lookup(pincode);
  return res.status(200).json(new ApiResponse(200, result, result.isValid ? 'PIN code details fetched' : 'Invalid PIN code'));
});
