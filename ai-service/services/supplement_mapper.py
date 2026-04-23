def map_supplements_to_apz(ai_plan: dict) -> list:
    """
    Maps AI-suggested supplements to relevant APZ product categories for marketing.
    """
    category_map = {
        "whey": "Whey Protein",
        "creatine": "Creatine",
        "multivitamin": "Multivitamins",
        "omega-3": "Fish Oil",
        "bcaa": "BCAAs",
        "pre-workout": "Pre-Workout",
        "casein": "Casein Protein",
        "glutamine": "L-Glutamine",
        "fat burner": "Fat Burners"
    }
    
    suggested_supps = ai_plan.get("supplements", [])
    apz_featured = []
    
    for supp in suggested_supps:
        supp_name = supp.get("name", "").lower()
        for key, value in category_map.items():
            if key in supp_name and value not in apz_featured:
                apz_featured.append(value)
                
    return apz_featured
