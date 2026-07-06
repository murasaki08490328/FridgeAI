"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, ArrowLeft, Plus, Check, Utensils, Coins, ShoppingBag, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RecipeData {
  inventaire: any[];
  recette100PourcentRestes: {
    titre: string;
    etapes: string[];
    ingrediensUtilises: string[];
    valeurEconomiseeEstimeeEnEuros: number;
  };
  recettePremiumUnManquant: {
    titre: string;
    etapes: string[];
    ingrediensUtilises: string[];
    ingredientManquant: string;
    valeurEconomiseeEstimeeEnEuros: number;
  };
}

interface RegeneratedRecipe {
  titre: string;
  tempsPreparation: string;
  macrosEstimees: { calories: string; proteines: string; glucides: string; lipides: string };
  etapes: string[];
  pourquoiCeRepas: string;
}

export default function RecipePage() {
  const [data, setData] = useState<RecipeData | null>(null);
  const [mode, setMode] = useState<"100" | "premium">("100");
  
  const [regeneratedRecipe, setRegeneratedRecipe] = useState<RegeneratedRecipe | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const router = useRouter();
  
  const addToShoppingList = useAppStore(state => state.addToShoppingList);
  const shoppingList = useAppStore(state => state.shoppingList);
  const removeFromInventory = useAppStore(state => state.removeFromInventory);
  const addSavings = useAppStore(state => state.addSavings);
  
  const userProfile = useAppStore(state => state.userProfile);
  const rejectedRecipes = useAppStore(state => state.rejectedRecipes);
  const addRejectedRecipe = useAppStore(state => state.addRejectedRecipe);
  const ingredientsDetectes = useAppStore(state => state.ingredientsDetectes);

  useEffect(() => {
    const raw = sessionStorage.getItem("recipeData");
    if (!raw) {
      router.push("/");
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch (e) {
      console.error(e);
      router.push("/");
    }
  }, [router]);

  if (!data) {
    return <div className="min-h-[100dvh] bg-[#f9fafb] dark:bg-slate-950 flex items-center justify-center text-[#111827] dark:text-gray-100 transition-colors">Chargement...</div>;
  }

  const recipe = mode === "100" ? data.recette100PourcentRestes : data.recettePremiumUnManquant;
  const isPremium = mode === "premium";
  const missingIngredient = isPremium ? data.recettePremiumUnManquant.ingredientManquant : null;
  const isMissingAdded = missingIngredient ? shoppingList.includes(missingIngredient) : false;

  const handleCooked = () => {
    if (regeneratedRecipe) {
      // Pour une recette régénérée, on ne supprime pas les ingrédients (car non renvoyés)
      router.push("/");
    } else {
      removeFromInventory(recipe.ingrediensUtilises);
      addSavings(recipe.valeurEconomiseeEstimeeEnEuros);
      router.push("/");
    }
  };

  const handleAddShopping = () => {
    if (missingIngredient) addToShoppingList(missingIngredient);
  };
  
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    
    const currentTitle = regeneratedRecipe ? regeneratedRecipe.titre : recipe.titre;
    addRejectedRecipe(currentTitle);
    
    try {
      const response = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredientsDetectes,
          userProfile,
          rejectedRecipes: [...rejectedRecipes, currentTitle]
        })
      });
      
      const newRecipe = await response.json();
      if (newRecipe.error) throw new Error(newRecipe.error);
      
      setRegeneratedRecipe(newRecipe);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la régénération. Veuillez réessayer.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const GoalBadge = () => {
    let emoji = "🥗";
    switch (userProfile.goal) {
      case "Sèche": emoji = "🔥"; break;
      case "Prise de masse": emoji = "💪"; break;
      case "Maintien": emoji = "⚖️"; break;
      case "Équilibré": emoji = "🥗"; break;
    }
    return (
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gradient-to-r from-orange-100 dark:from-orange-950/50 to-amber-50 dark:to-amber-950/30 text-orange-700 dark:text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-orange-200 dark:border-orange-900/50">
        <span className="text-sm">{emoji}</span>
        <span>{userProfile.goal}</span>
      </div>
    );
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f9fafb] dark:bg-slate-950 pb-28 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-[#111827] dark:text-gray-100 truncate">Choix de recette</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={handleRegenerate}
            disabled={isRegenerating || ingredientsDetectes.length === 0}
            className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <RefreshCw size={16} className={isRegenerating ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Proposer une autre idée</span>
          </button>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        
        {!regeneratedRecipe && (
          <div className="flex bg-gray-200 dark:bg-slate-800 p-1 rounded-full w-full">
            <button 
              onClick={() => setMode("100")}
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${mode === "100" ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              100% Restes
            </button>
            <button 
              onClick={() => setMode("premium")}
              className={`flex-1 py-3 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-1 ${mode === "premium" ? 'bg-[#111827] dark:bg-slate-950 text-amber-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Premium ✨
            </button>
          </div>
        )}

        {/* Main Title Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center gap-3 relative overflow-hidden">
          {regeneratedRecipe && <GoalBadge />}
          
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full text-[#10b981] mt-2">
            <ChefHat size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#111827] dark:text-gray-100 leading-tight">
            {regeneratedRecipe ? regeneratedRecipe.titre : recipe.titre}
          </h2>
          
          {regeneratedRecipe ? (
            <div className="w-full mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic font-medium">"{regeneratedRecipe.pourquoiCeRepas}"</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs font-bold">
                <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full">⏱ {regeneratedRecipe.tempsPreparation}</span>
                <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full">{regeneratedRecipe.macrosEstimees.calories}</span>
                <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full">{regeneratedRecipe.macrosEstimees.proteines} Prot</span>
                <span className="bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-full">{regeneratedRecipe.macrosEstimees.glucides} Glu</span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold mt-2">
              <Coins size={16} className="mr-1" />
              Économie : {recipe.valeurEconomiseeEstimeeEnEuros.toFixed(2)} €
            </div>
          )}
        </div>

        {/* Missing Ingredient Badge (Premium) */}
        {!regeneratedRecipe && isPremium && missingIngredient && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-200 dark:bg-amber-900/50 p-2 rounded-full text-amber-700 dark:text-amber-400">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-900 dark:text-amber-500 uppercase tracking-wider">Ingrédient Manquant</p>
                <p className="text-amber-950 dark:text-amber-100 font-medium text-lg">{missingIngredient}</p>
              </div>
            </div>
            <button 
              onClick={handleAddShopping}
              disabled={isMissingAdded}
              className={`p-3 rounded-full transition-colors ${isMissingAdded ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-500 dark:bg-amber-600 text-white active:scale-95'}`}
            >
              {isMissingAdded ? <Check size={20} /> : <Plus size={20} />}
            </button>
          </div>
        )}

        {/* Content Accordion */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-slate-800">
          <Accordion key={regeneratedRecipe ? regeneratedRecipe.titre : "initial"} className="w-full" defaultValue={regeneratedRecipe ? ["steps"] : []}>
            {!regeneratedRecipe && (
              <AccordionItem value="ingredients" className="border-b-0">
                <AccordionTrigger className="px-4 py-4 hover:no-underline rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 text-lg font-bold text-[#111827] dark:text-gray-100">
                  Ingrédients utilisés ({recipe.ingrediensUtilises.length})
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ul className="space-y-2">
                    {recipe.ingrediensUtilises.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-[#10b981] font-bold">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {!regeneratedRecipe && <div className="h-px w-full bg-gray-100 dark:bg-slate-800 my-1"></div>}
            
            <AccordionItem value="steps" className="border-b-0">
              <AccordionTrigger className="px-4 py-4 hover:no-underline rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 text-lg font-bold text-[#111827] dark:text-gray-100">
                Préparation ({regeneratedRecipe ? regeneratedRecipe.etapes.length : recipe.etapes.length} étapes)
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {(regeneratedRecipe ? regeneratedRecipe.etapes : recipe.etapes).map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1 leading-relaxed">{step}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-slate-950 dark:via-slate-950 to-transparent pointer-events-none pb-[88px]">
        <button 
          onClick={handleCooked}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white py-4 px-6 rounded-2xl text-xl font-bold transition-transform active:scale-95 shadow-xl shadow-emerald-500/30 pointer-events-auto"
        >
          <Utensils size={24} />
          J'ai cuisiné ça !
        </button>
      </div>
    </main>
  );
}
