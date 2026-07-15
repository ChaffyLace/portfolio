# 📦 StockFlow

**StockFlow** est une application web de gestion de stock multi-organisation permettant à des entreprises de suivre leur inventaire, d'enregistrer les mouvements de stock, de gérer leurs utilisateurs avec un système de rôles, et de sécuriser l'accès via une authentification JWT avec protection anti-brute force.

---

## 📋 Description du projet

### La problématique

La gestion de stock dans les petites et moyennes entreprises souffre de quatre problèmes récurrents :

- **Suivi manuel** — tableurs et cahiers, sans traçabilité fiable des entrées et sorties
- **Alertes tardives** — les ruptures sont constatées après la perte de vente
- **Aucun contrôle d'accès** — n'importe qui peut modifier les données produits
- **Pas de vue temps réel** — impossible de piloter l'activité sans indicateurs centralisés

### La solution

StockFlow centralise l'inventaire dans une base de données unique, trace chaque mouvement avec son auteur et son motif, détecte automatiquement les produits sous leur seuil critique, et restreint les actions sensibles aux administrateurs — le tout vérifié côté serveur.

### Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| **Multi-organisation** | Chaque entreprise dispose d'un espace totalement isolé |
| **Authentification JWT** | Token signé avec expiration automatique après 24h |
| **Anti-brute force** | Blocage automatique après 5 tentatives échouées (15 min) |
| **RBAC** | Deux rôles : `admin` (gestion complète) et `user` (consultation + mouvements) |
| **Gestion des produits** | Création, modification, suppression, recherche par nom/SKU |
| **Favoris** | Marquage des produits prioritaires (persistant en localStorage) |
| **Mouvements de stock** | Entrées/sorties avec aperçu temps réel avant validation |
| **Alertes automatiques** | Page dédiée : ruptures et stock bas, badge compteur dans la sidebar |
| **Historique** | Traçabilité complète avec filtrage par produit, utilisateur ou motif |
| **Dashboard** | KPIs en temps réel + graphiques (évolution, niveaux par SKU, santé du stock) |
| **Export Excel** | Export de l'inventaire complet en `.xlsx` |
| **Invitation d'utilisateurs** | Un admin crée des comptes rattachés à son organisation |

---

## 🛠️ Technologies utilisées

| Couche | Technologie | Justification |
|---|---|---|
| **Frontend** | React 18 + Vite | Composants réutilisables, HMR quasi-instantané via les ES modules natifs |
| **Routing** | React Router v6 | Navigation SPA avec routes protégées (`PrivateRoute`) |
| **HTTP Client** | Axios | Intercepteurs — injection automatique du JWT sur chaque requête |
| **Graphiques** | Recharts | Composants React natifs, intégration directe avec le state |
| **Export** | SheetJS (xlsx) | Génération de fichiers Excel côté client, sans appel serveur |
| **Backend** | FastAPI (Python) | Swagger auto-généré, validation Pydantic, performances élevées |
| **Serveur ASGI** | Uvicorn | Exécute l'application FastAPI, gère les connexions HTTP |
| **Base de données** | MySQL 8.0 | Relationnel — clés étrangères, contraintes UNIQUE, transactions ACID |
| **Authentification** | PyJWT | Stateless, scalable, aucune session à stocker côté serveur |
| **Hashing** | bcrypt | Algorithme volontairement lent avec salt automatique |
| **Conteneurisation** | Docker + Docker Compose | Environnement reproductible, lancement en une commande |

---

## 🏗️ Diagramme de l'architecture

