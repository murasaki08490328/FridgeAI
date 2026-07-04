"use client";

import { useAppStore } from "@/lib/store";
import { ChefHat, Trash2, AlertTriangle, CheckCircle2, Utensils, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FridgePage() {
  const inventory = useAppStore(state => state.inventory);
  const removeFromInventory = useAppStore(state => state.removeFromInventory);
  const updateShelfLife = useAppStore(state => state.updateShelfLife);
  const router = useRouter();

  const getExpirationStatus = (item: any) => {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const expirationDate = item.dateScan + (item.joursConservationEstimes * ONE_DAY);
    const timeUntilExpiration = expirationDate - Date.now();
    const daysLeft = Math.ceil(timeUntilExpiration / ONE_DAY);

    if (daysLeft <= 1) return { color: "text-red-500 bg-red-50 border-red-200", icon: AlertTriangle, text: `${daysLeft} jour` };
    if (daysLeft <= 3) return { color: "text-orange-500 bg-orange-50 border-orange-200", icon: AlertTriangle, text: `${daysLeft} jours` };
    return { color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2, text: `${daysLeft} jours` };
  };

  return (
    <main className="min-h-full w-full bg-[#f9fafb] p-6 pt-12 pb-24 flex flex-col">
      <div className="flex items-center gap-3 mb-8 shrink-0">
        <div className="bg-emerald-100 p-3 rounded-full text-[#10b981]">
          <ChefHat size={28} />
        </div>
        <h1 className="text-3xl font-extrabold text-[#111827]">Mon Frigo</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {inventory.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg">Votre frigo virtuel est vide !</p>
            <p className="text-sm mt-2">Prenez une photo sur l'accueil pour le remplir.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inventory.map(item => {
              const status = getExpirationStatus(item);
              const StatusIcon = status.icon;
              return (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg capitalize">{item.nom}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${status.color}`}>
                        <StatusIcon size={12} />
                        Reste : {status.text}
                      </div>
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                        <button 
                          onClick={() => updateShelfLife(item.id, -1)}
                          className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <button 
                          onClick={() => updateShelfLife(item.id, 1)}
                          className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromInventory([item.nom])}
                    className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors active:scale-95"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {inventory.length > 0 && (
        <div className="mt-8 shrink-0">
           <button 
             onClick={() => router.push("/")}
             className="w-full flex items-center justify-center gap-2 bg-[#111827] hover:bg-gray-800 text-white py-4 px-6 rounded-2xl text-lg font-bold transition-transform active:scale-95 shadow-xl"
           >
             <Utensils size={20} />
             Cuisiner avec ces restes
           </button>
        </div>
      )}
    </main>
  );
}
