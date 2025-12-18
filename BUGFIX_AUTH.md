# Correction : Authentification dans les Server Actions

## Problème identifié

Lors de l'utilisation des Server Actions pour créer, modifier ou supprimer des messages de prévention, l'erreur suivante se produisait :

```
Error: Vous devez être connecté pour modifier un message
```

### Cause

Les Server Actions utilisaient le client Supabase standard (`@supabase/supabase-js`) qui ne gère pas automatiquement les cookies côté serveur dans Next.js.

Le code suivant ne fonctionnait pas :

```typescript
import { supabase } from "@/lib/supabase"

export async function createPreventionMessage(formData: PreventionMessageFormData) {
  const { data: { user } } = await supabase.auth.getUser()  // ❌ user était toujours null

  if (!user) {
    throw new Error("Vous devez être connecté pour créer un message")
  }
  // ...
}
```

## Solution implémentée

### 1. Installation du package `@supabase/ssr`

```bash
npm install @supabase/ssr
```

Ce package permet de créer un client Supabase qui fonctionne correctement avec les cookies Next.js.

### 2. Création d'un client serveur Supabase

**Fichier : `src/lib/supabase-server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### 3. Mise à jour des Server Actions

**Fichier : `src/app/actions/prevention.ts`**

Changement de :
```typescript
import { supabase } from "@/lib/supabase"

export async function createPreventionMessage(formData: PreventionMessageFormData) {
  const { data: { user } } = await supabase.auth.getUser()
  // ...
}
```

Vers :
```typescript
import { createClient } from "@/lib/supabase-server"

export async function createPreventionMessage(formData: PreventionMessageFormData) {
  const supabase = await createClient()  // ✅ Crée un nouveau client avec les cookies
  const { data: { user } } = await supabase.auth.getUser()
  // ...
}
```

## Fonctions modifiées

Toutes les Server Actions ont été mises à jour :

1. ✅ `getPreventionMessages()` - Liste des messages
2. ✅ `getPreventionMessage(id)` - Récupération d'un message
3. ✅ `createPreventionMessage(formData)` - Création
4. ✅ `updatePreventionMessage(id, formData)` - Modification
5. ✅ `deletePreventionMessage(id)` - Suppression
6. ✅ `togglePreventionMessageStatus(id, isActive)` - Toggle actif/inactif

## Résultat

✅ **L'authentification fonctionne correctement** dans toutes les Server Actions

✅ **Les utilisateurs peuvent maintenant** :
- Créer de nouveaux messages de prévention
- Modifier les messages existants
- Activer/Désactiver les messages
- Supprimer les messages

✅ **Les métadonnées sont correctement enregistrées** :
- `created_by` : ID de l'utilisateur créateur
- `updated_by` : ID du dernier utilisateur modificateur
- `created_at` : Date de création
- `updated_at` : Date de dernière modification

## Vérification

### Test rapide
1. Connectez-vous au dashboard admin
2. Accédez à `/dashboard/prevention`
3. Créez un nouveau message
4. Modifiez un message existant
5. Activez/Désactivez un message avec le switch

Toutes ces actions devraient maintenant fonctionner sans erreur ! 🎉

## Architecture

```
Client (Browser)
    ↓
Next.js Server Actions (Server-side)
    ↓
Supabase SSR Client (avec cookies)
    ↓
Supabase Auth (vérifie la session)
    ↓
PostgreSQL Database
```

## Notes techniques

### Pourquoi deux clients Supabase ?

1. **Client standard** (`src/lib/supabase.ts`) :
   - Utilisé dans les composants clients
   - Fonctionne dans le navigateur
   - Utilise `createBrowserClient`

2. **Client serveur** (`src/lib/supabase-server.ts`) :
   - Utilisé dans les Server Actions et Server Components
   - Fonctionne côté serveur uniquement
   - Utilise `createServerClient` avec gestion des cookies

### Avantages de cette approche

✅ **Sécurité** : Les Server Actions s'exécutent côté serveur uniquement
✅ **Performance** : Pas besoin d'exposer de tokens au client
✅ **Simplicité** : Le client gère automatiquement les cookies
✅ **Standards Next.js** : Utilise l'API native `cookies()` de Next.js

## Documentation officielle

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [@supabase/ssr](https://github.com/supabase/ssr)

## Changelog

- **18 Décembre 2024** :
  - Installation de `@supabase/ssr`
  - Création de `src/lib/supabase-server.ts`
  - Migration de toutes les Server Actions
  - Tests et validation
