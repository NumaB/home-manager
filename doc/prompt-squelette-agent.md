# Prompt pour l’agent chargé du squelette

Copie-colle le prompt ci-dessous au nouvel agent. Il doit commencer par lire `doc/architecture-decisions.md`.

---

Tu es l’agent d’implémentation du projet **Doz Manager**. Je t’autorise à générer le **squelette local** du monorepo, conformément à `doc/architecture-decisions.md`.

## Avant de modifier

1. Lis entièrement `doc/architecture-decisions.md` et le `README.md` à la racine.
2. Inspecte le dépôt et préserve son contenu existant.
3. Distingue les décisions retenues, les propositions et les questions ouvertes. Ne transforme pas une question ouverte en décision implicite.
4. N’effectue aucune modification des issues GitHub sans demande explicite.

## Périmètre autorisé

Crée un squelette minimal et exécutable pour :

- un monorepo TypeScript avec **pnpm workspaces** ;
- `apps/web` avec **TanStack Start** ;
- `apps/api` avec **NestJS** ;
- une API REST JSON NestJS avec documentation OpenAPI générée en code-first et une interface Swagger UI en développement ;
- **Prisma** dans l’API et une configuration PostgreSQL ;
- un environnement PostgreSQL local reproductible. Docker Compose peut être utilisé pour la base locale ; si tu choisis une autre méthode, explique pourquoi et documente-la ;
- des commandes racine cohérentes pour installer, lancer, vérifier, tester et construire les applications ;
- un fichier `.env.example` sans secret, et les règles `.gitignore` empêchant de committer les vrais fichiers `.env` ;
- une CI GitHub Actions minimale pour les contrôles sur pull request. Les tests ayant besoin de PostgreSQL doivent utiliser une base temporaire dédiée à la CI.

L’API NestJS est un monolithe modulaire. Garde les deux applications indépendantes et **n’ajoute pas de package partagé, Nx ou Turborepo** au départ.

## Limites à respecter

- Ne déploie rien et ne crée aucune ressource Scaleway.
- Ne crée pas de Terraform, de pipeline de déploiement cloud, de domaine ou de configuration DNS.
- Ne mets aucun secret réel, jeton, mot de passe ou identifiant cloud dans les fichiers ou dans la sortie.
- Ne fais pas dépendre le démarrage local de clés Clerk. Prépare seulement les points de configuration nécessaires ou documente l’intégration à réaliser ensuite ; n’ajoute pas de fausse authentification ni de garde de sécurité contournable.
- Ne choisis pas le fournisseur social Yahoo sans vérifier sa prise en charge actuelle par Clerk ; signale cette vérification comme ouverte.
- Ne crée pas encore de fonctionnalités métier de réservation, d’approbation, de votes ou d’administration. Les questions fonctionnelles ouvertes ne doivent pas être inventées. Le schéma Prisma peut contenir la configuration minimale nécessaire à l’application, mais pas de modèle métier spéculatif.
- Ne configure pas un environnement d’intégration hébergé : il a été supprimé. La CI utilise une base PostgreSQL temporaire.
- Ne suppose pas que la base PostgreSQL partagée recette/production peut être suspendue ou qu’elle est isolée au niveau infrastructure.
- Ne choisis pas un service ou une région Scaleway précis : ces choix sont encore ouverts.

## Qualité attendue

- Utilise des versions stables et compatibles au moment de l’implémentation ; indique les versions retenues et tout compromis important.
- Favorise un squelette simple, lisible et documenté plutôt qu’une abstraction prématurée.
- Fournis un endpoint de santé minimal pour l’API et vérifie que Swagger UI démarre en développement.
- Prévois des tests minimaux démontrant que le web et l’API démarrent et que la CI fonctionne.
- N’introduis pas de données de production dans l’environnement local ou la CI.
- Après les changements, exécute les commandes pertinentes (installation, typecheck/lint/tests/build selon ce qui est configuré) et corrige les erreurs introduites.

## Compte-rendu final

À la fin, indique :

1. les fichiers et applications créés ;
2. les commandes exactes pour lancer le PostgreSQL local, le web et l’API ;
3. les vérifications exécutées et leurs résultats ;
4. les choix faits qui n’étaient pas explicitement arrêtés, avec leur justification ;
5. les décisions laissées ouvertes et les prochaines étapes.

Ne commence pas l’implémentation métier au-delà de ce squelette sans nouvelle demande.
