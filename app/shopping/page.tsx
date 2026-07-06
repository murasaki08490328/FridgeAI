"use client";

import { useAppStore } from "@/lib/store";
import { ShoppingCart, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ShoppingPage() {
  const shoppingList = useAppStore(state => state.shoppingList);
  const removeFromShoppingList = useAppStore(state => state.removeFromShoppingList);
  const clearShoppingList = useAppStore(state => state.clearShoppingList);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex-1 w-full flex flex-col bg-[#f9fafb] dark:bg-slate-950 transition-colors p-6 pt-12 pb-24 min-h-[100dvh]">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full text-amber-600 dark:text-amber-400">
            <ShoppingCart size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#111827] dark:text-gray-100">Courses</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {shoppingList.length > 0 && (
            <button onClick={clearShoppingList} className="text-sm font-bold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2">
              Vider
            </button>
          )}
        </div>
      </div>

      {shoppingList.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-20 flex-1">
          <p className="text-lg">Votre liste est vide !</p>
          <p className="text-sm mt-2">Les ingrédients manquants apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {shoppingList.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <span className="font-bold text-[#111827] dark:text-gray-100 text-lg capitalize">{item}</span>
              <button 
                onClick={() => removeFromShoppingList(item)}
                className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors active:scale-95"
              >
                <Check size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
