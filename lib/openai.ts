import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TransactionData {
  type: "expense" | "income" | "asset";
  amount: number;
  date: string;
  category: string;
  description: string;
  vendor?: string;
  client?: string;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: "once" | "monthly" | "quarterly" | "yearly";
  taxDeductible?: "yes" | "no" | "partial";
}

export interface ParsedTransaction {
  transactions: TransactionData[];
  followUpQuestions?: string[];
  missingInfo?: string[];
  confidence: number;
}

export async function parseTransactionWithAI(message: string, businessId: string): Promise<ParsedTransaction> {
  const systemPrompt = `You are an AI finance assistant for a business finance tracker. Your task is to parse natural language descriptions of financial transactions and extract structured data.

Business Context:
- Business ID: ${businessId}
- Current Date: ${new Date().toISOString().split('T')[0]}

Transaction Types:
1. Expense: Money spent by the business (e.g., "I spent $50 on office supplies")
2. Income: Money received by the business (e.g., "Client paid me $1000 for web design")
3. Asset: Items or investments owned by the business (e.g., "I bought a new laptop for $1200")

Common Categories:
- Expenses: office supplies, software, rent, utilities, marketing, travel, meals, equipment, insurance, taxes, salaries
- Income: consulting, services, products, sales, investments, interest
- Assets: equipment, furniture, computers, vehicles, property, investments

Payment Methods: cash, card, bank transfer, check, online payment, credit card

Recurring Options: once, monthly, quarterly, yearly

Tax Deductible: yes, no, partial

Instructions:
1. Parse the user's message to extract all financial transactions
2. If date is not mentioned, use today's date
3. If any required information is missing, ask follow-up questions
4. If multiple transactions are mentioned, parse each one
5. Always respond with valid JSON format

Required fields for each transaction type:
- Expense: type, amount, date, category, description, vendor
- Income: type, amount, date, category, description, client
- Asset: type, amount, date, category, description, name

Always respond with JSON in this format:
{
  "transactions": [
    {
      "type": "expense|income|asset",
      "amount": number,
      "date": "YYYY-MM-DD",
      "category": "string",
      "description": "string",
      "vendor": "string (for expenses)",
      "client": "string (for income)",
      "paymentMethod": "string",
      "notes": "string",
      "isRecurring": "once|monthly|quarterly|yearly",
      "taxDeductible": "yes|no|partial"
    }
  ],
  "followUpQuestions": ["string"],
  "missingInfo": ["string"],
  "confidence": 0.0-1.0
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);
    return parsed as ParsedTransaction;
  } catch (error) {
    console.error("Error parsing transaction with AI:", error);
    return {
      transactions: [],
      followUpQuestions: ["I had trouble understanding that. Could you rephrase your transaction?"],
      missingInfo: [],
      confidence: 0
    };
  }
}

export async function generateAIInsights(businessId: string): Promise<string> {
  const systemPrompt = `You are an AI finance assistant providing insights for a business. Generate helpful financial insights and recommendations based on typical business patterns.

Provide insights on:
- Cash flow trends
- Expense patterns
- Income stability
- Tax optimization opportunities
- Budget recommendations
- Anomaly detection
- Growth opportunities

Keep the response concise, actionable, and tailored to small business owners. Use a friendly, professional tone.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate insights for my business finances." }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || "I'm having trouble generating insights right now. Please try again later.";
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return "I'm having trouble generating insights right now. Please try again later.";
  }
}