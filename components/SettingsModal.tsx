"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const GOALS = ["Prise de masse", "Sèche", "Maintien", "Équilibré"];
const COOKING_LEVELS = ["Débutant", "Intermédiaire", "Expert"];
const EQUIPMENTS = ["Plaques de cuisson", "Four", "Micro-ondes", "Mixeur", "Air Fryer", "Cuiseur vapeur"];

export default function SettingsModal() {
  const [open, setOpen] = useState(false);
  const userProfile = useAppStore((state) => state.userProfile);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  const handleEquipmentChange = (eq: string, checked: boolean) => {
    if (checked) {
      updateUserProfile({ equipment: [...userProfile.equipment, eq] });
    } else {
      updateUserProfile({ equipment: userProfile.equipment.filter((e) => e !== eq) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" />}>
        <Settings className="text-gray-600 dark:text-gray-400" size={24} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center dark:text-gray-100">Préférences Culinaires</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="goal" className="text-base font-bold text-gray-700 dark:text-gray-300">Objectif Nutritionnel</Label>
            <Select 
              value={userProfile.goal} 
              onValueChange={(value) => updateUserProfile({ goal: value ?? "" })}
            >
              <SelectTrigger id="goal" className="w-full rounded-xl">
                <SelectValue placeholder="Sélectionnez un objectif" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {GOALS.map((goal) => (
                  <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="level" className="text-base font-bold text-gray-700 dark:text-gray-300">Niveau en cuisine</Label>
            <Select 
              value={userProfile.cookingLevel} 
              onValueChange={(value) => updateUserProfile({ cookingLevel: value ?? "" })}
            >
              <SelectTrigger id="level" className="w-full rounded-xl">
                <SelectValue placeholder="Sélectionnez un niveau" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {COOKING_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-bold text-gray-700 dark:text-gray-300">Équipements disponibles</Label>
            <div className="grid grid-cols-2 gap-3">
              {EQUIPMENTS.map((eq) => (
                <div key={eq} className="flex items-center space-x-2">
                  <Checkbox 
                    id={eq} 
                    checked={userProfile.equipment.includes(eq)}
                    onCheckedChange={(checked) => handleEquipmentChange(eq, checked as boolean)}
                  />
                  <label
                    htmlFor={eq}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {eq}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)} className="rounded-xl w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-5">
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
