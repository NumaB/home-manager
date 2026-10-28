# Doz Manager

Squelette local de l’application privée Doz Manager. Les décisions d’architecture retenues et les sujets encore ouverts sont détaillés dans [`doc/architecture-decisions.md`](doc/architecture-decisions.md).

## Prérequis

- Node.js **24** (minimum déclaré : 22.12)
- pnpm **10.34.3** (version épinglée dans `package.json`)
- Docker Compose

Le dépôt contient deux applications autonomes dans un monorepo pnpm : `apps/web` (TanStack Start) et `apps/api` (NestJS). Aucun package partagé, Nx ou Turborepo n’est introduit.

## Démarrage local

Depuis la racine :

```sh
pnpm install
cp .env.example .env
pnpm db:up
pnpm --filter @home-manager/api db:migrate:deploy
pnpm dev
```

`pnpm dev` lance les deux applications en parallèle :

- Web : <http://localhost:3000>
- API : <http://localhost:3001/api/health>
- Swagger UI (hors environnement `production`) : <http://localhost:3001/api/docs>
- Document OpenAPI JSON : <http://localhost:3001/api/docs-json>

Commandes séparées, pratiques pour développer dans deux terminaux :

```sh
pnpm db:up       # PostgreSQL local via Docker Compose
pnpm dev:web     # TanStack Start
pnpm dev:api     # NestJS (nécessite PostgreSQL démarré)
```

La base locale est persistée dans un volume Docker nommé `home-manager-postgres`. Pour l’arrêter sans supprimer ses données : `pnpm db:down`. Pour supprimer aussi les données locales : `docker compose down --volumes`.

La base de Compose est réservée au développement : elle n’est publiée que sur l’interface loopback et utilise l’authentification PostgreSQL `trust` pour éviter tout mot de passe dans le dépôt. Ne réutilisez jamais cette configuration pour un environnement partagé ou hébergé.

## Contrôles

```sh
pnpm lint       # vérification du formatage Prettier
pnpm typecheck  # TypeScript et génération du client Prisma
pnpm test       # tests unitaires minimaux des deux applications
pnpm build      # builds des deux applications
pnpm --filter @home-manager/web preview  # prévisualiser le build web localement
pnpm check      # ensemble des contrôles ci-dessus
```

La CI GitHub Actions exécute ces contrôles et des tests de démarrage HTTP sur une base PostgreSQL temporaire dédiée au job. Elle applique les migrations versionnées avec `prisma migrate deploy`; elle n’utilise aucune donnée de production et ne déploie rien.

## Environnement et configuration

`.env.example` ne contient que des valeurs de développement sans secret. Copiez-le en `.env` pour le développement local ; les fichiers `.env` réels sont ignorés par Git. L’API attend `DATABASE_URL` et utilise `API_PORT` (3001 par défaut). Le web utilise `WEB_PORT` (3000 par défaut).

Clerk est intégré à `apps/web` et NestJS. En local, le CLI écrit les clés de développement dans `apps/web/.env.local` (ignoré par Git) ; l’API lit sa clé secrète depuis ce fichier uniquement pour le développement local. Pour un nouveau clone, authentifiez le CLI et récupérez les clés de l’application choisie depuis `apps/web` avec `npx -y clerk@latest env pull`. En recette et en production, configurez séparément `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_AUTHORIZED_PARTIES`, `WEB_ORIGINS` et `VITE_API_BASE_URL` avec les valeurs propres à chaque environnement. La clé publishable et les variables `VITE_*` sont intégrées au build web ; `CLERK_SECRET_KEY` est un secret runtime de l’API et ne doit jamais être une variable de build publique. Consultez la [checklist de déploiement Clerk](doc/clerk-deployment-checklist.md) avant chaque mise en service. Ne partagez pas les clés de développement et de production.

