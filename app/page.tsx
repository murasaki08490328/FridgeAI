"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, ChefHat, PiggyBank, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import SettingsModal from "@/components/SettingsModal";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [showLoading, setShowLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const savings = useAppStore(state => state.savings);
  const resetSavings = useAppStore(state => state.resetSavings);
  const addToInventory = useAppStore(state => state.addToInventory);
  const setIngredientsDetectes = useAppStore(state => state.setIngredientsDetectes);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview and loading state
    const reader = new FileReader();
    reader.onload = async (event) => {
      // Resize image using Canvas to reduce payload size
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 1024;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64Image = canvas.toDataURL("image/jpeg", 0.8);
        setPreviewImage(base64Image);
        setShowLoading(true);
        setIsAnalyzing(true);
        setAnalyzedData(null);
        
        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
          });
          
          const data = await response.json();
          
          if (!data.inventaire || data.inventaire.length === 0) {
             alert("L'IA n'a pas pu identifier d'ingrédients exploitables ou l'image est trop floue. Veuillez réessayer.");
             setShowLoading(false);
             setIsAnalyzing(false);
             setPreviewImage(null);
          } else {
             setAnalyzedData(data);
             setIsAnalyzing(false);
          }
        } catch (error) {
          console.error(error);
          alert("Une erreur est survenue lors de l'analyse.");
          setShowLoading(false);
          setIsAnalyzing(false);
          setPreviewImage(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLoadingComplete = () => {
    if (analyzedData) {
      const newItems = analyzedData.inventaire.map((i: any) => ({
        id: crypto.randomUUID(),
        nom: i.nom,
        joursConservationEstimes: i.joursConservationEstimes,
        alertePeremptionProche: i.alertePeremptionProche,
        dateScan: Date.now()
      }));
      addToInventory(newItems);
      setIngredientsDetectes(newItems.map((i: any) => i.nom));

      sessionStorage.setItem("recipeData", JSON.stringify(analyzedData));
      router.push("/recipe");
    }
  };

  return (
    <main className="h-[100dvh] w-full overflow-hidden flex flex-col relative bg-[#f9fafb] dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="flex justify-between items-center p-6 shrink-0">
        <div className="flex items-center gap-2 text-[#10b981]">
          <ChefHat size={32} />
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-gray-100">Frigo Chef</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SettingsModal />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 pb-12 overflow-y-auto">
        {!showLoading && !previewImage ? (
          <>
            <div className="text-center space-y-3 max-w-sm">
              {mounted && savings > 0 && (
                <div className="flex items-center justify-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-2xl mb-6 shadow-sm border border-emerald-100 dark:border-emerald-900 mx-auto w-max">
                  <div className="flex items-center gap-2">
                    <PiggyBank size={24} className="text-emerald-500" />
                    <span className="font-bold text-lg">{savings.toFixed(2)} € <span className="font-medium text-sm">économisés</span></span>
                  </div>
                  <div className="w-[1px] h-6 bg-emerald-200 dark:bg-emerald-800"></div>
                  <button 
                    onClick={() => {
                      if (window.confirm("Voulez-vous vraiment réinitialiser vos économies ?")) {
                        resetSavings();
                      }
                    }}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-full transition-colors active:scale-95"
                    title="Réinitialiser les économies"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              )}
              <h2 className="text-3xl font-extrabold text-[#111827] dark:text-gray-100">
                Recette saine en 1 clic
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Prenez en photo l&apos;intérieur de votre frigo et laissez l&apos;IA créer une recette équilibrée.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-4">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                id="camera-input"
                ref={cameraInputRef}
                onChange={handleImageCapture}
              />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                id="gallery-input"
                ref={galleryInputRef}
                onChange={handleImageCapture}
              />
              
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-[#10b981] hover:bg-[#059669] text-white py-5 px-6 rounded-2xl text-xl font-bold transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
              >
                <Camera size={28} />
                Ouvrir l&apos;appareil photo
              </button>
              
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 py-4 px-6 rounded-2xl text-lg font-semibold transition-all active:scale-95 shadow-sm"
              >
                <ImageIcon size={24} />
                Choisir depuis la galerie
              </button>
            </div>
          </>
        ) : (
          <LoadingOverlay 
            isAnalyzing={isAnalyzing} 
            onComplete={handleLoadingComplete} 
            previewImage={previewImage} 
          />
        )}
      </div>
    </main>
  );
}
