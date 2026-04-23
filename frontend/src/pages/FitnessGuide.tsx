import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import { FitnessProfile, AIRecommendation } from '@/types/fitness';
import Badge from '@components/ui/Badge';
import { motion } from 'framer-motion';

const FitnessGuide: React.FC = () => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<FitnessProfile>>({
    gender: 'male',
    goal: 'muscle-gain',
    activityLevel: 'moderate',
    dietType: 'omnivore',
  });
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setRecommendation({
        bmi: 24.5,
        bmiCategory: 'Normal',
        workoutPlan: {
          name: 'Hypertrophy Phase 1',
          description: 'Focus on progressive overload and compound movements.',
          exercises: ['Bench Press 4x8', 'Squats 3x10', 'Deadlifts 3x5', 'Pull-ups 3xMax'],
        },
        dietPlan: {
          calories: 2800,
          macros: { protein: 180, carbs: 350, fats: 75 },
          description: 'High protein surplus for muscle growth.',
        },
        supplements: ['Creatine Monohydrate', 'Whey Isolate', 'Pre-workout'],
        tips: ['Prioritize sleep (7-9 hours)', 'Hydrate adequately (3L+)', 'Track your lifts'],
      });
      setIsGenerating(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="min-h-screen py-12 px-6 max-w-5xl mx-auto">
      <Helmet>
        <title>AI Fitness Guide | AlphaPowerZone</title>
      </Helmet>

      <div className="text-center mb-16">
        <Badge variant="primary" className="mb-4">AI Powered</Badge>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
          Personalized <span className="text-orange-600">Fitness Blueprint</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Our advanced AI analyzes your profile to generate a comprehensive workout and nutrition strategy tailored to your goals.
        </p>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Step 1: Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Height (cm)" type="number" placeholder="180" onChange={(e) => setProfile({ ...profile, height: +e.target.value })} />
            <Input label="Weight (kg)" type="number" placeholder="75" onChange={(e) => setProfile({ ...profile, weight: +e.target.value })} />
            <Input label="Age" type="number" placeholder="25" onChange={(e) => setProfile({ ...profile, age: +e.target.value })} />
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 ml-1">Gender</label>
              <select 
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-orange-600"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <Button className="mt-8 w-full" size="lg" onClick={() => setStep(2)}>Next Step</Button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Step 2: Your Goals</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-300 ml-1">Primary Goal</label>
                <select 
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-orange-600"
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value as any })}
                >
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-300 ml-1">Activity Level</label>
                <select 
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-orange-600"
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as any })}
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="active">Very Active</option>
                </select>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handleGenerate} isLoading={isGenerating}>
              Generate AI Blueprint
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>Go Back</Button>
          </div>
        </motion.div>
      )}

      {step === 3 && recommendation && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-orange-600/30">
              <p className="text-zinc-500 text-sm font-bold uppercase mb-1">Your BMI</p>
              <h3 className="text-3xl font-black text-orange-600">{recommendation.bmi}</h3>
              <Badge variant="info" className="mt-2">{recommendation.bmiCategory}</Badge>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-sm font-bold uppercase mb-1">Daily Calories</p>
              <h3 className="text-3xl font-black">{recommendation.dietPlan.calories}</h3>
              <p className="text-zinc-500 text-sm mt-1">Maintenance + Surplus</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-sm font-bold uppercase mb-1">Protein Goal</p>
              <h3 className="text-3xl font-black">{recommendation.dietPlan.macros.protein}g</h3>
              <p className="text-zinc-500 text-sm mt-1">High protein intake</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-orange-600 italic">Workout Plan: {recommendation.workoutPlan.name}</h3>
              <p className="text-zinc-400 mb-6">{recommendation.workoutPlan.description}</p>
              <ul className="space-y-3">
                {recommendation.workoutPlan.exercises.map((ex, i) => (
                  <li key={i} className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                    <span className="w-6 h-6 flex items-center justify-center bg-orange-600 text-white rounded-full text-xs font-bold">{i+1}</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-orange-600 italic">Nutritional Tips</h3>
              <ul className="space-y-4">
                {recommendation.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-orange-600 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <span className="text-zinc-300">{tip}</span>
                  </li>
                ))}
              </ul>
              <h4 className="font-bold mt-8 mb-4 uppercase text-sm tracking-widest text-zinc-500">Recommended Supplements</h4>
              <div className="flex flex-wrap gap-2">
                {recommendation.supplements.map((s, i) => (
                  <Badge key={i} variant="warning">{s}</Badge>
                ))}
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setStep(1)}>Start Over</Button>
        </motion.div>
      )}
    </div>
  );
};

export default FitnessGuide;
