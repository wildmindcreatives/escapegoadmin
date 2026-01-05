"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/StatCard"
import { getDashboardStats, type DashboardStats } from "@/lib/stats"
import type { User } from "@supabase/supabase-js"
import {
  Users,
  Gamepad2,
  PlayCircle,
  Euro,
  ShoppingCart,
  UserCheck,
  CheckCircle,
  MapPin,
  Star,
  TrendingUp,
  AlertCircle,
  Settings,
  Box,
  Tag
} from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    checkUser()

    // S'abonner aux changements d'authentification
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
  }, [router])

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      setLoadingStats(true)
      try {
        const dashboardStats = await getDashboardStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoadingStats(false)
      }
    }

    loadStats()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
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
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/prevention")}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Messages de prévention
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/objects-3d")}
            >
              <Box className="h-4 w-4 mr-2" />
              Objets 3D
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/promocodes")}
            >
              <Tag className="h-4 w-4 mr-2" />
              Codes Promos
            </Button>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Se déconnecter
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loadingStats ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Chargement des statistiques...</div>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Section: Vue d'ensemble */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Vue d'ensemble</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Utilisateurs inscrits"
                  value={stats.totalUsers.toLocaleString("fr-FR")}
                  description="Total des utilisateurs"
                  icon={Users}
                />
                <StatCard
                  title="Utilisateurs actifs"
                  value={stats.activeUsers.toLocaleString("fr-FR")}
                  description="Ayant joué au moins une fois"
                  icon={UserCheck}
                />
                <StatCard
                  title="Jeux créés"
                  value={stats.totalGames.toLocaleString("fr-FR")}
                  description="Total des jeux disponibles"
                  icon={Gamepad2}
                />
                <StatCard
                  title="Nouveaux jeux ce mois"
                  value={stats.newGamesThisMonth.toLocaleString("fr-FR")}
                  description="Créés ce mois-ci"
                  icon={TrendingUp}
                />
              </div>
            </div>

            {/* Section: Sessions et activité */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Sessions et activité</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Sessions de jeu"
                  value={stats.totalGameSessions.toLocaleString("fr-FR")}
                  description="Total des sessions"
                  icon={PlayCircle}
                />
                <StatCard
                  title="Sessions terminées"
                  value={stats.completedSessions.toLocaleString("fr-FR")}
                  description={`${stats.totalGameSessions > 0 ? Math.round((stats.completedSessions / stats.totalGameSessions) * 100) : 0}% de taux de complétion`}
                  icon={CheckCircle}
                />
                <StatCard
                  title="Note moyenne"
                  value={`${stats.averageGameRating.toFixed(1)} / 5`}
                  description={`Basé sur ${stats.totalReviews} avis`}
                  icon={Star}
                />
              </div>
            </div>

            {/* Section: Revenus */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Revenus et transactions</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Revenus totaux"
                  value={`${stats.totalRevenue.toLocaleString("fr-FR")} €`}
                  description="Toutes transactions confondues"
                  icon={Euro}
                />
                <StatCard
                  title="Achats réalisés"
                  value={stats.totalPurchases.toLocaleString("fr-FR")}
                  description="Total des achats"
                  icon={ShoppingCart}
                />
                <StatCard
                  title="Panier moyen"
                  value={`${stats.averageBasketValue.toLocaleString("fr-FR")} €`}
                  description="Montant moyen par achat"
                  icon={TrendingUp}
                />
              </div>
            </div>

            {/* Section: Localisations les plus actives */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Localisations populaires</h2>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Top 5 des villes
                  </CardTitle>
                  <CardDescription>
                    Villes avec le plus de jeux créés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.topCities.length > 0 ? (
                    <div className="space-y-3">
                      {stats.topCities.map((city, index) => (
                        <div key={city.city} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{city.city}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {city.count} jeu{city.count > 1 ? "x" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Section: Évolution des revenus */}
            {stats.revenueByMonth.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Évolution des revenus</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenus par mois</CardTitle>
                    <CardDescription>
                      6 derniers mois
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.revenueByMonth.map((item) => (
                        <div key={item.month} className="flex items-center justify-between">
                          <span className="font-medium">{item.month}</span>
                          <span className="text-sm font-bold">
                            {item.revenue.toLocaleString("fr-FR")} €
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Erreur de chargement</CardTitle>
                <CardDescription>
                  Impossible de charger les statistiques. Veuillez réessayer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
