# 📦 StockFlow

StockFlow est une application web de gestion de stock (MVP) permettant de suivre l'inventaire de produits, d'enregistrer les mouvements de stock (entrées/sorties) et de gérer les utilisateurs avec un système de rôles (RBAC).

## 🎯 Fonctionnalités

- **Authentification** : inscription et connexion sécurisées via JWT
- **Gestion des produits** : création et consultation de l'inventaire complet
- **Mouvements de stock** : enregistrement des entrées/sorties avec mise à jour automatique des quantités
- **Alertes de stock** : détection automatique des produits sous le seuil d'alerte ou en rupture
- **Dashboard** : vue d'ensemble avec indicateurs clés (KPIs) en temps réel
- **RBAC (Role-Based Access Control)** : seuls les administrateurs peuvent créer des produits

## 🏗️ Architecture de l'application

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │  HTTP   │                  │  SQL    │                 │
│  Frontend       │ ──────► │  Backend         │ ──────► │  Database       │
│  React + Vite   │ ◄────── │  FastAPI         │ ◄────── │  MySQL          │
│                 │  JSON   │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
   localhost:3000              localhost:8000               localhost:3306
```

L'application suit une architecture en couches (**Layered Architecture**) côté backend, avec un **Facade Pattern** pour centraliser la logique métier :

```
┌─────────────────────────────────────────┐
│  API Layer (FastAPI routers)             │  ← Gère les routes HTTP, validation Pydantic
│  /auth  /products  /movements            │
└──────────────────┬────────────────────────┘
                    │
┌──────────────────▼────────────────────────┐
│  Service Layer (Facade)                  │  ← Logique métier, RBAC, hashing
│  StockFlowFacade                         │
└──────────────────┬────────────────────────┘
                    │
┌──────────────────▼────────────────────────┐
│  Persistence Layer (Repository)          │  ← Requêtes SQL, accès base de données
│  MySQLRepository                         │
└──────────────────┬────────────────────────┘
                    │
┌──────────────────▼────────────────────────┐
│  Database (MySQL)                        │
└─────────────────────────────────────────┘
```

### Pourquoi cette architecture ?

- **Séparation des responsabilités** : chaque couche a un rôle unique, ce qui facilite la maintenance et les tests.
- **Facade Pattern** : la classe `StockFlowFacade` expose une interface simple aux routers, en cachant la complexité de l'accès aux données et des règles métier (ex : vérification du rôle admin avant création d'un produit).
- **Repository Pattern** : isole toute la logique SQL dans une seule classe (`MySQLRepository`), ce qui permettrait de changer de base de données sans toucher au reste du code.

## 🗄️ Modèle de données (Database Diagram)

```
┌─────────────────────┐
│       users          │
├─────────────────────┤
│ id            PK     │
│ name                 │
│ email         UNIQUE │
│ password (hashed)    │
│ role                 │
│ created_at           │
└──────────┬───────────┘
           │ 1
           │
           │ N
