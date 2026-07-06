"use client";

import { useState, useEffect } from "react";
import { ChefHat } from "lucide-react";

const PHRASES = [
  "Coupe des oignons virtuels...",
  "Négociation avec les carottes...",
  "Saupoudrage de magie culinaire...",
  "Calcul des macros en cours...",
  "Réchauffement des circuits...",
  "Dressage de l'assiette digitale...",
  "Extraction de la saveur des pixels...",
  "Émulsion des algorithmes...",
  "Affûtage des couteaux virtuels...",
  "Mijotage des données...",
  "Recherche de la recette parfaite...",
  "Consultation des grands chefs de l'IA...",
  "Vérification de la cuisson du code...",
  "Ajout d'une pincée de sel numérique...",
  "Préparation de votre festin..."
];

interface LoadingOverlayProps {
  isAnalyzing: boolean;
  onComplete: () => void;
  previewImage: string | null;
}

export function LoadingOverlay({ isAnalyzing, onComplete, previewImage }: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Gérer la phrase aléatoire toutes les 2 secondes
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
        setIsFading(false);
      }, 300); // 300ms pour correspondre à la durée de transition CSS
    }, 2000);

    return () => clearInterval(phraseInterval);
  }, []);

  // Gérer la barre de progression
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isAnalyzing) {
      // Simuler une progression asynchrone jusqu'à 90% (prend environ 10 secondes)
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 1;
        });
      }, 110); // 100 * 110ms = 11 secondes
    } else {
      // Quand l'API a répondu, accélérer à 100%
      setProgress(100);
    }

    return () => clearInterval(progressInterval);
  }, [isAnalyzing]);

  // Déclencher onComplete quand la progression est à 100% ET l'API a répondu
  useEffect(() => {
    if (!isAnalyzing && progress === 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500); // Attendre un peu que la barre soit bien visible à 100%
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, progress, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm gap-8 relative">
      <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-gray-100 dark:bg-slate-900 max-h-[50vh]">
        {previewImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={previewImage} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
            <ChefHat size={64} />
          </div>
        )}
        
        {/* Laser Scan Effect */}
        <div className="absolute inset-0 z-10 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_10px_rgba(16,185,129,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
        </div>
        
        <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />
      </div>
      
      <div className="flex flex-col items-center gap-3 w-full shrink-0">
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-[#10b981] rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p 
          className={`text-lg font-medium text-center text-[#111827] dark:text-gray-200 transition-opacity duration-300 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {PHRASES[phraseIndex]}
        </p>
      </div>
    </div>
  );
}
