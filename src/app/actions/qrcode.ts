"use server"

import { createClient } from "@/lib/supabase-server"
import QRCode from "qrcode"

export interface QRCodeData {
  id: string
  name: string
  destination_url: string
  short_code: string
  created_by: string | null
  created_at: string
  updated_at: string
  total_scans: number
  is_active: boolean
}

export interface QRCodeScan {
  id: string
  qrcode_id: string
  scanned_at: string
  user_agent: string | null
  ip_address: string | null
  referer: string | null
}

export interface QRCodeStats {
  total: number
  active: number
  inactive: number
  totalScans: number
}

/**
 * Récupère tous les QR codes
 */
export async function getQRCodes(): Promise<QRCodeData[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("QRCode")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching QR codes:", error)
    return []
  }

  return data || []
}

/**
 * Récupère un QR code par son short_code
 */
export async function getQRCodeByShortCode(shortCode: string): Promise<QRCodeData | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("QRCode")
    .select("*")
    .eq("short_code", shortCode)
    .single()

  if (error) {
    console.error("Error fetching QR code:", error)
    return null
  }

  return data
}

/**
 * Génère un code court unique
 */
async function generateUniqueShortCode(): Promise<string> {
  const supabase = await createClient()
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const { data } = await supabase
      .from("QRCode")
      .select("id")
      .eq("short_code", code)
      .maybeSingle()

    if (!data) {
      return code
    }

    attempts++
  }

  throw new Error("Unable to generate unique short code")
}

/**
 * Crée un nouveau QR code
 */
export async function createQRCode(
  name: string,
  destinationUrl: string
): Promise<{ success: boolean; data?: QRCodeData; error?: string; qrCodeDataUrl?: string }> {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Non authentifié" }
    }

    // Générer un code court unique
    const shortCode = await generateUniqueShortCode()

    // Créer le QR code dans la base de données
    const { data, error } = await supabase
      .from("QRCode")
      .insert({
        name,
        destination_url: destinationUrl,
        short_code: shortCode,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating QR code:", error)
      return { success: false, error: "Erreur lors de la création du QR code" }
    }

    // Générer l'URL de redirection
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/qr/${shortCode}`

    // Générer le QR code en Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 512,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    return { success: true, data, qrCodeDataUrl }
  } catch (error) {
    console.error("Error in createQRCode:", error)
    return { success: false, error: "Erreur lors de la création du QR code" }
  }
}

/**
 * Supprime un QR code
 */
export async function deleteQRCode(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("QRCode")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting QR code:", error)
      return { success: false, error: "Erreur lors de la suppression" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteQRCode:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

/**
 * Active/désactive un QR code
 */
export async function toggleQRCodeStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("QRCode")
      .update({ is_active: isActive })
      .eq("id", id)

    if (error) {
      console.error("Error toggling QR code status:", error)
      return { success: false, error: "Erreur lors de la modification" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in toggleQRCodeStatus:", error)
    return { success: false, error: "Erreur lors de la modification" }
  }
}

/**
 * Enregistre un scan de QR code
 */
export async function recordQRCodeScan(
  shortCode: string,
  userAgent?: string,
  ipAddress?: string,
  referer?: string
): Promise<{ success: boolean; destinationUrl?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // Récupérer le QR code
    const qrCode = await getQRCodeByShortCode(shortCode)

    if (!qrCode) {
      return { success: false, error: "QR code introuvable" }
    }

    if (!qrCode.is_active) {
      return { success: false, error: "Ce QR code n'est plus actif" }
    }

    // Enregistrer le scan
    await supabase.from("QRCodeScan").insert({
      qrcode_id: qrCode.id,
      user_agent: userAgent,
      ip_address: ipAddress,
      referer: referer,
    })

    // Incrémenter le compteur de scans
    await supabase
      .from("QRCode")
      .update({ total_scans: qrCode.total_scans + 1 })
      .eq("id", qrCode.id)

    return { success: true, destinationUrl: qrCode.destination_url }
  } catch (error) {
    console.error("Error recording QR code scan:", error)
    return { success: false, error: "Erreur lors de l'enregistrement du scan" }
  }
}

/**
 * Récupère les scans d'un QR code
 */
export async function getQRCodeScans(qrcodeId: string): Promise<QRCodeScan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("QRCodeScan")
    .select("*")
    .eq("qrcode_id", qrcodeId)
    .order("scanned_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching QR code scans:", error)
    return []
  }

  return data || []
}

/**
 * Récupère les statistiques des QR codes
 */
export async function getQRCodeStats(): Promise<QRCodeStats> {
  const supabase = await createClient()

  const { data: qrCodes } = await supabase
    .from("QRCode")
    .select("is_active, total_scans")

  if (!qrCodes) {
    return { total: 0, active: 0, inactive: 0, totalScans: 0 }
  }

  const stats = qrCodes.reduce(
    (acc, qr) => {
      acc.total++
      if (qr.is_active) {
        acc.active++
      } else {
        acc.inactive++
      }
      acc.totalScans += qr.total_scans || 0
      return acc
    },
    { total: 0, active: 0, inactive: 0, totalScans: 0 }
  )

  return stats
}

/**
 * Génère l'image du QR code pour téléchargement
 */
export async function generateQRCodeImage(shortCode: string): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  try {
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/qr/${shortCode}`

    const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 512,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    return { success: true, dataUrl: qrCodeDataUrl }
  } catch (error) {
    console.error("Error generating QR code image:", error)
    return { success: false, error: "Erreur lors de la génération du QR code" }
  }
}
