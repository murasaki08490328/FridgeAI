import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const maxDuration = 60; // 60 seconds max duration

const systemPrompt = `Tu es une IA experte en gestion de frigo, nutrition et économies.
Analyse l'image du frigo. Tu dois répondre avec un objet JSON strict :
{
 "inventaire": [
 { "nom": "Tomate", "joursConservationEstimes": 4, "alertePeremptionProche": false }
 ],
 "recette100PourcentRestes": {
 "titre": "Nom",
 "etapes": ["..."],
 "ingrediensUtilises": ["..."],
 "valeurEconomiseeEstimeeEnEuros": 12.50
 },
 "recettePremiumUnManquant": {
 "titre": "Nom",
 "etapes": ["..."],
 "ingrediensUtilises": ["..."],
 "ingredientManquant": "Mozzarella",
 "valeurEconomiseeEstimeeEnEuros": 14.00
 }
}`;

export async function POST(req: Request) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy_key",
    });

    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const base64Data = image.split(",")[1];
    const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            inventaire: {
              type: Type.ARRAY,
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
            recette100PourcentRestes: {
              type: Type.OBJECT,
              properties: {
                titre: { type: Type.STRING },
                etapes: { type: Type.ARRAY, items: { type: Type.STRING } },
                ingrediensUtilises: { type: Type.ARRAY, items: { type: Type.STRING } },
                valeurEconomiseeEstimeeEnEuros: { type: Type.NUMBER },
              },
              required: ["titre", "etapes", "ingrediensUtilises", "valeurEconomiseeEstimeeEnEuros"],
            },
            recettePremiumUnManquant: {
              type: Type.OBJECT,
              properties: {
                titre: { type: Type.STRING },
                etapes: { type: Type.ARRAY, items: { type: Type.STRING } },
                ingrediensUtilises: { type: Type.ARRAY, items: { type: Type.STRING } },
                ingredientManquant: { type: Type.STRING },
                valeurEconomiseeEstimeeEnEuros: { type: Type.NUMBER },
              },
              required: ["titre", "etapes", "ingrediensUtilises", "ingredientManquant", "valeurEconomiseeEstimeeEnEuros"],
            }
          },
          required: ["inventaire", "recette100PourcentRestes", "recettePremiumUnManquant"],
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
