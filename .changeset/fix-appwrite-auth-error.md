---
'@univ-lehavre/amarre': patch
---

Correction des logs d'erreur pour les utilisateurs non connectés

Les erreurs Appwrite 401 (session invalide ou expirée) sont maintenant correctement ignorées dans les logs, au même titre que l'absence de session. Cela évite les messages "Unexpected error" pour les visiteurs non authentifiés.
