import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query, modules } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Create a comprehensive report generation prompt
    const reportPrompt = `You are an expert business analyst generating a comprehensive ERP report.

Report Request: ${query}

Please generate a detailed business report that includes:
1. Executive Summary
2. Key Findings and Metrics
3. Data Analysis and Trends
4. Actionable Recommendations
5. Risk Assessment (if applicable)
6. Next Steps

Focus on providing practical, data-driven insights that can help improve business operations. Use professional business language and structure the report clearly with headings and bullet points where appropriate.

Make the report comprehensive but concise, typically 300-500 words unless more detail is specifically requested.`

    // Prepare the request payload for Google Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: reportPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more focused, factual reports
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000, // Higher token limit for detailed reports
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

    // Extract the generated report from Gemini response
    const generatedReport = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate report at this time."

    return NextResponse.json({
      report: generatedReport,
      timestamp: new Date().toISOString(),
      query: query,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report. Please try again." }, { status: 500 })
  }
}
