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
import { ArrowLeft, Plus, Trash2, Tag, CheckCircle, XCircle, Copy, Gamepad2, Pencil, Filter } from "lucide-react"
import {
  getPromoCodes,
  generatePromoCodes,
  deleteUsedPromoCodes,
  getPromoCodeStats,
  type PromoCode,
  type PromoCodeType
} from "@/app/actions/promocode"
import { toast } from "sonner"
import { StatCard } from "@/components/StatCard"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PromoCodesPage() {
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [filteredCodes, setFilteredCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [typeFilter, setTypeFilter] = useState<PromoCodeType | "all">("all")
  const [stats, setStats] = useState({
    total: 0,
    used: 0,
    unused: 0,
    usageRate: 0,
    byType: {
      play: { total: 0, used: 0, unused: 0 },
      publish: { total: 0, used: 0, unused: 0 }
    }
  })

  useEffect(() => {
    loadPromoCodes()
  }, [])

  useEffect(() => {
    if (typeFilter === "all") {
      setFilteredCodes(promoCodes)
    } else {
      setFilteredCodes(promoCodes.filter(code => code.type === typeFilter))
    }
  }, [promoCodes, typeFilter])

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

  async function handleGenerateCodes(type: PromoCodeType) {
    try {
      setGenerating(true)
      const result = await generatePromoCodes(type)

      if (result.success) {
        const typeLabel = type === "play" ? "pour jouer" : "pour créer"
        toast.success(`${result.count} nouveaux codes promos ${typeLabel} générés`)
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
      const typeToDelete = typeFilter !== "all" ? typeFilter : undefined
      const result = await deleteUsedPromoCodes(typeToDelete)

      if (result.success) {
        const typeLabel = typeToDelete === "play" ? " pour jouer" : typeToDelete === "publish" ? " pour créer" : ""
        toast.success(`${result.count} code(s) promo${typeLabel} utilisé(s) supprimé(s)`)
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={generating}>
                    <Plus className="h-4 w-4 mr-2" />
                    {generating ? "Génération..." : "Générer 10 codes"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleGenerateCodes("play")}>
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Codes pour jouer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleGenerateCodes("publish")}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Codes pour créer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistiques globales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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

        {/* Statistiques par type */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Codes pour jouer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">{stats.byType.play.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilisés:</span>
                  <span className="font-semibold">{stats.byType.play.used}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibles:</span>
                  <span className="font-semibold text-green-600">{stats.byType.play.unused}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Codes pour créer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">{stats.byType.publish.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilisés:</span>
                  <span className="font-semibold">{stats.byType.publish.used}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibles:</span>
                  <span className="font-semibold text-green-600">{stats.byType.publish.unused}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table des codes promos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des codes promos</CardTitle>
                <CardDescription>
                  {filteredCodes.length} code(s) promo{typeFilter !== "all" && ` (${typeFilter === "play" ? "pour jouer" : "pour créer"})`}
                </CardDescription>
              </div>
              <Tabs value={typeFilter} onValueChange={(value) => setTypeFilter(value as PromoCodeType | "all")}>
                <TabsList>
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="play">
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Jouer
                  </TabsTrigger>
                  <TabsTrigger value="publish">
                    <Pencil className="h-4 w-4 mr-2" />
                    Créer
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {typeFilter === "all" ? "Aucun code promo" : `Aucun code promo pour ${typeFilter === "play" ? "jouer" : "créer"}`}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Commencez par générer des codes promos
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCodes.map((promoCode) => (
                      <TableRow key={promoCode.id}>
                        <TableCell className="font-mono font-semibold">
                          {promoCode.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {promoCode.type === "play" ? (
                              <>
                                <Gamepad2 className="h-3 w-3" />
                                Jouer
                              </>
                            ) : (
                              <>
                                <Pencil className="h-3 w-3" />
                                Créer
                              </>
                            )}
                          </Badge>
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
