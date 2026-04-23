from groq import Groq
import json
from config import get_settings
from utils.prompt_builder import build_fitness_prompt

settings = get_settings()
client = Groq(api_key=settings.GROQ_API_KEY)

async def generate_fitness_plan(user_data, metrics) -> dict:
    prompt = build_fitness_prompt(user_data, metrics)
    
    completion = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an expert Fitness Coach. You provide structured, scientific, and personalized fitness advice in JSON format. Your output must be a single valid JSON object."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=4000,
        top_p=1,
        stream=False,
        response_format={"type": "json_object"}
    )
    
    # Extract JSON from response
    content = completion.choices[0].message.content
    try:
        return json.loads(content)
    except Exception as e:
        print(f"Error parsing AI response: {e}")
        print(f"Raw response: {content}")
        # Attempt to find JSON if there is noise
        try:
            start = content.find('{')
            end = content.rfind('}') + 1
            json_str = content[start:end]
            return json.loads(json_str)
        except:
            raise ValueError("Failed to generate a valid fitness plan from AI")
