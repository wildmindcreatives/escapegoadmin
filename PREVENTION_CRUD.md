# Gestion des Messages de Prévention - Documentation

## Vue d'ensemble

L'interface de gestion des messages de prévention permet de créer, modifier, activer/désactiver et supprimer les messages affichés dans l'application mobile EscapeGo.

## Accès à la fonctionnalité

### Navigation
- Depuis le dashboard principal, cliquez sur le bouton **"Messages de prévention"** dans le header
- URL directe : `/dashboard/prevention`

## Fonctionnalités

### 1. Liste des messages

La page principale affiche tous les messages de prévention avec :
- **Badge de statut** : Actif (vert) ou Inactif (gris)
- **Priorité** : Affichée sous forme de badge
- **Icône et couleurs** : Aperçu visuel du message
- **Options d'affichage** : 1x/jour, 1x/session
- **Période de validité** : Dates de début et fin
- **Aperçu des conseils** : Liste des conseils configurés

#### Actions disponibles
- **Switch Actif/Inactif** : Active ou désactive le message en temps réel
- **Bouton Modifier** : Ouvre le formulaire d'édition
- **Bouton Supprimer** : Supprime le message (avec confirmation)
- **Bouton "Nouveau message"** : Crée un nouveau message

### 2. Création d'un message

Cliquez sur **"Nouveau message"** pour accéder au formulaire de création.

#### Informations principales (obligatoires)
- **Titre** : Titre principal du message (ex: "Petit rappel bienveillant 💙")
- **Sous-titre** : Catégorie ou thème (ex: "Prévention canicule")
- **Message principal** : Contenu du message
- **Nom de l'icône** : Nom de l'icône Lucide (ex: sun, alert-circle, droplets)
- **Couleur de l'icône** : Sélecteur de couleur hexadécimale
- **Couleur de fond** : Sélecteur de couleur hexadécimale
- **Texte du bouton** : Texte affiché sur le bouton (ex: "J'ai compris")

#### Message de pied de page (optionnel)
- Texte affiché en bas du message (ex: "Prends soin de toi ! 🎮✨")

#### Conseils (optionnels - jusqu'à 5)
Pour chaque conseil, vous pouvez définir :
- **Icône** : Nom de l'icône Lucide
- **Couleur** : Couleur de l'icône
- **Texte** : Contenu du conseil

Exemple de conseils :
1. "Pense à porter une casquette ou un chapeau" (icône: sun)
2. "N'oublie pas de t'hydrater régulièrement" (icône: droplets)
3. "Fais des pauses à l'ombre si tu ressens de la fatigue" (icône: heart)

#### Paramètres
- **Priorité** : Nombre (plus élevé = plus prioritaire)
- **Valide à partir de** : Date et heure de début
- **Valide jusqu'au** : Date et heure de fin
- **Message actif** : Active/Désactive le message
- **Afficher une fois par jour** : Limite l'affichage à 1x/jour par utilisateur
- **Afficher une fois par session** : Limite l'affichage à 1x/session de jeu

### 3. Modification d'un message

Cliquez sur **"Modifier"** sur un message pour ouvrir le formulaire pré-rempli.

Tous les champs peuvent être modifiés. Le message est automatiquement mis à jour avec :
- La date de modification (`updated_at`)
- L'utilisateur qui a fait la modification (`updated_by`)

### 4. Suppression d'un message

Cliquez sur **"Supprimer"** sur un message pour afficher une boîte de dialogue de confirmation.

⚠️ **Attention** : La suppression est irréversible !

### 5. Activation/Désactivation rapide

Utilisez le **switch** à droite de chaque message pour activer ou désactiver un message instantanément, sans ouvrir le formulaire d'édition.

## Structure de données

### Table PreventionMessage

```typescript
interface PreventionMessage {
  id: string                          // UUID généré automatiquement

  // Informations principales
  title: string                       // Titre du message
  subtitle: string | null             // Sous-titre (optionnel)
  icon_name: string                   // Nom de l'icône (Lucide)
  icon_color: string                  // Couleur hex de l'icône
  background_color: string            // Couleur hex du fond
  main_message: string                // Message principal
  button_text: string                 // Texte du bouton
  footer_message: string | null       // Message de pied de page

  // Conseils (5 maximum)
  advice_1_icon: string | null
  advice_1_icon_color: string | null
  advice_1_text: string | null
  advice_2_icon: string | null
  advice_2_icon_color: string | null
  advice_2_text: string | null
  advice_3_icon: string | null
  advice_3_icon_color: string | null
  advice_3_text: string | null
  advice_4_icon: string | null
  advice_4_icon_color: string | null
  advice_4_text: string | null
  advice_5_icon: string | null
  advice_5_icon_color: string | null
  advice_5_text: string | null

  // Paramètres
  is_active: boolean                  // Message actif ou non
  priority: number                    // Priorité d'affichage
  valid_from: string | null           // Date de début
  valid_until: string | null          // Date de fin
  show_once_per_day: boolean          // Limite 1x/jour
  show_once_per_session: boolean      // Limite 1x/session

  // Métadonnées
  created_at: string                  // Date de création
  updated_at: string                  // Date de modification
  created_by: string | null           // Créateur
  updated_by: string | null           // Dernier éditeur
}
```