L’instance Clerk de développement est en mode **Invite-only**. La connexion se fait sur `/sign-in` et une inscription requiert un lien d’invitation valide. Les routes web sous `/_app` redirigent les visiteurs non authentifiés vers la connexion. NestJS vérifie le jeton Bearer Clerk sur toutes les routes sauf celles marquées explicitement publiques (`/api/health`), rattache l’identité à un membre PostgreSQL et attribue par défaut le rôle `USER`. `/api/auth/me` expose le membre courant ; `useApiClient()` transmet le jeton de session aux futurs appels REST.

Les rôles applicatifs restent en base. Aucun rôle n’est modifiable depuis le navigateur. Le schéma ne contient pas encore les modèles métier de réservation, approbation, vote ou administration.

### Bootstrap du premier administrateur

1. Envoyez une invitation à la personne depuis le Dashboard Clerk et faites-la se connecter à l’application. Au premier appel à `/api/auth/me`, son membre `USER` est créé en base.
2. Récupérez son identifiant Clerk (`user_...`) dans le Dashboard, puis exécutez depuis la racine :

   ```sh
   pnpm --filter @home-manager/api bootstrap:admin -- --clerk-user-id user_...
   ```

La commande vérifie que l’identifiant existe dans Clerk avant d’attribuer le rôle `ADMIN` en base. Elle ne crée aucun endpoint public de promotion.

## Versions et compromis du squelette

Versions directes retenues lors de la génération : TanStack Start 1.169.3, TanStack Router 1.170.45, Clerk TanStack Start 1.7.8 et `@clerk/backend` 3.26.4, React 19.3.1, Vite 8.3.4, NestJS 12.2.0, `@nestjs/swagger` 12.0.2, Prisma et `@prisma/client` 7.10.1, PostgreSQL 17.6 (image Docker) et TypeScript 5.9.3. Les dépendances sont épinglées précisément et le lockfile pnpm fait foi.

Prisma 7 utilise le générateur JavaScript `prisma-client-js` et l’adaptateur PostgreSQL `@prisma/adapter-pg`. Le générateur JavaScript conventionnel est gardé pour la compatibilité directe avec la compilation CommonJS de NestJS ; le nouveau générateur TypeScript nécessiterait un ajustement spécifique de la compilation/runtime. Les migrations Prisma sont versionnées dans `apps/api/prisma/migrations`; utilisez `db:migrate:dev` en développement et `db:migrate:deploy` avant un déploiement.

## Sujets explicitement encore ouverts

Ce dépôt n’entérine pas les décisions non prises dans le document d’architecture :

- région, produits et dimensionnement Scaleway, réseau, domaine/DNS, coût réel et configuration d’hébergement ; aucun déploiement ou Terraform n’est inclus ;
- mécanisme d’état distant Terraform et ownership de l’instance PostgreSQL partagée ; isolation des identifiants recette/production et stratégie/rétention de sauvegarde à préciser ;
- vérification de la prise en charge de Yahoo et choix définitif des méthodes de connexion ;
- création/configuration des instances Clerk dédiées à la recette et à la production (voir la [checklist de déploiement Clerk](doc/clerk-deployment-checklist.md)) ;
- déclencheur du déploiement en recette ;
- automatisation éventuelle des invitations Clerk depuis l’interface d’administration (les invitations se gèrent pour l’instant dans Clerk).
- questions fonctionnelles de quorum et conséquences des changements de membres pendant un vote.

La PWA est une exigence du produit, mais le présent squelette n’ajoute pas encore de manifeste, service worker ou politique de cache hors ligne ; ces éléments restent une prochaine étape technique et ne sont pas implicites dans le rendu web minimal.

La recette et la production partageraient une instance PostgreSQL, mais ses ressources et son domaine de panne seraient communs ; ce squelette ne suppose ni suspension ni isolation au niveau infrastructure. L’environnement hébergé d’intégration a été supprimé : les tests de CI utilisent une base temporaire, pas un environnement hébergé.
