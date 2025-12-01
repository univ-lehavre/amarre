## Catalogue d'erreurs — /api/v1/auth/\*

Ce document liste les erreurs retournées par les endpoints d'authentification (`/api/v1/auth/*`). Les réponses suivent l'enveloppe commune:

```json
{ "data": null, "error": { "code": "<code>", "message": "<message>", "cause": "<cause>" } }
```

Schema `ApiError` (résumé)

- `code` (string): identifiant d'erreur machine
- `message` (string): message lisible
- `details` (optionnel): information additionnelle
- `cause` (optionnel): chaîne décrivant la cause interne

---

### POST /auth/login

Erreurs possibles:

- `400` — `invalid_content_type`
  - Quand `Content-Type` n'est pas `application/json`.
  - Exemple: `{ data: null, error: { code: 'invalid_content_type', message: 'Content-Type must be application/json' } }`

- `400` — `invalid_body`
  - Quand le corps n'est pas un JSON valide.
  - Exemple: `{ data: null, error: { code: 'invalid_body', message: 'Request body must be valid JSON' } }`

- `400` — `validation_error`
  - Validation côté serveur via `validateMagicUrlLogin` (manquant, mauvais format, non hexadécimal).
  - `cause` contient un texte explicite (ex: `Missing userId or secret`, `Invalid userId or secret format`).
  - Exemple: `{ data: null, error: { code: 'validation_error', message: 'Login failed', cause: 'Missing userId or secret' } }`

- `401` — `unauthorized`
  - Erreur générique pour identifiants invalides ou problème lors de la création de session Appwrite.
  - Exemple: `{ data: null, error: { code: 'unauthorized', message: 'Invalid credentials or internal error' } }`

Notes:

- La route exige un JSON: `{ "userId": "<hex>", "secret": "<hex>" }`.
- Les erreurs Appwrite liées à la session peuvent remonter ici comme `unauthorized` ou provoquer des logs serveur.

---

### POST /auth/signup

Erreurs possibles:

- `400` — `invalid_email`
  - Levé par `validateSignupEmail` si l'adresse est absente, n'est pas une string ou n'est pas un email.
  - Exemple: `{ data: null, error: { code: 'invalid_email', message: 'Registration not possible', cause: 'Invalid email format' } }`

- `400` — `not_in_alliance`
  - L'email n'appartient pas à l'alliance attendue (vérification métier via `isAlliance`).
  - Exemple: `{ data: null, error: { code: 'not_in_alliance', message: 'Registration not possible', cause: 'Email not part of alliance' } }`

- `500` — `internal_error`
  - Cas inattendu (erreur Appwrite, erreur réseau, etc.).
  - Exemple: `{ data: null, error: { code: 'internal_error', message: 'Unexpected error' } }`

Notes:

- Le endpoint attend `application/x-www-form-urlencoded` avec champ `email`.
- En cas d'erreurs liées à Appwrite (création du token), on retourne `500` et log serveur.

---

### POST /auth/logout

Erreurs possibles:

- `400` — `validation_error`
  - Levé si `locals.userId` est absent ou invalide via `validateUserId`.
  - Exemple: `{ data: null, error: { code: 'validation_error', message: 'Operation failed', cause: 'Missing userId' } }`

- `500` — `internal_error`
  - Erreur lors de la suppression des sessions Appwrite ou d'autres opérations côté serveur.
  - Exemple: `{ data: null, error: { code: 'internal_error', message: 'Unexpected error' } }`

Notes:

- Le handler supprime la cookie locale `SESSION_COOKIE` et appelle Appwrite pour supprimer les sessions.

---

### POST /auth/delete

Erreurs possibles:

- `400` — `validation_error`
  - Levé si `locals.userId` est absent ou invalide.
  - Exemple: `{ data: null, error: { code: 'validation_error', message: 'Operation failed', cause: 'Missing userId' } }`

- `500` — `internal_error`
  - Erreurs inattendues (échec de suppression Appwrite, problème réseau, etc.).
  - Exemple: `{ data: null, error: { code: 'internal_error', message: 'Unexpected error' } }`

Notes:

- Le flow supprime d'abord les sessions puis l'utilisateur via l'API Admin Appwrite.

---

### Recommandations

- Harmoniser les codes d'erreur: utiliser des codes machine stables (`validation_error`, `invalid_email`, `not_in_alliance`, `invalid_content_type`, `invalid_body`, `unauthorized`, `internal_error`).
- Ajouter des exemples `ApiError` dans `scripts/generate-openapi.ts` pour que Swagger affiche les cas les plus courants.
- Préférer `POST` JSON (déjà appliqué pour `/auth/login`) ou `POST` form-urlencoded selon le endpoint; éviter les query params pour secrets.

---

Fichier généré automatiquement par l'outil de documentation interne. Si tu veux, j'ajoute aussi les exemples directement dans le `openapi.json` (via `scripts/generate-openapi.ts`).
