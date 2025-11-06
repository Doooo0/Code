
import { GoogleGenAI, Type } from '@google/genai';
import { GenerativePart } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const prompt = `
You are an expert financial assistant specialized in extracting transaction data from bank statements.
Your task is to analyze the provided image(s) of a bank statement and extract ALL transactional entries.

IMPORTANT INSTRUCTIONS:
1.  Identify every individual transaction (both debits and credits).
2.  Ignore all non-transactional information, such as page headers, footers, bank logos, promotional text, summary tables, and opening/closing balances.
3.  For each transaction, extract the details according to the provided JSON schema.
4.  Date format MUST be YYYY-MM-DD.
5.  Amount MUST be a negative number for withdrawals/expenses/debits and a positive number for deposits/credits/income.
6.  Auto-assign a relevant category. Examples: "Groceries", "Dining", "Transportation", "Salary", "Bills", "Shopping", "Entertainment". If unsure, use "Other".
7.  Return the data as a single, valid JSON array of objects.
8.  Do NOT include any explanations, introductory text, or markdown formatting (like \`\`\`json) around the JSON output. Your entire response must be only the JSON array.
`;

const transactionSchema = {
    type: Type.OBJECT,
    properties: {
        date: { type: Type.STRING, description: 'Transaction date in YYYY-MM-DD format.' },
        description: { type: Type.STRING, description: 'Full transaction description.' },
        amount: { type: Type.NUMBER, description: 'Transaction amount. Negative for debits, positive for credits.' },
        category: { type: Type.STRING, description: 'Categorization of the transaction.' },
        notes: { type: Type.STRING, description: 'Any relevant notes. Can be empty.' },
    },
    required: ['date', 'description', 'amount', 'category']
};


export const analyzeStatement = async (imageParts: GenerativePart[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            ...imageParts
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: transactionSchema
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error('Received an empty response from the AI.');
    }
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to analyze the statement with Gemini API.');
  }
};
