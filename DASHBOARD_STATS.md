# Dashboard de Statistiques - EscapeGo Admin

## Vue d'ensemble des métriques affichées

Le dashboard admin affiche un ensemble complet de statistiques pour analyser et comprendre l'activité des utilisateurs de l'application EscapeGo.

### Section 1 : Vue d'ensemble

#### 1. Utilisateurs inscrits
- **Métrique** : Nombre total d'utilisateurs enregistrés dans la table `User`
- **Utilité** : Mesure la croissance de la base utilisateurs
- **Source** : Table `User`

#### 2. Utilisateurs actifs
- **Métrique** : Nombre d'utilisateurs ayant joué au moins une session
- **Utilité** : Taux d'engagement réel des utilisateurs inscrits
- **Source** : Calcul basé sur les `userId` uniques dans `GameSession`

#### 3. Jeux créés
- **Métrique** : Nombre total de jeux disponibles
- **Utilité** : Croissance du catalogue de contenu
- **Source** : Table `Game`

#### 4. Nouveaux jeux ce mois
- **Métrique** : Jeux créés durant le mois en cours
- **Utilité** : Vitesse de création de contenu
- **Source** : Table `Game` avec filtre sur `created_at`

### Section 2 : Sessions et activité

#### 5. Sessions de jeu
- **Métrique** : Nombre total de sessions lancées
- **Utilité** : Volume global d'activité sur la plateforme
- **Source** : Table `GameSession`

#### 6. Sessions terminées
- **Métrique** : Sessions avec statut "finished"
- **Utilité** : Taux de complétion des jeux (engagement)
- **Calcul supplémentaire** : Pourcentage de complétion affiché en description
- **Source** : Table `GameSession` avec filtre `status = 'finished'`

#### 7. Note moyenne
- **Métrique** : Moyenne de toutes les notes sur 5 étoiles
- **Utilité** : Satisfaction globale des joueurs
- **Source** : Table `GameReview`, champ `rating`

### Section 3 : Revenus et transactions

#### 8. Revenus totaux
- **Métrique** : Somme de tous les montants des transactions réussies
- **Utilité** : Performance financière globale
- **Source** : Table `StripeTransaction` avec `status = 'succeeded'`, somme de `total_amount`

#### 9. Achats réalisés
- **Métrique** : Nombre d'achats de jeux validés
- **Utilité** : Nombre de conversions
- **Source** : Table `GamePurchase` avec `payment_status = 'succeeded'`

#### 10. Panier moyen
- **Métrique** : Revenus totaux / Nombre d'achats
- **Utilité** : Valeur moyenne d'une transaction
- **Formule** : `totalRevenue / totalPurchases`

### Section 4 : Localisations populaires

#### 11. Top 5 des villes
- **Métrique** : Classement des villes ayant le plus de jeux créés
- **Utilité** : Identifier les zones géographiques les plus actives
- **Source** : Table `Game`, agrégation sur le champ `city`
- **Affichage** : Top 5 avec nombre de jeux par ville

### Section 5 : Évolution des revenus

#### 12. Revenus par mois
- **Métrique** : Revenus agrégés par mois sur les 6 derniers mois
- **Utilité** : Tendance de croissance/décroissance des revenus
- **Source** : Table `StripeTransaction` avec groupement par mois
- **Période** : 180 derniers jours

## Métriques futures possibles

Voici quelques suggestions de métriques supplémentaires qui pourraient être ajoutées :

1. **Taux de rétention** : Pourcentage d'utilisateurs qui reviennent jouer
2. **Temps de jeu moyen** : Durée moyenne d'une session
3. **Jeux les plus populaires** : Top 10 des jeux les plus joués
4. **Revenus par créateur** : Classement des créateurs générant le plus de revenus
5. **Taux de conversion freemium → premium** : Pour les jeux en version trial
6. **Distribution des notes** : Graphique de répartition des notes 1-5 étoiles
7. **Taux d'abandon** : Pourcentage de sessions abandonnées par niveau
8. **Utilisation des indices** : Fréquence d'utilisation des hints
9. **Partages entre amis** : Nombre d'invitations envoyées/acceptées
10. **Dons patrimoine** : Montant total collecté pour la Fondation du Patrimoine

## Technologies utilisées

- **Next.js 16** : Framework React
- **Supabase** : Base de données PostgreSQL et authentification
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling
- **Lucide React** : Icônes
- **shadcn/ui** : Composants UI

## Accès au dashboard

URL : `/dashboard` (authentification requise)
