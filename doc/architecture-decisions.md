# Doz Manager — décisions et synthèse d’architecture

Ce document rassemble les décisions prises dans la discussion et les points qui restent ouverts. Il sert de contexte au prochain agent. Il ne vaut pas autorisation de déployer sur Scaleway ni de trancher les questions encore ouvertes.

## Contexte et objectif

Doz Manager est une application privée de gestion de maison. Le projet sert à développer en TypeScript tout en apprenant progressivement le full stack, l’infrastructure et le développement assisté par agent. L’application doit être une PWA. Le squelette du monorepo n’a pas encore été généré.

Issues de référence :

- [#1 — Socle technique](https://github.com/NumaB/home-manager/issues/1)
- [#2 — Page calendrier des réservations](https://github.com/NumaB/home-manager/issues/2)

## Décisions techniques retenues

### Organisation et applications

- **Monorepo TypeScript** géré avec **pnpm workspaces**.
- Deux applications distinctes et déployables indépendamment :
  - `apps/web` : **TanStack Start** ;
  - `apps/api` : **NestJS**.
- Le backend reste un **monolithe modulaire**, pas une architecture à microservices.
- Ne pas ajouter au départ de package partagé ni d’orchestrateur de builds (Nx/Turborepo). Les contrats API seront privilégiés au partage des modèles internes de la base.
- Le front et l’API communiquent par **REST JSON**. Le contrat est **OpenAPI**, produit depuis NestJS en approche code-first et présenté/testable dans **Swagger UI**.

### Données

- **PostgreSQL** est la base retenue ; **Prisma** est retenu pour l’accès aux données et les migrations.
- Les règles métier et l’accès PostgreSQL appartiennent à l’API NestJS. Le navigateur ne se connecte jamais directement à la base.
- En recette et en production, choix retenu : **une instance PostgreSQL gérée commune**, avec une base de données et des identifiants distincts par environnement. Les environnements ne partagent donc pas leurs données applicatives, mais partagent l’instance, ses ressources et son domaine de panne.
- Aucune copie de données de production en recette/test.
- Les migrations Prisma sont versionnées dans Git, vérifiées sur une base PostgreSQL temporaire en CI, puis exécutées une seule fois avant le déploiement de la nouvelle API — pas au démarrage de chaque instance.
- Il faut configurer des sauvegardes de production et tester une restauration. La fréquence et la rétention restent à décider.

### Authentification et autorisation

- **Clerk** est le service d’authentification géré retenu.
- Flux retenu : TanStack Start transmet un jeton de session Clerk à NestJS ; NestJS vérifie le jeton puis retrouve l’utilisateur interne et applique les autorisations.
- Les rôles métier (`utilisateur`, `administrateur`) appartiennent à l’application et sont contrôlés côté API, pas uniquement dans l’interface.
- La connexion sociale Google/Yahoo est souhaitée. La compatibilité spécifique de Yahoo avec Clerk reste à vérifier avant de la considérer comme acquise.
- Les identifiants, secrets et clés ne doivent pas être commis dans Git ni inscrits en clair dans la configuration Terraform.

### Environnements et hébergement

- Il y a **trois environnements** :
  1. développement local ;
  2. recette hébergée ;
  3. production hébergée.
- L’environnement hébergé d’intégration est supprimé. Cela ne supprime pas les tests d’intégration : ils s’exécutent en CI avec une base PostgreSQL temporaire.
- **Scaleway** est le fournisseur cible. Le choix est d’utiliser des **conteneurs gérés** pour le web et l’API et une base PostgreSQL gérée.
- Les applications de recette peuvent dormir lorsqu’elles ne sont pas utilisées si le produit choisi le permet. La base PostgreSQL commune ne peut pas être mise en veille tant que la production en dépend. Ne pas supposer qu’une base Scaleway peut être suspendue tout en conservant les données à moindre coût : cela doit être vérifié.
- Le web et l’API sont servis en HTTPS ; l’API vérifie l’identité et les droits. PostgreSQL n’est pas exposé publiquement et n’accepte que les connexions des API.
- La région et les produits Scaleway précis ne sont pas encore choisis.

### Infrastructure-as-code et livraison

- **Terraform** est retenu pour provisionner l’infrastructure. Le code d’infrastructure est séparé du code applicatif, dans une organisation envisagée sous `infra/terraform/`.
- Les états Terraform sont distants, sécurisés et non versionnés dans Git ; une séparation des états par environnement a été retenue. La manière de représenter la ressource PostgreSQL commune dans ces états reste à définir pour éviter un ownership Terraform ambigu.
- Les changements d’infrastructure ont un plan Terraform examiné puis une application contrôlée, séparée des déploiements applicatifs.
- **GitHub Actions** est retenu pour les vérifications et déploiements : contrôles sur pull request, construction d’une image puis promotion de la même image en recette et en production après validation. Le déclencheur précis du déploiement en recette reste ouvert.
- Ne pas ajouter de déploiement cloud ni d’infrastructure Scaleway au squelette local.

### Budget

- La cible est d’environ **25 €/mois**.
- Les estimations antérieures indiquent qu’une seule petite instance PostgreSQL gérée constitue le coût fixe principal ; deux instances permanentes séparées (production et recette) risqueraient de dépasser la cible avec la TVA et les autres services.
- L’estimation doit être recalculée avec les produits, tailles, région, TVA et domaine réellement retenus. Le fait que le budget inclue ou non la TVA et le domaine n’est pas encore précisé.
- Les services à surveiller sont PostgreSQL, les conteneurs s’ils ne s’éteignent pas, les sauvegardes, le registre d’images, le stockage de l’état Terraform et le domaine. Clerk, Terraform CLI et GitHub Actions devraient rester dans les offres/quota gratuits à l’usage envisagé, sous réserve de vérifier leurs conditions actuelles.

## Règles fonctionnelles déjà décidées

Les détails sont consignés dans l’issue #2. Repères importants pour ne pas les contredire :

- Une réservation est la présence d’un membre dans la maison, pour des journées entières avec dates de début et de fin incluses.
- Tous les membres peuvent consulter et créer des réservations ; le créateur est identifié par sa connexion. Les chevauchements sont autorisés, avec avertissement non bloquant.
- Le créateur peut modifier ou annuler sa réservation. Une modification des dates réinitialise les approbations.
- L’approbation est désactivée par défaut. Désactivée, une nouvelle réservation est validée immédiatement ; activée, elle est en attente.
- Tous les membres, y compris le créateur, votent. Les votes sont modifiables tant que la demande est en attente.
- Le seuil est **la moitié ou plus du nombre total de membres** (`ceil(total / 2)`) : par exemple 4/8 et 4/7 atteignent le seuil, 3/7 non. Le seuil d’approbations valide la réservation ; le seuil de votes défavorables la supprime.
- Tout changement effectif du réglage d’approbation valide automatiquement les demandes encore en attente.

Des questions fonctionnelles restent volontairement ouvertes, notamment la définition exacte des membres comptés dans le quorum et l’effet d’un changement de composition des membres durant un vote. Ne pas inventer ces réponses ni prétendre qu’elles sont décidées.

## Décisions encore ouvertes avant le déploiement

- Produits Scaleway précis, région et dimensionnement adapté à la production.
- Vérifier le réseau privé entre conteneurs gérés et base, le comportement de mise à l’échelle à zéro, et les frais d’entrée/sortie.
- Vérifier les sauvegardes/restaurations possibles avec l’instance PostgreSQL commune et définir rétention/fréquence.
- Choisir domaine, DNS et routage web/API.
- Choisir le mécanisme de stockage distant des états Terraform et la gestion/injection des secrets.
- Définir comment la ressource PostgreSQL partagée est possédée par Terraform et comment chaque environnement obtient ses identifiants séparés.
- Décider si la cible de 25 €/mois inclut TVA et domaine, puis recalculer le coût réel.
- Vérifier la connexion Yahoo dans Clerk et décider comment les membres sont admis dans l’application (invitations/liste autorisée/etc.).
- Définir le déclencheur et les validations du déploiement en recette.
- Finaliser les règles fonctionnelles de quorum restées ouvertes avant d’implémenter complètement l’approbation.
