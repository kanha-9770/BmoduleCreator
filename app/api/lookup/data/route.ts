import { type NextRequest, NextResponse } from "next/server"
import { LookupService } from "@/lib/lookup-service"

const dataCache = new Map<string, { data: any[]; timestamp: number }>()
const CACHE_DURATION = 60000

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceId = searchParams.get("sourceId")
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!sourceId) {
      return NextResponse.json({ error: "sourceId is required" }, { status: 400 })
    }

    const cacheKey = `${sourceId}-${search}-${limit}-${offset}`
    const now = Date.now()
    const cached = dataCache.get(cacheKey)

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      })
    }

    const lookupService = new LookupService()
    const data = await lookupService.getData(sourceId, { search, limit, offset })

    dataCache.set(cacheKey, { data, timestamp: now })

    return NextResponse.json({
      success: true,
      data,
      cached: false,
    })
  } catch (error) {
    console.error("Error fetching lookup data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lookup data",
      },
      { status: 500 },
    )
  }
}
