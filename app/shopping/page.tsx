"use client";

import { useAppStore } from "@/lib/store";
import { ShoppingCart, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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
    <main className="min-h-full w-full bg-[#f9fafb] p-6 pt-12 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600">
            <ShoppingCart size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#111827]">Courses</h1>
        </div>
        {shoppingList.length > 0 && (
          <button onClick={clearShoppingList} className="text-sm font-bold text-red-500 hover:text-red-700 p-2">
            Vider
          </button>
        )}
      </div>

      {shoppingList.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-lg">Votre liste est vide !</p>
          <p className="text-sm mt-2">Les ingrédients manquants apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shoppingList.map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <span className="font-bold text-[#111827] text-lg capitalize">{item}</span>
              <button 
                onClick={() => removeFromShoppingList(item)}
                className="p-3 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors active:scale-95"
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
