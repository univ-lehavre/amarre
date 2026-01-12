---
'@univ-lehavre/amarre': minor
---

Ajouter le téléchargement PDF pour les formulaires complétés

- Ajouter l'endpoint API GET /api/v1/surveys/pdf pour télécharger le PDF d'un formulaire
- Ajouter la fonction downloadSurveyPdf dans le service surveys
- Ajouter fetchRedcapBuffer pour récupérer les données binaires depuis REDCap
- Modifier Request.svelte pour afficher un lien de téléchargement PDF lorsque form_complete === '2'
- Ajouter des tests pour valider le téléchargement PDF

Lorsqu'un formulaire est complet (form_complete == "2"), le lien "Formulaire" devient "Formulaire (PDF)" et déclenche le téléchargement du PDF au lieu de rediriger vers REDCap.
