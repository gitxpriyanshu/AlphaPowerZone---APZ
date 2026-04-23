import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import axios from 'axios';

/**
 * @desc    Analyze fitness profile via Python AI Service
 * @route   POST /api/v1/fitness/analyze
 * @access  Private
 */
export const analyzeFitness = asyncHandler(async (req: Request, res: Response) => {
  const profileData = req.body;
  const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';
  const apiKey = process.env.AI_SERVICE_API_KEY;

  try {
    const response = await axios.post(
      `${pythonServiceUrl}/fitness/analyze`,
      profileData,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, response.data, 'Elite Blueprint generated successfully'));
  } catch (error: any) {
    console.error('AI Service Error:', error.response?.data || error.message);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.detail || 'Error communicating with AI Service'
    );
  }
});

/**
 * @desc    Save generated plan (Placeholder)
 * @route   POST /api/v1/fitness/save-plan
 * @access  Private
 */
export const saveFitnessPlan = asyncHandler(async (req: Request, res: Response) => {
  // Logic to save to database would go here
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Fitness plan saved successfully'));
});
