import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";
import { db } from "@/db";
import { expense, income, asset, transactionCategory, business } from "@/db/index";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an AI finance assistant for a business finance tracker. You help users track expenses, income, and assets through natural language and can save transactions directly to their database.

Your role is to:
1. Parse and save transactions when users describe them
2. Answer questions about their finances
3. Provide general financial guidance
4. Be friendly and helpful

When users describe transactions, extract the following information:
- Amount (required)
- Description/category (required)
- Type: "expense", "income", or "asset" (required)
- Date (optional - assume today if not mentioned)
- Vendor/client (optional)
- Any other relevant details

Examples of transactions you should save:
- "I spent $50 on office supplies today" → Expense, $50, Office Supplies
- "Client paid me $1000 for web design work" → Income, $1000, Web Design
- "I bought a new laptop for $1200" → Asset, $1200, Equipment
- "Paid $200 for monthly software subscription" → Expense, $200, Software

Always save transactions when you detect them, then provide a helpful confirmation message.`;

    const tools = [
      {
        type: "function" as const,
        function: {
          name: "save_transaction",
          description: "Save a financial transaction to the database",
          parameters: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["expense", "income", "asset"],
                description: "The type of transaction"
              },
              amount: {
                type: "number",
                description: "The amount of the transaction in the currency being used"
              },
              category: {
                type: "string",
                description: "The category of the transaction (e.g., Office Supplies, Software, Web Design, Equipment)"
              },
              description: {
                type: "string",
                description: "Detailed description of what the transaction was for"
              },
              date: {
                type: "string",
                description: "The date of the transaction (YYYY-MM-DD format), defaults to today if not provided"
              },
              vendor: {
                type: "string",
                description: "The vendor or client name (for expenses or income respectively)"
              },
              paymentMethod: {
                type: "string",
                description: "Payment method used (cash, card, bank transfer, etc.)"
              },
              notes: {
                type: "string",
                description: "Additional notes about the transaction"
              },
              isRecurring: {
                type: "string",
                enum: ["once", "monthly", "quarterly", "yearly"],
                description: "Whether this is a recurring transaction"
              },
              taxDeductible: {
                type: "string",
                enum: ["yes", "no", "partial"],
                description: "Whether this expense is tax deductible (for expenses only)"
              }
            },
            required: ["type", "amount", "category", "description"]
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "add_transaction_category",
          description: "Add a new transaction category for the business",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the category (e.g., Marketing, Software, Office Supplies)"
              },
              type: {
                type: "string",
                enum: ["expense", "income"],
                description: "Whether this is an expense or income category"
              },
              color: {
                type: "string",
                description: "Hex color code for UI display (optional, defaults to #22c55e)"
              },
              description: {
                type: "string",
                description: "Description of what this category is for (optional)"
              }
            },
            required: ["name", "type"]
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "update_business_info",
          description: "Update business information",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Business name"
              },
              currency: {
                type: "string",
                description: "Business currency (e.g., USD, EUR, GBP)"
              },
              fiscalStartDate: {
                type: "string",
                description: "Fiscal year start date (YYYY-MM-DD format)"
              }
            },
            required: []
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "get_financial_summary",
          description: "Get a summary of business finances",
          parameters: {
            type: "object",
            properties: {
              period: {
                type: "string",
                enum: ["current_month", "last_month", "current_quarter", "last_quarter", "current_year", "last_year"],
                description: "Time period for the summary (optional, defaults to current_month)"
              }
            },
            required: []
          }
        }
      }
    ];

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    const aiResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 500,
      tools: tools,
      tool_choice: "auto"
    });

    const responseMessage = aiResponse.choices[0]?.message;
    let response = responseMessage?.content || "I'm having trouble responding right now. Please try again.";

    // Handle function calls
    if (responseMessage?.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.id && toolCall.type === 'function') {
          try {
            const functionArgs = JSON.parse(toolCall.function.arguments);

            if (toolCall.function.name === "save_transaction") {
              // Get user's business first
              const userBusiness = await db
                .select()
                .from(business)
                .where(eq(business.userId, session.user.id))
                .limit(1);

              if (userBusiness.length === 0) {
                response = "You need to set up your business first before adding transactions.";
                break;
              }

              const businessId = userBusiness[0].id;
              let savedTransaction;

              if (functionArgs.type === "expense") {
                const [newExpense] = await db.insert(expense).values({
                  businessId,
                  amount: functionArgs.amount.toString(),
                  date: new Date(functionArgs.date || new Date().toISOString().split('T')[0]),
                  category: functionArgs.category,
                  description: functionArgs.description,
                  vendor: functionArgs.vendor || "Unknown",
                  paymentMethod: functionArgs.paymentMethod || "unspecified",
                  notes: functionArgs.notes,
                  isRecurring: functionArgs.isRecurring || "once",
                  taxDeductible: functionArgs.taxDeductible || "yes",
                }).returning();
                savedTransaction = newExpense;
              } else if (functionArgs.type === "income") {
                const [newIncome] = await db.insert(income).values({
                  businessId,
                  amount: functionArgs.amount.toString(),
                  date: new Date(functionArgs.date || new Date().toISOString().split('T')[0]),
                  category: functionArgs.category,
                  description: functionArgs.description,
                  client: functionArgs.vendor || "Unknown",
                  paymentMethod: functionArgs.paymentMethod || "unspecified",
                  notes: functionArgs.notes,
                  isRecurring: functionArgs.isRecurring || "once",
                  taxWithheld: "0",
                }).returning();
                savedTransaction = newIncome;
              } else if (functionArgs.type === "asset") {
                const [newAsset] = await db.insert(asset).values({
                  businessId,
                  name: functionArgs.description,
                  type: functionArgs.category,
                  currentValue: functionArgs.amount.toString(),
                  purchaseValue: functionArgs.amount.toString(),
                  purchaseDate: new Date(functionArgs.date || new Date().toISOString().split('T')[0]),
                  description: functionArgs.notes,
                  documents: [],
                }).returning();
                savedTransaction = newAsset;
              }

              if (savedTransaction) {
                const transactionType = functionArgs.type === "expense" ? "💸 Expense" :
                                    functionArgs.type === "income" ? "💰 Income" : "🏢 Asset";
                response = `✅ ${transactionType} saved: ${functionArgs.description} - $${functionArgs.amount}`;
              }
            } else if (toolCall.function.name === "add_transaction_category") {
              // Get user's business first
              const userBusiness = await db
                .select()
                .from(business)
                .where(eq(business.userId, session.user.id))
                .limit(1);

              if (userBusiness.length === 0) {
                response = "You need to set up your business first before adding categories.";
                break;
              }

              await db.insert(transactionCategory).values({
                businessId: userBusiness[0].id,
                name: functionArgs.name,
                type: functionArgs.type,
                color: functionArgs.color || "#22c55e",
                description: functionArgs.description,
              }).returning();

              response = `✅ Category "${functionArgs.name}" added for ${functionArgs.type}s`;
            } else if (toolCall.function.name === "update_business_info") {
              const userBusiness = await db
                .select()
                .from(business)
                .where(eq(business.userId, session.user.id))
                .limit(1);

              if (userBusiness.length === 0) {
                response = "Business not found. Please set up your business first.";
                break;
              }

              const updateData: any = {};
              if (functionArgs.name) updateData.name = functionArgs.name;
              if (functionArgs.currency) updateData.currency = functionArgs.currency;
              if (functionArgs.fiscalStartDate) updateData.fiscalStartDate = new Date(functionArgs.fiscalStartDate);
              updateData.updatedAt = new Date();

              await db
                .update(business)
                .set(updateData)
                .where(eq(business.id, userBusiness[0].id));

              response = "✅ Business information updated successfully";
            } else if (toolCall.function.name === "get_financial_summary") {
              const userBusiness = await db
                .select()
                .from(business)
                .where(eq(business.userId, session.user.id))
                .limit(1);

              if (userBusiness.length === 0) {
                response = "Business not found. Please set up your business first.";
                break;
              }

              // For now, we'll get all data and could implement period filtering later
              // The period parameter is saved for future implementation of date range filtering

              const businessId = userBusiness[0].id;

              // Get totals from each table
              const [expenses, incomes, assets] = await Promise.all([
                db
                  .select({ amount: expense.amount })
                  .from(expense)
                  .where(eq(expense.businessId, businessId)),
                db
                  .select({ amount: income.amount })
                  .from(income)
                  .where(eq(income.businessId, businessId)),
                db
                  .select({ currentValue: asset.currentValue })
                  .from(asset)
                  .where(eq(asset.businessId, businessId))
              ]);

              const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
              const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
              const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.currentValue), 0);
              const netCashFlow = totalIncome - totalExpenses;

              response = `📊 **Financial Summary** (${functionArgs.period || "current_month"})\n\n` +
                        `💰 **Income**: $${totalIncome.toFixed(2)}\n` +
                        `💸 **Expenses**: $${totalExpenses.toFixed(2)}\n` +
                        `📈 **Net Cash Flow**: $${netCashFlow.toFixed(2)}\n` +
                        `🏢 **Total Assets**: $${totalAssets.toFixed(2)}\n` +
                        `💵 **Net Worth**: $${(totalAssets + netCashFlow).toFixed(2)}`;
            }
          } catch (error) {
            console.error("Error executing function call:", error);
            response = "I encountered an error while processing your request. Please try again.";
          }
        }
      }
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}