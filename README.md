# Idle Founder Ultra

Jeu idle startup complet en **PWA**.

## Fonctionnalités
- Idle game complet avec progression longue
- Sauvegarde locale automatique
- Progression hors ligne
- Installable comme application mobile/desktop
- Fonctionne sur GitHub Pages
- Service worker + cache offline
- Export / import de sauvegarde
- Prestige, financement, marchés, features, équipe, infra, analytics

## Déploiement GitHub Pages
1. Crée un repo GitHub.
2. Envoie tous les fichiers du dossier à la racine du repo.
3. Active **Settings > Pages**.
4. Choisis la branche principale et le dossier `/root`.
5. Attends le lien public.

## Test local
Avec Python :

```bash
python -m http.server 8080
```

Puis ouvre :

```text
http://localhost:8080
```

## Fichiers
- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `assets/icon-192.png`
- `assets/icon-512.png`
- `assets/icon.svg`
