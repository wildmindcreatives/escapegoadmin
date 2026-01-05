"use server"

import { supabase } from "@/lib/supabase"

export type PromoCodeType = "play" | "publish"

export interface PromoCode {
  id: string
  code: string
  used: boolean
  type: PromoCodeType
  created_at: string
}

/**
 * Récupère tous les codes promos
 */
export async function getPromoCodes(): Promise<PromoCode[]> {
  const { data, error } = await supabase
    .from("promocode")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promocodes:", error)
    throw new Error("Erreur lors de la récupération des codes promos")
  }

  return data || []
}

/**
 * Génère un code promo aléatoire unique
 */
function generatePromoCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Génère 10 nouveaux codes promos
 */
export async function generatePromoCodes(type: PromoCodeType = "play"): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const newCodes: { code: string; used: boolean; type: PromoCodeType }[] = []
    const existingCodes = await getPromoCodes()
    const existingCodesSet = new Set(existingCodes.map(c => c.code))

    // Générer 10 codes uniques
    while (newCodes.length < 10) {
      const code = generatePromoCode()
      if (!existingCodesSet.has(code) && !newCodes.some(c => c.code === code)) {
        newCodes.push({ code, used: false, type })
        existingCodesSet.add(code)
      }
    }

    const { error } = await supabase
      .from("promocode")
      .insert(newCodes)

    if (error) {
      console.error("Error generating promocodes:", error)
      throw new Error("Erreur lors de la génération des codes promos")
    }

    return { success: true, count: 10 }
  } catch (error) {
    console.error("Error in generatePromoCodes:", error)
    return { success: false, count: 0, error: "Erreur lors de la génération des codes promos" }
  }
}

/**
 * Supprime tous les codes promos utilisés (optionnellement filtrés par type)
 */
export async function deleteUsedPromoCodes(type?: PromoCodeType): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Construire la requête
    let countQuery = supabase
      .from("promocode")
      .select("*", { count: "exact", head: true })
      .eq("used", true)

    let deleteQuery = supabase
      .from("promocode")
      .delete()
      .eq("used", true)

    // Ajouter le filtre de type si spécifié
    if (type) {
      countQuery = countQuery.eq("type", type)
      deleteQuery = deleteQuery.eq("type", type)
    }

    // Compter les codes utilisés avant suppression
    const { count } = await countQuery

    // Supprimer tous les codes utilisés
    const { error } = await deleteQuery

    if (error) {
      console.error("Error deleting used promocodes:", error)
      throw new Error("Erreur lors de la suppression des codes utilisés")
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error("Error in deleteUsedPromoCodes:", error)
    return { success: false, count: 0, error: "Erreur lors de la suppression des codes utilisés" }
  }
}

/**
 * Obtient les statistiques des codes promos
 */
export async function getPromoCodeStats(): Promise<{
  total: number
  used: number
  unused: number
  usageRate: number
  byType: {
    play: { total: number; used: number; unused: number }
    publish: { total: number; used: number; unused: number }
  }
}> {
  const codes = await getPromoCodes()
  const total = codes.length
  const used = codes.filter(c => c.used).length
  const unused = total - used
  const usageRate = total > 0 ? (used / total) * 100 : 0

  // Stats par type
  const playCodes = codes.filter(c => c.type === "play")
  const publishCodes = codes.filter(c => c.type === "publish")

  return {
    total,
    used,
    unused,
    usageRate,
    byType: {
      play: {
        total: playCodes.length,
        used: playCodes.filter(c => c.used).length,
        unused: playCodes.filter(c => !c.used).length
      },
      publish: {
        total: publishCodes.length,
        used: publishCodes.filter(c => c.used).length,
        unused: publishCodes.filter(c => !c.used).length
      }
    }
  }
}
