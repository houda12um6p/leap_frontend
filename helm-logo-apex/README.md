# Helm — Apex logo package (v2)
Production-ready SVGs · italic Instrument Serif wordmark · cyan→amber gradient

## What's new in v2
- Wordmark is now "helm." in fully italic Instrument Serif lowercase
  (matches the "today's signal." / "back." typography moment)
- Wordmark sized a little smaller than the chevron in the lockup
- Period included — same editorial gesture as your hero copy

## Contents
- mark/        chevron mark, dark / light / mono variants
- wordmark/    "helm." italic serif wordmark
- lockup/      chevron + "helm." horizontal lockup
- favicon/     16 / 32 / 180 / 512 — browser tab + iOS home

## Drop-in for the React app
1. Copy this folder to  leap_frontend/public/  (e.g. public/helm-logo/)
2. In  public/index.html  replace:

   <link rel="icon" type="image/svg+xml" href="%PUBLIC_URL%/helm-logo/favicon/favicon.svg" />
   <link rel="apple-touch-icon" href="%PUBLIC_URL%/helm-logo/favicon/apple-touch-icon.svg" />
   <title>helm. · Today's signal</title>

## Fonts required at render
- Instrument Serif (italic) — entire wordmark
Already loaded in your project via Google Fonts.

## Color
- Cyan  #5eead4 (dark) · #0a8a6b (light)
- Amber #fbbf24 (dark) · #b8530a (light)
- Favicon background  #050810

## License
Your project — use freely.
