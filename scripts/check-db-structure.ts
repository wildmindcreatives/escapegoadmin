import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Charger les variables d'environnement depuis .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) {
      const value = valueParts.join('=').trim()
      process.env[key.trim()] = value
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabaseStructure() {
  console.log('🔍 Vérification de la structure de la base de données...\n')

  // Vérifier d'abord auth.users
  console.log('📋 Vérification des utilisateurs (auth.users)...')
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.log('   ⚠️ Erreur lors de la récupération des utilisateurs:', authError.message)
  } else {
    console.log(`   ✅ ${authData.users.length} utilisateurs trouvés dans auth.users`)
  }

  // Essayer avec des tables spécifiques au schéma public
  const commonTables = [
    'users', 'profiles', 'games', 'game_sessions', 'sessions',
    'orders', 'purchases', 'players', 'bookings', 'reservations',
    'teams', 'scores', 'payments', 'transactions', 'rooms',
    'escape_games', 'reservations_escape_game', 'joueurs'
  ]
  const foundTables: string[] = []

  for (const tableName of commonTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(3)

      if (!error && data !== null) {
        foundTables.push(tableName)
        console.log(`\n✅ Table "${tableName}"`)
        console.log(`   📊 ${data.length > 0 ? `${data.length} enregistrements affichés` : 'Table vide'}`)

        if (data.length > 0) {
          const columns = Object.keys(data[0])
          console.log(`   📋 Colonnes (${columns.length}): ${columns.join(', ')}`)
          console.log(`   🔍 Exemples de données:`)
          data.forEach((row, i) => {
            console.log(`      ${i + 1}. ${JSON.stringify(row, null, 2).split('\n').slice(0, 10).join('\n      ')}`)
          })
        }
      } else if (error) {
        // Afficher l'erreur pour debug
        if (!error.message.includes('does not exist') && !error.message.includes('relation')) {
          console.log(`   ⚠️ Erreur pour "${tableName}": ${error.message}`)
        }
      }
    } catch (e: any) {
      // Ignorer les erreurs
    }
  }

  console.log('\n\n📈 RÉSUMÉ:')
  if (foundTables.length > 0) {
    console.log(`   Tables trouvées: ${foundTables.join(', ')}`)
  } else {
    console.log(`   ⚠️ Aucune table trouvée. Votre base de données est peut-être vide.`)
    console.log(`   💡 Conseil: Créez des tables dans Supabase pour commencer à utiliser le dashboard.`)
  }
}

checkDatabaseStructure()
