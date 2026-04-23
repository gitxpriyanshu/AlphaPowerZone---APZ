from typing import Tuple
from models.schemas import HealthMetrics

def calculate_bmi(weight_kg: float, height_cm: float) -> Tuple[float, str, str]:
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    
    if bmi < 18.5:
        category, color = "Underweight", "yellow"
    elif 18.5 <= bmi < 25:
        category, color = "Normal", "green"
    elif 25 <= bmi < 30:
        category, color = "Overweight", "yellow"
    else:
        category, color = "Obese", "red"
        
    return round(bmi, 2), category, color

def calculate_bmr(weight: float, height: float, age: int, gender: str) -> float:
    # Mifflin-St Jeor Equation
    if gender.lower() == "male":
        return (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        return (10 * weight) + (6.25 * height) - (5 * age) - 161

def calculate_tdee(bmr: float, activity_level: str) -> float:
    multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725,
        "extremely_active": 1.9
    }
    return bmr * multipliers.get(activity_level, 1.2)

def calculate_calorie_target(tdee: float, goal: str, gender: str) -> float:
    min_calories = 1500 if gender.lower() == "male" else 1200
    
    if goal == "fat_loss":
        target = tdee - 500
    elif goal == "muscle_gain":
        target = tdee + 300
    elif goal == "maintenance":
        target = tdee
    elif goal == "athletic_performance":
        target = tdee + 200
    else:
        target = tdee
        
    return max(target, min_calories)

def calculate_macros(calorie_target: float, weight: float, goal: str) -> Tuple[float, float, float]:
    # Protein: 1.8g to 2.2g per kg
    protein_multiplier = 2.2 if goal == "muscle_gain" else 2.0
    protein_g = weight * protein_multiplier
    
    # Fat: 25-30% of total calories
    fat_calories = calorie_target * 0.25
    fat_g = fat_calories / 9
    
    # Carbs: Remainder
    remaining_calories = calorie_target - (protein_g * 4) - (fat_g * 9)
    carbs_g = remaining_calories / 4
    
    return round(protein_g, 1), round(carbs_g, 1), round(fat_g, 1)

def get_metrics(data: 'FitnessInput') -> HealthMetrics:
    bmi, category, color = calculate_bmi(data.weight_kg, data.height_cm)
    bmr = calculate_bmr(data.weight_kg, data.height_cm, data.age, data.gender)
    tdee = calculate_tdee(bmr, data.activity_level)
    calories_target = calculate_calorie_target(tdee, data.goal, data.gender)
    protein, carbs, fat = calculate_macros(calories_target, data.weight_kg, data.goal)
    
    # Ideal Weight Range (BMI 18.5 - 24.9)
    height_m = data.height_cm / 100
    min_weight = 18.5 * (height_m ** 2)
    max_weight = 24.9 * (height_m ** 2)
    
    return HealthMetrics(
        bmi=bmi,
        bmi_category=category,
        bmi_color=color,
        bmr=round(bmr, 2),
        tdee=round(tdee, 2),
        calories_target=round(calories_target, 2),
        protein_g=protein,
        carbs_g=carbs,
        fat_g=fat,
        ideal_weight_range=(round(min_weight, 1), round(max_weight, 1)),
        body_fat_estimate="15-25% (Estimated based on BMI)"
    )
