import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const apiRouter = express.Router();

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it via the Secrets panel or Environment Variables in your hosting provider.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Helper to retry on 503/429 specifically
async function generateWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const status = error?.status || error?.response?.status || 500;
      const isRetryable = status === 503 || status === 429 || error.message?.includes('503') || error.message?.includes('429') || error.message?.includes('high demand');
      if (!isRetryable || i === maxRetries - 1) {
        throw error;
      }
      const delay = 1000 * Math.pow(2, i);
      console.warn(`Gemini API busy (attempt ${i + 1}/${maxRetries}). Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// Chef Nutri-Kid Master Prompt System Instructions
const ChefNutriKidPrompt = `You are "Chef Nutri-Kid," a world-class children's nutrition coach and clinical culinary assistant. Your mission is to help parents and kids transform everyday ingredients into exciting, delicious, and balanced plates based on the Harvard Kid’s Healthy Eating Plate.

Your tone is highly enthusiastic, warm, encouraging, and professional (a real "kitchen companion" for families), decorated with fun, kid-friendly emojis! You must respond in the user's requested language.

Rules for your content generation:
1. Map every group of food to its corresponding Harvard Kid's Plate quadrant:
   - Vegetables & Fruits (Half-plate ratio, loaded with immunity shields and bright vision power 🥬🍎)
   - Whole Grains (Quarter-plate, the steady-energy engine charger 🌾🍞)
   - Healthy Protein (Quarter-plate, the muscle builder 🍗🫘)
   - Healthy Fats & Hydration (Engine smoothers & cold fresh water 💧🥑)
2. Include at least 2-3 interactive "Junior Assistant Chef Tasks" where kids can safely help out in the kitchen (e.g., washing, tearing, cold mixing).
3. Do not suggest deep frying or highly sugary additions. Focus on plant fats/oils (like olive oil, avocado oil, seed oils) over butter.
4. If the ingredient input is empty or says "empty fridge", kindly propose a delicious meal made of common pantry staples (like oats, apples, yogurt, or whole wheat bread).
5. Calculate approximate nutritional information (Calories, Protein, Carbs, Fat, Fiber, Key Vitamins) for a standard kid's portion. Make it professional sounding.
`;

// API endpoint for Recipe generation
apiRouter.post("/recipe", async (req, res) => {
  try {
    const { ingredients, language = "English", diet = "Any / No Restriction" } = req.body;
    if (!ingredients || typeof ingredients !== "string") {
      res.status(400).json({ error: "Ingredients must be provided as a string." });
      return;
    }

    const ai = getGeminiClient();

    const response = await generateWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Great chef! Let's cook using these ingredients: "${ingredients}". The dietary preference is "${diet}". Transform them into a healthy, gorgeous, kid-approved masterpiece matching this diet. Please generate the response in ${language}. Ensure the response format fits the requested Harvard Kid's Plate structure perfectly.`,
      config: {
        systemInstruction: ChefNutriKidPrompt,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealName: {
              type: Type.STRING,
              description: "Fabulous kid-themed title with emojis (e.g. 'Captain Broccoli's Shield Sandwiches 🥦🦸‍♂️')."
            },
            plateBreakdown: {
              type: Type.OBJECT,
              properties: {
                fruitsVeggies: {
                  type: Type.STRING,
                  description: "Explain how fruits/veg map to 50% of the plate and what power they give (e.g. eye power or custom immunity shield, decorated with emojis)."
                },
                wholeGrains: {
                  type: Type.STRING,
                  description: "Explain the whole grain source (25% energy module) and why it keeps our engines running forever, with emojis."
                },
                strongProtein: {
                  type: Type.STRING,
                  description: "Explain the healthy protein (25% muscle builder) and how it creates strong arms/legs, with emojis."
                },
                fatsHydrates: {
                  type: Type.STRING,
                  description: "Healthy fats used (e.g., olive oil) and cheerful hydration suggestions, with emojis."
                }
              },
              required: ["fruitsVeggies", "wholeGrains", "strongProtein", "fatsHydrates"]
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Detailed, easy step-by-step cooking steps. Maximum 6 clear steps, easy for parents."
            },
            juniorDuties: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 fun interactive junior tasks (e.g. 'Tear the spinach leaves into tiny bites', 'Mix the sauce with a spoon!')."
            },
            powerMealFact: {
              type: Type.STRING,
              description: "A super encouraging scientific fact told in very cute kid terms (e.g. 'Beta-carotene in carrots is like Night Vision Goggles!')."
            },
            moveChallenge: {
              type: Type.STRING,
              description: "A fun 15-second physical challenge related to the food theme (e.g. 'Do 10 Star Jumps to fire up your digestive engine before the first bite!')."
            },
            tutorialQuery: {
              type: Type.STRING,
              description: "Exact search term to find a tutorial video (e.g., 'kids healthy brown rice bowl recipe tutorial')."
            },
            dietIndicator: {
              type: Type.STRING,
              description: "A short indicator of the recipe's diet type with an emoji (e.g., '🟢 Pure Veg', '🔴 Non-Veg', '🥚 Eggetarian', '🌱 Vegan', '🧄 Jain')."
            },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.INTEGER, description: "Total calories for a kid's portion" },
                protein: { type: Type.STRING, description: "Protein amount (e.g., '15g')" },
                carbs: { type: Type.STRING, description: "Carbohydrates amount (e.g., '30g')" },
                fat: { type: Type.STRING, description: "Healthy fats amount (e.g., '10g')" },
                fiber: { type: Type.STRING, description: "Fiber amount (e.g., '8g')" },
                keyVitamins: { type: Type.STRING, description: "Key vitamins provided (e.g., 'Vitamin A, C, Iron')" }
              },
              required: ["calories", "protein", "carbs", "fat", "fiber", "keyVitamins"]
            }
          },
          required: [
            "mealName",
            "plateBreakdown",
            "instructions",
            "juniorDuties",
            "powerMealFact",
            "moveChallenge",
            "tutorialQuery",
            "dietIndicator",
            "nutrition"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response string received from the Gemini clinical culinary engine.");
    }

    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini culinary engine error:", error);
    let errorMessage = error.message || "Something went wrong in Chef Nutri-Kid's kitchen!";
    if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("429")) {
      errorMessage = "The AI Chef's kitchen is currently experiencing high demand! Please try again in a moment.";
    }
    res.status(500).json({
      error: errorMessage,
    });
  }
});

