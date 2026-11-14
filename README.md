# Humanization

Application web locale pour **réécrire des textes de façon naturelle** et **estimer leur part d'IA**, avec import de PDF.
Les traitements passent par l'API Claude (Anthropic) ; les PDF sont lus directement dans le navigateur.

## Stack

- TanStack Start (React 19, Vite) + server functions
- shadcn/ui (Base UI) + Tailwind CSS v4
- `@anthropic-ai/sdk` (réécriture et détection, sorties structurées validées par Zod)
- `pdfjs-dist` (extraction du texte des PDF côté navigateur)

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigne ANTHROPIC_API_KEY
npm run dev            # http://localhost:3000
```

L'indicateur « Moteur » en haut de l'outil affiche « Claude » quand la clé est détectée.

## Fonctionnalités

| Onglet | Ce qu'il fait |
| --- | --- |
| Humaniser le texte | Réécrit le texte avec un ton (naturel, académique, simple, formel) et une intensité (légère, moyenne, forte), sans changer le sens. Copier, télécharger en .txt, envoyer vers le détecteur. |
| Détecteur IA | Score global, verdict, indices de style et surlignage phrase par phrase. C'est une estimation, pas une preuve. |
| PDF | Glisser-déposer d'un PDF (25 Mo max), extraction du texte en local, puis analyse ou réécriture. |

Limite : 2 000 mots par requête.

## Structure

```
src/
  server/ai.ts            # server functions : statut, réécriture, détection
  lib/pdf.ts              # extraction PDF (navigateur)
  components/tool/        # carte d'outil, onglets et panneaux
  components/site/        # navbar, hero, section PDF animée, FAQ, CTA, footer
  routes/                 # __root.tsx, index.tsx
```
