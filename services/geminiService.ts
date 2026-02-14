
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, luxury-focused marketing description for an e-commerce product named "${productName}" in the "${category}" category. Make it sound sophisticated and exclusive.`,
      config: {
        // Fix: Added thinkingBudget as it is mandatory when setting maxOutputTokens for Gemini 3 series models to reserve space for final output
        maxOutputTokens: 150,
        thinkingConfig: { thinkingBudget: 50 },
        temperature: 0.8
      }
    });
    return response.text || "Exclusive premium product crafted for the discerning individual.";
  } catch (error) {
    console.error("AI Generation failed:", error);
    return "The pinnacle of modern design and functional elegance.";
  }
};

export const analyzeSalesTrends = async (data: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this weekly sales data and give one brief, high-impact business advice: ${JSON.stringify(data)}`,
    });
    return response.text || "Sales remain steady. Consider targeted promotions for mid-week boosts.";
  } catch (error) {
    return "Focus on inventory management during peak weekend hours.";
  }
};
