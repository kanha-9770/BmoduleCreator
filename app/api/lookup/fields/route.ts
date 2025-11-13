import { type NextRequest, NextResponse } from "next/server"
import { LookupService } from "@/lib/lookup-service"

const fieldsCache = new Map<string, { fields: string[]; timestamp: number }>()
const CACHE_DURATION = 300000 // 5 minutes cache for fields

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get("sourceId")

    if (!sourceId) {
      return NextResponse.json({ error: "sourceId is required" }, { status: 400 })
    }

    const now = Date.now()
    const cached = fieldsCache.get(sourceId)

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cached.fields,
        cached: true,
      })
    }

    const lookupService = new LookupService()
    const fields = await lookupService.getFields(sourceId)

    // Update cache
    fieldsCache.set(sourceId, { fields, timestamp: now })

    return NextResponse.json({
      success: true,
      data: fields,
      cached: false,
    })
  } catch (error) {
    console.error("Error fetching lookup fields:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lookup fields",
      },
      { status: 500 },
    )
  }
}
