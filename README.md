# Humanization

Application web locale pour **réécrire des textes de façon naturelle** et **estimer leur part d'IA**, avec import de PDF.
Par défaut, tout tourne en local et gratuitement avec [Ollama](https://ollama.com). Une clé Anthropic dans `.env` permet d'utiliser Claude à la place. Les PDF sont lus directement dans le navigateur.

## Stack

- TanStack Start (React 19, Vite) + server functions
- shadcn/ui (Base UI) + Tailwind CSS v4
- Ollama (modèle local, par défaut `qwen3:8b`) ou `@anthropic-ai/sdk` (Claude), sorties validées par Zod
- `pdfjs-dist` (extraction du texte des PDF côté navigateur)

## Démarrage

1. Installe [Ollama](https://ollama.com/download) et lance l'application.
2. Télécharge le modèle (environ 5 Go, une seule fois) :

```bash
ollama pull qwen3:8b
```

3. Lance le site :

```bash
npm install
npm run dev            # http://localhost:3000
```

L'indicateur « Moteur » en haut de l'outil affiche « Ollama » en violet quand tout est prêt.
Pour un autre modèle (plus léger : `qwen3:4b`), copie `.env.example` en `.env` et change `OLLAMA_MODEL`.

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
  server/ai.ts            # server functions : statut, réécriture, détection (Ollama ou Claude)
  lib/pdf.ts              # extraction PDF (navigateur)
  components/tool/        # carte d'outil, onglets et panneaux
  components/site/        # navbar, hero, section PDF animée, FAQ, CTA, footer
  routes/                 # __root.tsx, index.tsx
```
