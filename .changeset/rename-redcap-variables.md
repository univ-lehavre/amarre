---
'@univ-lehavre/amarre': minor
---

Renommage des variables REDCap en français pour une meilleure lisibilité

Les variables utilisées par l'application ont été renommées pour correspondre au nouveau dictionnaire REDCap :

- `type` → `demandeur_statut`
- `voyage` → `mobilite_type`
- `name` → `invite_nom`
- `eunicoast` → `mobilite_universite_eunicoast`
- `gu8` → `mobilite_universite_gu8`
- `uni` → `mobilite_universite_autre`
- `avis` → `avis_composante_position`
- `avis_v2` → `avis_laboratoire_position`
- `avis_v2_v2` → `avis_encadrant_position`

**Important** : Cette modification nécessite la mise à jour préalable du dictionnaire REDCap avec le fichier `DataDictionary_adapte.csv` du dépôt AMARRE-REDCap-Dictionary.
