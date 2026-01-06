import { NextRequest, NextResponse } from "next/server"
import { recordQRCodeScan } from "@/app/actions/qrcode"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params

  // Récupérer les informations de la requête
  const userAgent = request.headers.get("user-agent") || undefined
  const referer = request.headers.get("referer") || undefined
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                    request.headers.get("x-real-ip") ||
                    undefined

  // Enregistrer le scan et récupérer l'URL de destination
  const result = await recordQRCodeScan(shortCode, userAgent, ipAddress, referer)

  if (!result.success || !result.destinationUrl) {
    return NextResponse.json(
      { error: result.error || "QR code introuvable" },
      { status: 404 }
    )
  }

  // Rediriger vers l'URL de destination
  return NextResponse.redirect(result.destinationUrl)
}
