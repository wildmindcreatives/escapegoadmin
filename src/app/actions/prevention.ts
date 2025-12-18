"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import type { PreventionMessageFormData } from "@/types/prevention"

export async function getPreventionMessages() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("PreventionMessage")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching prevention messages:", error)
    throw new Error("Impossible de récupérer les messages de prévention")
  }

  return data
}

export async function getPreventionMessage(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("PreventionMessage")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching prevention message:", error)
    throw new Error("Impossible de récupérer le message de prévention")
  }

  return data
}

export async function createPreventionMessage(formData: PreventionMessageFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Vous devez être connecté pour créer un message")
  }

  // Convertir les chaînes vides en null pour les champs timestamp
  const cleanedData = {
    ...formData,
    valid_from: formData.valid_from || null,
    valid_until: formData.valid_until || null,
    created_by: user.id,
    updated_by: user.id,
  }

  const { data, error } = await supabase
    .from("PreventionMessage")
    .insert(cleanedData)
    .select()
    .single()

  if (error) {
    console.error("Error creating prevention message:", error)
    throw new Error("Impossible de créer le message de prévention")
  }

  revalidatePath("/dashboard/prevention")
  return data
}

export async function updatePreventionMessage(id: string, formData: PreventionMessageFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Vous devez être connecté pour modifier un message")
  }

  // Convertir les chaînes vides en null pour les champs timestamp
  const cleanedData = {
    ...formData,
    valid_from: formData.valid_from || null,
    valid_until: formData.valid_until || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("PreventionMessage")
    .update(cleanedData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating prevention message:", error)
    throw new Error("Impossible de mettre à jour le message de prévention")
  }

  revalidatePath("/dashboard/prevention")
  return data
}

export async function deletePreventionMessage(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("PreventionMessage")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting prevention message:", error)
    throw new Error("Impossible de supprimer le message de prévention")
  }

  revalidatePath("/dashboard/prevention")
  return { success: true }
}

export async function togglePreventionMessageStatus(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Vous devez être connecté pour modifier un message")
  }

  const { data, error } = await supabase
    .from("PreventionMessage")
    .update({
      is_active: isActive,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error toggling prevention message status:", error)
    throw new Error("Impossible de changer le statut du message")
  }

  revalidatePath("/dashboard/prevention")
  return data
}
