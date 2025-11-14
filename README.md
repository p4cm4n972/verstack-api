<!-- README sous forme de dossier de compétences / mini-CV -->

# verstack-api — Dossier de compétences / Mini‑CV du projet

## 1) Présentation du projet

verstack-api est une API back‑end écrite en TypeScript (NestJS). Sa mission : centraliser et synchroniser automatiquement les versions des langages, frameworks et runtimes (Node.js, Docker, Java, PHP, etc.) à partir de sources hétérogènes (npm, GitHub tags/releases, APIs officielles, pages web comme Wikipédia).

Le service normalise les labels de version (ex. suppression du préfixe `v`), identifie les éditions/standards (ES, C/C++, SQL...) et persiste les résultats dans MongoDB via Mongoose. Un mode `--dry-run` permet d'exécuter la synchronisation sans écriture en base pour validation.

## 2) Stack technique

- Langage : TypeScript
- Framework : NestJS
- Base de données : MongoDB (via Mongoose)
- HTTP : `@nestjs/axios` (Axios + RxJS)
- Tests : Jest (+ ts-jest)
- Gestion de versions : `semver`
- Outillage interne : `CacheHelper`, `RetryHelper`, `ParallelHelper`

## 3) Compétences acquises / démontrées

Voici les compétences concrètes mises en oeuvre dans le projet, avec où les trouver dans le code :

- Intégration d'APIs externes
  - Consommation d'APIs REST, gestion des headers (User-Agent, Authorization) et des erreurs réseau.
  - Fichiers : `src/langages/custom-updaters.ts`, `src/langages/langage-update.service.ts`.

- Résilience et fiabilité
  - Stratégies de retry/backoff et gestion du cache pour réduire les appels redondants.
  - Fichiers : helpers `RetryHelper`, `CacheHelper` et utilisation dans le service.

- Parsing & normalisation de versions
  - Usage de `semver.coerce` pour coerce/compare et fallback pour formats non‑standards.
  - Fichiers : `src/langages/version-parsers.ts`.

- Tests unitaires et mocking
  - Tests isolés avec Jest, mock d'`HttpService` et de Mongoose pour valider updaters et parsers.
  - Fichiers : `src/langages/*.spec.ts`.

- Orchestration et performance
  - Traitement parallèle contrôlé et cache local pour optimiser la collecte.
  - Fichiers : `ParallelHelper`, `langage-update-optimized.service.ts`.

## 4) Compétences nécessaires pour reprendre / maintenir le projet

- TypeScript avancé et patterns NestJS
- Tests unitaires et mocking (Jest)
- Connaissances HTTP/REST, gestion d'entêtes et gestion d'erreurs réseau
- Semver et parsing de versions non standard
- Notions d'architecture (orchestration de tâches, caching, parallélisme)

## 5) Réalisations concrètes à montrer en entretien

- Normalisation : suppression systématique du préfixe `v` et règles spécifiques (ex. `docker-v29.0.0` → `29.0.0`).
- Updaters personnalisés : exemples d'implémentation pour Wikipedia, Adoptium, pages JSON.
- Tests : suites unitaires pour parsers et updaters avec exemples de mocking.

## 6) Validation rapide (commandes utiles)

1) Installer les dépendances :

```powershell
npm install
```

2) Lancer les tests unitaires :

```powershell
npm run test
```

3) Exécuter la synchronisation en mode non destructif (dry‑run) :

```powershell
npm run sync:langages -- --dry-run
```

Observer dans les logs : versions normalisées (ex. `Node.js: current=18.15.0, lts=18.16.0`; `Docker: current=29.0.0`) — sans préfixe `v`.

## 7) Fichiers à lire en priorité

- `src/langages/langage-update.service.ts` — logique métier et normalisation
- `src/langages/custom-updaters.ts` — adaptateurs et cas particuliers
- `src/langages/version-parsers.ts` — extraction/coercion et fallback
- `src/langages/*.spec.ts` — tests unitaires représentatifs

## 8) Questions techniques recommandées en entretien

