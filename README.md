# AMARRE

[![DOI](https://zenodo.org/badge/1107483862.svg)](https://doi.org/10.5281/zenodo.17775106)

## Développement

### Prérequis

- Node.js + pnpm

### Configuration

Créer votre fichier d’environnement local à partir de l’exemple :

```bash
cp .env.example .env
```

Puis renseigner les variables dans `.env` (ne pas committer de secrets).

### Lancer en local

```bash
pnpm install
pnpm dev
```

### Personnalisation du thème

Le projet utilise une palette de couleurs Bootstrap personnalisée qui correspond au logo AMARRE :

- **Couleur primaire (`primary`)** : Bleu marine `#0c4e6a` - utilisée pour les éléments principaux (boutons, liens, navbar)
- **Couleur warning (`warning`)** : Jaune/doré `#e6b229` - utilisée pour les alertes et accents

La personnalisation est définie dans [static/theme.css](static/theme.css) et surcharge les variables CSS de Bootstrap. Pour modifier les couleurs du thème, éditez ce fichier.

### Tests et Qualité

Le projet utilise un agent de test automatisé IA pour garantir la qualité du code :

```bash
# Exécuter tous les tests
pnpm test

# Mode watch pour le développement
pnpm test:watch

# Générer un rapport de couverture
pnpm test:coverage

# Vérifier tout (format, lint, tests, build)
pnpm check:all
```

Pour plus d'informations sur les tests automatisés, consultez :

- [Guide de l'Agent de Test IA](docs/AI_TESTING_GUIDE.md)
- [Documentation des Tests](tests/README.md)
