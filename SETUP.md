# Configuration de l'authentification Admin Escape Go

## Configuration Supabase

Votre application est maintenant configurée avec l'authentification Supabase.

### Étapes de configuration déjà complétées :

1. Installation du package `@supabase/supabase-js`
2. Configuration du client Supabase dans `src/lib/supabase.ts`
3. Variables d'environnement dans `.env.local`
4. Contexte d'authentification dans `src/contexts/AuthContext.tsx`
5. Page de login à la racine (`/`)
6. Dashboard admin protégé (`/dashboard`)

### Configuration Supabase nécessaire

Pour que l'authentification fonctionne, vous devez configurer Supabase :

1. **Créer une table utilisateurs** (optionnel si vous voulez stocker des données supplémentaires)

2. **Créer un utilisateur admin** dans Supabase :
   - Allez sur https://app.supabase.com/project/yjvnofoxbqvavjqvbgmg/auth/users
   - Cliquez sur "Add user"
   - Choisissez "Create new user"
   - Entrez un email et un mot de passe
   - Cliquez sur "Create user"

3. **Configurer les URL de redirection** (si nécessaire) :
   - Allez dans Authentication > URL Configuration
   - Ajoutez vos URLs de redirection autorisées

### Structure du projet

```
src/
├── app/
│   ├── page.tsx                 # Page de login
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard admin protégé
│   └── layout.tsx              # Layout avec AuthProvider
├── components/
│   └── ui/                     # Composants UI (déjà existants)
├── contexts/
│   └── AuthContext.tsx         # Contexte d'authentification global
├── lib/
│   └── supabase.ts            # Client Supabase configuré
└── middleware.ts              # Middleware Next.js
```

### Fonctionnalités implémentées

- Formulaire de connexion avec validation
- Protection des routes du dashboard
- Redirection automatique si déjà connecté
- Déconnexion
- Gestion globale de l'état d'authentification
- Messages d'erreur en français
- Interface responsive avec Tailwind CSS

### Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Test de l'authentification

1. Créez un utilisateur dans Supabase (voir ci-dessus)
2. Ouvrez `http://localhost:3000`
3. Connectez-vous avec les identifiants créés
4. Vous serez redirigé vers `/dashboard`
5. Utilisez le bouton "Se déconnecter" pour vous déconnecter

### Dashboard de statistiques

Le dashboard affiche maintenant des statistiques complètes sur l'activité de l'application :

#### Statistiques affichées :
- **Vue d'ensemble** : Utilisateurs inscrits, utilisateurs actifs, jeux créés, nouveaux jeux
- **Sessions et activité** : Sessions totales, sessions terminées, taux de complétion, notes moyennes
- **Revenus** : Revenus totaux, nombre d'achats, panier moyen
- **Localisations** : Top 5 des villes les plus actives
- **Évolution** : Revenus par mois (6 derniers mois)

Pour plus de détails sur les métriques, consultez `DASHBOARD_STATS.md`.

### Prochaines étapes

- ✅ Dashboard de statistiques avec connexion Supabase
- Implémenter la récupération de mot de passe
- Ajouter des rôles et permissions
- Créer des pages supplémentaires dans le dashboard (gestion des utilisateurs, des jeux, etc.)
