## Démarrage rapide

### Prérequis

- **Node.js** 24+ avec npm
- **Backend Pixia** sur `http://localhost:8000`

### Installation

```bash
git clone https://github.com/Tom-dlhy/Pixia-Frontend.git
cd Pixia-Frontend
npm install
```

### Configuration

Crée un `.env` à la racine :

```env
VITE_BACKEND_URL=http://localhost:8000/api
API_BASE=http://localhost:8000/api
```

Crée un `.env.local` à la racine :

```env
VITE_BACKEND_URL=http://localhost:8000/api
```

### Lancer

```bash
npm run dev
```

**→ Ouvre http://localhost:3000**

## Commandes

```bash
npm run dev        # Démarrer le dev
npm run build      # Build pour la prod
npm start          # Lancer la prod
```

## Tech Stack

| Technologie |
|-------------|
| **React 19** |
| **TypeScript** |
| **TanStack Router** |
| **Vite** |
| **TanStack Query** |
| **Tailwind CSS** |
| **shadcn/ui** |
| **Framer Motion** |
| **Zod** |

## 🔗 Liens

- **Backend** : https://github.com/Tom-dlhy/Pixia-Backend
- **Live** : https://hackathon-frontend-356001158171.europe-west9.run.app
