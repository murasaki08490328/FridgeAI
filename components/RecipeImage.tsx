"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface RecipeImageProps {
  title: string;
  ingredients: string[];
}

export function RecipeImage({ title, ingredients }: RecipeImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, ingredients }),
        });
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        if (data.imageUrl && isMounted) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [title, ingredients]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 text-sm italic">
        Impossible de charger l'image
      </div>
    );
  }

  if (isLoading || !imageUrl) {
    return <Skeleton className="w-full aspect-video rounded-2xl" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={imageUrl} 
      alt={title} 
      className="w-full aspect-video object-cover rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"
    />
  );
}
