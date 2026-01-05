"use server"

import { supabase } from "@/lib/supabase"

export interface PromoCode {
  id: string
  code: string
  used: boolean
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
export async function generatePromoCodes(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const newCodes: { code: string; used: boolean }[] = []
    const existingCodes = await getPromoCodes()
    const existingCodesSet = new Set(existingCodes.map(c => c.code))

    // Générer 10 codes uniques
    while (newCodes.length < 10) {
      const code = generatePromoCode()
      if (!existingCodesSet.has(code) && !newCodes.some(c => c.code === code)) {
        newCodes.push({ code, used: false })
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
 * Supprime tous les codes promos utilisés
 */
export async function deleteUsedPromoCodes(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Compter les codes utilisés avant suppression
    const { count } = await supabase
      .from("promocode")
      .select("*", { count: "exact", head: true })
      .eq("used", true)

    // Supprimer tous les codes utilisés
    const { error } = await supabase
      .from("promocode")
      .delete()
      .eq("used", true)

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
}> {
  const codes = await getPromoCodes()
  const total = codes.length
  const used = codes.filter(c => c.used).length
  const unused = total - used
  const usageRate = total > 0 ? (used / total) * 100 : 0

  return { total, used, unused, usageRate }
}
