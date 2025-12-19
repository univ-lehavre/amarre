# @univ-lehavre/amarre

## 1.2.0

### Minor Changes

- 3f712af: La création d'une nouvelle requête n'est pas possible uniquement que si les dernières ont un formulaire complété
- cc93f5f: Replace Swagger UI with RapiDoc for API documentation. RapiDoc offers a modern, customizable interface with better user experience. Added anti-derive tests for survey endpoints to ensure OpenAPI schemas match actual API responses.
- c34f53b: add UI cards for each request

### Patch Changes

- 13fd770: /api/v1/surveys/download retrieves now all requests.

## 1.1.0

### Minor Changes

- 8e4676c: /api/v1/surveys/new Ajoute désormais l'identifiant de l'utilisateur
- 08608c2: Add /api/v1/surveys/new
- 43494a0: /api/v1/surveys/list is now implemented

### Patch Changes

- e70b05d: Mise à jour de la description de l'API dans /api/docs

## 1.0.0

### Major Changes

- 10d948c: Simplification du code et mise en place des bonnes pratiques

### Patch Changes

- 9d12227: Refactorisation des messages d'erreur dans l'interface graphique
- 436cfd0: Mise à jour de /api/docs en fonction des modifications de l'API
