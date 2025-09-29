import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { grantId: string } }
) {
  try {
    const { grantId } = params

    // First, delete any saved grants that reference this grant
    await sql`
      DELETE FROM saved_grants 
      WHERE grant_id = ${parseInt(grantId)}
    `

    // Then delete the grant itself
    const result = await sql`
      DELETE FROM grants 
      WHERE id = ${parseInt(grantId)}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Grant deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting grant:", error)
    return NextResponse.json(
      { error: "Failed to delete grant" },
      { status: 500 }
    )
  }
}
