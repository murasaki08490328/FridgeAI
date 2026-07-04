"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

export default function FreshnessAlerter() {
  const inventory = useAppStore((state) => state.inventory);
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    // Wait for hydration and avoid duplicate alerts per session
    if (typeof window === "undefined" || hasAlerted || inventory.length === 0) return;
    
    // Request permission if not already asked
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const checkExpiration = () => {
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;
      
      const expiringItems = inventory.filter((item) => {
        const expirationDate = item.dateScan + (item.joursConservationEstimes * ONE_DAY);
        const timeUntilExpiration = expirationDate - now;
        
        // If it's less than 1.5 days (which covers J-1) and greater than 0
        return timeUntilExpiration > 0 && timeUntilExpiration <= (1.5 * ONE_DAY);
      });

      if (expiringItems.length > 0 && "Notification" in window && Notification.permission === "granted") {
        const itemNames = expiringItems.map(i => i.nom).join(", ");
        new Notification("Alerte Anti-Gaspi 🚨", {
          body: `Tes aliments (${itemNames}) vont se perdre ! Voici une recette express pour ce soir.`,
          icon: "/icon.svg"
        });
        setHasAlerted(true);
      }
    };

    // Small delay to ensure state is loaded from localStorage
    const timer = setTimeout(checkExpiration, 3000);
    return () => clearTimeout(timer);
  }, [inventory, hasAlerted]);

  return null;
}
