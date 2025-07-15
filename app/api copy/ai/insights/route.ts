import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { modules = ["all"] } = await request.json()

    // Create insights generation prompt
    const insightsPrompt = `You are an AI business analyst for an ERP system. Generate 3-5 actionable business insights based on typical ERP data patterns.

Focus on these areas:
- Inventory optimization opportunities
- Sales performance trends
- Production efficiency improvements
- Cost reduction possibilities
- Risk management alerts

For each insight, provide:
1. A clear, specific title
2. A brief description of the issue/opportunity
3. The business impact
4. A recommended action

Format your response as a JSON array with this structure:
[
  {
    "title": "Insight Title",
    "description": "Detailed description of the insight",
    "type": "opportunity|warning|recommendation",
    "priority": "high|medium|low",
    "module": "inventory|sales|production|finance|hr",
    "action": "Recommended action to take"
  }
]

Generate realistic, actionable insights that would be valuable for business decision-making.`

    // Prepare the request payload for Google Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: insightsPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1500,
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

    // Extract the generated insights from Gemini response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]"

    try {
      // Try to parse as JSON
      const insights = JSON.parse(generatedText)
      return NextResponse.json({ insights })
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      return NextResponse.json({
        insights: [],
        rawResponse: generatedText,
        error: "Failed to parse insights as JSON",
      })
    }
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights. Please try again." }, { status: 500 })
  }
}
