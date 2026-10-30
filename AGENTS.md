# Consignes pour les agents

## Imports entre dossiers

Pour tout nouvel import entre fichiers de dossiers différents, utilise les alias `@...` configurés pour le projet plutôt qu'un chemin relatif (`../...`). Les imports entre fichiers du même dossier peuvent rester relatifs (`./...`).

Si l'alias nécessaire n'existe pas encore, configure-le dans TypeScript et dans les outils d'exécution/build concernés avant de l'utiliser. Pour l'API, les alias `@/…` doivent être réécrits en chemins relatifs dans les fichiers compilés afin de fonctionner sous Node en production.

## Contrats API et types du front

Quand tu ajoutes ou modifies une fonctionnalité côté API (route, DTO, enum, requête ou réponse) susceptible d'être consommée par le front :

1. Décris les requêtes et réponses dans les métadonnées Swagger/OpenAPI du back (`@ApiBody`, `@ApiOkResponse`, DTO annotés, etc.). Ne laisse pas de schéma incomplet ou seulement inféré si le front en dépend.
2. Régénère le document OpenAPI et les types TypeScript du front avec la commande racine :

   ```sh
   pnpm generate:api-types
   ```

3. Utilise les types générés depuis `apps/web/src/generated/api-schema.ts` dans le front au lieu de recopier manuellement les DTOs API. Ne modifie pas directement le fichier généré.
4. Vérifie et conserve dans le changement les fichiers régénérés (`apps/api/openapi.json` et `apps/web/src/generated/api-schema.ts`) ; vérifie que le typecheck API et front passe.

La commande génère le document depuis les contrôleurs NestJS via `apps/api/src/scripts/generate-openapi.ts`, puis en déduit les types du front. Si tu ajoutes un nouveau contrôleur, ajoute-le également au module de génération OpenAPI.
