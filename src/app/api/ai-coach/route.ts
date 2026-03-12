import { NextRequest, NextResponse } from "next/server";

// ── AI Financial Coach: "Roast or Toast" ──
// This endpoint analyzes recent transactions and returns a witty comment.
// Replace the mock implementation with a real OpenAI/Gemini API call.

interface TransactionInput {
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface AiCoachRequest {
  transactions: TransactionInput[];
  user_name: string;
  net_worth: number;
  savings_goal_progress: number; // 0-100
}

export async function POST(request: NextRequest) {
  try {
    const body: AiCoachRequest = await request.json();
    const { transactions, user_name, net_worth, savings_goal_progress } = body;

    // Build a summary of spending for the AI
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const categorySpending: Record<string, number> = {};
    transactions.forEach((t) => {
      categorySpending[t.category] =
        (categorySpending[t.category] || 0) + t.amount;
    });

    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, amt]) => `${cat}: ฿${amt.toLocaleString()}`)
      .join(", ");

    // ── System prompt for the AI ──
    const systemPrompt = `You are PaoKoo's AI Financial Coach — a witty, Gen-Z-savvy money advisor for Thai couples.
Your job is to analyze spending data and respond with ONE short, punchy comment that is either:
- A "ROAST" 🔥 (playful teasing if there's wasteful spending, impulse buys, or overspending)
- A "TOAST" 🎉 (cheerful encouragement if they're saving well, hitting goals, or being smart with money)

Rules:
- Keep it under 280 characters (like a tweet)
- Use 1-2 relevant emojis
- Be specific about their actual spending (mention amounts and categories)
- Be funny but never mean
- Reference Thai culture or lifestyle when relevant
- Respond in English`;

    const userPrompt = `Here's ${user_name}'s financial data:

Total spent this month: ฿${totalSpent.toLocaleString()}
Top spending: ${topCategories}
Net worth: ฿${net_worth.toLocaleString()}
Savings goal progress: ${savings_goal_progress}%

Recent transactions:
${transactions
  .slice(0, 10)
  .map((t) => `- ${t.description}: ฿${t.amount} (${t.category}) on ${t.date}`)
  .join("\n")}

Give me either a ROAST or a TOAST based on this data. Start with the type in brackets like [ROAST] or [TOAST].`;

    // ── Option A: OpenAI API ──
    // Uncomment this block if using OpenAI
    /*
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.9,
      }),
    });

    const openaiData = await openaiResponse.json();
    const aiMessage = openaiData.choices[0].message.content;
    */

    // ── Option B: Google Gemini API ──
    // Uncomment this block if using Gemini
    /*
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 150,
          },
        }),
      }
    );

    const geminiData = await geminiResponse.json();
    const aiMessage = geminiData.candidates[0].content.parts[0].text;
    */

    // ── Demo fallback (remove when API keys are configured) ──
    const isRoast = totalSpent > 20000 || savings_goal_progress < 50;
    const aiMessage = isRoast
      ? `[ROAST] ☕ ${user_name}, you spent ฿${totalSpent.toLocaleString()} this month — your top splurge is ${topCategories.split(",")[0]}. At this rate, your Japan trip fund is gonna need a Japan trip of its own to recover! 💀`
      : `[TOAST] 🎉 ${user_name}, you're at ${savings_goal_progress}% on your savings goal with ฿${net_worth.toLocaleString()} net worth! You and babe are building wealth like pros. Keep cooking! 🔥💎`;

    // Parse the response
    const type = aiMessage.includes("[ROAST]") ? "roast" : "toast";
    const message = aiMessage.replace(/\[(ROAST|TOAST)\]\s*/, "");

    return NextResponse.json({
      type,
      message,
      meta: {
        total_spent: totalSpent,
        top_categories: Object.entries(categorySpending)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI Coach error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI comment" },
      { status: 500 }
    );
  }
}
