export interface FitnessProfile {
  height: number; // in cm
  weight: number; // in kg
  age: number;
  gender: 'male' | 'female' | 'other';
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'endurance';
  workoutDaysPerWeek: number;
  dietType: 'vegan' | 'vegetarian' | 'omnivore' | 'keto' | 'paleo';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
}

export interface AIRecommendation {
  bmi: number;
  bmiCategory: string;
  workoutPlan: {
    name: string;
    description: string;
    exercises: string[];
  };
  dietPlan: {
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    description: string;
  };
  supplements: string[];
  tips: string[];
}
