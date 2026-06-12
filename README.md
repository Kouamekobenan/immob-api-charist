# Immob API

API REST de gestion immobilière construite avec **NestJS 11**, **Prisma 7** et **PostgreSQL**.  
Architecture **Domain-Driven Design (DDD)** — chaque module est découpé en 4 couches : `domain`, `application`, `infrastructure`, `presentation`.

---

## Table des matières

1. [Stack technique](#stack-technique)
2. [Démarrage rapide](#démarrage-rapide)
3. [Variables d'environnement](#variables-denvironnement)
4. [Architecture DDD](#architecture-ddd)
5. [Rôles utilisateurs](#rôles-utilisateurs)
6. [Modules — rôle et routes](#modules--rôle-et-routes)
   - [Auth](#-auth)
   - [Users](#-users)
   - [Properties](#-properties)
   - [Contracts](#-contracts)
   - [Payments](#-payments)
   - [Tickets](#-tickets)
   - [Expenses](#-expenses)
   - [Audit Logs](#-audit-logs)
7. [Intégration Frontend](#intégration-frontend)
   - [Authentification JWT](#authentification-jwt)
   - [Intercepteur Axios avec auto-refresh](#intercepteur-axios-avec-auto-refresh)
   - [Upload de fichiers](#upload-de-fichiers)
   - [Pagination](#pagination)
   - [Gestion des erreurs](#gestion-des-erreurs)
8. [Documentation Swagger](#documentation-swagger)
9. [Scripts disponibles](#scripts-disponibles)

---

## Stack technique

| Outil | Version | Rôle |
|-------|---------|------|
| NestJS | 11 | Framework Node.js |
| Prisma | 7.8 | ORM (driver adapter `@prisma/adapter-pg`) |
| PostgreSQL | 14+ | Base de données relationnelle |
| Passport + JWT | — | Authentification (access + refresh tokens) |
| Cloudinary | 2 | Stockage images et fichiers |
| Swagger / OpenAPI | 11 | Documentation interactive |
| bcryptjs | 3 | Hachage des mots de passe (12 rounds) |
| class-validator | 0.15 | Validation des DTOs |
| class-transformer | 0.5 | Transformation des types entrants |

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Copier et remplir le fichier d'environnement
cp .env.example .env

# 3. Appliquer les migrations Prisma
npx prisma migrate dev

# 4. Lancer en mode développement (hot reload)
npm run start:dev
```

| URL | Description |
|-----|-------------|
| `http://localhost:3001/api/v1` | Base URL de l'API |
| `http://localhost:3001/api/docs` | Documentation Swagger interactive |

---

## Variables d'environnement

```env
# ── Base de données ───────────────────────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/immob_db"

# ── JWT — Access Token (courte durée) ─────────────────────────────────────────
JWT_ACCESS_SECRET="votre_secret_access_32_chars_min"
ACCESS_TOKEN_EXPIRATION="15m"

# ── JWT — Refresh Token (longue durée) ────────────────────────────────────────
JWT_REFRESH_SECRET="votre_secret_refresh_32_chars_min"
REFRESH_TOKEN_EXPIRATION="7d"

# ── Cloudinary (stockage images et fichiers) ──────────────────────────────────
CLOUDINARY_CLOUD_NAME="votre_cloud_name"
CLOUDINARY_API_KEY="votre_api_key"
CLOUDINARY_API_SECRET="votre_api_secret"

# ── Serveur ───────────────────────────────────────────────────────────────────
PORT=3001
```

---

## Architecture DDD

Chaque module respecte la même structure en 4 couches :

```
src/modules/<module>/
├── domain/
│   ├── entities/          ← Entités métier pures (logique, règles, état)
│   └── repositories/      ← Interfaces + tokens Symbol d'injection
├── application/
│   ├── dtos/              ← Validation des données entrantes (class-validator)
│   ├── responses/         ← Forme des données sortantes (Swagger @ApiProperty)
│   └── use-cases/         ← Un fichier = une action métier atomique
├── infrastructure/
│   └── repositories/      ← Implémentations Prisma des interfaces du domaine
└── presentation/
    └── <module>.controller.ts  ← Routes HTTP, décorateurs Swagger, guards
```

**Règle fondamentale :** les use-cases ne dépendent que des interfaces du domaine. Les détails d'infrastructure (Prisma, Cloudinary) sont injectés via le système d'injection de dépendances de NestJS — jamais importés directement dans le domaine ou l'application.

---

## Rôles utilisateurs

| Rôle | Accès typique |
|------|---------------|
| `SUPER_ADMIN` | Accès illimité à tout |
| `BAILLEUR` | Crée des biens, signe des contrats, initie des dépenses |
| `GERANT` | Gère les biens qui lui sont assignés, initie des dépenses |
| `LOCATAIRE` | Consulte son contrat, paye son loyer, signale des pannes |
| `PRESTATAIRE` | Reçoit des tickets assignés, perçoit des paiements de prestation |

> La vérification des rôles est faite dans les **use-cases** (logique métier), pas dans les guards. Les guards vérifient uniquement que le JWT est valide.

---

## Modules — rôle et routes

> **Base URL :** `http://localhost:3001/api/v1`
>
> Toutes les routes sauf celles marquées ❌ nécessitent le header :
> ```
> Authorization: Bearer <accessToken>
> ```

---

### 🔐 Auth

**Rôle :** Gestion de l'identité — inscription, connexion, renouvellement de tokens, réinitialisation du mot de passe.

| Méthode | Route | Auth | Description |
|---------|-------|:----:|-------------|
| `POST` | `/auth/register` | ❌ | Créer un compte |
| `POST` | `/auth/login` | ❌ | Connexion → `accessToken` + `refreshToken` |
| `POST` | `/auth/logout` | ✅ | Invalide le refresh token en base |
| `POST` | `/auth/refresh` | ✅ refresh | Renouveler les tokens |
| `POST` | `/auth/forgot-password` | ❌ | Demander un lien de reset par email |
| `POST` | `/auth/reset-password` | ❌ | Réinitialiser avec le token email |
| `GET` | `/auth/me` | ✅ | Profil minimal issu du JWT |

**Réponse login/register :**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "LOCATAIRE"
  }
}
```

---

### 👤 Users

**Rôle :** Gestion des profils — lister, modifier ses informations, changer son mot de passe, changer le rôle d'un autre utilisateur (admin).

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/users` | Lister (filtres : `role`, `search`) |
| `GET` | `/users/me` | Son propre profil complet (sans `passwordHash`) |
| `GET` | `/users/:id` | Profil d'un utilisateur |
| `PATCH` | `/users/me` | Modifier nom, prénom, téléphone |
| `PATCH` | `/users/me/password` | Changer son mot de passe (requiert l'ancien) |
| `PATCH` | `/users/:id/role` | Changer le rôle d'un utilisateur |
| `DELETE` | `/users/:id` | Supprimer un utilisateur (pas son propre compte) |

---

### 🏠 Properties

**Rôle :** CRUD du parc immobilier — créer des biens, les filtrer, assigner/retirer un gérant.

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/properties` | Créer un bien (BAILLEUR / SUPER_ADMIN) |
| `GET` | `/properties` | Lister (filtres : `search`, `type`, `ville`, `estOccupe`, `bailleurId`, `gerantId`) |
| `GET` | `/properties/available` | Biens libres uniquement |
| `GET` | `/properties/occupied` | Biens occupés uniquement |
| `GET` | `/properties/bailleur/:id` | Biens d'un propriétaire |
| `GET` | `/properties/gerant/:id` | Biens d'un gérant |
| `GET` | `/properties/:id` | Détail d'un bien |
| `PATCH` | `/properties/:id` | Modifier (titre, adresse, loyer, charges…) |
| `PATCH` | `/properties/:id/manager` | Assigner / changer le gérant |
| `DELETE` | `/properties/:id/manager` | Retirer le gérant |
| `DELETE` | `/properties/:id` | Supprimer (bloqué si contrat actif) |

**Types :** `APPARTEMENT` · `STUDIO` · `VILLA` · `MAGASIN` · `AUTRE`

---

### 📄 Contracts

**Rôle :** Contrats de location — un seul contrat actif par bien à la fois. La création met automatiquement `estOccupe = true` sur le bien ; la résiliation le remet à `false`.

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/contracts` | Créer un contrat (vérifie qu'aucun actif n'existe) |
| `GET` | `/contracts` | Lister (filtres : `propertyId`, `locataireId`, `estActif`) |
| `GET` | `/contracts/property/:id` | Contrats d'un bien |
| `GET` | `/contracts/locataire/:id` | Contrats d'un locataire |
| `GET` | `/contracts/active` | Contrats actifs uniquement |
| `GET` | `/contracts/:id` | Détail |
| `PATCH` | `/contracts/:id/terminate` | Résilier (date ≥ dateDebut requise) |
| `DELETE` | `/contracts/:id` | Supprimer (bloqué si actif) |

---

### 💳 Payments

**Rôle :** Paiements de loyer — génération d'un avis mensuel, confirmation, rejet, suivi par période.

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/payments` | Créer un avis de paiement (`EN_ATTENTE`) |
| `GET` | `/payments` | Lister (filtres : `contractId`, `locataireId`, `statut`, `periode`) |
| `GET` | `/payments/contract/:id` | Paiements d'un contrat |
| `GET` | `/payments/locataire/:id` | Historique d'un locataire |
| `GET` | `/payments/:id` | Détail |
| `PATCH` | `/payments/:id/confirm` | Confirmer → `PAYE` (+ référence + quittance URL) |
| `PATCH` | `/payments/:id/reject` | Rejeter → `REJETE` |
| `PATCH` | `/payments/:id/fail` | Marquer → `ECHOUE` |
| `DELETE` | `/payments/:id` | Supprimer (`EN_ATTENTE` ou `ECHOUE`) |

**Statuts :** `EN_ATTENTE` → `PAYE` / `REJETE` / `ECHOUE`  
**Format période :** `"06-2026"` *(MM-YYYY)*

---

### 🔧 Tickets

**Rôle :** Signalement et suivi de pannes ou travaux — machine à états stricte, photos uploadées sur Cloudinary, assignation d'un prestataire.

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/tickets` | Signaler une panne *(multipart, 5 photos max)* |
| `GET` | `/tickets` | Lister (filtres : `propertyId`, `locataireId`, `prestataireId`, `statut`, `urgence`) |
| `GET` | `/tickets/property/:id` | Tickets d'un bien |
| `GET` | `/tickets/locataire/:id` | Tickets d'un locataire |
| `GET` | `/tickets/prestataire/:id` | Tickets d'un prestataire |
| `GET` | `/tickets/:id` | Détail |
| `PATCH` | `/tickets/:id/assign` | Assigner un prestataire → `ASSIGNE` |
| `PATCH` | `/tickets/:id/status` | Changer le statut (machine à états) |
| `POST` | `/tickets/:id/photos` | Ajouter des photos *(multipart, 5 max)* |
| `DELETE` | `/tickets/:id` | Supprimer (`OUVERT` uniquement) |

**Machine à états :**
```
OUVERT ──→ ASSIGNE, CLOTURE
ASSIGNE ──→ EN_COURS, OUVERT (désassigner), CLOTURE
EN_COURS ──→ RESOLU, CLOTURE
RESOLU ──→ CLOTURE
CLOTURE ──→ (terminal)
```
**Niveaux d'urgence :** `FAIBLE` · `MOYEN` · `CRITIQUE`

---

### 💰 Expenses

**Rôle :** Dépenses opérationnelles des GERANT/BAILLEUR — payer un prestataire, un gardien, des fournitures, des charges communes, etc. Avec upload de justificatifs (factures/reçus) sur Cloudinary.

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/expenses` | Créer une dépense (GERANT / BAILLEUR) |
| `GET` | `/expenses` | Lister (filtres : `payeurId`, `propertyId`, `categorie`, `statut`, `dateDebut`, `dateFin`) |
| `GET` | `/expenses/property/:id` | Dépenses d'un bien |
| `GET` | `/expenses/payeur/:id` | Dépenses d'un gérant/bailleur |
| `GET` | `/expenses/beneficiaire/:id` | Paiements reçus par un prestataire interne |
| `GET` | `/expenses/:id` | Détail |
| `PATCH` | `/expenses/:id/pay` | Confirmer le paiement → `PAYEE` |
| `PATCH` | `/expenses/:id/cancel` | Annuler → `ANNULEE` |
| `POST` | `/expenses/:id/justificatif` | Uploader facture/reçu *(multipart, 1 fichier)* |
| `DELETE` | `/expenses/:id` | Supprimer (`EN_ATTENTE` ou `ANNULEE`) |

**Catégories :** `PRESTATAIRE` · `PERSONNEL` · `FOURNITURES` · `CHARGES_COMMUNES` · `ASSURANCE` · `TAXE_IMPOT` · `AUTRE`

---

### 📋 Audit Logs

**Rôle :** Journal immuable de toutes les actions importantes — **append-only**, aucune modification ni suppression possible. Exporté pour être utilisé par les autres modules.

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/audit-logs` | Enregistrer une action (admin / usage interne) |
| `GET` | `/audit-logs` | Lister (filtres : `action`, `table`, `userId`, `enregistrementId`, `dateDebut`, `dateFin`) |
| `GET` | `/audit-logs/user/:id` | Historique d'un utilisateur |
| `GET` | `/audit-logs/record/:table/:id` | Timeline complète d'un enregistrement |
| `GET` | `/audit-logs/:id` | Détail d'une entrée |

---

## Intégration Frontend

### Authentification JWT

L'API utilise **deux tokens** distincts :

| Token | Durée | Usage |
|-------|-------|-------|
| `accessToken` | 15 min | Header `Authorization: Bearer <token>` sur chaque requête protégée |
| `refreshToken` | 7 jours | Envoyé **uniquement** à `POST /auth/refresh` pour renouveler les tokens |

**Flux complet :**

```
1. POST /auth/login  →  { accessToken, refreshToken, user }
2. Stocker les tokens (voir recommandation ci-dessous)
3. Chaque requête protégée → Authorization: Bearer <accessToken>
4. Réponse 401 reçue → POST /auth/refresh (avec refreshToken)
              → Nouveaux tokens → Rejouer la requête originale
5. /auth/refresh échoue (refresh expiré) → Rediriger vers /login
```

> **Recommandation sécurité**  
> Stocker le `refreshToken` dans un cookie `httpOnly; Secure; SameSite=Strict` côté serveur, et l'`accessToken` uniquement en mémoire (variable JS ou état React/Vue). Éviter `localStorage` pour les tokens sensibles.

---

### Intercepteur Axios avec auto-refresh

```typescript
// src/lib/api.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

export const api = axios.create({ baseURL: BASE_URL });

// ── Injecter le token sur chaque requête ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh si 401 ───────────────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      pendingQueue.forEach((p) => p.resolve(data.accessToken));
      pendingQueue = [];

      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (err) {
      pendingQueue.forEach((p) => p.reject(err));
      pendingQueue = [];
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
```

---

### Upload de fichiers

Les routes qui acceptent des fichiers utilisent `multipart/form-data`. **Ne jamais définir `Content-Type` manuellement** — Axios le fait automatiquement avec le bon `boundary`.

```typescript
// ── Créer un ticket avec des photos ──────────────────────────────────────────
async function createTicket(payload: {
  titre: string;
  description: string;
  urgence: 'FAIBLE' | 'MOYEN' | 'CRITIQUE';
  propertyId: string;
  locataireId: string;
}, photos: File[]) {
  const form = new FormData();
  form.append('titre', payload.titre);
  form.append('description', payload.description);
  form.append('urgence', payload.urgence);
  form.append('propertyId', payload.propertyId);
  form.append('locataireId', payload.locataireId);

  // Champ attendu par l'API : "photos" (plusieurs fichiers)
  photos.forEach((photo) => form.append('photos', photo));

  const { data } = await api.post('/tickets', form);
  return data;
}

// ── Ajouter des photos à un ticket existant ───────────────────────────────────
async function addTicketPhotos(ticketId: string, photos: File[]) {
  const form = new FormData();
  photos.forEach((photo) => form.append('photos', photo));

  const { data } = await api.post(`/tickets/${ticketId}/photos`, form);
  return data;
}

// ── Uploader un justificatif de dépense ───────────────────────────────────────
async function uploadJustificatif(expenseId: string, file: File) {
  const form = new FormData();
  form.append('file', file); // champ "file" pour les justificatifs

  const { data } = await api.post(`/expenses/${expenseId}/justificatif`, form);
  return data;
}
```

---

### Pagination

Toutes les routes de listing retournent le format suivant :

```typescript
interface PaginatedResponse<T> {
  data: T[];        // Tableau des éléments de la page courante
  total: number;    // Nombre total d'éléments (toutes pages confondues)
  page: number;     // Page courante
  limit: number;    // Éléments par page
  totalPages: number;
}
```

**Utilisation avec filtres :**

```typescript
// Récupérer page 2, 10 biens/page, filtrer par type et ville
const { data: response } = await api.get('/properties', {
  params: {
    page: 2,
    limit: 10,
    type: 'APPARTEMENT',
    ville: 'Abidjan',
  },
});

const { data: properties, total, totalPages } = response;

// Paiements EN_ATTENTE d'un locataire
const { data: paymentsPage } = await api.get('/payments', {
  params: {
    locataireId: 'uuid-du-locataire',
    statut: 'EN_ATTENTE',
    page: 1,
    limit: 20,
  },
});
```

---

### Gestion des erreurs

L'API retourne des erreurs au format standard NestJS :

```typescript
interface ApiError {
  statusCode: number;
  message: string | string[]; // string[] pour les erreurs de validation DTO
  error: string;
}
```

| Code HTTP | Cause | Action recommandée côté frontend |
|-----------|-------|----------------------------------|
| `400` | Données invalides / règle métier | Afficher `message` (peut être un tableau) |
| `401` | Token absent, expiré ou invalide | Rafraîchir le token, puis rediriger |
| `403` | Accès refusé (mauvais rôle) | Afficher "Permission insuffisante" |
| `404` | Ressource introuvable | Page 404 ou message contextuel |
| `409` | Conflit (doublon, unicité) | Ex : "Cette période est déjà payée" |
| `422` | Règle métier non respectée | Afficher l'explication dans `message` |
| `500` | Erreur serveur interne | Message générique + log Sentry/similaire |

**Wrapper utilitaire :**

```typescript
import axios from 'axios';

type ApiResult<T> = [data: T, error: null] | [data: null, error: string];

async function call<T>(fn: () => Promise<T>): Promise<ApiResult<T>> {
  try {
    return [await fn(), null];
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const serverMessage = err.response?.data?.message;
      const message = Array.isArray(serverMessage)
        ? serverMessage.join(' · ')
        : (serverMessage ?? 'Une erreur est survenue');
      return [null, message];
    }
    return [null, 'Erreur réseau ou serveur inaccessible'];
  }
}

// Utilisation
const [ticket, error] = await call(() =>
  api.post('/tickets', form).then((r) => r.data)
);

if (error) {
  toast.error(error); // Afficher via votre système de notification
} else {
  console.log('Ticket créé :', ticket);
}
```

---

## Documentation Swagger

La documentation interactive est disponible à :

```
http://localhost:3001/api/docs
```

**S'authentifier dans Swagger :**
1. Ouvrir `POST /auth/login` → cliquer **Try it out** → exécuter
2. Copier la valeur de `accessToken` dans la réponse
3. Cliquer sur le bouton **Authorize** (cadenas en haut à droite)
4. Coller le token (sans `Bearer`) → **Authorize**
5. Toutes les routes protégées sont désormais accessibles

> `persistAuthorization: true` est activé — le token est conservé entre les rechargements de page du navigateur.

---

## Scripts disponibles

```bash
# ── Développement ─────────────────────────────────────────────────────────────
npm run start:dev       # Démarrer avec hot reload
npm run start:debug     # Démarrer en mode debug
npm run start:prod      # Démarrer depuis le build compilé

# ── Build ─────────────────────────────────────────────────────────────────────
npm run build           # Compiler TypeScript → dist/

# ── Qualité ───────────────────────────────────────────────────────────────────
npm run lint            # ESLint + auto-fix
npm run format          # Prettier sur tous les fichiers

# ── Tests ─────────────────────────────────────────────────────────────────────
npm run test            # Tests unitaires
npm run test:e2e        # Tests end-to-end
npm run test:cov        # Couverture de code

# ── Prisma ────────────────────────────────────────────────────────────────────
npx prisma migrate dev                    # Appliquer les migrations existantes
npx prisma migrate dev --name <nom>       # Créer + appliquer une nouvelle migration
npx prisma generate                       # Régénérer le client Prisma
npx prisma studio                         # Interface graphique de la base de données
npx prisma db seed                        # Peupler la base (si seed configuré)
```
