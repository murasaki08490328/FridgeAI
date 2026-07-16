import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const maxDuration = 60; // 60 seconds max duration

export async function POST(req: Request) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy_key",
    });

    const { images, userProfile } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const systemPrompt = `Tu es un chef cuisinier expert. Analyse les images fournies.
Liste les ingrédients détectés.
Tu dois impérativement respecter le profil utilisateur :
- Régime : ${userProfile?.dietaryPreference || 'Omnivore'}
- Objectif : ${userProfile?.goal || 'Équilibré'}
- Niveau : ${userProfile?.cookingLevel || 'Intermédiaire'}
- Équipement : ${userProfile?.equipment?.join(', ') || 'Plaques de cuisson, Four, Micro-ondes'}

Génère 2 à 3 recettes pour chaque catégorie (Economie et Premium).`;

    const parts: any[] = [{ text: systemPrompt }];

    for (const img of images) {
      const base64Data = img.split(",")[1];
      const mimeType = img.split(";")[0].split(":")[1] || "image/jpeg";
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            inventaire: {
              type: Type.ARRAY,
              description: "Inventaire des ingrédients détectés",
              items: {
                type: Type.OBJECT,
                properties: {
                  nom: { type: Type.STRING },
                  joursConservationEstimes: { type: Type.NUMBER },
                  alertePeremptionProche: { type: Type.BOOLEAN },
                },
                required: ["nom", "joursConservationEstimes", "alertePeremptionProche"],
              },
            },
            ingrediensDetectes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            categorieEconomie: {
              type: Type.ARRAY,
              description: "2 à 3 recettes utilisant uniquement les ingrédients détectés",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING },
                  tempsPreparation: { type: Type.STRING },
                  etapes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  macrosEstimees: {
                    type: Type.OBJECT,
                    properties: { calories: { type: Type.STRING } },
                    required: ["calories"],
                  },
                  ingrediensUtilises: { type: Type.ARRAY, items: { type: Type.STRING } },
                  valeurEconomiseeEstimeeEnEuros: { type: Type.NUMBER },
                },
                required: ["titre", "tempsPreparation", "etapes", "macrosEstimees", "ingrediensUtilises", "valeurEconomiseeEstimeeEnEuros"],
              },
            },
            categoriePremium: {
              type: Type.ARRAY,
              description: "2 à 3 recettes premium nécessitant l'achat d'un seul ingrédient clé",
              items: {
                type: Type.OBJECT,
                properties: {
                  titre: { type: Type.STRING },
                  tempsPreparation: { type: Type.STRING },
                  etapes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  macrosEstimees: {
                    type: Type.OBJECT,
                    properties: { calories: { type: Type.STRING } },
                    required: ["calories"],
                  },
                  ingrediensUtilises: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredientManquant: { type: Type.STRING },
                  valeurEconomiseeEstimeeEnEuros: { type: Type.NUMBER },
                },
                required: ["titre", "tempsPreparation", "etapes", "macrosEstimees", "ingrediensUtilises", "ingredientManquant", "valeurEconomiseeEstimeeEnEuros"],
              },
            },
          },
          required: ["inventaire", "ingrediensDetectes", "categorieEconomie", "categoriePremium"],
        },
      },
    });

    const resultStr = response.text;
    if (!resultStr) throw new Error("No response from Gemini");

    return NextResponse.json(JSON.parse(resultStr));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
