import { type NextRequest, NextResponse } from "next/server"
import { LookupService } from "@/lib/lookup-service"

let cachedSources: any[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60000 // 1 minute cache

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quick = searchParams.get("quick") === "true"

    const now = Date.now()

    if (!quick && cachedSources && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedSources,
        cached: true,
      })
    }

    const sources = await LookupService.getLookupSources({ quick })

    if (!quick) {
      cachedSources = sources
      cacheTimestamp = now
    }

    return NextResponse.json({
      success: true,
      data: sources,
      cached: false,
      quick,
    })
  } catch (error) {
    console.error("Error fetching lookup sources:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lookup sources",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    cachedSources = null
    cacheTimestamp = 0

    return NextResponse.json({
      success: true,
      message: "Cache cleared",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear cache",
      },
      { status: 500 },
    )
  }
}
