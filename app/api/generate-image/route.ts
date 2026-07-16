import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy_key",
    });

    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Missing recipe title" }, { status: 400 });
    }

    const prompt = `A professional, appetizing culinary photography of ${title}, food magazine editorial style, top-down view, natural lighting.`;

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No image data returned from Gemini");
    }

    const generatedImage = response.generatedImages[0];
    if (!generatedImage.image?.imageBytes) {
      throw new Error("No imageBytes returned from Gemini");
    }

    const base64Image = generatedImage.image.imageBytes;
    // Prefix with data URI scheme so the frontend can display it directly in an <img src="..." />
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Gemini Image generation error:", error);
    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
