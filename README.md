## Quick Start

### App

Live app (hosted frontend):
[Pixia](https://hackathon-frontend-356001158171.europe-west9.run.app/)

### Prerequisites

* **Node.js** 24+ with npm
* **Pixia Backend** — follow the installation guide at [Pixia Backend](https://github.com/Tom-dlhy/Pixia-Backend)
  The backend must be running locally at `http://localhost:8000`


### Installation

```bash
git clone https://github.com/Tom-dlhy/Pixia-Frontend.git
cd Pixia-Frontend
npm install
```

### Configuration

Create a `.env` file at the root:

```env
VITE_BACKEND_URL=http://localhost:8000/api
API_BASE=http://localhost:8000/api
```

Create a `.env.local` file at the root:

```env
VITE_BACKEND_URL=http://localhost:8000/api
```

### Run

```bash
npm run dev
```

**→ Open [http://localhost:3000](http://localhost:3000)**

## Commands

```bash
npm run dev        # Start development
npm run build      # Build for production
npm start          # Run in production
```

## Tech Stack

| Technology          |
| ------------------- |
| **React 19**        |
| **TypeScript**      |
| **TanStack Router** |
| **Vite**            |
| **TanStack Query**  |
| **Tailwind CSS**    |
| **shadcn/ui**       |
| **Framer Motion**   |
| **Zod**             |

## Links

* **Backend**: [https://github.com/Tom-dlhy/Pixia-Backend](https://github.com/Tom-dlhy/Pixia-Backend)
* **Live**: [https://hackathon-frontend-356001158171.europe-west9.run.app](https://hackathon-frontend-356001158171.europe-west9.run.app)
