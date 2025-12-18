# Guide de dépannage - Authentification

## Problème : "Vous devez être connecté"

Si vous obtenez ce message d'erreur malgré une connexion réussie, suivez ces étapes :

### Étape 1 : Vérifier la connexion

1. Ouvrez `http://localhost:3000`
2. Connectez-vous avec vos identifiants Supabase
3. Vous devriez être redirigé vers `/dashboard`

### Étape 2 : Vérifier les cookies

1. Ouvrez les DevTools du navigateur (F12)
2. Allez dans l'onglet **Application** (Chrome) ou **Storage** (Firefox)
3. Regardez dans **Cookies** > `http://localhost:3000`
4. Vous devriez voir des cookies Supabase comme :
   - `sb-[project-ref]-auth-token`
   - `sb-[project-ref]-auth-token-code-verifier`

Si ces cookies ne sont pas présents, le problème vient de l'authentification initiale.

### Étape 3 : Se déconnecter et se reconnecter

1. Cliquez sur "Se déconnecter"
2. Fermez tous les onglets de l'application
3. **Videz le cache et les cookies** :
   - Chrome : Ctrl+Shift+Delete > Cocher "Cookies" et "Cache"
   - Firefox : Ctrl+Shift+Delete > Cocher "Cookies" et "Cache"
4. Reconnectez-vous

### Étape 4 : Vérifier l'utilisateur dans Supabase

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. **Authentication** > **Users**
4. Vérifiez que votre utilisateur existe et est confirmé
5. Si nécessaire, créez un nouvel utilisateur avec :
   - Email : votre-email@example.com
   - Mot de passe : (au moins 6 caractères)
   - Cochez "Auto Confirm User"

### Étape 5 : Tester manuellement l'authentification

Ouvrez la console du navigateur (F12 > Console) sur la page `/dashboard` et tapez :

```javascript
// Vérifier la session actuelle
const { data: { session } } = await window.supabase.auth.getSession()
console.log('Session:', session)

// Vérifier l'utilisateur
const { data: { user } } = await window.supabase.auth.getUser()
console.log('User:', user)
```

Si `session` et `user` sont `null`, le problème vient de l'authentification côté client.

### Étape 6 : Redémarrer complètement

```bash
# 1. Arrêter le serveur (Ctrl+C)
# 2. Nettoyer Next.js
rm -rf .next

# 3. Redémarrer
npm run dev
```

### Étape 7 : Vérifier les variables d'environnement

Vérifiez que votre fichier `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[votre-clé-anonyme]
```

⚠️ **Important** : Après modification du `.env.local`, redémarrez le serveur !

## Solution de contournement temporaire

Si le problème persiste, vous pouvez temporairement désactiver la vérification d'authentification dans les Server Actions pour tester :

**⚠️ À UTILISER UNIQUEMENT POUR TESTS - NE PAS DEPLOYER EN PRODUCTION**

Dans `src/app/actions/prevention.ts`, commentez temporairement la vérification :

```typescript
export async function createPreventionMessage(formData: PreventionMessageFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // TEMPORAIRE : Commenté pour tests
  // if (!user) {
  //   throw new Error("Vous devez être connecté pour créer un message")
  // }

  // Utiliser un ID temporaire pour les tests
  const userId = user?.id || "00000000-0000-0000-0000-000000000000"

  const { data, error } = await supabase
    .from("PreventionMessage")
    .insert({
      ...formData,
      created_by: userId,
      updated_by: userId,
    })
    // ...
}
```

## Déboggage avancé

### Ajouter des logs dans les Server Actions

Dans `src/app/actions/prevention.ts` :

```typescript
export async function createPreventionMessage(formData: PreventionMessageFormData) {
  const supabase = await createClient()

  // DEBUG
  console.log('🔍 DEBUG - Vérification de l\'utilisateur...')

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // DEBUG
  console.log('🔍 DEBUG - User:', user)
  console.log('🔍 DEBUG - Auth Error:', authError)

  if (!user) {
    console.log('❌ DEBUG - Pas d\'utilisateur trouvé')
    throw new Error("Vous devez être connecté pour créer un message")
  }

  console.log('✅ DEBUG - Utilisateur authentifié:', user.email)

  // ...
}
```

Regardez les logs dans le terminal où tourne `npm run dev`.

### Vérifier les cookies côté serveur

Dans le middleware (`src/middleware.ts`), ajoutez :

```typescript
export async function middleware(request: NextRequest) {
  // DEBUG
  console.log('🔍 MIDDLEWARE - Cookies:', request.cookies.getAll())

  // ... reste du code
}
```

## Causes fréquentes

### 1. Session expirée
- **Symptôme** : Fonctionnait avant, ne fonctionne plus
- **Solution** : Se déconnecter et se reconnecter

### 2. Cookies bloqués
- **Symptôme** : Ne fonctionne jamais
- **Solution** : Vérifier les paramètres du navigateur (autoriser les cookies tiers)

### 3. Domaines différents
- **Symptôme** : Fonctionne en local, pas en prod
- **Solution** : Configurer les URL autorisées dans Supabase

### 4. Cache Next.js
- **Symptôme** : Comportement erratique
- **Solution** : `rm -rf .next && npm run dev`

### 5. Middleware non appelé
- **Symptôme** : Les cookies ne sont jamais mis à jour
- **Solution** : Vérifier le `matcher` dans `middleware.ts`

## Test rapide de bout en bout

```bash
# 1. Arrêter le serveur
Ctrl+C

# 2. Nettoyer
rm -rf .next

# 3. Redémarrer
npm run dev

# 4. Dans le navigateur :
# - Vider cache et cookies
# - Ouvrir http://localhost:3000
# - Se connecter
# - Aller sur /dashboard/prevention
# - Créer un message
```

## Besoin d'aide ?

Si aucune de ces solutions ne fonctionne :

1. Vérifiez les logs du serveur (terminal)
2. Vérifiez la console du navigateur (F12)
3. Vérifiez la configuration Supabase
4. Vérifiez que vous utilisez la dernière version du code

## Informations système à fournir

Si vous demandez de l'aide, fournissez :

```
- Version Node.js : node --version
- Version Next.js : (voir package.json)
- Navigateur : Chrome/Firefox/Safari + version
- Logs du serveur : (copier les erreurs)
- Logs de la console : (copier les erreurs)
- Cookies présents : (liste des cookies sb-*)
```
