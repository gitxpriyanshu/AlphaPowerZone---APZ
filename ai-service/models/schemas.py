from pydantic import BaseModel, Field
from typing import List, Tuple, Optional

class FitnessInput(BaseModel):
    height_cm: float
    weight_kg: float
    age: int
    gender: str
    goal: str
    workout_days_per_week: int
    activity_level: str
    diet_type: str
    health_conditions: List[str] = []
    fitness_experience: str
    preferred_workout_type: str
    available_equipment: List[str] = []
    workout_time: str = "Evening"
    workout_specific_time: str = "18:00"

class HealthMetrics(BaseModel):
    bmi: float
    bmi_category: str
    bmi_color: str
    bmr: float
    tdee: float
    calories_target: float
    protein_g: float
    carbs_g: float
    fat_g: float
    ideal_weight_range: Tuple[float, float]
    body_fat_estimate: str

class Exercise(BaseModel):
    name: str
    sets: int = 3
    reps: str = "10-12"
    rest: str = "60 sec"
    instructions: str = ""

class DayPlan(BaseModel):
    day: str
    focus: str = "Rest Day"
    exercises: List[Exercise] = []

class WorkoutPlan(BaseModel):
    overview: str = ""
    weekly_schedule: List[DayPlan] = []
    progression_tips: List[str] = []

class Meal(BaseModel):
    meal: str
    time: str = ""
    options: List[str] = []
    calories: int = 0

class DietPlan(BaseModel):
    overview: str = ""
    daily_meals: List[Meal] = []
    foods_to_eat: List[str] = []
    foods_to_avoid: List[str] = []
    hydration_tip: str = ""

class Supplement(BaseModel):
    name: str
    purpose: str = ""
    dosage: str = ""
    timing: str = ""
    priority: str = "recommended"

class FitnessPlan(BaseModel):
    workout_plan: Optional[WorkoutPlan] = WorkoutPlan()
    diet_plan: Optional[DietPlan] = DietPlan()
    supplements: List[Supplement] = []
    lifestyle_tips: List[str] = []
    warnings: List[str] = []

class AnalysisResponse(BaseModel):
    metrics: HealthMetrics
    plan: FitnessPlan