┌──────────▼───────────┐         ┌───────────────────────┐
│  stock_movements      │  N    1 │      products          │
├───────────────────────┤ ◄───────┤────────────────────────┤
│ id              PK    │         │ id              PK     │
│ user_id         FK    │         │ sku             UNIQUE │
│ product_id      FK    │────────►│ name                   │
│ quantity_changed       │         │ quantity                │
│ reason                 │         │ alert_threshold          │
│ movement_date           │         └────────────────────────┘
└────────────────────────┘
```

### Relations

- **users → stock_movements** : relation 1-N. Un utilisateur peut enregistrer plusieurs mouvements de stock (`ON DELETE SET NULL` : si l'utilisateur est supprimé, l'historique est conservé mais anonymisé).
- **products → stock_movements** : relation 1-N. Un produit peut avoir plusieurs mouvements associés (`ON DELETE CASCADE` : si le produit est supprimé, son historique de mouvements l'est aussi).

## 🛠️ Stack technique

| Couche      | Technologie                          |
|-------------|---------------------------------------|
| Frontend    | React 18, Vite, React Router v6      |
| Backend     | FastAPI (Python), Pydantic            |
| Base de données | MySQL 8.0                          |
| Authentification | JWT (PyJWT), hashing SHA-256    |
| Conteneurisation | Docker, Docker Compose            |

### Pourquoi ces choix ?

- **FastAPI** : framework Python moderne, rapide, avec validation automatique des données via Pydantic et documentation Swagger générée automatiquement (`/docs`).
- **React + Vite** : Vite offre un temps de démarrage et de rechargement à chaud (HMR) très rapide comparé à Create React App.
- **MySQL** : base de données relationnelle adaptée aux relations claires entre utilisateurs, produits et mouvements de stock.
- **JWT** : permet une authentification stateless, scalable, sans avoir besoin de stocker les sessions côté serveur.
- **Docker Compose** : permet de lancer l'ensemble de la stack (frontend, backend, base de données) avec une seule commande, garantissant un environnement reproductible.

## 🔐 Sécurité

- **Hashing des mots de passe** : les mots de passe ne sont jamais stockés en clair. Ils sont hashés en SHA-256 avant insertion en base.
- **JWT (JSON Web Token)** : à la connexion, un token signé est généré et contient l'identifiant, l'email et le rôle de l'utilisateur. Ce token est ensuite envoyé dans le header `Authorization: Bearer <token>` pour authentifier chaque requête.
- **RBAC (Role-Based Access Control)** : certaines actions (comme la création de produits) sont réservées aux utilisateurs ayant le rôle `admin`. Cette vérification est faite côté backend dans la couche Facade, garantissant qu'elle ne peut pas être contournée depuis le frontend.

## 🚀 Installation et lancement

### Prérequis

- Docker et Docker Compose installés

### Étapes

```bash
# Cloner le repository
git clone <url-du-repo>
cd portfolio

# Lancer l'ensemble de la stack
docker-compose up --build
```

L'application sera accessible sur :
- **Frontend** : http://localhost:3000
- **Backend (API)** : http://localhost:8000
- **Documentation Swagger** : http://localhost:8000/docs

### Variables d'environnement

Copier `.env.example` vers `.env` et adapter les valeurs si nécessaire (URL de l'API, secret JWT, identifiants base de données).

## 📂 Structure du projet

```
portfolio/
├── backend/
│   ├── api/                  # Routers FastAPI (auth, products, movements, analytics)
│   ├── services/
│   │   └── facade.py         # Logique métier centralisée (Facade Pattern)
│   ├── persistence/
│   │   └── repository.py     # Accès base de données (Repository Pattern)
│   ├── models/                # Modèles métier (User, Product, StockMovement)
│   └── main.py                # Point d'entrée FastAPI
├── database/
│   └── init.sql               # Script de création des tables et données de seed
├── frontend/
│   ├── src/
│   │   ├── api/                # Appels HTTP vers le backend
│   │   ├── components/         # Composants réutilisables (Layout, Sidebar, PrivateRoute)
│   │   ├── context/             # Context React pour l'authentification globale
│   │   └── pages/                # Pages principales (Login, Register, Dashboard, Products, Movements)
│   └── vite.config.js
└── docker-compose.yml
```

## 🧪 Tests effectués

Les tests ont été réalisés manuellement à travers :

- **Tests fonctionnels via Swagger UI** (`/docs`) : validation de chaque endpoint (login, register, création de produit, mouvements de stock) indépendamment du frontend, pour isoler les bugs backend des bugs frontend.
- **Tests d'intégration via le navigateur** : vérification du parcours utilisateur complet (inscription → connexion → consultation dashboard → création de produit → enregistrement d'un mouvement de stock → mise à jour du stock visible en temps réel).
- **Tests RBAC** : vérification qu'un utilisateur avec le rôle `user` ne peut pas créer de produit (doit recevoir une erreur 403 Forbidden).
- **Vérification des données en base** : contrôle direct via le client MySQL en ligne de commande pour confirmer la persistance correcte des données (utilisateurs créés, mots de passe hashés, mouvements liés aux bons produits).

## 👤 Auteur

Abdel Mourid — Projet réalisé dans le cadre de mon portfolio de développement full-stack.