```
┌──────────────────────── Docker Compose — stockflow_network ────────────────────────┐
│                                                                                     │
│   ┌─────────────────┐  HTTP/JSON   ┌──────────────────┐   SQL    ┌───────────────┐ │
│   │   FRONTEND      │ ───────────► │    BACKEND       │ ───────► │   DATABASE    │ │
│   │  React + Vite   │ ◄─────────── │    FastAPI       │ ◄─────── │   MySQL 8.0   │ │
│   │     :3000       │  Bearer JWT  │     :8000        │          │     :3306     │ │
│   └─────────────────┘              └──────────────────┘          └───────────────┘ │
│    • Pages & composants             • API Layer (routers)         • organizations   │
│    • Context API (session)          • Facade (RBAC, bcrypt)       • users           │
│    • Axios + intercepteur JWT       • Repository (SQL)            • products        │
│    • PrivateRoute                   • Rate limiting               • stock_movements │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Architecture en couches (backend)

```
┌──────────────────────────────────────────────────────────┐
│  API Layer — Routers FastAPI                              │
│  /api/auth  /api/products  /api/movements  /api/analytics │
│  → Routes HTTP, validation Pydantic, vérification JWT     │
└───────────────────────────┬──────────────────────────────┘
                             │
┌───────────────────────────▼──────────────────────────────┐
│  Service Layer — StockFlowFacade                          │
│  → Logique métier, RBAC, hashing bcrypt, rate limiting    │
└───────────────────────────┬──────────────────────────────┘
                             │
┌───────────────────────────▼──────────────────────────────┐
│  Persistence Layer — MySQLRepository                      │
│  → Toutes les requêtes SQL, transactions (commit/rollback)│
└───────────────────────────┬──────────────────────────────┘
                             │
┌───────────────────────────▼──────────────────────────────┐
│  Database — MySQL 8.0                                     │
└──────────────────────────────────────────────────────────┘
```

**Pourquoi ce découpage ?**

- **Facade Pattern** — `StockFlowFacade` expose une interface simple aux routers en cachant la complexité (RBAC, validation, accès données). Les routes ne contiennent aucune logique métier.
- **Repository Pattern** — `MySQLRepository` isole tout le SQL. Changer de base de données ne modifierait que cette classe.
- **Séparation des responsabilités** — chaque couche est testable indépendamment.

---

## 🗄️ Diagramme de la base de données

```
┌─────────────────────────────────────┐
│           organizations              │
├─────────────────────────────────────┤
│ 🔑 id              INT  PK           │
│    name            VARCHAR(150)      │
│    created_at      DATETIME          │
└──────────────┬──────────────┬───────┘
               │ 1            │ 1
          ON DELETE       ON DELETE
          CASCADE         CASCADE
               │ N            │ N
┌──────────────▼──────┐  ┌───▼──────────────────┐
│        users        │  │       products        │
├─────────────────────┤  ├───────────────────────┤
│ 🔑 id          PK   │  │ 🔑 id            PK   │
│ 🔗 org_id      FK   │  │ 🔗 org_id        FK   │
│    name             │  │    sku    UNIQUE/org  │
│    email    UNIQUE  │  │    name               │
│    password  bcrypt │  │    quantity           │
│    role             │  │    alert_threshold    │
└──────────┬──────────┘  └──────────┬────────────┘
           │ 1                       │ 1
      ON DELETE                 ON DELETE
      SET NULL                  CASCADE
           │ N                       │ N
           └───────────┬─────────────┘
                       │
          ┌────────────▼──────────────┐
          │       stock_movements      │
          ├───────────────────────────┤
          │ 🔑 id              PK      │
          │ 🔗 organization_id FK      │
          │ 🔗 user_id         FK      │
          │ 🔗 product_id      FK      │
          │    quantity_changed INT ±  │
          │    reason                  │
          │    movement_date           │
          └───────────────────────────┘
