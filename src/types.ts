export interface Recipe {
  mealName: string;
  plateBreakdown: {
    fruitsVeggies: string;
    wholeGrains: string;
    strongProtein: string;
    fatsHydrates: string;
  };
  instructions: string[];
  juniorDuties: string[];
  powerMealFact: string;
  moveChallenge: string;
  tutorialQuery: string;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  category: 'fruitsVeggies' | 'wholeGrains' | 'strongProtein' | 'fatsHydrates';
  color: string;
}

export const PRESET_INGREDIENTS: FoodItem[] = [
  // Fruits & Veggies
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'fruitsVeggies', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
  { id: 'carrots', name: 'Carrots', emoji: '🥕', category: 'fruitsVeggies', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { id: 'spinach', name: 'Spinach', emoji: '🥬', category: 'fruitsVeggies', color: 'bg-green-100 border-green-300 text-green-800' },
  { id: 'apples', name: 'Apples', emoji: '🍎', category: 'fruitsVeggies', color: 'bg-red-100 border-red-300 text-red-800' },
  { id: 'tomatoes', name: 'Tomatoes', emoji: '🍅', category: 'fruitsVeggies', color: 'bg-red-100 border-red-300 text-red-800' },
  { id: 'sweet_potato', name: 'Sweet Potato', emoji: '🍠', category: 'fruitsVeggies', color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { id: 'pepper', name: 'Bell Pepper', emoji: '🫑', category: 'fruitsVeggies', color: 'bg-green-100 border-green-300 text-green-800' },
  { id: 'berries', name: 'Berries', emoji: '🍓', category: 'fruitsVeggies', color: 'bg-rose-100 border-rose-300 text-rose-800' },
  { id: 'avocado', name: 'Avocado', emoji: '🥑', category: 'fatsHydrates', color: 'bg-lime-100 border-lime-300 text-lime-800' },

  // Whole Grains
  { id: 'brown_rice', name: 'Brown Rice', emoji: '🍚', category: 'wholeGrains', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { id: 'whole_wheat_bread', name: 'Whole Wheat Bread', emoji: '🍞', category: 'wholeGrains', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { id: 'oats', name: 'Oats', emoji: '🥣', category: 'wholeGrains', color: 'bg-amber-100 border-amber-200 text-amber-800' },
  { id: 'quinoa', name: 'Quinoa', emoji: '🌾', category: 'wholeGrains', color: 'bg-amber-50 border-amber-300 text-amber-800' },
  { id: 'whole_pasta', name: 'Wheat Pasta', emoji: '🍝', category: 'wholeGrains', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },

  // Healthy Protein
  { id: 'chicken', name: 'Chicken Breast', emoji: '🍗', category: 'strongProtein', color: 'bg-rose-50 border-rose-200 text-rose-800' },
  { id: 'eggs', name: 'Eggs', emoji: '🥚', category: 'strongProtein', color: 'bg-stone-100 border-stone-300 text-stone-800' },
  { id: 'salmon', name: 'Salmon', emoji: '🐟', category: 'strongProtein', color: 'bg-sky-50 border-sky-200 text-sky-800' },
  { id: 'chickpeas', name: 'Chickpeas', emoji: '🫘', category: 'strongProtein', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { id: 'tofu', name: 'Tofu', emoji: '🟧', category: 'strongProtein', color: 'bg-neutral-100 border-neutral-300 text-neutral-800' },
  { id: 'yogurt', name: 'Greek Yogurt', emoji: '🥛', category: 'strongProtein', color: 'bg-blue-50 border-blue-200 text-blue-800' },

  // Fats & Hydration
  { id: 'olive_oil', name: 'Olive Oil', emoji: '🫗', category: 'fatsHydrates', color: 'bg-lime-50 border-lime-200 text-lime-800' },
  { id: 'walnuts', name: 'Walnuts', emoji: '🥜', category: 'fatsHydrates', color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { id: 'seeds', name: 'Chia Seeds', emoji: '🌱', category: 'fatsHydrates', color: 'bg-green-50 border-green-200 text-green-800' },
  { id: 'water', name: 'Fresh Water', emoji: '💧', category: 'fatsHydrates', color: 'bg-sky-100 border-sky-300 text-sky-800' }
];
