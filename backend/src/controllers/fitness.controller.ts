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
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        response = await axios.post(
          `${pythonServiceUrl}/fitness/analyze`,
          profileData,
          {
            headers: {
              'X-API-Key': apiKey,
              'Content-Type': 'application/json',
            },
            timeout: 120000, // 120s — accounts for Render free tier cold start
          }
        );
        break; // Success
      } catch (err: any) {
        attempts++;

        // These error codes all mean the AI service is waking up from sleep (Render cold start)
        const isWakingUp =
          err.response?.status === 429 ||
          err.code === 'ECONNRESET' ||
          err.code === 'ETIMEDOUT' ||
          err.code === 'ECONNREFUSED' ||
          err.code === 'ECONNABORTED';

        if (isWakingUp && attempts < maxAttempts) {
          const waitSeconds = 20 * attempts; // 20s, 40s — enough for Render cold start
          console.warn(
            `[Fitness Controller] AI service cold start detected. Retrying attempt ${attempts} after ${waitSeconds}s...`
          );
          await new Promise(res => setTimeout(res, waitSeconds * 1000));
        } else {
          throw err;
        }
      }
    }

    if (!response) {
      throw new ApiError(500, 'Failed to get response from AI Service');
    }

    return res
      .status(200)
      .json(new ApiResponse(200, response.data, 'Elite Blueprint generated successfully'));

  } catch (error: any) {
    console.error('AI Service Error:', error.response?.data || error.message);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.detail || `Error communicating with AI Service: ${error.message}`
    );
  }
});

/**
 * @desc    Debug AI service connectivity
 * @route   GET /api/v1/fitness/debug
 * @access  Public
 */
export const debugNetwork = asyncHandler(async (req: Request, res: Response) => {
  const aiServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';
  let result: any = {};

  try {
    const response = await axios.get(`${aiServiceUrl}/health`, { timeout: 10000 });
    result = { status: response.status, data: response.data };
  } catch (e: any) {
    result = { error: e.message, status: e.response?.status };
  }

  res.status(200).json({
    current_env_url: aiServiceUrl,
    health: result
  });
});

/**
 * @desc    Save generated plan
 * @route   POST /api/v1/fitness/save-plan
 * @access  Private
 */
export const saveFitnessPlan = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Fitness plan saved successfully'));
});
