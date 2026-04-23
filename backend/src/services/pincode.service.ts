import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';

interface PincodeData {
  city: string;
  state: string;
  district: string;
  country: "India";
  isValid: boolean;
}

const cache = new Map<string, { data: PincodeData; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const pincodeService = {
  /**
   * Fetch city/state details from PIN code
   */
  lookup: async (pincode: string): Promise<PincodeData> => {
    // Check cache
    const cached = cache.get(pincode);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = response.data[0];

      if (data.Status !== 'Success') {
        return { city: '', state: '', district: '', country: "India", isValid: false };
      }

      const postOffice = data.PostOffice[0];
      const result: PincodeData = {
        city: postOffice.Division,
        district: postOffice.District,
        state: postOffice.State,
        country: "India",
        isValid: true,
      };

      // Set cache
      cache.set(pincode, { data: result, timestamp: Date.now() });

      return result;
    } catch (error) {
      throw new ApiError(500, 'Error fetching PIN code details');
    }
  },
};
