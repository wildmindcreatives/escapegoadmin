import { supabase } from "./supabase"

export interface DashboardStats {
  totalUsers: number
  totalGames: number
  totalGameSessions: number
  totalRevenue: number
  averageBasketValue: number
  totalPurchases: number
  activeUsers: number
  completedSessions: number
  topCities: Array<{ city: string; count: number }>
  revenueByMonth: Array<{ month: string; revenue: number }>
  newUsersThisMonth: number
  newGamesThisMonth: number
  averageGameRating: number
  totalReviews: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // 1. Nombre total d'utilisateurs
    const { count: totalUsers } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true })

    // 2. Nombre total de jeux créés
    const { count: totalGames } = await supabase
      .from("Game")
      .select("*", { count: "exact", head: true })

    // 3. Nombre total de sessions de jeu
    const { count: totalGameSessions } = await supabase
      .from("GameSession")
      .select("*", { count: "exact", head: true })

    // 4. Sessions terminées
    const { count: completedSessions } = await supabase
      .from("GameSession")
      .select("*", { count: "exact", head: true })
      .eq("status", "finished")

    // 5. Revenus totaux (transactions réussies)
    const { data: revenueData } = await supabase
      .from("StripeTransaction")
      .select("total_amount")
      .eq("status", "succeeded")

    const totalRevenue = revenueData?.reduce((sum, t) => sum + Number(t.total_amount || 0), 0) || 0

    // 6. Nombre total d'achats
    const { count: totalPurchases } = await supabase
      .from("GamePurchase")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "succeeded")

    // 7. Panier moyen
    const averageBasketValue = totalPurchases && totalPurchases > 0
      ? totalRevenue / totalPurchases
      : 0

    // 8. Utilisateurs actifs (ayant joué au moins une fois)
    const { data: activeUsersData } = await supabase
      .from("GameSession")
      .select("userId", { count: "exact" })
      .not("userId", "is", null)

    const uniqueActiveUsers = new Set(activeUsersData?.map(s => s.userId) || [])
    const activeUsers = uniqueActiveUsers.size

    // 9. Top des villes les plus actives
    const { data: citiesData } = await supabase
      .from("Game")
      .select("city")
      .not("city", "is", null)

    const cityCounts = citiesData?.reduce((acc, game) => {
      const city = game.city || "Non spécifié"
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const topCities = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 10. Nouveaux utilisateurs ce mois-ci
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Note: La table User n'a pas de created_at visible, on utilise GameSession comme proxy
    const { count: newUsersThisMonth } = await supabase
      .from("GameSession")
      .select("userId", { count: "exact" })
      .gte("created_at", startOfMonth.toISOString())

    // 11. Nouveaux jeux ce mois-ci
    const { count: newGamesThisMonth } = await supabase
      .from("Game")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString())

    // 12. Revenus par mois (6 derniers mois)
    const { data: monthlyRevenue } = await supabase
      .from("StripeTransaction")
      .select("created_at, total_amount")
      .eq("status", "succeeded")
      .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })

    const revenueByMonth = monthlyRevenue?.reduce((acc, t) => {
      const month = new Date(t.created_at).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short"
      })
      const existing = acc.find(r => r.month === month)
      if (existing) {
        existing.revenue += Number(t.total_amount || 0)
      } else {
        acc.push({ month, revenue: Number(t.total_amount || 0) })
      }
      return acc
    }, [] as Array<{ month: string; revenue: number }>) || []

    // 13. Note moyenne des jeux
    const { data: reviewsData } = await supabase
      .from("GameReview")
      .select("rating")

    const totalReviews = reviewsData?.length || 0
    const averageGameRating = totalReviews > 0 && reviewsData
      ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    return {
      totalUsers: totalUsers || 0,
      totalGames: totalGames || 0,
      totalGameSessions: totalGameSessions || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageBasketValue: Math.round(averageBasketValue * 100) / 100,
      totalPurchases: totalPurchases || 0,
      activeUsers,
      completedSessions: completedSessions || 0,
      topCities,
      revenueByMonth,
      newUsersThisMonth: newUsersThisMonth || 0,
      newGamesThisMonth: newGamesThisMonth || 0,
      averageGameRating: Math.round(averageGameRating * 10) / 10,
      totalReviews,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw error
  }
}
