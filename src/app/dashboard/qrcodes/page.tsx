"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  ArrowLeft,
  Plus,
  Trash2,
  QrCode as QrCodeIcon,
  Eye,
  EyeOff,
  Download,
  Copy,
  ExternalLink,
  BarChart3,
} from "lucide-react"
import {
  getQRCodes,
  createQRCode,
  deleteQRCode,
  toggleQRCodeStatus,
  getQRCodeStats,
  generateQRCodeImage,
  type QRCodeData,
} from "@/app/actions/qrcode"
import { toast } from "sonner"
import { StatCard } from "@/components/StatCard"

export default function QRCodesPage() {
  const router = useRouter()
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false)
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeData | null>(null)
  const [qrCodeDataUrl, setQRCodeDataUrl] = useState<string>("")
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalScans: 0,
  })

  // Formulaire de création
  const [formData, setFormData] = useState({
    name: "",
    destinationUrl: "",
  })

  useEffect(() => {
    loadQRCodes()
  }, [])

  async function loadQRCodes() {
    try {
      setLoading(true)
      const [codes, statistics] = await Promise.all([
        getQRCodes(),
        getQRCodeStats(),
      ])
      setQRCodes(codes)
      setStats(statistics)
    } catch (error) {
      console.error("Error loading QR codes:", error)
      toast.error("Erreur lors du chargement des QR codes")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateQRCode() {
    if (!formData.name.trim() || !formData.destinationUrl.trim()) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    try {
      setCreating(true)
      const result = await createQRCode(formData.name, formData.destinationUrl)

      if (result.success && result.data && result.qrCodeDataUrl) {
        toast.success("QR code créé avec succès")
        setFormData({ name: "", destinationUrl: "" })
        setShowCreateDialog(false)

        // Afficher le QR code généré
        setSelectedQRCode(result.data)
        setQRCodeDataUrl(result.qrCodeDataUrl)
        setShowQRCodeDialog(true)

        await loadQRCodes()
      } else {
        toast.error(result.error || "Erreur lors de la création")
      }
    } catch (error) {
      console.error("Error creating QR code:", error)
      toast.error("Erreur lors de la création du QR code")
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteQRCode() {
    if (!selectedQRCode) return

    try {
      setDeleting(true)
      const result = await deleteQRCode(selectedQRCode.id)

      if (result.success) {
        toast.success("QR code supprimé")
        setShowDeleteDialog(false)
        setSelectedQRCode(null)
        await loadQRCodes()
      } else {
        toast.error(result.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error deleting QR code:", error)
      toast.error("Erreur lors de la suppression")
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleStatus(qrCode: QRCodeData) {
    try {
      const result = await toggleQRCodeStatus(qrCode.id, !qrCode.is_active)

      if (result.success) {
        toast.success(
          qrCode.is_active
            ? "QR code désactivé"
            : "QR code activé"
        )
        await loadQRCodes()
      } else {
        toast.error(result.error || "Erreur lors de la modification")
      }
    } catch (error) {
      console.error("Error toggling status:", error)
      toast.error("Erreur lors de la modification")
    }
  }

  async function handleShowQRCode(qrCode: QRCodeData) {
    try {
      const result = await generateQRCodeImage(qrCode.short_code)

      if (result.success && result.dataUrl) {
        setSelectedQRCode(qrCode)
        setQRCodeDataUrl(result.dataUrl)
        setShowQRCodeDialog(true)
      } else {
        toast.error("Erreur lors de la génération du QR code")
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Erreur lors de la génération")
    }
  }

  function downloadQRCode() {
    if (!selectedQRCode || !qrCodeDataUrl) return

    const link = document.createElement("a")
    link.download = `qrcode-${selectedQRCode.short_code}.png`
    link.href = qrCodeDataUrl
    link.click()

    toast.success("QR code téléchargé")
  }

  function copyQRCodeUrl() {
    if (!selectedQRCode) return

    const url = `${window.location.origin}/qr/${selectedQRCode.short_code}`
    navigator.clipboard.writeText(url)
    toast.success("URL copiée dans le presse-papier")
  }

  function copyShortCode(shortCode: string) {
    navigator.clipboard.writeText(shortCode)
    toast.success("Code copié")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
                <h1 className="text-2xl font-bold">QR Codes</h1>
                <p className="text-sm text-muted-foreground">
                  Générez et suivez vos QR codes avec statistiques
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un QR code
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total QR codes"
            value={stats.total.toString()}
            description="Codes générés"
            icon={QrCodeIcon}
          />
          <StatCard
            title="QR codes actifs"
            value={stats.active.toString()}
            description="En fonctionnement"
            icon={Eye}
          />
          <StatCard
            title="QR codes inactifs"
            value={stats.inactive.toString()}
            description="Désactivés"
            icon={EyeOff}
          />
          <StatCard
            title="Scans totaux"
            value={stats.totalScans.toString()}
            description="Tous QR codes confondus"
            icon={BarChart3}
          />
        </div>

        {/* Liste des QR codes */}
        <Card>
          <CardHeader>
            <CardTitle>Vos QR codes</CardTitle>
            <CardDescription>
              {qrCodes.length} QR code(s) créé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <QrCodeIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun QR code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Commencez par créer votre premier QR code
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un QR code
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Code court</TableHead>
                      <TableHead>URL de destination</TableHead>
                      <TableHead>Scans</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qrCodes.map((qrCode) => (
                      <TableRow key={qrCode.id}>
                        <TableCell className="font-semibold">
                          {qrCode.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                              {qrCode.short_code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyShortCode(qrCode.short_code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          <a
                            href={qrCode.destination_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {qrCode.destination_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            {qrCode.total_scans}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={qrCode.is_active ? "default" : "secondary"}>
                            {qrCode.is_active ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Actif
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Inactif
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(qrCode.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowQRCode(qrCode)}
                            >
                              <QrCodeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(qrCode)}
                            >
                              {qrCode.is_active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedQRCode(qrCode)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
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

      {/* Dialog de création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau QR code</DialogTitle>
            <DialogDescription>
              Le QR code générera une URL courte qui redirigera vers votre destination
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du QR code</Label>
              <Input
                id="name"
                placeholder="Ex: Menu du restaurant"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL de destination</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.destinationUrl}
                onChange={(e) =>
                  setFormData({ ...formData, destinationUrl: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                L'URL vers laquelle le QR code redirigera les utilisateurs
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateQRCode} disabled={creating}>
              {creating ? "Création..." : "Créer le QR code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'affichage du QR code */}
      <Dialog open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedQRCode?.name}</DialogTitle>
            <DialogDescription>
              Scannez ce QR code pour accéder à {selectedQRCode?.destination_url}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {qrCodeDataUrl && (
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="w-64 h-64 border-4 border-zinc-200 dark:border-zinc-800 rounded-lg"
              />
            )}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded">
                <code className="text-sm">
                  {window.location.origin}/qr/{selectedQRCode?.short_code}
                </code>
                <Button variant="ghost" size="sm" onClick={copyQRCodeUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Scans totaux:</span>
                <Badge variant="secondary">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {selectedQRCode?.total_scans || 0}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={downloadQRCode}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button onClick={() => setShowQRCodeDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le QR code</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le QR code "{selectedQRCode?.name}" ?
              Cette action est irréversible et supprimera également toutes les statistiques associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQRCode} disabled={deleting}>
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
