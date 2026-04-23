import { trackerService } from '../services/tracker.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const logStats = asyncHandler(async (req, res) => {
    const result = await trackerService.logStats(req.user.id, req.body);
    return res.status(201).json(new ApiResponse(201, result, 'Stats logged successfully'));
});
export const getLogs = asyncHandler(async (req, res) => {
    const { period } = req.query;
    const result = await trackerService.getLogs(req.user.id, period);
    return res.status(200).json(new ApiResponse(200, result, 'Logs fetched successfully'));
});
export const logSupplement = asyncHandler(async (req, res) => {
    const { name, dosage } = req.body;
    const result = await trackerService.logSupplement(req.user.id, name, dosage);
    return res.status(201).json(new ApiResponse(201, result, 'Supplement intake logged'));
});
export const getInsights = asyncHandler(async (req, res) => {
    const result = await trackerService.getStreaks(req.user.id);
    return res.status(200).json(new ApiResponse(200, result, 'Insights fetched successfully'));
});
