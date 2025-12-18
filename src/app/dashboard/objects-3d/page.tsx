"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  listObjects3D,
  deleteObject3D,
  uploadObject3D,
  type Object3D
} from "@/app/actions/objects3d"
import type { User } from "@supabase/supabase-js"
import {
  Box,
  Upload,
  Trash2,
  ArrowLeft,
  Plus
} from "lucide-react"
import { Model3DViewer } from "@/components/Model3DViewer"

export default function Objects3DPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [objects, setObjects] = useState<Object3D[]>([])
  const [loadingObjects, setLoadingObjects] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const hasCheckedAuth = useRef(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'cube',
    description: '',
    defaultColor: '#ff3b30',
    previewEmoji: '📦',
    isPremium: false,
    category: 'basic',
    file: null as File | null
  })

  const loadObjects = useCallback(async () => {
    setLoadingObjects(true)
    try {
      const { data, error } = await listObjects3D()
      if (error) {
        console.error("Error loading objects:", error)
      } else if (data) {
        setObjects(data)
      }
    } catch (error) {
      console.error("Error loading objects:", error)
    } finally {
      setLoadingObjects(false)
    }
  }, [])

  useEffect(() => {
    if (hasCheckedAuth.current) return
    hasCheckedAuth.current = true

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push("/")
        } else {
          setUser(user)
          // Charger les objets après avoir confirmé l'utilisateur
          loadObjects()
        }
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/")
      } else {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, loadObjects])

  const handleDelete = async (id: string, modelUrl: string | null) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet objet 3D ?")) {
      return
    }

    try {
      const { success, error } = await deleteObject3D(id, modelUrl)
      if (success) {
        // Recharger la liste
        await loadObjects()
      } else {
        alert(`Erreur lors de la suppression: ${error}`)
      }
    } catch (error) {
      console.error("Error deleting object:", error)
      alert("Une erreur est survenue lors de la suppression")
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let modelUrl: string | null = null

      // Uploader le fichier directement depuis le client vers Supabase Storage
      if (formData.file && formData.file.size > 0) {
        const fileExt = formData.file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('3d-models')
          .upload(filePath, formData.file, {
            contentType: formData.file.type || 'application/octet-stream',
            upsert: false
          })

        if (uploadError) {
          console.error('Error uploading file:', uploadError)
          alert(`Erreur d'upload: ${uploadError.message}`)
          setUploading(false)
          return
        }

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('3d-models')
          .getPublicUrl(filePath)

        modelUrl = publicUrl
      }

      // Insérer dans la base de données via Supabase client
      const { data: newObject, error: insertError } = await supabase
        .from('objects_3d_library')
        .insert({
          name: formData.name,
          type: formData.type,
          description: formData.description || null,
          default_color: formData.defaultColor,
          preview_emoji: formData.previewEmoji,
          is_premium: formData.isPremium,
          is_active: true,
          category: formData.category,
          model_url: modelUrl,
          created_by: user?.id
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
        alert(`Erreur lors de la création: ${insertError.message}`)
      } else {
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          type: 'cube',
          description: '',
          defaultColor: '#ff3b30',
          previewEmoji: '📦',
          isPremium: false,
          category: 'basic',
          file: null
        })
        setIsUploadDialogOpen(false)
        // Recharger la liste
        await loadObjects()
      }
    } catch (error) {
      console.error("Error uploading object:", error)
      alert("Une erreur est survenue lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Box className="h-6 w-6" />
              Objets 3D
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un objet 3D
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleUpload}>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouvel objet 3D</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations et uploadez un fichier 3D (.glb, .gltf, .obj, etc.)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cube">Cube</SelectItem>
                          <SelectItem value="sphere">Sphère</SelectItem>
                          <SelectItem value="cylinder">Cylindre</SelectItem>
                          <SelectItem value="cone">Cône</SelectItem>
                          <SelectItem value="custom">Personnalisé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="defaultColor">Couleur par défaut</Label>
                        <Input
                          id="defaultColor"
                          type="color"
                          value={formData.defaultColor}
                          onChange={(e) => setFormData({ ...formData, defaultColor: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="previewEmoji">Emoji de prévisualisation</Label>
                        <Input
                          id="previewEmoji"
                          value={formData.previewEmoji}
                          onChange={(e) => setFormData({ ...formData, previewEmoji: e.target.value })}
                          maxLength={2}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Catégorie</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basique</SelectItem>
                          <SelectItem value="nature">Nature</SelectItem>
                          <SelectItem value="urban">Urbain</SelectItem>
                          <SelectItem value="decoration">Décoration</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPremium"
                        checked={formData.isPremium}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                      />
                      <Label htmlFor="isPremium">Objet premium</Label>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="file">Fichier 3D</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".glb,.gltf,.obj,.fbx,.dae"
                        onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                      />
                      <p className="text-sm text-muted-foreground">
                        Formats acceptés : .glb, .gltf, .obj, .fbx, .dae
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(false)}
                      disabled={uploading}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? "Upload en cours..." : "Ajouter"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loadingObjects ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Chargement des objets 3D...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Bibliothèque d'objets 3D
                </CardTitle>
                <CardDescription>
                  {objects.length} objet{objects.length > 1 ? "s" : ""} disponible{objects.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {objects.length === 0 ? (
                  <div className="text-center py-12">
                    <Box className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Aucun objet 3D</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Commencez par ajouter votre premier objet 3D
                    </p>
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un objet 3D
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {objects.map((object) => (
                      <Card key={object.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{object.preview_emoji || '📦'}</span>
                              <div>
                                <CardTitle className="text-base">{object.name}</CardTitle>
                                <p className="text-xs text-muted-foreground">{object.type}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(object.id, object.model_url)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {object.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {object.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs">
                            <div
                              className="h-4 w-4 rounded border"
                              style={{ backgroundColor: object.default_color || '#ff3b30' }}
                            />
                            <span className="text-muted-foreground">
                              {object.default_color || '#ff3b30'}
                            </span>
                          </div>
                          {object.category && (
                            <div className="flex gap-1">
                              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                {object.category}
                              </span>
                              {object.is_premium && (
                                <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                  Premium
                                </span>
                              )}
                            </div>
                          )}
                          {object.model_url && (
                            <div className="pt-2 space-y-2">
                              <Model3DViewer
                                modelUrl={object.model_url}
                                defaultColor={object.default_color || undefined}
                              />
                              <a
                                href={object.model_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Upload className="h-3 w-3" />
                                Télécharger le fichier
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