// API endpoint for Weekly Meal Plan generation
apiRouter.post("/weekly-plan", async (req, res) => {
  try {
    const { ageGroup, language = "English", diet = "Any / No Restriction" } = req.body;
    if (!ageGroup) {
      res.status(400).json({ error: "Age group must be provided." });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `You are a professional pediatric dietitian and "Chef Nutri-Kid".
Please create a professional weekly healthy meal chart (7 days) for a child in the age group: ${ageGroup}.
The dietary preference is: ${diet}. Ensure all meals strictly adhere to this dietary restriction.
Adhere to the Harvard Kid's Healthy Eating Plate guidelines.
Please generate the response in ${language}.
Return a structured weekly meal plan and a concise grocery shopping list. Ensure professional formatting and accurate language translation.`;

    const response = await generateWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: ChefNutriKidPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Professional title for the weekly plan" },
            tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 professional nutrition tips for this age group" },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "Name of the day (e.g., Monday)" },
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  dinner: { type: Type.STRING },
                  snacks: { type: Type.STRING },
                  powerFact: { type: Type.STRING, description: "Short nutritional fact about this day's meals" }
                },
                required: ["day", "breakfast", "lunch", "dinner", "snacks", "powerFact"]
              }
            },
            shoppingList: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Categorized shopping list items" }
          },
          required: ["title", "tips", "days", "shoppingList"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response string received from the Gemini clinical culinary engine.");
    }

    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini weekly chart engine error:", error);
    let errorMessage = error.message || "Something went wrong generating the weekly chart!";
    if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("429")) {
      errorMessage = "The AI Chef's kitchen is currently experiencing high demand! Please try again in a moment.";
    }
    res.status(500).json({
      error: errorMessage,
    });
  }
});