## Exemples de messages

### Exemple 1 : Prévention Canicule
- **Titre** : Petit rappel bienveillant 💙
- **Sous-titre** : Prévention canicule
- **Icône** : sun (#FF6B35)
- **Message** : Nous sommes en été et il fait chaud ! ☀️
- **Conseils** :
  - Porter une casquette (sun)
  - S'hydrater régulièrement (droplets)
  - Faire des pauses à l'ombre (heart)
- **Période** : 1er juin - 30 septembre
- **Priorité** : 100

### Exemple 2 : Prévention Hiver
- **Titre** : Attention au froid ❄️
- **Sous-titre** : Prévention hiver
- **Icône** : snowflake (#5A9FD4)
- **Message** : Les températures sont basses, protégez-vous !
- **Conseils** :
  - Porter des vêtements chauds (shirt)
  - Protéger les extrémités (hand)
  - Faire des pauses au chaud (home)
- **Période** : 1er décembre - 28 février
- **Priorité** : 100

### Exemple 3 : Sécurité Générale
- **Titre** : Restez vigilant 🚨
- **Sous-titre** : Sécurité
- **Icône** : shield (#56aa74)
- **Message** : Pour votre sécurité, restez attentif à votre environnement
- **Conseils** :
  - Jouer en groupe (users)
  - Éviter les zones isolées (map-pin)
  - Respecter le code de la route (traffic-cone)
- **Période** : Toute l'année
- **Priorité** : 50

## Architecture technique

### Server Actions
Les opérations CRUD utilisent les **Next.js Server Actions** pour une sécurité maximale :

```typescript
// src/app/actions/prevention.ts
- getPreventionMessages()             // Liste tous les messages
- getPreventionMessage(id)            // Récupère un message
- createPreventionMessage(formData)   // Crée un nouveau message
- updatePreventionMessage(id, data)   // Met à jour un message
- deletePreventionMessage(id)         // Supprime un message
- togglePreventionMessageStatus(id)   // Active/Désactive un message
```

### Notifications
Les actions affichent des notifications toast (via Sonner) :
- ✅ Succès : Message vert
- ❌ Erreur : Message rouge

### Revalidation
Après chaque opération, la page est automatiquement rafraîchie (`revalidatePath`).

## Bonnes pratiques

### Priorités
- **100+** : Messages urgents (canicule, météo extrême)
- **50-99** : Messages importants (sécurité générale)
- **0-49** : Messages informatifs (conseils, astuces)

### Périodes de validité
- Définissez toujours une période pour les messages saisonniers
- Les messages généraux peuvent ne pas avoir de dates

### Icônes disponibles
Utilisez les icônes de **Lucide React** :
- Météo : sun, cloud, snowflake, droplets, wind, zap
- Sécurité : shield, alert-circle, alert-triangle, lock
- Santé : heart, activity, thermometer, pill
- Navigation : map-pin, navigation, compass
- Voir la liste complète : https://lucide.dev/icons/

### Couleurs recommandées
- **Rouge** (#e74c3c) : Danger, urgence
- **Orange** (#FF6B35) : Attention, chaleur
- **Vert** (#56aa74) : Sécurité, nature
- **Bleu** (#3498db) : Information, eau
- **Jaune** (#f1c40f) : Avertissement

## Dépannage

### Le message ne s'affiche pas dans l'app
Vérifiez :
1. Le message est **actif** (switch activé)
2. La **période de validité** inclut la date actuelle
3. La **priorité** est suffisante
4. L'utilisateur n'a pas déjà vu le message (si 1x/jour ou 1x/session)

### Erreur lors de la sauvegarde
- Vérifiez que tous les champs obligatoires sont remplis
- Vérifiez les couleurs sont au format hexadécimal (#RRGGBB)
- Vérifiez que vous êtes toujours connecté

### L'icône ne s'affiche pas
- Vérifiez que le nom de l'icône est correct (https://lucide.dev/icons/)
- Les noms doivent être en kebab-case (ex: alert-circle, map-pin)

## Évolutions futures

- [ ] Prévisualisation en temps réel du message
- [ ] Duplication de messages
- [ ] Filtres et recherche dans la liste
- [ ] Statistiques d'affichage par message
- [ ] Templates de messages pré-configurés
- [ ] Import/Export de messages
- [ ] Historique des modifications
- [ ] Envoi de notifications push avec les messages
