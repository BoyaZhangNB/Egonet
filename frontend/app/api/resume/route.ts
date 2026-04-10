import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"

interface SaveResumePayload {
  data: unknown
  filename?: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SaveResumePayload

    if (!payload || payload.data === undefined) {
      return NextResponse.json({ error: "Missing resume data" }, { status: 400 })
    }

    const backendResumeDir = path.resolve(process.cwd(), "../backend/resume")
    const safeFilename = payload.filename?.endsWith(".json") ? payload.filename : "resume.json"
    const targetFilePath = path.join(backendResumeDir, safeFilename)

    await mkdir(backendResumeDir, { recursive: true })
    await writeFile(targetFilePath, JSON.stringify(payload.data, null, 2), "utf-8")

    return NextResponse.json({
      ok: true,
      path: `backend/resume/${safeFilename}`,
    })
  } catch (error) {
    console.error("Failed to save resume JSON:", error)
    return NextResponse.json({ error: "Failed to save resume JSON" }, { status: 500 })
  }
}
