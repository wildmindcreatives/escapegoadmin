"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { getPreventionMessage, createPreventionMessage, updatePreventionMessage } from "@/app/actions/prevention"
import type { PreventionMessage, PreventionMessageFormData } from "@/types/prevention"
import { toast } from "sonner"

export default function PreventionFormPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === "new"
  const messageId = typeof params.id === "string" ? params.id : ""

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PreventionMessageFormData>({
    title: "",
    subtitle: "",
    icon_name: "alert-circle",
    icon_color: "#56aa74",
    background_color: "#E8F5E8",
    main_message: "",
    button_text: "J'ai compris",
    advice_1_icon: "",
    advice_1_icon_color: "",
    advice_1_text: "",
    advice_2_icon: "",
    advice_2_icon_color: "",
    advice_2_text: "",
    advice_3_icon: "",
    advice_3_icon_color: "",
    advice_3_text: "",
    advice_4_icon: "",
    advice_4_icon_color: "",
    advice_4_text: "",
    advice_5_icon: "",
    advice_5_icon_color: "",
    advice_5_text: "",
    footer_message: "",
    is_active: true,
    priority: 0,
    valid_from: "",
    valid_until: "",
    show_once_per_day: false,
    show_once_per_session: false,
  })

  useEffect(() => {
    if (!isNew && messageId) {
      loadMessage()
    }
  }, [isNew, messageId])

  async function loadMessage() {
    try {
      setLoading(true)
      const message = await getPreventionMessage(messageId)
      setFormData({
        title: message.title || "",
        subtitle: message.subtitle || "",
        icon_name: message.icon_name || "alert-circle",
        icon_color: message.icon_color || "#56aa74",
        background_color: message.background_color || "#E8F5E8",
        main_message: message.main_message || "",
        button_text: message.button_text || "J'ai compris",
        advice_1_icon: message.advice_1_icon || "",
        advice_1_icon_color: message.advice_1_icon_color || "",
        advice_1_text: message.advice_1_text || "",
        advice_2_icon: message.advice_2_icon || "",
        advice_2_icon_color: message.advice_2_icon_color || "",
        advice_2_text: message.advice_2_text || "",
        advice_3_icon: message.advice_3_icon || "",
        advice_3_icon_color: message.advice_3_icon_color || "",
        advice_3_text: message.advice_3_text || "",
        advice_4_icon: message.advice_4_icon || "",
        advice_4_icon_color: message.advice_4_icon_color || "",
        advice_4_text: message.advice_4_text || "",
        advice_5_icon: message.advice_5_icon || "",
        advice_5_icon_color: message.advice_5_icon_color || "",
        advice_5_text: message.advice_5_text || "",
        footer_message: message.footer_message || "",
        is_active: message.is_active,
        priority: message.priority,
        valid_from: message.valid_from ? new Date(message.valid_from).toISOString().slice(0, 16) : "",
        valid_until: message.valid_until ? new Date(message.valid_until).toISOString().slice(0, 16) : "",
        show_once_per_day: message.show_once_per_day,
        show_once_per_session: message.show_once_per_session,
      })
    } catch (error) {
      console.error("Error loading message:", error)
      toast.error("Erreur lors du chargement du message")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      if (isNew) {
        await createPreventionMessage(formData)
        toast.success("Message créé avec succès")
      } else {
        await updatePreventionMessage(messageId, formData)
        toast.success("Message mis à jour avec succès")
      }
      router.push("/dashboard/prevention")
    } catch (error) {
      console.error("Error saving message:", error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/prevention")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isNew ? "Nouveau message" : "Modifier le message"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isNew ? "Créer un nouveau message de prévention" : "Modifier les informations du message"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations principales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations principales</CardTitle>
              <CardDescription>
                Les informations de base du message de prévention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Petit rappel bienveillant 💙"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Sous-titre</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ex: Prévention canicule"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="main_message">Message principal *</Label>
                <Textarea
                  id="main_message"
                  value={formData.main_message}
                  onChange={(e) => setFormData({ ...formData, main_message: e.target.value })}
                  placeholder="Le message principal à afficher"
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="icon_name">Nom de l'icône *</Label>
                  <Input
                    id="icon_name"
                    value={formData.icon_name}
                    onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                    placeholder="Ex: sun, alert-circle"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon_color">Couleur de l'icône *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="icon_color"
                      value={formData.icon_color}
                      onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={formData.icon_color}
                      onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
                      placeholder="#56aa74"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background_color">Couleur de fond *</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="background_color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    placeholder="#E8F5E8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_text">Texte du bouton *</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="Ex: J'ai compris"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_message">Message de pied de page</Label>
                <Input
                  id="footer_message"
                  value={formData.footer_message}
                  onChange={(e) => setFormData({ ...formData, footer_message: e.target.value })}
                  placeholder="Ex: Prends soin de toi et passe un excellent moment ! 🎮✨"
                />
              </div>
            </CardContent>
          </Card>

          {/* Conseils */}
          <Card>
            <CardHeader>
              <CardTitle>Conseils (optionnels)</CardTitle>
              <CardDescription>
                Jusqu'à 5 conseils peuvent être ajoutés au message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="space-y-3 pb-4 border-b last:border-0">
                  <h4 className="font-medium text-sm">Conseil {num}</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`advice_${num}_icon`}>Icône</Label>
                      <Input
                        id={`advice_${num}_icon`}
                        value={formData[`advice_${num}_icon` as keyof PreventionMessageFormData] as string}
                        onChange={(e) => setFormData({ ...formData, [`advice_${num}_icon`]: e.target.value })}
                        placeholder="sun"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`advice_${num}_icon_color`}>Couleur</Label>
                      <Input
                        type="color"
                        id={`advice_${num}_icon_color`}
                        value={formData[`advice_${num}_icon_color` as keyof PreventionMessageFormData] as string}
                        onChange={(e) => setFormData({ ...formData, [`advice_${num}_icon_color`]: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor={`advice_${num}_text`}>Texte</Label>
                      <Textarea
                        id={`advice_${num}_text`}
                        value={formData[`advice_${num}_text` as keyof PreventionMessageFormData] as string}
                        onChange={(e) => setFormData({ ...formData, [`advice_${num}_text`]: e.target.value })}
                        placeholder="Texte du conseil"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Paramètres */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>
                Configuration de l'affichage et de la validité du message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground">
                  Plus le nombre est élevé, plus le message sera prioritaire
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valide à partir de</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valide jusqu'au</Label>
                  <Input
                    id="valid_until"
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Message actif</Label>
                  <p className="text-sm text-muted-foreground">
                    Le message sera visible dans l'application
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_once_per_day">Afficher une fois par jour</Label>
                  <p className="text-sm text-muted-foreground">
                    Le message ne s'affichera qu'une fois par jour par utilisateur
                  </p>
                </div>
                <Switch
                  id="show_once_per_day"
                  checked={formData.show_once_per_day}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_once_per_day: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_once_per_session">Afficher une fois par session</Label>
                  <p className="text-sm text-muted-foreground">
                    Le message ne s'affichera qu'une fois par session de jeu
                  </p>
                </div>
                <Switch
                  id="show_once_per_session"
                  checked={formData.show_once_per_session}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_once_per_session: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/prevention")}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
