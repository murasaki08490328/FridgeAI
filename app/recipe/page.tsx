"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, ArrowLeft, Plus, Check, Utensils, Coins, ShoppingBag } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { RecipeImage } from "@/components/RecipeImage";

interface Recipe {
  titre: string;
  tempsPreparation: string;
  etapes: string[];
  macrosEstimees: { calories: string };
  ingrediensUtilises: string[];
  valeurEconomiseeEstimeeEnEuros: number;
  ingredientManquant?: string;
}

interface RecipeData {
  inventaire: any[];
  ingrediensDetectes: string[];
  categorieEconomie: Recipe[];
  categoriePremium: Recipe[];
}

export default function RecipePage() {
  const [data, setData] = useState<RecipeData | null>(null);
  const router = useRouter();
  
  const addToShoppingList = useAppStore(state => state.addToShoppingList);
  const shoppingList = useAppStore(state => state.shoppingList);
  const removeFromInventory = useAppStore(state => state.removeFromInventory);
  const addSavings = useAppStore(state => state.addSavings);
  
  const userProfile = useAppStore(state => state.userProfile);

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

  const handleCooked = (recipe: Recipe) => {
    removeFromInventory(recipe.ingrediensUtilises);
    addSavings(recipe.valeurEconomiseeEstimeeEnEuros);
    router.push("/");
  };

  const handleAddShopping = (ingredient: string) => {
    addToShoppingList(ingredient);
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
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gradient-to-r from-orange-100 dark:from-orange-950/50 to-amber-50 dark:to-amber-950/30 text-orange-700 dark:text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-orange-200 dark:border-orange-900/50 z-10">
        <span className="text-sm">{emoji}</span>
        <span>{userProfile.goal}</span>
      </div>
    );
  };

  const renderRecipeCard = (recipe: Recipe, isPremium: boolean) => {
    const isMissingAdded = isPremium && recipe.ingredientManquant ? shoppingList.includes(recipe.ingredientManquant) : false;

    return (
      <div className="p-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center gap-4 relative overflow-hidden">
          <GoalBadge />
          
          <div className="w-full relative mt-4">
            <RecipeImage title={recipe.titre} ingredients={recipe.ingrediensUtilises} />
          </div>

          <h2 className="text-2xl font-extrabold text-[#111827] dark:text-gray-100 leading-tight">
            {recipe.titre}
          </h2>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs font-bold">
            <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full">⏱ {recipe.tempsPreparation}</span>
            <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full">{recipe.macrosEstimees.calories}</span>
            <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full flex items-center">
              <Coins size={14} className="mr-1" />
              {recipe.valeurEconomiseeEstimeeEnEuros.toFixed(2)} €
            </span>
          </div>
        </div>

        {isPremium && recipe.ingredientManquant && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-200 dark:bg-amber-900/50 p-2 rounded-full text-amber-700 dark:text-amber-400">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-900 dark:text-amber-500 uppercase tracking-wider">Ingrédient Manquant</p>
                <p className="text-amber-950 dark:text-amber-100 font-medium text-lg">{recipe.ingredientManquant}</p>
              </div>
            </div>
            <button 
              onClick={() => handleAddShopping(recipe.ingredientManquant as string)}
              disabled={isMissingAdded}
              className={`p-3 rounded-full transition-colors ${isMissingAdded ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-500 dark:bg-amber-600 text-white active:scale-95'}`}
            >
              {isMissingAdded ? <Check size={20} /> : <Plus size={20} />}
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-slate-800">
          <Accordion className="w-full">
            <AccordionItem value="ingredients" className="border-b-0">
              <AccordionTrigger className="px-4 py-4 hover:no-underline rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 text-lg font-bold text-[#111827] dark:text-gray-100">
                Ingrédients ({recipe.ingrediensUtilises.length})
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
            
            <div className="h-px w-full bg-gray-100 dark:bg-slate-800 my-1"></div>
            
            <AccordionItem value="steps" className="border-b-0">
              <AccordionTrigger className="px-4 py-4 hover:no-underline rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 text-lg font-bold text-[#111827] dark:text-gray-100">
                Préparation ({recipe.etapes.length} étapes)
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {recipe.etapes.map((step, idx) => (
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

        <button 
          onClick={() => handleCooked(recipe)}
          className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white py-4 px-6 rounded-2xl text-xl font-bold transition-transform active:scale-95 shadow-xl shadow-emerald-500/30"
        >
          <Utensils size={24} />
          J'ai cuisiné ça !
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f9fafb] dark:bg-slate-950 pb-8 transition-colors">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-[#111827] dark:text-gray-100 truncate">Vos Recettes</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="max-w-lg mx-auto mt-6 px-2">
        <Tabs defaultValue="economie" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-gray-200 dark:bg-slate-800 p-1">
            <TabsTrigger value="economie" className="rounded-full text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              100% Restes
            </TabsTrigger>
            <TabsTrigger value="premium" className="rounded-full text-sm font-bold data-[state=active]:bg-[#111827] data-[state=active]:text-amber-400 data-[state=active]:shadow-sm flex gap-1">
              Premium ✨
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="economie" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
            <Carousel className="w-full">
              <CarouselContent>
                {data.categorieEconomie.map((recipe, index) => (
                  <CarouselItem key={index}>
                    {renderRecipeCard(recipe, false)}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-2 pb-4">
                <CarouselPrevious className="relative translate-y-0 left-0 hover:bg-gray-200 h-10 w-10" />
                <CarouselNext className="relative translate-y-0 right-0 hover:bg-gray-200 h-10 w-10" />
              </div>
            </Carousel>
          </TabsContent>
          
          <TabsContent value="premium" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
            <Carousel className="w-full">
              <CarouselContent>
                {data.categoriePremium.map((recipe, index) => (
                  <CarouselItem key={index}>
                    {renderRecipeCard(recipe, true)}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-2 pb-4">
                <CarouselPrevious className="relative translate-y-0 left-0 hover:bg-gray-200 h-10 w-10" />
                <CarouselNext className="relative translate-y-0 right-0 hover:bg-gray-200 h-10 w-10" />
              </div>
            </Carousel>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
