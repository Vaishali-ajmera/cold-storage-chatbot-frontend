
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ExistingOwnerContext, NewBuilderContext, UserType } from "../types";
import { GEMINI_MODEL, SYSTEM_INSTRUCTION_BASE } from "../constants";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables");
      throw new Error("API Key missing");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const initializeChat = (
  userType: UserType,
  context: ExistingOwnerContext | NewBuilderContext
) => {
  const ai = getGenAI();

  let contextString = "";
  let location = "";
  if (userType === UserType.EXISTING_OWNER) {
    const ctx = context as ExistingOwnerContext;
    location = ctx.location;
    contextString = `
      USER PROFILE: EXISTING COLD STORAGE OWNER
      - Capacity: ${ctx.capacity} MT
      - Location: ${ctx.location}
      - Potato Variety: ${ctx.variety}
      - Purpose: ${ctx.purpose}
      - Current Issues: ${ctx.issues.join(', ')}
    `;
  } else {
    const ctx = context as NewBuilderContext;
    location = ctx.location;
    contextString = `
      USER PROFILE: NEW COLD STORAGE BUILDER
      - Target Capacity: ${ctx.targetCapacity}
      - Planned Location: ${ctx.location}
      - Target Users: ${ctx.targetUsers}
      - Budget: ${ctx.budget}
    `;
  }

  const systemInstruction = `
    ${SYSTEM_INSTRUCTION_BASE}
    
    WEATHER & CLIMATE PROTOCOL:
    1. Use Google Search to check the current weather, humidity, and 7-day forecast for ${location}.
    2. In your first greeting, provide a brief "Local Storage Weather Advisory" based on these real-time conditions.
    3. If the humidity is high or temperatures are unusual for this region, warn the user about potential storage risks (sprouting, rot).
    
    CURRENT USER CONTEXT:${contextString}
  `;

  chatSession = ai.chats.create({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
      temperature: 0.4,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<GenerateContentResponse> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
