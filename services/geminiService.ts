import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Player, Transaction, TransactionType } from '../types';

export const parseTransactionCommand = async (
  command: string,
  players: Player[]
): Promise<{ fromId: string; toId: string; amount: number; type: TransactionType } | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const playerContext = players.map(p => ({ id: p.id, name: p.name })).concat([{ id: 'BANK', name: 'Bank' }]);

  const prompt = `
    Task: Parse a Monopoly transaction command into a structured JSON object.
    Command: "${command}"

    Entities:
    ${playerContext.map(p => `- ${p.name} (ID: ${p.id})`).join('\n')}

    Rules:
    - Identify the sender (fromId) and receiver (toId).
    - Map names to the IDs provided above.
    - If someone says "Pass Go", the sender is "BANK" and it's a PASS_GO type.
    - If someone says "to the bank" or "pays bank", the toId is "BANK" (BANK_DEPOSIT).
    - If someone says "from the bank" or "bank pays", the fromId is "BANK" (BANK_WITHDRAWAL).
    - Convert shorthand like "1.2m" to 1200000, "50k" to 50000.
    - Return a JSON object with properties: fromId, toId, amount (number), type (TRANSFER, PASS_GO, BANK_DEPOSIT, BANK_WITHDRAWAL).
    - If unclear, return null.

    Output format: ONLY return the JSON object or "null".
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fromId: { type: Type.STRING },
            toId: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { 
              type: Type.STRING,
              description: "The type of transaction: TRANSFER, PASS_GO, BANK_DEPOSIT, BANK_WITHDRAWAL"
            },
          },
          required: ['fromId', 'toId', 'amount', 'type'],
        }
      }
    });
    
    const text = response.text?.trim();
    if (!text || text === 'null') return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini command parsing error:", error);
    return null;
  }
};

export const getDetailedGameAnalysis = async (
  players: Player[],
  transactions: Transaction[]
): Promise<{ sentiment: string; targetIntel: string; advice: string[] } | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const simplifiedHistory = transactions.slice(-15).map(t => ({
    from: t.fromId === 'BANK' ? 'Bank' : (players.find(p => p.id === t.fromId)?.name || 'Unknown'),
    to: t.toId === 'BANK' ? 'Bank' : (players.find(p => p.id === t.toId)?.name || 'Unknown'),
    amt: t.amount,
    type: t.type
  }));

  const prompt = `
    Analyze this Monopoly game state and provide deep strategic insights.
    Players: ${players.map(p => `${p.name} ($${p.balance})`).join(', ')}
    Recent History: ${JSON.stringify(simplifiedHistory)}

    Return a JSON object:
    - sentiment: A clever 1-sentence description of the current game vibe.
    - targetIntel: 1 sentence identifying the biggest threat and why.
    - advice: An array of 3 specific, punchy tactical recommendations for the players.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            targetIntel: { type: Type.STRING },
            advice: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['sentiment', 'targetIntel', 'advice'],
        }
      }
    });
    
    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
};

export const askRulesBot = async (query: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert Monopoly Rules Lawyer. 
    Answer the following question about Monopoly rules concisely and accurately.
    Question: "${query}"
    
    If the question is not about Monopoly, politely decline to answer.
    Keep it short and to the point. Refer to official Hasbro rules where possible.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "I couldn't find a rule for that.";
  } catch (error) {
    console.error("Gemini rules error:", error);
    return "Sorry, I'm having trouble checking the rulebook right now.";
  }
};

export const getStrategyAdvice = async (players: Player[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a professional Monopoly strategist. 
    Analyze the current game state and provide 3 quick, punchy strategy tips based on these balances:
    ${players.map(p => `${p.name}: ${p.balance}`).join(', ')}
    
    Identify who is the biggest threat and who needs to make trades to stay alive.
    Keep the response under 100 words.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Keep buying property and building houses!";
  } catch (error) {
    console.error("Gemini strategy error:", error);
    return "The best strategy? Don't go bankrupt!";
  }
};