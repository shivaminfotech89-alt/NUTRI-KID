import React, { useState } from 'react';
import { Sparkles, Utensils, BookOpen, UserCheck, ShieldAlert, Award, ArrowLeft, Search, HelpCircle, Activity, ChevronRight } from 'lucide-react';
import IngredientSelector from './components/IngredientSelector';
import HarvardPlate from './components/HarvardPlate';
import { Recipe } from './types';

export default function App() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(['Broccoli', 'Carrots', 'Brown Rice', 'Chicken Breast', 'Eggs', 'Olive Oil', 'Fresh Water']);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [moveChallengeDone, setMoveChallengeDone] = useState<boolean>(false);
  const [showMoveConfetti, setShowMoveConfetti] = useState<boolean>(false);

  // Playful cooking state tips to rotate through during generation
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const loadingTips = [
    "Washing our fresh vegetables to create superhero shields... 🥬🧼",
    "Gently measuring out the steady-energy whole grains... 🌾📏",
    "Prepping the muscle-builder proteins with kid-glove care... 🍗🔬",
    "Stir-frying up some magic with cold-pressed olive oil... 🫗✨",
    "Pouring custom hydration cups to keep our brains sparkling... 💧🧠",
    "Chef Nutri-Kid is polishing the golden dining spoons... 🥄⭐"
  ];

  // Dynamic interval to change tips during loading
  React.useEffect(() => {
    let timer: any;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleGenerateRecipe = async () => {
    setIsLoading(true);
    setError(null);
    setCompletedTasks([]);
    setMoveChallengeDone(false);
    setShowMoveConfetti(false);

    try {
      const ingredientString = selectedIngredients.join(', ');
      const response = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientString })
      });

      if (!response.ok) {
        throw new Error('Our baking ovens got a bit too hot! Let\'s try mixing ingredients again.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setRecipe(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong in Chef Nutri-Kid\'s kitchen. Please make sure your server is online.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (task: string) => {
    if (completedTasks.includes(task)) {
      setCompletedTasks(completedTasks.filter(t => t !== task));
    } else {
      setCompletedTasks([...completedTasks, task]);
    }
  };

  const handleCompleteMoveChallenge = () => {
    setMoveChallengeDone(true);
    setShowMoveConfetti(true);
    setTimeout(() => {
      setShowMoveConfetti(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF0] font-sans pb-16 transition-all duration-300">
      {/* Visual Accent top ribbon */}
      <div className="h-3 bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4]"></div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Global Header Section */}
        <header className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-3xl p-5 md:p-6 shadow-sm border-2 border-[#FFD966] mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#FF6B6B] rounded-2xl flex items-center justify-center text-4xl shadow-md animate-chef-bounce">
              👨‍🍳
            </div>
            <div>
              <h1 id="app-title" className="text-2xl sm:text-3xl font-black text-[#4A4A4A] tracking-tight">
                CHEF NUTRI-KID
              </h1>
              <p className="text-xs sm:text-sm font-bold text-[#FF6B6B] flex items-center gap-1.5">
                Your Culinary Buddy & Nutrition Companion! <span className="animate-pulse">🌟</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-center sm:text-right">
            <div className="bg-[#4ECDC4] px-5 py-2.5 rounded-full text-white font-extrabold text-xs sm:text-sm shadow-xs uppercase tracking-wider">
              🍏 Harvard Kid's Plate Authorized
            </div>
            <div className="text-[10px] text-slate-400 font-semibold italic">
              Empowering little junior chefs with clinical cooking joy!
            </div>
          </div>
        </header>

        {/* Error Notification Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 text-rose-800 shadow-sm">
            <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">A Little Kitchen Spill Occurred!</h4>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
              <button 
                onClick={handleGenerateRecipe}
                className="mt-2 text-xs font-bold underline text-[#FF6B6B] hover:text-rose-900 block"
              >
                🍳 Tap here to retry baking!
              </button>
            </div>
          </div>
        )}

        {/* Main Cooking Control Arena */}
        {!recipe ? (
          /* View A: Ingredient Pick & Launch Fridge */
          <div className="space-y-6">
            {isLoading ? (
              /* Loading State Screen with rotating tips */
              <div className="bg-white rounded-3xl p-12 text-center border-4 border-[#FF6B6B] shadow-xl max-w-2xl mx-auto my-12 animate-pulse">
                <div className="text-6xl mb-6">🌋</div>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4ECDC4] mb-4"></div>
                <h3 className="text-2xl font-black text-slate-705">Mixing in Chef Nutri-Kid's Blender...</h3>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <p className="text-[#A35D36] font-bold text-md italic animate-bounce">
                    "{loadingTips[loadingTipIndex]}"
                  </p>
                </div>
                
                <p className="text-slate-400 text-xs mt-6">
                  Applying clinical nutrient ratios using Gemini AI for kid goodness...
                </p>
              </div>
            ) : (
              /* Ready to pick ingredients */
              <IngredientSelector
                selectedItems={selectedIngredients}
                onChangeSelected={setSelectedIngredients}
                customIngredients={customInputText}
                onChangeCustom={setCustomInputText}
                onGenerate={handleGenerateRecipe}
                isLoading={isLoading}
              />
            )}
          </div>
        ) : (
          /* View B: Active Recipe Plate & Steps */
          <div className="space-y-6">
            
            {/* Header recipe alert with return button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FFE8D6] rounded-2xl p-4 border-2 border-[#FFB280]">
              <div>
                <p className="text-xs uppercase font-extrabold tracking-widest text-[#A35D36]">
                  ✨ Fresh Out of the Kitchen
                </p>
                <h2 id="recipe-meal-title" className="text-2xl font-black text-[#7D4427] leading-tight">
                  {recipe.mealName}
                </h2>
              </div>
              <button
                id="btn-return-fridge"
                type="button"
                onClick={() => setRecipe(null)}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-350 shadow-xs flex items-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Go back to Pantry
              </button>
            </div>

            {/* Main Interactive 12-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: 5-Col Harvard Plate Visualization */}
              <div className="lg:col-span-5 flex flex-col space-y-6">
                <HarvardPlate recipe={recipe} />

                {/* Companion Quick Fact Widget */}
                <div className="bg-[#F1F8E9] p-5 rounded-3xl border-2 border-[#95CD41] shadow-sm relative overflow-hidden">
                  <span className="absolute top-2 right-2 text-3xl opacity-15">🔬</span>
                  <h5 className="text-xs font-black text-[#33691E] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#33691E]" /> DIETITIAN COCHING FACT
                  </h5>
                  <p className="text-xs font-bold text-[#558B2F]">
                    Chef Nutri-Kid's clinical design ensures plant oils provide essential brain fat (Omega-3/6) of the plate while grains keep the mitochondria engines charging!
                  </p>
                </div>
              </div>

              {/* Right Side: 7-Col Instructions, Tasks, Move Challenge */}
              <div className="lg:col-span-7 flex flex-col space-y-6">
                
                {/* Steps Section */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-gray-100 flex-1">
                  <h3 className="text-[#4A4A4A] font-black text-xl mb-6 flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-[#FF6B6B]" /> 👩‍🍳 EASY STEP-BY-STEP RECIPE
                  </h3>

                  <div className="space-y-5">
                    {recipe.instructions.map((step, idx) => (
                      <div key={idx} className="flex space-x-4 items-start">
                        <div className="font-black text-2xl text-[#4ECDC4] opacity-50 select-none mt-0.5">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Junior Assistant Tasks Section */}
                  <div className="mt-8 bg-[#E0F7FA] border-2 border-[#4ECDC4] rounded-2xl p-5 md:p-6">
                    <h4 className="text-[#00838F] font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-[#00838F]" /> 🧑‍🍳 JUNIOR CHEF SAFE TASKS
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 font-semibold">
                      Hey there kiddo! Tap and check off your kitchen chores to finish this dish safely:
                    </p>

                    <div className="space-y-2.5">
                      {recipe.juniorDuties.map((task, idx) => {
                        const isDone = completedTasks.includes(task);
                        return (
                          <div
                            key={idx}
                            id={`junior-task-box-${idx}`}
                            onClick={() => toggleTask(task)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              isDone
                                ? 'bg-teal-50 border-teal-300 text-teal-800 line-through opacity-85'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => {}} // toggled via parent div click
                              className="accent-teal-600 h-4 w-4 rounded-md pointer-events-none"
                            />
                            <span className="text-xs sm:text-sm font-bold leading-tight">
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {completedTasks.length === recipe.juniorDuties.length && (
                      <div className="mt-4 p-3 bg-teal-100 rounded-xl text-teal-900 border border-teal-400 text-center animate-bounce text-xs font-extrabold flex items-center justify-center gap-2">
                        🌟 Double High Five! Junior Chef Assistant Complete! 🥳
                      </div>
                    )}
                  </div>
                </div>

                {/* Row Grid: Move Challenge & Scientific Fact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Why this is powerful card */}
                  <div className="bg-[#FFE8D6] p-5 rounded-3xl border-2 border-[#FFB280] flex flex-col justify-between">
                    <div>
                      <h5 className="text-[10px] font-black text-[#A35D36] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        💡 WHY IT'S A POWER MEAL
                      </h5>
                      <p className="text-xs sm:text-sm font-bold text-[#7D4427] italic leading-relaxed">
                        "{recipe.powerMealFact}"
                      </p>
                    </div>
                    <div className="mt-4 text-xs text-[#A35D36] font-semibold flex items-center gap-1.5">
                      💪 Nutrition Science for Kids!
                    </div>
                  </div>

                  {/* Move Challenge Card */}
                  <div className={`p-5 rounded-3xl border-2 flex flex-col justify-between transition-all ${
                    moveChallengeDone 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                      : 'bg-[#FFFBEB] border-[#FFD93D] text-[#854d0e]'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          🏃‍♂️ MOVE CHALLENGE!
                        </h5>
                        {moveChallengeDone && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            COMPLETED ⭐
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-bold leading-relaxed">
                        {recipe.moveChallenge}
                      </p>
                    </div>

                    <div className="mt-4 pt-2">
                      {moveChallengeDone ? (
                        <p className="text-xs font-black text-emerald-700 italic flex items-center gap-1">
                          🎉 Engines fired up & ready to digest!
                        </p>
                      ) : (
                        <button
                          id="btn-complete-challenge"
                          onClick={handleCompleteMoveChallenge}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-transform hover:scale-102 flex items-center justify-center gap-1.5"
                        >
                          🦖 Done the Challenge!
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Move challenge confetti simulation banner */}
                {showMoveConfetti && (
                  <div className="p-3 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-2xl text-[#7D4427] font-black text-xs text-center border-2 border-yellow-400 animate-bounce">
                    ✨ Sparkle Power Activators Online! You stomped like a real dinosaur! 🦖✨ Let's enjoy!
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Navigation & Youtube assistant */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📺</span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wide">
                  Recommended Youtube Search: 
                  <span id="youtube-search-query" className="text-[#FF6B6B] block sm:inline sm:ml-1 font-mono font-bold text-xs bg-slate-50 px-2 py-1 rounded-md max-w-full truncate">
                    "{recipe.tutorialQuery}"
                  </span>
                </p>
              </div>

              <button
                onClick={() => setRecipe(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md tracking-wider transition-all"
              >
                🌿 Cook Another Dish
              </button>
            </div>

          </div>
        )}

        {/* Global Footer Details */}
        <footer className="mt-12 flex flex-col sm:flex-row items-center justify-between text-slate-400 px-4 py-6 border-t border-slate-200/60 text-center gap-2">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
            🍎 Based on the Harvard Kid’s Healthy Eating Plate Model
          </p>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
            © 2026 Chef Nutri-Kid • Hand-prepared with Clinical Culinary Love
          </p>
        </footer>

      </div>
    </div>
  );
}