- Pourquoi utiliser `semver.coerce` plutôt que des regex pour certains tags ?
- Comment tester et isoler un updater qui effectue des appels réseau ?
- Quels risques subsistent (rate limit, changement HTML) et quelles stratégies d'atténuation proposeriez‑vous ?

## 9) Authentification (présentation rapide)

Le back intègre un module d'authentification complet :

- Méthode : JSON Web Tokens (JWT) pour l'authentification stateless.
- Flux supportés : signup (création utilisateur), signin (génération access + refresh tokens), refresh tokens, vérification d'email (lien envoyé par e‑mail), reset password.
- Stockage des refresh tokens : gestion d'ids de refresh tokens côté serveur (`RefreshTokenIdsStorage`) pour pouvoir invalider des sessions.
- Hashing des mots de passe : `bcrypt` via `HashingService`.
- Emails : envoi de mails de confirmation et de réinitialisation via `MailService`.

Variables d'environnement importantes (extrait) :

- `JWT_SECRET` — secret pour signer les tokens
- `JWT_TOKEN_AUDIENCE` / `JWT_TOKEN_ISSUER` — claims attendus
- `JWT_ACCESS_TOKEN_TTL`, `JWT_REFRESH_TOKEN_TTL` — durées en secondes

Fichiers clés à lire pour l'authentification :

- `src/iam/authentication/authentication.service.ts` — logique d'inscription, connexion, génération/refresh des tokens, envoi de mails et réinitialisation de mot de passe.
- `src/iam/config/jwt.config.ts` — configuration centralisée des paramètres JWT.
- `src/iam/refresh-token-ids.storage/*` — gestion et invalidation des refresh tokens.

Exemple rapide (flow) :

1. `signUp` : création d'utilisateur + hash du mot de passe + envoi d'un email de confirmation (token JWT expirant).
2. `signIn` : vérification du mot de passe, vérification de l'email, génération d'accessToken & refreshToken (le refreshToken contient un id stocké côté serveur).
3. `refreshTokens` : vérification du refreshToken, validation via `RefreshTokenIdsStorage`, rotation/invalidation, génération de nouveaux tokens.

Notes sécurité / amélioration

- Assurer la rotation des secrets et l'utilisation de variables d'environnement sécurisées en production.
- Ajouter un mécanisme de throttling / rate limiting sur les endpoints auth pour réduire le risque d'attaques par force brute.
- Stocker les refresh tokens invalidés ou les garder dans un magasin TTL pour audits si nécessaire.

---

Licence : MIT

  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# Dossier de compétences — verstack-api

## Présentation du projet

`verstack-api` est une API back-end en TypeScript (NestJS) dont la mission principale est de centraliser et synchroniser les versions des langages, frameworks et runtimes (ex. Node.js, Docker, PHP, Java, etc.).

Le service collecte automatiquement les informations de version depuis des sources variées : registre npm, API GitHub (tags/releases), pages web ou API tierces (Wikipedia, Adoptium, pages officielles), puis normalise et sauvegarde ces informations dans une base MongoDB via Mongoose.

Ce dépôt sert à la fois de moteur de synchronisation (script `sync:langages`) et de laboratoire pour expérimenter des stratégies de parsing, des updaters spécifiques et des mécanismes de robustesse (retry, cache, traitement parallèle).

---

## Objectifs fonctionnels

- Récupérer automatiquement les versions "current" et "lts" des écosystèmes pertinents.
- Gérer des sources hétérogènes : npm, GitHub (tags/releases), endpoints JSON et pages web.
- Normaliser les labels de versions (ex. suppression du préfixe `v`), détecter éditions/standards (ES, C/C++, SQL, JSON...), et stocker les résultats en base.
- Fournir un mode non-destructif (`--dry-run`) pour tester les runs sans écrire en base.

---

## Technologies utilisées

- Langage : TypeScript
- Framework : NestJS
- Base de données : MongoDB via Mongoose
- HTTP : `@nestjs/axios` (Axios + RxJS)
- Tests : Jest (avec `ts-jest`)
- Parsing & versions : `semver`
- Outillage interne : helpers personnalisés (`CacheHelper`, `RetryHelper`, `ParallelHelper`)
- Scripts : `sync-langages.ts` (et variante optimisée)

