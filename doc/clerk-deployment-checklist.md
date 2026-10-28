# Checklist Clerk — recette et production

À compléter séparément pour chaque environnement hébergé. Le dépôt ne configure pas encore les instances Clerk ni les déploiements. Ne réutilisez jamais une clé ou une instance de production en recette, en local ou en CI.

## Décisions et configuration Clerk

- [ ] Créer/sélectionner une instance Clerk dédiée à la recette et une autre dédiée à la production. Vérifier le type d’instance et les domaines personnalisés requis par Clerk pour chacun de ces environnements.
- [ ] Confirmer les méthodes de connexion souhaitées. Google est prévu ; la prise en charge de Yahoo reste à vérifier avant de l’activer ou de la promettre.
- [ ] Configurer, pour chaque instance, le domaine HTTPS de l’application, les URL de redirection autorisées et les URL de connexion/inscription.
- [ ] Configurer les règles d’accès conformément au produit (l’instance locale actuelle est _Invite-only_). Prévoir qui peut inviter des membres et comment les invitations seront émises.
- [ ] Préparer les invitations et le processus d’amorçage du premier administrateur pour chaque environnement ; vérifier que l’opération vise la bonne base et la bonne instance Clerk.

## Variables à injecter par environnement

| Variable                     | Où / usage                                                                | Vérifications                                                                                                                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Web, au **build** ; clé publique de l’instance Clerk de cet environnement | Correspond à l’instance utilisée par l’API. Une clé publishable est publique, mais doit rester propre à l’environnement.                                                                                                                     |
| `CLERK_SECRET_KEY`           | API, au **runtime**, comme secret                                         | Secret de la même instance que la clé publishable ; ne pas l’inclure dans l’image web, les artefacts client, le dépôt ou les logs.                                                                                                           |
| `CLERK_AUTHORIZED_PARTIES`   | API, au runtime                                                           | Définir explicitement l’origine HTTPS exacte du web (schéma + hôte, sans chemin), ou la liste d’origines permises séparées par des virgules. Le claim `azp` des jetons doit correspondre. Cette variable est exigée par l’API en production. |
| `WEB_ORIGINS`                | API, au runtime, configuration CORS                                       | Origine(s) web de cet environnement uniquement ; liste séparée par des virgules si nécessaire. Ce réglage CORS ne remplace pas `CLERK_AUTHORIZED_PARTIES`.                                                                                   |
| `VITE_API_BASE_URL`          | Web, au **build**                                                         | URL HTTPS de l’API de cet environnement, avec le préfixe `/api` (par exemple `https://api.example.tld/api`).                                                                                                                                 |

- [ ] Injecter les valeurs par environnement depuis le gestionnaire de secrets/configuration de la plateforme, sans les inscrire dans Git ni les passer dans une variable publique du build, sauf `VITE_CLERK_PUBLISHABLE_KEY` et `VITE_API_BASE_URL` qui sont destinées au client.
- [ ] Vérifier que le processus de build web reçoit les valeurs `VITE_*` de l’environnement cible et que l’API reçoit sa propre `CLERK_SECRET_KEY` au démarrage.
- [ ] Vérifier que `NODE_ENV=production` est défini pour l’API de production et que `CLERK_AUTHORIZED_PARTIES` est bien injectée explicitement (ne pas compter sur le fallback local).

## Vérifications avant validation de l’environnement

- [ ] Depuis le domaine HTTPS de l’environnement, ouvrir une session avec un compte invité autorisé ; confirmer que le navigateur appelle la bonne API.
- [ ] Confirmer qu’un appel authentifié à `/api/auth/me` retourne `200`, crée/récupère le membre attendu et n’attribue que le rôle applicatif par défaut (`USER`).
- [ ] Confirmer qu’une requête sans jeton ou avec un jeton expiré/invalide reçoit `401`, et qu’un compte désactivé reçoit `403`.
- [ ] Vérifier que les requêtes navigateur passent le contrôle CORS et que le `azp` du jeton correspond à `CLERK_AUTHORIZED_PARTIES`.
- [ ] Vérifier les parcours de déconnexion, d’expiration/renouvellement de session et de redirection vers la bonne URL de connexion.
- [ ] Pour chaque environnement, exécuter le processus contrôlé de bootstrap du premier administrateur contre la base et l’instance Clerk correspondantes ; vérifier son rôle puis conserver une trace d’exploitation, sans stocker de jeton ou de secret.
- [ ] Contrôler que les logs ne contiennent ni `CLERK_SECRET_KEY` ni jetons de session. Ne pas activer en production les logs de diagnostic détaillés de vérification des jetons.

## Séparation et exploitation

- [ ] Confirmer l’isolation des comptes, invitations, clés Clerk, bases de données et URL entre recette et production. Ne pas copier de données utilisateurs de production en recette.
- [ ] Documenter les responsables des secrets, la procédure de rotation/révocation des clés et le processus de retrait d’un accès/invitation.
- [ ] Garder les clés de production hors de la CI de vérification ; ne les exposer qu’aux jobs de déploiement qui en ont besoin.
- [ ] Après validation de recette, configurer et tester la production indépendamment ; ne pas promouvoir les clés ni la configuration d’authentification de recette.
