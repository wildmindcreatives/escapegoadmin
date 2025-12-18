"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, ArrowLeft, AlertCircle, Calendar } from "lucide-react"
import { getPreventionMessages, deletePreventionMessage, togglePreventionMessageStatus } from "@/app/actions/prevention"
import type { PreventionMessage } from "@/types/prevention"
import { toast } from "sonner"

export default function PreventionPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<PreventionMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    try {
      setLoading(true)
      const data = await getPreventionMessages()
      console.log("Messages chargés:", data?.length || 0)
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Erreur lors du chargement des messages")
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePreventionMessage(id)
      toast.success("Message supprimé avec succès")
      loadMessages()
    } catch (error) {
      console.error("Error deleting message:", error)
      toast.error("Erreur lors de la suppression")
    } finally {
      setDeleteId(null)
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    try {
      await togglePreventionMessageStatus(id, !currentStatus)
      toast.success(`Message ${!currentStatus ? "activé" : "désactivé"} avec succès`)
      loadMessages()
    } catch (error) {
      console.error("Error toggling status:", error)
      toast.error("Erreur lors du changement de statut")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
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
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Messages de prévention</h1>
                <p className="text-sm text-muted-foreground">
                  Gérez les messages affichés dans l'application
                </p>
              </div>
            </div>
            <Button onClick={() => router.push("/dashboard/prevention/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau message
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-muted-foreground">
          {messages.length} message{messages.length > 1 ? 's' : ''} trouvé{messages.length > 1 ? 's' : ''}
        </div>
        {messages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun message de prévention</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par créer votre premier message
              </p>
              <Button onClick={() => router.push("/dashboard/prevention/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un message
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: message.background_color }}
                        >
                          <span style={{ color: message.icon_color }}>
                            {message.icon_name}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{message.title}</CardTitle>
                          {message.subtitle && (
                            <CardDescription>{message.subtitle}</CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant={message.is_active ? "default" : "secondary"}>
                          {message.is_active ? "Actif" : "Inactif"}
                        </Badge>
                        <Badge variant="outline">
                          Priorité: {message.priority}
                        </Badge>
                        {message.show_once_per_day && (
                          <Badge variant="outline">1x/jour</Badge>
                        )}
                        {message.show_once_per_session && (
                          <Badge variant="outline">1x/session</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={message.is_active}
                        onCheckedChange={(checked) => handleToggleStatus(message.id, message.is_active)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Message principal</p>
                      <p className="text-sm text-muted-foreground">{message.main_message}</p>
                    </div>

                    {(message.advice_1_text || message.advice_2_text || message.advice_3_text) && (
                      <div>
                        <p className="text-sm font-medium mb-2">Conseils</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {message.advice_1_text && <li>• {message.advice_1_text}</li>}
                          {message.advice_2_text && <li>• {message.advice_2_text}</li>}
                          {message.advice_3_text && <li>• {message.advice_3_text}</li>}
                          {message.advice_4_text && <li>• {message.advice_4_text}</li>}
                          {message.advice_5_text && <li>• {message.advice_5_text}</li>}
                        </ul>
                      </div>
                    )}

                    {(message.valid_from || message.valid_until) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(message.valid_from)} - {formatDate(message.valid_until)}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/prevention/${message.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(message.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce message de prévention ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
