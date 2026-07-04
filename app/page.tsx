"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, ChefHat, PiggyBank } from "lucide-react";
import { useAppStore } from "@/lib/store";
import SettingsModal from "@/components/SettingsModal";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const savings = useAppStore(state => state.savings);
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
        setLoading(true);
        
        const messages = [
          "Analyse de l'image en cours...",
          "Identification des ingrédients...",
          "Analyse des protéines disponibles...",
          "Équilibrage nutritionnel en cours...",
          "Génération de la recette santé..."
        ];
        
        let messageIndex = 0;
        setLoadingMessage(messages[0]);
        setProgress(20);
        const interval = setInterval(() => {
          messageIndex = (messageIndex + 1) % messages.length;
          setLoadingMessage(messages[messageIndex]);
          setProgress(Math.min(90, (messageIndex + 1) * 20));
        }, 2000);

        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
          });
          
          const data = await response.json();
          
          if (!data.inventaire || data.inventaire.length === 0) {
             alert("L'IA n'a pas pu identifier d'ingrédients exploitables ou l'image est trop floue. Veuillez réessayer.");
             setLoading(false);
             setPreviewImage(null);
          } else {
             setProgress(100);
             setLoadingMessage("Recette trouvée !");
             
             // Ajouter les ingrédients au frigo virtuel
             const newItems = data.inventaire.map((i: any) => ({
               id: crypto.randomUUID(),
               nom: i.nom,
               joursConservationEstimes: i.joursConservationEstimes,
               alertePeremptionProche: i.alertePeremptionProche,
               dateScan: Date.now()
             }));
             addToInventory(newItems);
             
             // Sauvegarder les ingrédients pour la régénération
             setIngredientsDetectes(newItems.map((i: any) => i.nom));

             sessionStorage.setItem("recipeData", JSON.stringify(data));
             setTimeout(() => {
               router.push("/recipe");
             }, 500);
          }
        } catch (error) {
          console.error(error);
          alert("Une erreur est survenue lors de l'analyse.");
          setLoading(false);
          setPreviewImage(null);
        } finally {
          clearInterval(interval);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="h-[100dvh] w-full overflow-hidden flex flex-col relative bg-[#f9fafb]">
      {/* Header */}
      <header className="flex justify-between items-center p-6 shrink-0">
        <div className="flex items-center gap-2 text-[#10b981]">
          <ChefHat size={32} />
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Frigo Chef</h1>
        </div>
        <SettingsModal />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 pb-12 overflow-y-auto">
        {!loading && !previewImage ? (
          <>
            <div className="text-center space-y-3 max-w-sm">
              {mounted && savings > 0 && (
                <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl mb-6 shadow-sm border border-emerald-100 mx-auto w-max">
                  <PiggyBank size={24} className="text-emerald-500" />
                  <span className="font-bold text-lg">{savings.toFixed(2)} € <span className="font-medium text-sm">économisés</span></span>
                </div>
              )}
              <h2 className="text-3xl font-extrabold text-[#111827]">
                Recette saine en 1 clic
              </h2>
              <p className="text-gray-500 text-lg">
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
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 py-4 px-6 rounded-2xl text-lg font-semibold transition-all active:scale-95 shadow-sm"
              >
                <ImageIcon size={24} />
                Choisir depuis la galerie
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full max-w-sm gap-8 relative">
            <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100 max-h-[50vh]">
              {previewImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Laser Scan Effect */}
              <div className="absolute inset-0 z-10 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_10px_rgba(16,185,129,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
              
              <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />
            </div>
            
            <div className="flex flex-col items-center gap-3 w-full shrink-0">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#10b981] rounded-full transition-all duration-1000 ease-in-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-lg font-medium text-center text-[#111827] animate-pulse">
                {loadingMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