```

### Relations & cardinalités

| Relation | Type | Contrainte | Description |
|---|---|---|---|
| `organizations` → `users` | 1 — N | `ON DELETE CASCADE` | Une organisation possède plusieurs utilisateurs |
| `organizations` → `products` | 1 — N | `ON DELETE CASCADE` | Une organisation possède plusieurs produits |
| `users` → `stock_movements` | 1 — N | `ON DELETE SET NULL` | Historique conservé mais anonymisé si l'utilisateur est supprimé |
| `products` → `stock_movements` | 1 — N | `ON DELETE CASCADE` | L'historique est supprimé avec le produit |

### Contraintes notables

- **`UNIQUE (organization_id, sku)`** — un SKU est unique **par organisation**, pas globalement. Deux entreprises peuvent utiliser le même code sans conflit.
- **`password`** — jamais stocké en clair, toujours hashé avec bcrypt.
- **`quantity`** — validée à `>= 0` par une property setter Python avant toute écriture.
- **Transactions** — l'insertion d'un mouvement et la mise à jour de la quantité produit sont atomiques (`commit` / `rollback`).

---

## 🔐 Sécurité

- **Hashing bcrypt** — algorithme volontairement lent avec salt automatique, résistant aux attaques par force brute et aux rainbow tables.
- **JWT** — token signé avec `SECRET_KEY`, contenant l'id, l'email, le rôle et l'`organization_id`. Expiration après 24h. Transmis via le header `Authorization: Bearer <token>`.
- **RBAC côté serveur** — la vérification du rôle est faite dans la **Facade**, jamais uniquement côté frontend. Un appel direct à l'API par un utilisateur non-admin retourne HTTP 403.
- **Rate limiting** — après 5 tentatives de connexion échouées sur un même email, blocage de 15 minutes (HTTP 429). Compteur remis à zéro après un login réussi.
- **Isolation des données** — toutes les requêtes SQL sont filtrées par `organization_id`. Aucun accès croisé entre organisations, même avec un token valide.
- **CORS** — configuré pour n'autoriser que les origines connues.

---

## 🚀 Installation

### Prérequis

- [Docker](https://www.docker.com/products/docker-desktop/) et Docker Compose installés
- Git

### Commandes d'installation

```bash
# Cloner le repository
git clone https://github.com/ChaffyLace/portfolio.git
cd portfolio

# Copier le fichier d'environnement et l'adapter si nécessaire
cp .env.example .env
```

---

## ▶️ Lancement du projet

```bash
# Lancer toute la stack (frontend + backend + base de données)
docker-compose up --build
```

L'application est ensuite accessible sur :

| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **API Backend** | http://localhost:8000 |
| **Documentation Swagger** | http://localhost:8000/docs |

### Compte de démonstration

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@admin.com` | `admin123` | Admin |

### Commandes utiles

```bash
# Arrêter la stack
docker-compose down

# Arrêter et supprimer les volumes (réinitialise la base)
docker-compose down -v

# Consulter les logs d'un service
docker logs stockflow_backend -f

# Accéder à la base MySQL en ligne de commande
docker exec -it stockflow_db mysql -u root -p stockflow_db

# Reconstruire uniquement le frontend
docker-compose up --build stockflow_frontend
```

---

## 🧪 Tests

Les tests ont été réalisés manuellement selon plusieurs approches complémentaires.

### 1. Tests fonctionnels — Swagger UI

Chaque endpoint est testé isolément sur `/docs`, sans passer par le frontend. Cela permet de déterminer immédiatement si un bug provient du backend ou du frontend.

### 2. Tests RBAC — permissions

Connexion avec un compte `user`, puis appel direct de `POST /api/products` avec son token.
→ **Résultat attendu et vérifié :** HTTP `403 Forbidden`. La règle n'est pas contournable depuis le client.

### 3. Tests rate limiting — anti-brute force

5 tentatives de connexion avec un mot de passe erroné.
→ **Résultat attendu et vérifié :** la 6ᵉ retourne HTTP `429 Too Many Requests`, compte bloqué 15 minutes, déblocage automatique confirmé.

### 4. Tests d'intégration — navigateur

Parcours utilisateur complet :
`création entreprise → connexion → dashboard → création produit → mouvement de stock → historique`
→ Vérification de la mise à jour temps réel des quantités et des KPIs.

### 5. Tests multi-organisation — isolation

Deux organisations créées en parallèle avec des produits distincts.
→ **Vérifié :** aucune organisation ne voit les données de l'autre.

### 6. Vérification en base — persistance

```bash
docker exec -it stockflow_db mysql -u root -p stockflow_db
SELECT id, email, LEFT(password, 7) AS hash_prefix, role FROM users;
```
→ **Vérifié :** les mots de passe commencent bien par `$2b$12$` (signature bcrypt), les clés étrangères sont respectées, les quantités sont cohérentes avec l'historique.

---

## 🐛 Bugs et limites restant à résoudre

