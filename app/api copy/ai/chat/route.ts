import { type NextRequest, NextResponse } from "next/server"

// Mock ERP data for context
const erpContext = {
  inventory: {
    totalItems: 513,
    criticalStock: 2,
    lowStock: 3,
    totalValue: 847293,
  },
  sales: {
    totalRevenue: 2847392,
    activeOrders: 1247,
    monthlyGrowth: 12.5,
  },
  production: {
    activeOrders: 5,
    completedOrders: 2,
    efficiency: 85,
  },
  hr: {
    totalEmployees: 156,
    activeEmployees: 142,
    departments: 8,
  },
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Create system prompt with ERP context
    const systemPrompt = `You are an AI assistant for an ERP (Enterprise Resource Planning) system. You help users analyze business data, generate insights, and provide recommendations.

Current ERP System Data:
- Inventory: ${erpContext.inventory.totalItems} total items, ${erpContext.inventory.criticalStock} critical stock items, Total value: $${erpContext.inventory.totalValue.toLocaleString()}
- Sales: $${erpContext.sales.totalRevenue.toLocaleString()} total revenue, ${erpContext.sales.activeOrders} active orders, ${erpContext.sales.monthlyGrowth}% monthly growth
- Production: ${erpContext.production.activeOrders} active orders, ${erpContext.production.completedOrders} completed orders, ${erpContext.production.efficiency}% efficiency
- HR: ${erpContext.hr.totalEmployees} total employees, ${erpContext.hr.activeEmployees} active employees, ${erpContext.hr.departments} departments

You should:
1. Provide helpful, accurate responses about ERP operations
2. Offer actionable business insights and recommendations
3. Help with data analysis and interpretation
4. Suggest process improvements
5. Be concise but comprehensive in your responses
6. Use the provided data context when relevant

Always maintain a professional, helpful tone and focus on practical business solutions.`

    // Prepare the request payload for Google Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nUser Question: ${message}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
    }

    // Make request to Google Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBSxNkWyCS5Py1c41Yf6fhhS3tT_I4VUKk",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini API Error:", errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    // Extract the generated text from Gemini response
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response at this time."

    return NextResponse.json({ response: generatedText })
  } catch (error) {
    console.error("Error in AI chat:", error)
    return NextResponse.json({ error: "Failed to process AI request. Please try again." }, { status: 500 })
  }
}
