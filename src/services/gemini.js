import { GoogleGenAI } from "@google/genai";

export async function askLearningAssistant(prompt, currentView) {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || "" });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are the VirtualCitySchool AI Learning Assistant. 
        The user is currently viewing the ${currentView} page. 
        Provide helpful, concise, and academic guidance based on this context. 
        If the user asks about the platform, explain features of the current view.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later!";
  }
}
