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
pnpm --filter @home-manager/api db:push
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

La CI GitHub Actions exécute ces contrôles et des tests de démarrage HTTP sur une base PostgreSQL temporaire dédiée au job. Elle valide le schéma avec `prisma db push`; elle n’utilise aucune donnée de production et ne déploie rien.

## Environnement et configuration

`.env.example` ne contient que des valeurs de développement sans secret. Copiez-le en `.env` pour le développement local ; les fichiers `.env` réels sont ignorés par Git. L’API attend `DATABASE_URL` et utilise `API_PORT` (3001 par défaut). Le web utilise `WEB_PORT` (3000 par défaut).

Clerk est le fournisseur d’authentification retenu, mais son intégration est volontairement absente de ce squelette : ni clé Clerk ni compte Clerk ne sont nécessaires pour démarrer le web ou l’API. Il n’y a pas d’authentification factice ni de garde de sécurité contournable. Le navigateur ne se connecte pas à PostgreSQL.

Le schéma Prisma initial ne contient aucun modèle métier. Aucun flux de réservation, approbation, vote ou administration n’est implémenté.

## Versions et compromis du squelette

Versions directes retenues lors de la génération : TanStack Start 1.169.3, TanStack Router 1.170.45, React 19.3.1, Vite 8.3.4, NestJS 12.2.0, `@nestjs/swagger` 12.0.2, Prisma et `@prisma/client` 7.10.1, PostgreSQL 17.6 (image Docker) et TypeScript 5.9.3. Les dépendances sont épinglées précisément et le lockfile pnpm fait foi.

Prisma 7 utilise le générateur JavaScript `prisma-client-js` et l’adaptateur PostgreSQL `@prisma/adapter-pg`. Le générateur JavaScript conventionnel est gardé pour la compatibilité directe avec la compilation CommonJS de NestJS ; le nouveau générateur TypeScript nécessiterait un ajustement spécifique de la compilation/runtime. Aucun fichier de migration n’est inventé avant l’existence d’un schéma de données ; `db:push` sert uniquement à initialiser/valider le schéma vide au stade actuel.

## Sujets explicitement encore ouverts

Ce dépôt n’entérine pas les décisions non prises dans le document d’architecture :

- région, produits et dimensionnement Scaleway, réseau, domaine/DNS, coût réel et configuration d’hébergement ; aucun déploiement ou Terraform n’est inclus ;
- mécanisme d’état distant Terraform et ownership de l’instance PostgreSQL partagée ; isolation des identifiants recette/production et stratégie/rétention de sauvegarde à préciser ;
- vérification de la prise en charge actuelle de Yahoo par Clerk et mécanisme d’admission des membres ;
- déclencheur du déploiement en recette ;
- questions fonctionnelles de quorum et conséquences des changements de membres pendant un vote.

La PWA est une exigence du produit, mais le présent squelette n’ajoute pas encore de manifeste, service worker ou politique de cache hors ligne ; ces éléments restent une prochaine étape technique et ne sont pas implicites dans le rendu web minimal.

La recette et la production partageraient une instance PostgreSQL, mais ses ressources et son domaine de panne seraient communs ; ce squelette ne suppose ni suspension ni isolation au niveau infrastructure. L’environnement hébergé d’intégration a été supprimé : les tests de CI utilisent une base temporaire, pas un environnement hébergé.
