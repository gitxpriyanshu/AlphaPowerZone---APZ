import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Dumbbell, Utensils, Zap, Target, Activity, 
  ChevronRight, ChevronLeft, Check, Info,
  Flame, Scale, Trophy, Heart, AlertCircle,
  Clock, Coffee, Sun, Moon, ShoppingCart, Download, Save, RefreshCw
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend 
} from 'recharts';
import { useFitnessAnalysis } from '@hooks/useFitnessAnalysis';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Badge from '@components/ui/Badge';

const FitnessAI: React.FC = () => {
  const { 
    step, setStep, formData, updateFormData, nextStep, prevStep, 
    isLoading, loadingMessage, results, runAnalysis, reset 
  } = useFitnessAnalysis();

  const [activeDay, setActiveDay] = useState('Monday');

  // BMI Calculation for Step 1 Live Preview
  const bmi = useMemo(() => {
    const h = formData.height_cm / 100;
    return (formData.weight_kg / (h * h)).toFixed(1);
  }, [formData.height_cm, formData.weight_kg]);

  const bmiCategory = useMemo(() => {
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: 'text-yellow-500' };
    if (val < 25) return { label: 'Normal', color: 'text-brand-success' };
    if (val < 30) return { label: 'Overweight', color: 'text-yellow-500' };
    return { label: 'Obese', color: 'text-brand-error' };
  }, [bmi]);

  // Form Steps Rendering
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Input 
                  label="Height (cm)" 
                  type="number" 
                  value={formData.height_cm} 
                  onChange={(e) => updateFormData({ height_cm: e.target.value === '' ? '' as any : Number(e.target.value) })}
                />
                <Input 
                  label="Weight (kg)" 
                  type="number" 
                  value={formData.weight_kg} 
                  onChange={(e) => updateFormData({ weight_kg: e.target.value === '' ? '' as any : Number(e.target.value) })}
                />
                <Input 
                  label="Age" 
                  type="number" 
                  value={formData.age} 
                  onChange={(e) => updateFormData({ age: e.target.value === '' ? '' as any : Number(e.target.value) })}
                />
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Gender</label>
                  <div className="flex gap-2">
                    {['male', 'female', 'other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => updateFormData({ gender: g })}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-brand-md border-2 text-xs font-black uppercase tracking-widest transition-all",
                          formData.gender === g ? "border-brand-accent bg-brand-accent text-white" : "border-brand-border text-brand-text-muted hover:border-brand-text-primary"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-8 bg-brand-surface-alt rounded-brand-xl border-2 border-dashed border-brand-border">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted mb-2">Live BMI Preview</p>
                <motion.span 
                  key={bmi}
                  initial={{ scale: 1.2, color: '#C8A96E' }}
                  animate={{ scale: 1, color: '#09090B' }}
                  className="text-7xl font-black font-display italic tracking-tighter"
                >
                  {bmi}
                </motion.span>
                <p className={cn("text-xs font-black uppercase tracking-widest mt-2", bmiCategory.color)}>
                  {bmiCategory.label}
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        const goals = [
          { id: 'fat_loss', title: 'Fat Loss', desc: 'Burn fat, stay lean', icon: <Flame size={32} /> },
          { id: 'muscle_gain', title: 'Muscle Gain', desc: 'Build size and strength', icon: <Dumbbell size={32} /> },
          { id: 'maintenance', title: 'Maintenance', desc: 'Stay fit and healthy', icon: <Scale size={32} /> },
          { id: 'athletic_performance', title: 'Performance', desc: 'Train like a pro', icon: <Zap size={32} /> },
        ];
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => updateFormData({ goal: goal.id })}
                className={cn(
                  "p-6 rounded-brand-xl border-2 text-left transition-all group",
                  formData.goal === goal.id ? "border-brand-accent bg-brand-accent/5 shadow-brand-md" : "border-brand-border hover:border-brand-text-primary"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-brand-lg flex items-center justify-center mb-4 transition-colors",
                  formData.goal === goal.id ? "bg-brand-accent text-white" : "bg-brand-surface-alt text-brand-text-muted group-hover:text-brand-text-primary"
                )}>
                  {goal.icon}
                </div>
                <h3 className="text-xl font-black font-display italic uppercase tracking-tighter mb-1">{goal.title}</h3>
                <p className="text-xs text-brand-text-secondary">{goal.desc}</p>
              </button>
            ))}
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Activity Level</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'sedentary', icon: '🪑' },
                  { id: 'lightly_active', icon: '🚶' },
                  { id: 'moderately_active', icon: '🏃' },
                  { id: 'very_active', icon: '🏋️' },
                  { id: 'extremely_active', icon: '⚡' }
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => updateFormData({ activity_level: act.id })}
                    className={cn(
                      "flex-1 py-4 px-2 rounded-brand-md border-2 transition-all flex flex-col items-center gap-2",
                      formData.activity_level === act.id ? "border-brand-accent bg-brand-accent/5" : "border-brand-border"
                    )}
                  >
                    <span className="text-2xl">{act.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-center">{act.id.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Workout Frequency</label>
                <span className="text-sm font-black text-brand-accent">{formData.workout_days_per_week} days/week</span>
              </div>
              <input 
                type="range" min="1" max="7" 
                value={formData.workout_days_per_week} 
                onChange={(e) => updateFormData({ workout_days_per_week: Number(e.target.value) })}
                className="w-full accent-brand-accent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Experience Level</label>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((exp) => (
                    <button
                      key={exp}
                      onClick={() => updateFormData({ fitness_experience: exp })}
                      className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-full border-2 transition-all",
                        formData.fitness_experience === exp ? "border-brand-accent bg-brand-accent text-white" : "border-brand-border"
                      )}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Preferred Setting</label>
                <div className="flex gap-2">
                  {['gym', 'home', 'mixed'].map((set) => (
                    <button
                      key={set}
                      onClick={() => updateFormData({ preferred_workout_type: set })}
                      className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-full border-2 transition-all",
                        formData.preferred_workout_type === set ? "border-brand-accent bg-brand-accent text-white" : "border-brand-border"
                      )}
                    >
                      {set}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Workout Timing</label>
              <div className="flex flex-wrap gap-2">
                {['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      const defaults: Record<string, string> = {
                        'Early Morning': '06:00',
                        'Morning': '09:00',
                        'Afternoon': '14:00',
                        'Evening': '18:00',
                        'Night': '21:00'
                      };
                      updateFormData({ workout_time: time, workout_specific_time: defaults[time] });
                    }}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-full border-2 transition-all",
                      formData.workout_time === time ? "border-brand-accent bg-brand-accent text-white" : "border-brand-border text-brand-text-muted hover:border-brand-text-primary"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 bg-brand-surface-alt p-6 rounded-brand-2xl border border-brand-border shadow-brand-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-brand-text-primary mb-1">Precision Timing</h4>
                    <p className="text-[10px] text-brand-text-muted uppercase font-mono">Sync nutrition with your metabolic window</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Custom Time Display/Input */}
                    <div className="flex items-center bg-brand-background border-2 border-brand-border rounded-brand-xl p-1 shadow-inner">
                      {/* Hour Selector */}
                      <select 
                        value={(() => {
                          const h = parseInt(formData.workout_specific_time.split(':')[0]);
                          return (h === 0 ? 12 : h > 12 ? h - 12 : h).toString();
                        })()}
                        onChange={(e) => {
                          const newH = parseInt(e.target.value);
                          const [currH, currM] = formData.workout_specific_time.split(':');
                          const ampm = parseInt(currH) >= 12 ? 'PM' : 'AM';
                          let finalH = newH;
                          if (ampm === 'PM' && newH < 12) finalH += 12;
                          if (ampm === 'AM' && newH === 12) finalH = 0;
                          
                          const newTime = `${finalH.toString().padStart(2, '0')}:${currM}`;
                          const hourInt = finalH;
                          let label = 'Night';
                          if (hourInt >= 4 && hourInt <= 7) label = 'Early Morning';
                          else if (hourInt >= 8 && hourInt <= 11) label = 'Morning';
                          else if (hourInt >= 12 && hourInt <= 16) label = 'Afternoon';
                          else if (hourInt >= 17 && hourInt <= 20) label = 'Evening';
                          updateFormData({ workout_specific_time: newTime, workout_time: label });
                        }}
                        className="bg-transparent text-xl font-black font-display italic text-brand-accent px-3 py-2 outline-none appearance-none cursor-pointer hover:bg-brand-surface-alt rounded-brand-lg transition-colors"
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i} value={(i + 1).toString()} className="bg-brand-surface text-brand-text-primary">
                            {(i + 1).toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      
                      <span className="text-brand-text-muted font-black mx-1">:</span>
                      
                      {/* Minute Selector */}
                      <select 
                        value={formData.workout_specific_time.split(':')[1]}
                        onChange={(e) => {
                          const currentHour = formData.workout_specific_time.split(':')[0];
                          const newMin = e.target.value;
                          updateFormData({ workout_specific_time: `${currentHour}:${newMin}` });
                        }}
                        className="bg-transparent text-xl font-black font-display italic text-brand-accent px-3 py-2 outline-none appearance-none cursor-pointer hover:bg-brand-surface-alt rounded-brand-lg transition-colors"
                      >
                        {['00', '15', '30', '45'].map((min) => (
                          <option key={min} value={min} className="bg-brand-surface text-brand-text-primary">{min}</option>
                        ))}
                      </select>

                      <div className="w-[1px] h-6 bg-brand-border mx-2" />

                      {/* AM/PM Selector */}
                      <select 
                        value={parseInt(formData.workout_specific_time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                        onChange={(e) => {
                          const newAmPm = e.target.value;
                          const [currH, currM] = formData.workout_specific_time.split(':');
                          let h = parseInt(currH);
                          // Convert current 24h hour to 12h base
                          let displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
                          
                          let finalH = displayH;
                          if (newAmPm === 'PM' && displayH < 12) finalH += 12;
                          if (newAmPm === 'AM' && displayH === 12) finalH = 0;

                          const newTime = `${finalH.toString().padStart(2, '0')}:${currM}`;
                          const hourInt = finalH;
                          let label = 'Night';
                          if (hourInt >= 4 && hourInt <= 7) label = 'Early Morning';
                          else if (hourInt >= 8 && hourInt <= 11) label = 'Morning';
                          else if (hourInt >= 12 && hourInt <= 16) label = 'Afternoon';
                          else if (hourInt >= 17 && hourInt <= 20) label = 'Evening';
                          updateFormData({ workout_specific_time: newTime, workout_time: label });
                        }}
                        className="bg-transparent text-sm font-black font-display italic text-brand-accent px-3 py-2 outline-none appearance-none cursor-pointer hover:bg-brand-surface-alt rounded-brand-lg transition-colors"
                      >
                        <option value="AM" className="bg-brand-surface text-brand-text-primary">AM</option>
                        <option value="PM" className="bg-brand-surface text-brand-text-primary">PM</option>
                      </select>
                    </div>

                    <div className="hidden md:block w-[1px] h-10 bg-brand-border mx-2" />
                    
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-brand-accent uppercase tracking-tighter">Current Slot</span>
                      <span className="text-xs font-black uppercase tracking-widest text-brand-text-primary italic">{formData.workout_time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        const equipments = ['Dumbbells', 'Barbell', 'Bands', 'Bench', 'Pull-up Bar', 'Cardio Machine', 'Full Gym', 'None'];
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Diet Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'vegetarian', label: 'Veg', icon: '🥦' },
                  { id: 'non_vegetarian', label: 'Non-Veg', icon: '🍗' },
                  { id: 'eggetarian', label: 'Egg-Veg', icon: '🥚' },
                  { id: 'vegan', label: 'Vegan', icon: '🌱' },
                ].map((diet) => (
                  <button
                    key={diet.id}
                    onClick={() => updateFormData({ diet_type: diet.id })}
                    className={cn(
                      "py-4 rounded-brand-md border-2 transition-all flex flex-col items-center gap-1",
                      formData.diet_type === diet.id ? "border-brand-accent bg-brand-accent/5" : "border-brand-border"
                    )}
                  >
                    <span className="text-xl">{diet.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">{diet.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Equipment Available</label>
              <div className="flex flex-wrap gap-2">
                {equipments.map((eq) => {
                  const isSelected = formData.available_equipment.includes(eq.toLowerCase().replace(' ', '_'));
                  return (
                    <button
                      key={eq}
                      onClick={() => {
                        const val = eq.toLowerCase().replace(' ', '_');
                        const newEq = isSelected 
                          ? formData.available_equipment.filter(e => e !== val)
                          : [...formData.available_equipment, val];
                        updateFormData({ available_equipment: newEq });
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                        isSelected ? "border-brand-accent bg-brand-accent text-white" : "border-brand-border text-brand-text-muted"
                      )}
                    >
                      {eq}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="premium-card p-8 bg-brand-surface-alt">
              <h3 className="text-2xl font-black font-display italic uppercase tracking-tighter mb-6">Profile Review</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                {[
                  { label: 'Stats', val: `${formData.height_cm}cm / ${formData.weight_kg}kg / ${formData.age}y` },
                  { label: 'Goal', val: formData.goal.replace('_', ' ').toUpperCase() },
                  { label: 'Frequency', val: `${formData.workout_days_per_week} Days/Week` },
                  { label: 'Diet', val: formData.diet_type.replace('_', ' ').toUpperCase() },
                  { label: 'Setting', val: formData.preferred_workout_type.toUpperCase() },
                  { label: 'Experience', val: formData.fitness_experience.toUpperCase() },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted mb-1">{item.label}</p>
                    <p className="text-sm font-bold uppercase">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-accent/5 p-6 rounded-brand-xl border border-brand-accent/20 flex gap-4">
              <AlertCircle className="text-brand-accent flex-shrink-0" size={24} />
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                By generating this plan, you acknowledge that our AI analysis is for informational purposes. Always consult a healthcare professional before starting any intense physical regime or radical diet changes.
              </p>
            </div>

            <Button size="xl" fullWidth onClick={runAnalysis} className="h-16 text-lg">
              Generate My Elite Blueprint
              <Zap className="ml-3 fill-white" size={20} />
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Analysis Dashboard Rendering
  if (results) {
    const macroData = [
      { name: 'Protein', value: results.metrics.protein_g * 4, color: '#C8A96E' },
      { name: 'Carbs', value: results.metrics.carbs_g * 4, color: '#09090B' },
      { name: 'Fats', value: results.metrics.fat_g * 9, color: '#D1D1D6' },
    ];

    return (
      <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="primary" className="mb-4">Personalized Elite Blueprint</Badge>
              <h1 className="text-5xl md:text-7xl font-black font-display italic uppercase tracking-tighter leading-none">
                Fitness <span className="text-brand-accent">Intelligence</span>
              </h1>
            </motion.div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="mr-2" size={16} /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={reset}>
                <RefreshCw className="mr-2" size={16} /> Recalculate
              </Button>
              <Button size="sm">
                <Save className="mr-2" size={16} /> Save Plan
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'BMI SCORE', val: results.metrics.bmi, sub: results.metrics.bmi_category, icon: <Scale size={24} /> },
              { label: 'DAILY TARGET', val: results.metrics.calories_target, sub: 'KCAL/DAY', icon: <Flame size={24} /> },
              { label: 'PROTEIN GOAL', val: results.metrics.protein_g, sub: 'GRAMS/DAY', icon: <Dumbbell size={24} /> },
              { label: 'IDEAL WEIGHT', val: `${results.metrics.ideal_weight_range[0]}-${results.metrics.ideal_weight_range[1]}`, sub: 'KILOGRAMS', icon: <Target size={24} /> },
            ].map((card, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-6 border-l-4 border-brand-accent flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-brand-md bg-brand-surface-alt flex items-center justify-center text-brand-accent">
                  {card.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted mb-1">{card.label}</p>
                  <p className="text-2xl font-black font-mono">{card.val}</p>
                  <p className="text-[10px] font-bold text-brand-text-secondary uppercase">{card.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Macro Chart */}
            <div className="lg:col-span-4 premium-card p-8 flex flex-col items-center">
              <h3 className="text-xl font-black font-display italic uppercase tracking-tighter mb-8 self-start">Macro Distribution</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-8 w-full mt-8">
                {[
                  { l: 'P', v: results.metrics.protein_g, c: 'text-brand-accent' },
                  { l: 'C', v: results.metrics.carbs_g, c: 'text-brand-text-primary' },
                  { l: 'F', v: results.metrics.fat_g, c: 'text-brand-text-muted' },
                ].map((m, i) => (
                  <div key={i} className="text-center">
                    <p className={cn("text-lg font-black font-mono", m.c)}>{Math.round(m.v)}g</p>
                    <p className="text-[10px] font-bold text-brand-text-muted uppercase">{m.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* BMI Scale */}
            <div className="lg:col-span-8 premium-card p-8 space-y-8">
              <h3 className="text-xl font-black font-display italic uppercase tracking-tighter">Body Mass Index Analysis</h3>
              <div className="relative pt-12 pb-8">
                {/* Scale Bar */}
                <div className="h-4 w-full bg-brand-surface-alt rounded-full flex overflow-hidden">
                  <div className="h-full w-[25%] bg-yellow-400" />
                  <div className="h-full w-[25%] bg-green-500" />
                  <div className="h-full w-[25%] bg-yellow-500" />
                  <div className="h-full w-[25%] bg-red-500" />
                </div>
                {/* Indicator Marker */}
                <motion.div 
                  initial={{ left: 0 }}
                  animate={{ left: `${Math.min(Math.max((results.metrics.bmi - 15) / 25 * 100, 5), 95)}%` }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="absolute top-4 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                  <div className="px-3 py-1 bg-brand-text-primary text-white text-xs font-black font-mono rounded-full">
                    {results.metrics.bmi}
                  </div>
                  <div className="w-1 h-8 bg-brand-text-primary" />
                </motion.div>
                {/* Labels */}
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-text-muted mt-4">
                  <span>Under</span>
                  <span>Normal</span>
                  <span>Over</span>
                  <span>Obese</span>
                </div>
              </div>
              <p className="text-sm text-brand-text-secondary leading-relaxed max-w-2xl">
                Your BMI of {results.metrics.bmi} is classified as <span className="font-bold text-brand-text-primary uppercase tracking-tight">{results.metrics.bmi_category}</span>. 
                Our elite target is to optimize your body composition while maintaining metabolic health and high performance levels.
              </p>
            </div>
          </div>

          {/* Tabs for Workout/Diet */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-brand-border">
              <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter pb-4 border-b-4 border-brand-accent">Blueprint Detail</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
              {/* Workout Section */}
              <div className="xl:col-span-7 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black font-display italic uppercase tracking-tighter flex items-center gap-3">
                    <Dumbbell className="text-brand-accent" /> Workout Schedule
                  </h3>
                </div>
                
                {/* Day Select */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const dayPlan = results.plan.workout_plan.weekly_schedule.find((d: any) => d.day === day);
                    if (!dayPlan) return null;
                    return (
                      <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={cn(
                          "flex-shrink-0 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                          activeDay === day ? "bg-brand-text-primary text-white" : "bg-brand-surface-alt text-brand-text-muted hover:text-brand-text-primary"
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDay}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="p-6 bg-brand-surface-alt rounded-brand-xl border-l-4 border-brand-accent">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent mb-1">Training Focus</p>
                      <h4 className="text-2xl font-black font-display italic uppercase tracking-tighter">
                        {results.plan.workout_plan.weekly_schedule.find((d: any) => d.day === activeDay)?.focus || 'Rest Day'}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {results.plan.workout_plan.weekly_schedule.find((d: any) => d.day === activeDay)?.exercises.map((ex: any, i: number) => (
                        <div key={i} className="premium-card p-6 flex items-center justify-between group hover:bg-brand-surface-alt transition-colors">
                          <div className="flex items-center gap-6">
                            <span className="text-2xl font-black font-mono text-brand-border group-hover:text-brand-accent transition-colors">0{i+1}</span>
                            <div>
                              <h5 className="text-sm font-black uppercase tracking-tight">{ex.name}</h5>
                              <p className="text-[10px] text-brand-text-muted font-mono uppercase mt-1">{ex.rest} Rest</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black font-mono">{ex.sets} × {ex.reps}</p>
                            <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Sets × Reps</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Diet Section */}
              <div className="xl:col-span-5 space-y-8">
                <h3 className="text-xl font-black font-display italic uppercase tracking-tighter flex items-center gap-3">
                  <Utensils className="text-brand-accent" /> Performance Nutrition
                </h3>

                <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[2px] before:bg-brand-border">
                  {[...results.plan.diet_plan.daily_meals]
                    .sort((a, b) => {
                      const timeA = new Date(`1970/01/01 ${a.time.replace(/([ap]m)/i, ' $1')}`).getTime();
                      const timeB = new Date(`1970/01/01 ${b.time.replace(/([ap]m)/i, ' $1')}`).getTime();
                      return timeA - timeB;
                    })
                    .map((meal: any, i: number) => (
                      <div key={i} className="relative pl-14">
                        <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-brand-accent border-4 border-white shadow-brand-sm" />
                        <div className="premium-card p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-[10px] font-black font-mono text-brand-accent mb-1">{meal.time}</p>
                              <h4 className="text-lg font-black font-display italic uppercase tracking-tighter">{meal.meal}</h4>
                            </div>
                            <Badge variant="primary" className="font-mono text-[10px]">{meal.calories} KCAL</Badge>
                          </div>
                          <ul className="space-y-2">
                            {meal.options.map((opt: string, j: number) => (
                              <li key={j} className="text-xs text-brand-text-secondary flex items-start gap-2">
                                <div className="mt-1 w-1 h-1 rounded-full bg-brand-border flex-shrink-0" />
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Supplements Section */}
          <div className="space-y-8">
            <h3 className="text-xl font-black font-display italic uppercase tracking-tighter flex items-center gap-3">
              <Zap className="text-brand-accent" /> Recommended Supplementation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {results.plan.supplements.map((supp: any, i: number) => (
                <div key={i} className="premium-card p-8 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <ShoppingCart size={80} />
                  </div>
                  <div className="flex justify-between items-start">
                    <Badge variant={supp.priority === 'essential' ? 'primary' : 'outline'}>
                      {supp.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black font-display italic uppercase tracking-tighter mb-2">{supp.name}</h4>
                    <p className="text-xs text-brand-text-secondary h-12 line-clamp-3">{supp.purpose}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-brand-border">
                    <div>
                      <p className="text-[10px] font-black uppercase text-brand-text-muted mb-1">Dosage</p>
                      <p className="text-xs font-bold uppercase">{supp.dosage}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-brand-text-muted mb-1">Timing</p>
                      <p className="text-xs font-bold uppercase">{supp.timing}</p>
                    </div>
                  </div>
                  <Button fullWidth size="sm" variant="outline">
                    Shop Category
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Input Wizard
  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Fitness AI Blueprint | AlphaPowerZone</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="relative w-32 h-32 mb-12">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-dashed border-brand-accent rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-4 bg-brand-accent/20 rounded-full flex items-center justify-center"
                >
                  <Activity className="text-brand-accent" size={40} />
                </motion.div>
              </div>
              <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter mb-4">Elite Analysis in Progress</h2>
              <motion.p 
                key={loadingMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-brand-text-secondary font-mono uppercase tracking-widest text-xs"
              >
                {loadingMessage}
              </motion.p>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-12">
              {/* Stepper Header */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-5xl md:text-6xl font-black font-display italic uppercase tracking-tighter leading-none mb-4">
                      Create Your <span className="text-brand-accent">Blueprint</span>
                    </h1>
                    <p className="text-brand-text-secondary max-w-md">Our AI engine builds professional-grade training and nutrition plans tailored to your exact physiology.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black font-mono">0{step} <span className="text-brand-text-muted mx-2">/</span> 05</span>
                    <div className="w-32 h-2 bg-brand-surface-alt rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 5) * 100}%` }}
                        className="h-full bg-brand-accent shadow-[0_0_10px_rgba(200,169,110,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Step Content */}
              <div className="premium-card p-10 min-h-[450px] flex flex-col">
                <div className="flex-grow">
                  <div className="mb-10">
                    <h2 className="text-2xl font-black font-display italic uppercase tracking-tight">
                      {step === 1 && "Physical Dimensions"}
                      {step === 2 && "The Objective"}
                      {step === 3 && "Training Lifestyle"}
                      {step === 4 && "Nutrition & Access"}
                      {step === 5 && "Final Integration"}
                    </h2>
                    <div className="w-12 h-1 bg-brand-accent mt-2" />
                  </div>
                  <AnimatePresence mode="wait">
                    {renderStep()}
                  </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-10 mt-10 border-t border-brand-border">
                  <button 
                    onClick={prevStep} 
                    disabled={step === 1}
                    className={cn(
                      "flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
                      step === 1 ? "opacity-0 cursor-default" : "text-brand-text-muted hover:text-brand-text-primary"
                    )}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  {step < 5 && (
                    <Button onClick={nextStep} size="lg" className="px-12 group">
                      Next Phase
                      <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FitnessAI;
