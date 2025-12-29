
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Player, Transaction, TransactionType } from '../types';

export const parseTransactionCommand = async (
  command: string,
  players: Player[]
): Promise<{ fromId: string; toId: string; amount: number; type: TransactionType } | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

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

export const getTransactionCommentary = async (
  transaction: Transaction,
  players: Player[],
  senderName: string,
  receiverName: string
): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are the witty, sarcastic, and sometimes ruthless narrator of a Monopoly game.
    A transaction just occurred:
    Type: ${transaction.type}
    Sender: ${senderName}
    Receiver: ${receiverName}
    Amount: ${transaction.amount}
    
    Current Player Balances:
    ${players.map(p => `${p.name}: ${p.balance}`).join(', ')}

    Give a very short (max 2 sentences), fun commentary on this event. 
    If someone is low on money, mock them gently. 
    If someone is rich, warn the others.
    If it's Pass Go, be encouraging but brief.
    Keep it punchy and entertaining!
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || null;
  } catch (error) {
    console.error("Gemini commentary error:", error);
    return null;
  }
};

export const askRulesBot = async (query: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "AI services are currently offline.";
  const ai = new GoogleGenAI({ apiKey });

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
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "AI services are currently offline.";
  const ai = new GoogleGenAI({ apiKey });

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
