import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const maxDuration = 60; // 60 seconds max duration

export async function POST(req: Request) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy_key",
    });

    const { ingredients, userProfile, rejectedRecipes } = await req.json();
    
    if (!ingredients || !userProfile) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const systemPrompt = `Tu es un chef cuisinier et nutritionniste expert.
Génère UNE recette optimisée en utilisant la liste d'ingrédients suivante : ${ingredients.join(', ')}.

Tu dois IMPÉRATIVEMENT respecter le profil de l'utilisateur suivant :
- Objectif nutritionnel : ${userProfile.goal} 
  (Si Sèche : maximise le volume et les protéines, minimise les calories. Si Prise de masse : augmente les portions et les calories saines).
- Niveau en cuisine : ${userProfile.cookingLevel} 
  (Adapte la complexité des étapes et le vocabulaire culinaire).
- Équipement disponible : ${userProfile.equipment.join(', ')} 
  (INTERDICTION STRICTE d'utiliser un équipement qui n'est pas dans cette liste. Par exemple, s'il n'y a pas de 'Four', ne propose pas de gratin).

Contrainte de nouveauté : L'utilisateur a déjà refusé ces recettes : ${rejectedRecipes ? rejectedRecipes.join(', ') : ''}. Ne propose pas de plat similaire.

Renvoie la réponse au format JSON strict avec cette structure :
{
  "titre": "Nom de la recette",
  "tempsPreparation": "ex: 15 min",
  "macrosEstimees": { "calories": "...", "proteines": "...", "glucides": "...", "lipides": "..." },
  "etapes": ["..."],
  "pourquoiCeRepas": "Une phrase expliquant en quoi ce repas est parfait pour son objectif de ${userProfile.goal} et son niveau."
}`;

    const response = await ai.models.generateContent({
      // We use gemini-2.5-flash as the fallback text model (it's fast and supports text-only)
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titre: { type: Type.STRING },
            tempsPreparation: { type: Type.STRING },
            macrosEstimees: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.STRING },
                proteines: { type: Type.STRING },
                glucides: { type: Type.STRING },
                lipides: { type: Type.STRING },
              },
              required: ["calories", "proteines", "glucides", "lipides"],
            },
            etapes: { type: Type.ARRAY, items: { type: Type.STRING } },
            pourquoiCeRepas: { type: Type.STRING },
          },
          required: ["titre", "tempsPreparation", "macrosEstimees", "etapes", "pourquoiCeRepas"],
        },
      },
    });

    const resultStr = response.text;
    if (!resultStr) throw new Error("No response from Gemini");

    return NextResponse.json(JSON.parse(resultStr));
  } catch (error) {
    console.error("Gemini API Error (Regenerate):", error);
    return NextResponse.json(
      { error: "Regeneration failed" },
      { status: 500 }
    );
  }
}