---

## Structure principale du code

- `src/langages/langage-update.service.ts` — cœur de la synchronisation (npm, GitHub tags/releases, custom updaters).
- `src/langages/custom-updaters.ts` — adaptateurs spécifiques pour pages/API non standard (Wikipedia, pages officielles, JSON endpoints).
- `src/langages/version-parsers.ts` — utilitaires pour extraire/coercer des versions (semver, patterns non‑standards, drafts C++).
- `src/langages/langage-sync.config.ts` — configuration des langages à synchroniser et des sources.
- `sync-langages.ts` / `sync-langages-optimized.ts` — scripts CLI pour lancer la synchronisation.
- Tests unitaires : `src/langages/*.spec.ts` (parsers, updaters, services).

---

## Compétences acquises et mises en pratique

Ce projet est une excellente base pour démontrer et pratiquer les compétences suivantes :

1. Développement back-end en TypeScript & NestJS
  - Architecture modulaire NestJS (services, modules, contrôleurs).
  - Injection de dépendances et bonne séparation des responsabilités.

2. Intégration d'API externes et robustesse
  - Consommation d'APIs REST (Axios via `@nestjs/axios`) et gestion d'observables RxJS (`firstValueFrom`).
  - Ajout d'entêtes (User-Agent, Authorization) et gestion des limites/erreurs réseau.
  - Stratégies de retry et backoff pour fiabiliser les appels externes (`RetryHelper`).

3. Parsing et normalisation des versions
  - Utilisation de `semver` pour coerce/compare/filtrer les versions.
  - Écriture de parsers spécialisés pour formats non standard (p.ex. `es2024`, `n5014`, `SQL:2016`, `docker-v29.0.0`).
  - Mise en place d'une sanitation centralisée pour éviter l'enregistrement de labels comme `v1.2.3`.

4. Tests unitaires et stratégie de tests
  - Conception de tests unitaires isolés (Jest) avec mocks pour `HttpService`, Mongoose et helpers.
  - Tests des parsers, des updaters personnalisés et des services métier.

5. Moteur de synchronisation et orchestration
  - Parcours d'une configuration centralisée (`SYNC_LANGAGES`) et orchestration des différents updaters.
  - Traitement parallèle contrôlé (`ParallelHelper`) et cache local (`CacheHelper`) pour réduire les appels redondants.

6. Bonnes pratiques et sûreté
  - Mode `DRY_RUN` pour valider les runs sans toucher la base de données.
  - Logging structuré et traçabilité des erreurs.

---

## Comment exécuter le projet (rapide)

1. Installer les dépendances

```powershell
npm install
```

2. En développement

```powershell
npm run start:dev
```

3. Lancer les tests unitaires

```powershell
npm run test
```

4. Lancer la synchronisation (dry-run recommandé pour vérifier sans écrire)

```powershell
npm run sync:langages -- --dry-run
```

Remarque : `--dry-run` active `process.env.DRY_RUN=1` et empêche `setVersion(...)` d'écrire en base — très utile pour valider la normalisation des labels (ex. suppression de `v`).

---

## Exemples de vérifications utiles

- Vérifier que `Node.js` affiche à la fois `current` et `lts` sans préfixe `v`.
- Vérifier que `Docker` (moby/moby) passe de `docker-v29.0.0` à `29.0.0` grâce à la normalisation.
- Lancer `npm run test` pour s'assurer des comportements des parsers et updaters.

---

## Contribution & bonnes pratiques

- Ouvrir une branche dédiée par fonctionnalité/bugfix et proposer une PR.
- Ajouter des tests unitaires pour tout nouveau parser/updater.
- Préférer les appels testés et mockés pour les updaters (mock `HttpService` + `of(...)` de RxJS).

---

## Sujets d'amélioration possibles

- Ajouter une CI GitHub Actions exécutant la suite de tests et la vérification du lint.
- Ajouter des tests d'intégration avec une base MongoDB éphémère (testcontainers / mongodb-memory-server).
- Exposer une API REST publique pour consulter l'état des versions synchronisées.

---

## Licence

Projet dérivé d'un starter NestJS — licence : MIT.
