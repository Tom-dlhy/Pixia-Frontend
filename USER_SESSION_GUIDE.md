# 🔐 Guide Complet: Récupérer les Variables du User après Login

## 📊 Architecture Globale

```
Backend API (/login)
    ↓
    Returns: LoginResponse { user_id, email, nom, notion_token, study }
    ↓
Login.tsx (applyAuthResult)
    ↓
    Stocke dans localStorage + UserSession
    ↓
SessionProvider (useAppSession)
    ↓
N'importe quel composant peut utiliser: const { session } = useAppSession()
```

## 1️⃣ Backend Retourne (FastAPI)

```python
return LoginResponse(
    existing_user=bool(user),
    user_id=(user["google_sub"] if user else None),  # ← user_id
    email=(user["email"] if user else None),          # ← email
    nom=(user["name"] if user else None),             # ← nom
    notion_token=(user["notion_token"] if user else None),  # ← notion_token
    study=(user["study"] if user else None),          # ← study
)
```

## 2️⃣ Frontend TypeScript: types/login.ts

```typescript
// src/server/login.ts
export type SendLoginResponse = {
  existing_user: boolean
  email?: string
  user_id?: string
  nom?: string                    // ← NOM
  notion_token?: string           // ← NOTION TOKEN
  study?: string                  # ← STUDY
}
```

## 3️⃣ Login Component: src/components/Login.tsx

```typescript
const loginMutation = useMutation<LoginRequest, LoginResponse>({
  fn: async (data) => { ... },
  onSuccess: async ({ data }) => {
    // data = réponse du backend
    console.log(data.nom)           // ← Accéder au NOM
    console.log(data.notion_token)  // ← Accéder au TOKEN
    console.log(data.study)         // ← Accéder à l'ÉTUDE

    applyAuthResult(
      {
        success: true,
        email: data.email ?? null,
        user_id: userId,
        nom: data.nom ?? null,              // ← STOCKER NOM
        notion_token: data.notion_token ?? null,  // ← STOCKER TOKEN
        study: data.study ?? null,          # ← STOCKER STUDY
      },
      setSession,
    )
  }
})
```

## 4️⃣ Stocker dans localStorage: src/utils/auth-client.ts

```typescript
export type StoredProfile = {
  email?: string | null
  userId?: string | number | null
  name?: string | null              // ← NOM stocké
  notionToken?: string | null       // ← TOKEN stocké
  study?: string | null             // ← STUDY stocké
}

export const applyAuthResult = (result, setSession) => {
  const profile: StoredProfile = {
    email: result.email ?? null,
    userId: result.user_id ?? null,
    name: result.name ?? null,              // ← STOCKER
    notionToken: result.notion_token ?? null,  // ← STOCKER
    study: result.study ?? null,            # ← STOCKER
  }

  // ✅ Sauvegarde dans localStorage
  persistProfile(profile)

  // ✅ Met à jour le context React
  setSession((prev) => ({
    ...prev,
    name: profile.name ?? prev.name ?? null,
    notionToken: profile.notionToken ?? prev.notionToken ?? null,
    study: profile.study ?? prev.study ?? null,
  }))
}
```

## 5️⃣ SessionProvider: src/utils/session.ts

```typescript
export type UserSession = {
  userEmail?: string | null
  userId?: string | number | null
  name?: string | null              // ← NOM
  notionToken?: string | null       // ← NOTION TOKEN
  study?: string | null             # ← STUDY
  isLoggedIn?: boolean
}
```

## 6️⃣ Utiliser dans N'importe quel Composant

```typescript
import { useAppSession } from "~/utils/session"

export function MyComponent() {
  const { session } = useAppSession()

  return (
    <div>
      <p>Email: {session.userEmail}</p>
      <p>Nom: {session.name}</p>                    {/* ← NOM */}
      <p>Notion Token: {session.notionToken}</p>    {/* ← TOKEN */}
      <p>Study: {session.study}</p>                 {/* ← ÉTUDE */}
    </div>
  )
}
```

## 📝 Correspondance Backend → Frontend

| Backend (FastAPI) | Frontend Type | Stocké Comme | Accès |
|-------------------|---------------|--------------|-------|
| `user["google_sub"]` | `user_id` | `userId` | `session.userId` |
| `user["email"]` | `email` | `userEmail` | `session.userEmail` |
| `user["name"]` | `nom` | `name` | `session.name` |
| `user["notion_token"]` | `notion_token` | `notionToken` | `session.notionToken` |
| `user["study"]` | `study` | `study` | `session.study` |

## 🔄 Exemple Complet: Utiliser le Notion Token

```typescript
// Dans n'importe quel composant:
import { useAppSession } from "~/utils/session"

export function NotionIntegration() {
  const { session } = useAppSession()

  const handleSyncNotation = async () => {
    const token = session.notionToken

    if (!token) {
      console.error("❌ No Notion token available")
      return
    }

    // Utiliser le token pour appeler l'API Notion
    const response = await fetch("https://api.notion.com/v1/databases", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    })

    const data = await response.json()
    console.log("📚 Notion databases:", data)
  }

  return (
    <div>
      <p>Utilisateur: {session.name}</p>
      <p>Token valide: {session.notionToken ? '✅ Yes' : '❌ No'}</p>
      <button onClick={handleSyncNotation}>
        Sync avec Notion
      </button>
    </div>
  )
}
```

## ✅ Checklist

- [x] Backend retourne `nom`, `notion_token`, `study`
- [x] Types TypeScript incluent ces champs
- [x] `applyAuthResult` stocke ces valeurs
- [x] `UserSession` a les champs `name`, `notionToken`, `study`
- [x] Composants peuvent utiliser `useAppSession()` pour accéder

## ⚠️ Pièges Courants

### 1. Typo: `nom` vs `name`
```typescript
// ❌ MAUVAIS
session.nom  // undefined

// ✅ BON
session.name  // ✅ C'est "name" en React, pas "nom"
```

### 2. Token non persisté
```typescript
// ❌ Si tu oublies dans applyAuthResult
notion_token: result.notion_token ?? null,  // ← oublie ceci

// Le token ne sera pas stocké et perdu au refresh!
```

### 3. Accéder avant login
```typescript
// ❌ AVANT login
session.notionToken  // null ou undefined

// ✅ APRÈS login
session.notionToken  // "abc123..."
```

## 🚀 Conclusion

Résumé du flux:
1. **Backend** envoie: `LoginResponse` avec `user_id`, `email`, `nom`, `notion_token`, `study`
2. **Frontend** reçoit et appelle `applyAuthResult()`
3. `applyAuthResult()` stocke dans `localStorage` ET met à jour le context
4. **N'importe quel composant** utilise `useAppSession()` pour accéder

C'est tout! 🎉
