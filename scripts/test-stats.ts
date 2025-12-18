/**
 * Script de test pour vérifier les statistiques du dashboard
 *
 * Ce script vérifie que toutes les requêtes fonctionnent correctement
 * et affiche les résultats dans la console.
 *
 * Usage: npx tsx scripts/test-stats.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStats() {
  console.log('🔍 Test des statistiques du dashboard...\n')

  try {
    // 1. Nombre total d'utilisateurs
    console.log('📊 Test 1: Nombre d\'utilisateurs')
    const { count: totalUsers, error: usersError } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true })

    if (usersError) throw usersError
    console.log(`✅ Total utilisateurs: ${totalUsers}\n`)

    // 2. Nombre total de jeux
    console.log('📊 Test 2: Nombre de jeux')
    const { count: totalGames, error: gamesError } = await supabase
      .from("Game")
      .select("*", { count: "exact", head: true })

    if (gamesError) throw gamesError
    console.log(`✅ Total jeux: ${totalGames}\n`)

    // 3. Sessions de jeu
    console.log('📊 Test 3: Sessions de jeu')
    const { count: totalSessions, error: sessionsError } = await supabase
      .from("GameSession")
      .select("*", { count: "exact", head: true })

    if (sessionsError) throw sessionsError
    console.log(`✅ Total sessions: ${totalSessions}\n`)

    // 4. Transactions Stripe
    console.log('📊 Test 4: Transactions')
    const { data: transactions, error: transactionsError } = await supabase
      .from("StripeTransaction")
      .select("total_amount, status")
      .eq("status", "succeeded")

    if (transactionsError) throw transactionsError
    const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.total_amount || 0), 0) || 0
    console.log(`✅ Transactions réussies: ${transactions?.length}`)
    console.log(`✅ Revenus totaux: ${totalRevenue.toFixed(2)} €\n`)

    // 5. Achats de jeux
    console.log('📊 Test 5: Achats de jeux')
    const { count: totalPurchases, error: purchasesError } = await supabase
      .from("GamePurchase")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "succeeded")

    if (purchasesError) throw purchasesError
    console.log(`✅ Total achats: ${totalPurchases}\n`)

    // 6. Top des villes
    console.log('📊 Test 6: Top des villes')
    const { data: citiesData, error: citiesError } = await supabase
      .from("Game")
      .select("city")
      .not("city", "is", null)

    if (citiesError) throw citiesError

    const cityCounts = citiesData?.reduce((acc, game) => {
      const city = game.city || "Non spécifié"
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const topCities = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    console.log('✅ Top 5 villes:')
    topCities.forEach((city, index) => {
      console.log(`   ${index + 1}. ${city.city}: ${city.count} jeux`)
    })
    console.log()

    // 7. Avis et notes
    console.log('📊 Test 7: Avis et notes')
    const { data: reviews, error: reviewsError } = await supabase
      .from("GameReview")
      .select("rating")

    if (reviewsError) throw reviewsError

    const totalReviews = reviews?.length || 0
    const averageRating = totalReviews > 0 && reviews
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    console.log(`✅ Total avis: ${totalReviews}`)
    console.log(`✅ Note moyenne: ${averageRating.toFixed(1)}/5\n`)

    // Résumé
    console.log('═══════════════════════════════════════')
    console.log('✨ RÉSUMÉ DES STATISTIQUES')
    console.log('═══════════════════════════════════════')
    console.log(`👥 Utilisateurs: ${totalUsers}`)
    console.log(`🎮 Jeux: ${totalGames}`)
    console.log(`🎯 Sessions: ${totalSessions}`)
    console.log(`💰 Revenus: ${totalRevenue.toFixed(2)} €`)
    console.log(`🛒 Achats: ${totalPurchases}`)
    console.log(`⭐ Note moyenne: ${averageRating.toFixed(1)}/5`)
    console.log('═══════════════════════════════════════\n')

    console.log('✅ Tous les tests sont passés avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    process.exit(1)
  }
}

testStats()