| Priorité | Limite | Impact / Solution envisagée |
|---|---|---|
| 🔴 **Haute** | **Aucun test automatisé** | Les tests sont entièrement manuels. → Ajouter des tests unitaires `pytest` sur la Facade et le Repository, puis un pipeline CI/CD GitHub Actions. |
| 🔴 **Haute** | **HTTP uniquement, pas de HTTPS** | Les tokens transitent en clair en développement. → Nginx en reverse proxy + certificat Let's Encrypt en production. |
| 🟡 **Moyenne** | **Rate limiting en mémoire** | Le dictionnaire `login_attempts` est perdu au redémarrage du conteneur et ne fonctionne pas en multi-instances. → Migrer vers Redis. |
| 🟡 **Moyenne** | **Pas de pagination** | `GET /products` et `GET /movements` retournent toute la table. Dégradation attendue au-delà de quelques milliers de lignes. → Pagination `limit` / `offset` côté API. |
| 🟡 **Moyenne** | **Pas d'index sur `organization_id`** | Toutes les requêtes filtrent sur cette colonne sans index — scan complet de la table à grande échelle. → `CREATE INDEX idx_products_org ON products(organization_id);` |
| 🟢 **Basse** | **JWT sans refresh token** | Le token expire brutalement après 24h, l'utilisateur est déconnecté sans prévenir. → Implémenter un refresh token avec des access tokens courts (1h). |
| 🟢 **Basse** | **Table `stock_movements` non archivée** | Journal qui grossit indéfiniment. → Partitionnement par année ou archivage des mouvements de plus de 2 ans. |
| 🟢 **Basse** | **2FA conçue mais non déployée** | L'architecture et le service SMTP Gmail sont prêts mais non branchés. → Finaliser l'envoi du code OTP à 6 chiffres. |
| 🟢 **Basse** | **Favoris non synchronisés** | Stockés en `localStorage` — perdus au changement de navigateur. → Persister en base dans une table `user_favorites`. |

---

## 👥 Les créateurs du projet

### Abdel Mourid El Mrabit — *Backend Developer*

Architecture en couches (Facade & Repository), API FastAPI, sécurité (JWT, bcrypt, RBAC, rate limiting), conception de la base de données, orchestration Docker.

- 📧 Email : `abdelmouridelmrabit07@gmail.com`
- 💼 LinkedIn : [linkedin.com/in/abdelmourid-elmrabit](https://www.linkedin.com/in/abdel-mourid-el-mrabit-a260a93b0/)

### Nikola — *Frontend Developer*

Interface React (composants, pages, routing), intégration Axios ↔ API, gestion du state via Context API, design et UX, dashboard et graphiques.

- 📧 Email : `nikolag1jic93430@gmail.com`
- 💼 LinkedIn : [linkedin.com/in/nikola](https://www.linkedin.com/in/nikola-gajic-3316223aa/)

---

## 📂 Structure du projet

```
portfolio/
├── backend/
│   ├── api/
│   │   ├── auth.py             # Login, register, register-company, rate limiting
│   │   ├── products.py         # CRUD produits
│   │   ├── movements.py        # Mouvements de stock
│   │   └── analytics.py        # KPIs du dashboard
│   ├── services/
│   │   └── facade.py           # Logique métier — Facade Pattern
│   ├── persistence/
│   │   └── repository.py       # Requêtes SQL — Repository Pattern
│   ├── models/                 # User, Product, StockMovement
│   ├── main.py                 # Point d'entrée FastAPI + CORS
│   └── requirements.txt
├── database/
│   └── init.sql                # Schéma + données de seed
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/index.js        # Appels HTTP centralisés (Axios + intercepteur)
│   │   ├── components/         # Layout, Sidebar, PrivateRoute, Modals
│   │   ├── context/
│   │   │   └── AuthContext.jsx # État global d'authentification
│   │   └── pages/              # Login, Register, Dashboard, Products,
│   │                           # Movements, History, Alerts, InviteUser
│   └── vite.config.js
└── docker-compose.yml
```

---

<p align="center">
  <strong>StockFlow</strong> — Projet portfolio de développement full-stack Juillet 2026
</p>
