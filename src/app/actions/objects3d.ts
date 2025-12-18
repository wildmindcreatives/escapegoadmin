'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Type pour un objet 3D
export type Object3D = {
  id: string
  name: string
  type: string
  description: string | null
  model_url: string | null
  default_color: string | null
  preview_emoji: string | null
  is_premium: boolean | null
  is_active: boolean | null
  category: string | null
  tags: string[] | null
  metadata: Record<string, any> | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
}

// Créer le client Supabase serveur
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // La méthode `setAll` a été appelée depuis un Server Component
          }
        },
      },
    }
  )
}

// Lister tous les objets 3D
export async function listObjects3D(): Promise<{
  data: Object3D[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('objects_3d_library')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching objects:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { data: null, error: 'Une erreur inattendue est survenue' }
  }
}

// Supprimer un objet 3D (fichier et entrée dans la base de données)
export async function deleteObject3D(id: string, modelUrl: string | null): Promise<{
  success: boolean
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Supprimer le fichier du storage si modelUrl existe
    if (modelUrl) {
      // Extraire le chemin du fichier depuis l'URL
      const urlParts = modelUrl.split('/3d-models/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        const { error: storageError } = await supabase.storage
          .from('3d-models')
          .remove([filePath])

        if (storageError) {
          console.error('Error deleting file from storage:', storageError)
          // Continuer même si la suppression du fichier échoue
        }
      }
    }

    // Supprimer l'entrée de la base de données
    const { error: dbError } = await supabase
      .from('objects_3d_library')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('Error deleting object from database:', dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Une erreur inattendue est survenue' }
  }
}

// Uploader un nouvel objet 3D
export async function uploadObject3D(formData: FormData): Promise<{
  success: boolean
  error: string | null
  data?: Object3D
}> {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Récupérer les données du formulaire
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const description = formData.get('description') as string | null
    const defaultColor = formData.get('defaultColor') as string
    const previewEmoji = formData.get('previewEmoji') as string
    const isPremium = formData.get('isPremium') === 'true'
    const category = formData.get('category') as string
    const file = formData.get('file') as File | null

    console.log('Upload request:', { name, type, fileSize: file?.size, fileName: file?.name })

    if (!name || !type) {
      return { success: false, error: 'Le nom et le type sont obligatoires' }
    }

    let modelUrl: string | null = null

    // Uploader le fichier si fourni
    if (file && file.size > 0) {
      try {
        // Convertir le File en ArrayBuffer pour Supabase
        const arrayBuffer = await file.arrayBuffer()
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        console.log('Uploading file:', { filePath, size: arrayBuffer.byteLength })

        const { error: uploadError } = await supabase.storage
          .from('3d-models')
          .upload(filePath, arrayBuffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
          })

        if (uploadError) {
          console.error('Error uploading file:', uploadError)
          return { success: false, error: `Erreur d'upload: ${uploadError.message}` }
        }

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('3d-models')
          .getPublicUrl(filePath)

        modelUrl = publicUrl
        console.log('File uploaded successfully:', publicUrl)
      } catch (fileError) {
        console.error('Error processing file:', fileError)
        return { success: false, error: 'Erreur lors du traitement du fichier' }
      }
    }

    // Insérer dans la base de données
    const { data, error: insertError } = await supabase
      .from('objects_3d_library')
      .insert({
        name,
        type,
        description: description || null,
        default_color: defaultColor,
        preview_emoji: previewEmoji,
        is_premium: isPremium,
        is_active: true,
        category,
        model_url: modelUrl,
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting object:', insertError)
      // Supprimer le fichier uploadé si l'insertion échoue
      if (modelUrl) {
        const urlParts = modelUrl.split('/3d-models/')
        if (urlParts.length > 1) {
          await supabase.storage.from('3d-models').remove([urlParts[1]])
        }
      }
      return { success: false, error: insertError.message }
    }

    console.log('Object created successfully:', data)
    return { success: true, error: null, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: `Une erreur inattendue est survenue: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}
