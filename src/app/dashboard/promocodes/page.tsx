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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Tag, CheckCircle, XCircle, Copy } from "lucide-react"
import {
  getPromoCodes,
  generatePromoCodes,
  deleteUsedPromoCodes,
  getPromoCodeStats,
  type PromoCode
} from "@/app/actions/promocode"
import { toast } from "sonner"
import { StatCard } from "@/components/StatCard"

export default function PromoCodesPage() {
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    used: 0,
    unused: 0,
    usageRate: 0
  })

  useEffect(() => {
    loadPromoCodes()
  }, [])

  async function loadPromoCodes() {
    try {
      setLoading(true)
      const [codes, statistics] = await Promise.all([
        getPromoCodes(),
        getPromoCodeStats()
      ])
      setPromoCodes(codes)
      setStats(statistics)
    } catch (error) {
      console.error("Error loading promo codes:", error)
      toast.error("Erreur lors du chargement des codes promos")
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateCodes() {
    try {
      setGenerating(true)
      const result = await generatePromoCodes()

      if (result.success) {
        toast.success(`${result.count} nouveaux codes promos générés avec succès`)
        await loadPromoCodes()
      } else {
        toast.error(result.error || "Erreur lors de la génération")
      }
    } catch (error) {
      console.error("Error generating codes:", error)
      toast.error("Erreur lors de la génération des codes")
    } finally {
      setGenerating(false)
    }
  }

  async function handleDeleteUsedCodes() {
    try {
      setDeleting(true)
      const result = await deleteUsedPromoCodes()

      if (result.success) {
        toast.success(`${result.count} code(s) promo utilisé(s) supprimé(s)`)
        await loadPromoCodes()
      } else {
        toast.error(result.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error deleting codes:", error)
      toast.error("Erreur lors de la suppression des codes")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code)
    toast.success("Code copié dans le presse-papier")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
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
                <h1 className="text-2xl font-bold">Codes Promos</h1>
                <p className="text-sm text-muted-foreground">
                  Gérez les codes promotionnels de l'application
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting || stats.used === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer les codes utilisés
              </Button>
              <Button onClick={handleGenerateCodes} disabled={generating}>
                <Plus className="h-4 w-4 mr-2" />
                {generating ? "Génération..." : "Générer 10 codes"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total de codes"
            value={stats.total.toString()}
            description="Codes générés au total"
            icon={Tag}
          />
          <StatCard
            title="Codes utilisés"
            value={stats.used.toString()}
            description={`${stats.usageRate.toFixed(1)}% du total`}
            icon={CheckCircle}
          />
          <StatCard
            title="Codes disponibles"
            value={stats.unused.toString()}
            description="Prêts à être utilisés"
            icon={XCircle}
          />
          <StatCard
            title="Taux d'utilisation"
            value={`${stats.usageRate.toFixed(1)}%`}
            description="Codes déjà utilisés"
            icon={Tag}
          />
        </div>

        {/* Table des codes promos */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des codes promos</CardTitle>
            <CardDescription>
              {promoCodes.length} code(s) promo au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {promoCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun code promo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Commencez par générer des codes promos
                </p>
                <Button onClick={handleGenerateCodes} disabled={generating}>
                  <Plus className="h-4 w-4 mr-2" />
                  Générer 10 codes
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((promoCode) => (
                      <TableRow key={promoCode.id}>
                        <TableCell className="font-mono font-semibold">
                          {promoCode.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant={promoCode.used ? "secondary" : "default"}>
                            {promoCode.used ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Utilisé
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Disponible
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(promoCode.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(promoCode.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les codes utilisés</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer tous les codes promos déjà utilisés ({stats.used} code(s)) ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUsedCodes} disabled={deleting}>
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
