// Updated geminiService to include missing game analysis and strategy functions
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

// Fix: Added missing getDetailedGameAnalysis export for AnalysisModal
/**
 * Generates a detailed game analysis using Gemini.
 * Includes sentiment, target intel, and strategic advice based on player status and transaction history.
 */
export const getDetailedGameAnalysis = async (
  players: Player[],
  transactions: Transaction[]
): Promise<{ sentiment: string; targetIntel: string; advice: string[] } | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze this Monopoly game state and provide strategic insights for a group of players.
    
    Players Status:
    ${players.map(p => `- ${p.name}: Current Balance ${p.balance} ${p.isBankrupt ? '(Eliminated/Bankrupt)' : ''}`).join('\n')}
    
    Recent Transaction Stream (Last 15):
    ${transactions.slice(-15).map(t => `- From ${t.fromId} to ${t.toId}: Amount ${t.amount} (Type: ${t.type})`).join('\n')}
    
    Provide your analysis in JSON format with exactly these properties:
    1. "sentiment": A brief (1 sentence) description of the game's current atmosphere (e.g., tense, aggressive, cooperative).
    2. "targetIntel": Identification of who is the current leader or biggest threat, or most vulnerable player.
    3. "advice": An array of 3-4 specific strategic tips for the players to consider given the current distribution of wealth.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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

// Fix: Added missing getStrategyAdvice export for StrategyModal
/**
 * Generates high-level strategic advice for the current board situation.
 */
export const getStrategyAdvice = async (players: Player[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Given the current Monopoly game balances:
    ${players.map(p => `- ${p.name}: ${p.balance}`).join('\n')}
    
    Provide a single, powerful paragraph of strategic advice. 
    Adopt the persona of a "Strategic AI Advisor" with a high-tech, futuristic tone. 
    Focus on wealth management and power dynamics.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "Strategic data stream interrupted. Re-sync suggested.";
  } catch (error) {
    console.error("Gemini strategy error:", error);
    return "Error encountered in neural strategy processing uplink.";
  }
};