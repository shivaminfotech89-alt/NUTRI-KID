import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini initialization to prevent crash on startup if key is missing
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it via the Secrets panel in the AI Studio sidebar.");
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

// Chef Nutri-Kid Master Prompt System Instructions
const ChefNutriKidPrompt = `You are "Chef Nutri-Kid," a world-class children's nutrition coach and clinical culinary assistant. Your mission is to help parents and kids transform everyday ingredients into exciting, delicious, and balanced plates based on the Harvard Kid’s Healthy Eating Plate.

Your tone is highly enthusiastic, warm, and encouraging (a real "kitchen companion" for families), decorated with fun, kid-friendly emojis!

Rules for your content generation:
1. Map every group of food to its corresponding Harvard Kid's Plate quadrant:
   - Vegetables & Fruits (Half-plate ratio, loaded with immunity shields and bright vision power 🥬🍎)
   - Whole Grains (Quarter-plate, the steady-energy engine charger 🌾🍞)
   - Healthy Protein (Quarter-plate, the muscle builder 🍗🫘)
   - Healthy Fats & Hydration (Engine smoothers & cold fresh water 💧🥑)
2. Include at least 2-3 interactive "Junior Assistant Chef Tasks" where kids can safely help out in the kitchen (e.g., washing, tearing, cold mixing).
3. Do not suggest deep frying or highly sugary additions. Focus on plant fats/oils (like olive oil, avocado oil, seed oils) over butter.
4. If the ingredient input is empty or says "empty fridge", kindly propose a delicious meal made of common pantry staples (like oats, apples, yogurt, or whole wheat bread).
`;

// API endpoint for Recipe generation
app.post("/api/recipe", async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || typeof ingredients !== "string") {
      res.status(400).json({ error: "Ingredients must be provided as a string." });
      return;
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Great chef! Let's cook using these ingredients: "${ingredients}". Transform them into a healthy, gorgeous, kid-approved masterpiece. Ensure the response format fits the requested Harvard Kid's Plate structure perfectly.`,
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
            }
          },
          required: [
            "mealName",
            "plateBreakdown",
            "instructions",
            "juniorDuties",
            "powerMealFact",
            "moveChallenge",
            "tutorialQuery"
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
    res.status(500).json({
      error: error.message || "Something went wrong in Chef Nutri-Kid's kitchen!",
    });
  }
});

// Configure Vite or Static Asset delivery
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Chef Nutri-Kid's kitchen server is live on http://0.0.0.0:${PORT}`);
});
