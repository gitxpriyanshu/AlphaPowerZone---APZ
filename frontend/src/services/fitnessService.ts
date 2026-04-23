import axiosInstance from '../config/axiosInstance';

export const fitnessService = {
  /**
   * Analyze fitness profile and generate plan
   */
  analyzeProfile: async (data: any) => {
    // This will call the Node.js backend which proxies to the Python AI service
    const response = await axiosInstance.post('/fitness/analyze', data);
    return response.data.data;
  },

  /**
   * Save generated plan to user profile
   */
  savePlan: async (planData: any) => {
    const response = await axiosInstance.post('/fitness/save-plan', planData);
    return response.data.data;
  }
};
