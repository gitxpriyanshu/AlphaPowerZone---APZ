import { useState } from 'react';
import { fitnessService } from '../services/fitnessService';
import toast from 'react-hot-toast';

export const useFitnessAnalysis = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [results, setResults] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    height_cm: 175,
    weight_kg: 70,
    age: 25,
    gender: 'male',
    goal: 'muscle_gain',
    workout_days_per_week: 4,
    activity_level: 'moderately_active',
    fitness_experience: 'intermediate',
    preferred_workout_type: 'gym',
    diet_type: 'non_vegetarian',
    available_equipment: ['full_gym'],
    health_conditions: [],
    workout_time: 'Evening',
    workout_specific_time: '18:00',
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const runAnalysis = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    const messages = [
      "Analyzing body metrics...",
      "Calculating optimal calorie targets...",
      "Generating personalized workout plan...",
      "Crafting high-performance diet plan...",
      "Recommending elite supplements...",
      "Finalizing your APZ blueprint..."
    ];

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      if (msgIndex < messages.length) {
        setLoadingMessage(messages[msgIndex]);
        msgIndex++;
      }
    }, 2000);

    try {
      const data = await fitnessService.analyzeProfile(formData);
      setResults(data);
      clearInterval(msgInterval);
      toast.success('Your Elite Blueprint is Ready!');
    } catch (error: any) {
      clearInterval(msgInterval);
      const status = error.response?.status;
      if (status === 429 || status === 503) {
        toast.error('Our AI is processing many requests right now. Please try again in 60 seconds.');
      } else if (status === 500) {
        toast.error('Something went wrong. Please try again.');
      } else {
        toast.error('Could not generate your blueprint. Please try again in a moment.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setStep(1);
  };

  return {
    step,
    setStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    isLoading,
    loadingMessage,
    results,
    runAnalysis,
    reset
  };
};
