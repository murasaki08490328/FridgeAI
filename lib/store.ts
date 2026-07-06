import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InventoryItem {
  id: string;
  nom: string;
  dateScan: number; // timestamp in milliseconds
  joursConservationEstimes: number;
  alertePeremptionProche?: boolean;
}

export interface UserProfile {
  goal: string;
  cookingLevel: string;
  equipment: string[];
}

interface AppState {
  inventory: InventoryItem[];
  savings: number;
  shoppingList: string[];
  addToInventory: (items: InventoryItem[]) => void;
  removeFromInventory: (itemsToRemove: string[]) => void;
  addSavings: (amount: number) => void;
  resetSavings: () => void;
  addToShoppingList: (item: string) => void;
  removeFromShoppingList: (item: string) => void;
  clearShoppingList: () => void;
  updateShelfLife: (id: string, deltaDays: number) => void;
  
  userProfile: UserProfile;
  rejectedRecipes: string[];
  ingredientsDetectes: string[];
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addRejectedRecipe: (recipeName: string) => void;
  setIngredientsDetectes: (ingredients: string[]) => void;
  clearSessionData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      inventory: [],
      savings: 0,
      shoppingList: [],
      userProfile: {
        goal: 'Équilibré',
        cookingLevel: 'Intermédiaire',
        equipment: ['Plaques de cuisson', 'Four', 'Micro-ondes'],
      },
      rejectedRecipes: [],
      ingredientsDetectes: [],
      addToInventory: (items) =>
        set((state) => {
          // Add new items, optionally filtering out duplicates
          return { inventory: [...state.inventory, ...items] };
        }),
      removeFromInventory: (itemsToRemove) =>
        set((state) => {
          const lowerCaseToRemove = itemsToRemove.map(i => i.toLowerCase());
          return {
            inventory: state.inventory.filter(
              (item) => !lowerCaseToRemove.includes(item.nom.toLowerCase())
            ),
          };
        }),
      addSavings: (amount) =>
        set((state) => ({ savings: state.savings + amount })),
      resetSavings: () =>
        set({ savings: 0 }),
      addToShoppingList: (item) =>
        set((state) => ({
          shoppingList: state.shoppingList.includes(item)
            ? state.shoppingList
            : [...state.shoppingList, item],
        })),
      removeFromShoppingList: (item) =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((i) => i !== item),
        })),
      clearShoppingList: () => set({ shoppingList: [] }),
      updateShelfLife: (id, deltaDays) =>
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === id
              ? { ...item, joursConservationEstimes: Math.max(0, item.joursConservationEstimes + deltaDays) }
              : item
          ),
        })),
      updateUserProfile: (profile) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } })),
      addRejectedRecipe: (recipeName) =>
        set((state) => ({ rejectedRecipes: [...state.rejectedRecipes, recipeName] })),
      setIngredientsDetectes: (ingredients) =>
        set({ ingredientsDetectes: ingredients }),
      clearSessionData: () =>
        set({ rejectedRecipes: [], ingredientsDetectes: [] }),
    }),
    {
      name: 'frigo-chef-storage',
    }
  )
);
