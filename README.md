# Admin Dashboard - EscapeGo

Dashboard d'administration pour l'application EscapeGo avec statistiques en temps réel connectées à Supabase.

## 🚀 Fonctionnalités

### Authentification
- Connexion sécurisée avec Supabase Auth
- Protection des routes du dashboard
- Gestion de session
- Interface de connexion/déconnexion

### Dashboard de statistiques

Le dashboard affiche des statistiques détaillées sur l'activité de l'application :

#### 📊 Vue d'ensemble
- **Utilisateurs inscrits** : Total des utilisateurs enregistrés
- **Utilisateurs actifs** : Utilisateurs ayant joué au moins une fois
- **Jeux créés** : Total des jeux disponibles sur la plateforme
- **Nouveaux jeux ce mois** : Jeux créés durant le mois en cours

#### 🎮 Sessions et activité
- **Sessions de jeu** : Nombre total de sessions lancées
- **Sessions terminées** : Sessions complétées avec taux de complétion
- **Note moyenne** : Satisfaction globale des joueurs (sur 5)

#### 💰 Revenus et transactions
- **Revenus totaux** : Somme de toutes les transactions réussies
- **Achats réalisés** : Nombre total d'achats validés
- **Panier moyen** : Valeur moyenne d'une transaction

#### 📍 Localisations populaires
- **Top 5 des villes** : Classement des villes avec le plus de jeux créés

#### 📈 Évolution des revenus
- **Revenus par mois** : Graphique d'évolution sur 6 mois

### Gestion des messages de prévention

Interface complète de CRUD pour gérer les messages de prévention affichés dans l'application mobile :

#### 🔧 Fonctionnalités
- **Créer** de nouveaux messages de prévention
- **Modifier** les messages existants
- **Activer/Désactiver** les messages en temps réel
- **Supprimer** les messages (avec confirmation)
- **Configurer** jusqu'à 5 conseils par message
- **Planifier** avec dates de début et fin
- **Prioriser** les messages importants
- **Personnaliser** icônes et couleurs

#### 📋 Exemples de messages
- Prévention canicule (été)
- Prévention froid (hiver)
- Sécurité générale
- Conseils santé
- Rappels d'hydratation

Pour plus de détails, consultez [PREVENTION_CRUD.md](./PREVENTION_CRUD.md).

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.local.example .env.local

# Configurer les variables d'environnement
# Modifier .env.local avec vos clés Supabase
```

### Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anonyme
```

## 🏃 Démarrage

```bash
# Démarrer le serveur de développement
npm run dev

# Compiler pour la production
npm run build

# Lancer en production
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🧪 Tests

Testez les statistiques avec le script de test :

```bash
npm run test:stats
```

Ce script affichera un résumé complet des statistiques disponibles dans votre base de données.

## 🔐 Configuration Supabase

### 1. Créer un utilisateur admin

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Authentication > Users**
4. Cliquez sur **Add user**
5. Entrez un email et un mot de passe
6. Cliquez sur **Create user**

### 2. Structure de la base de données

Le dashboard se connecte aux tables suivantes :
- `User` - Utilisateurs de l'application
- `Game` - Jeux créés
- `GameSession` - Sessions de jeu
- `GamePurchase` - Achats de jeux
- `StripeTransaction` - Transactions Stripe
- `GameReview` - Avis et notes

Pour plus de détails sur les métriques, consultez [DASHBOARD_STATS.md](./DASHBOARD_STATS.md).

## 🛠️ Technologies utilisées

- **Next.js 16** - Framework React avec Turbopack
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
- **Tailwind CSS 4** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI
- **Lucide React** - Icônes
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schémas

## 📁 Structure du projet

```
adminescapego/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Page de connexion
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard avec statistiques
│   │   ├── layout.tsx               # Layout global
│   │   └── globals.css              # Styles globaux
│   ├── components/
│   │   ├── ui/                      # Composants UI shadcn
│   │   └── StatCard.tsx             # Composant de carte de statistique
│   ├── contexts/
│   │   └── AuthContext.tsx          # Contexte d'authentification
│   ├── hooks/
│   │   └── use-mobile.tsx           # Hook responsive
│   ├── lib/
│   │   ├── supabase.ts              # Client Supabase
│   │   ├── stats.ts                 # Logique de récupération des stats
│   │   └── utils.ts                 # Utilitaires
│   └── middleware.ts                # Middleware Next.js
├── scripts/
│   └── test-stats.ts                # Script de test des statistiques
├── .env.local                       # Variables d'environnement (à créer)
├── DASHBOARD_STATS.md               # Documentation des statistiques
└── SETUP.md                         # Guide de configuration
```

## 🎨 Personnalisation

### Ajouter de nouvelles statistiques

1. Ajoutez votre métrique dans `src/lib/stats.ts` :

```typescript
export interface DashboardStats {
  // ... statistiques existantes
  maNouvelleStat: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // ... code existant

  // Ajoutez votre requête
  const { count: maNouvelleStat } = await supabase
    .from("MaTable")
    .select("*", { count: "exact", head: true })

  return {
    // ... stats existantes
    maNouvelleStat: maNouvelleStat || 0,
  }
}
```

2. Affichez-la dans le dashboard (`src/app/dashboard/page.tsx`) :

```tsx
<StatCard
  title="Ma Nouvelle Stat"
  value={stats.maNouvelleStat.toLocaleString("fr-FR")}
  description="Description de ma stat"
  icon={MonIcone}
/>
```

## 📝 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm start` - Lance l'application en mode production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run test:stats` - Teste les statistiques de la base de données

## 🐛 Dépannage

### Le build échoue
```bash
# Nettoyer le cache Next.js
rm -rf .next

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Relancer le build
npm run build
```

### Problèmes de connexion Supabase
1. Vérifiez que vos variables d'environnement sont correctement configurées
2. Vérifiez que votre URL et clé Supabase sont valides
3. Assurez-vous que l'utilisateur existe dans Supabase Auth

### Port 3000 déjà utilisé
```bash
# Trouver et arrêter le processus
lsof -ti:3000 | xargs kill -9
```

## 📄 Licence

Ce projet est privé et destiné à l'administration de l'application EscapeGo.

## 🤝 Support

Pour toute question ou problème :
1. Consultez la [documentation Supabase](https://supabase.com/docs)
2. Consultez la [documentation Next.js](https://nextjs.org/docs)
3. Vérifiez les fichiers SETUP.md et DASHBOARD_STATS.md

## 🔮 Évolutions futures

- [ ] Export des statistiques en CSV/Excel
- [ ] Graphiques interactifs avec Recharts
- [ ] Filtres par période
- [ ] Gestion des utilisateurs
- [ ] Gestion des jeux
- [ ] Notifications temps réel
- [ ] Dashboard mobile
- [ ] Rapports automatisés
