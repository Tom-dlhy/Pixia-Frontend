# 🔄 Fresh Data Migration Guide

## 📋 Résumé des Changements

Tu as demandé du **fresh data** à chaque changement de page/session tout en évitant les requêtes en doublons. Voici ce qui a changé:

### 1. **QueryProvider.tsx** - Configuration globale du cache
```typescript
staleTime: 0                    // ✅ Data TOUJOURS considérée "stale"
gcTime: 30 * 1000             // ✅ Garde en cache 30s pour éviter doublons en vol
refetchOnWindowFocus: true     // ✅ Refetch au focus
refetchOnMount: true           // ✅ Refetch au montage du composant
refetchOnReconnect: true       // ✅ Refetch à la reconnexion
```

**Effet**: Chaque fois que tu navigues vers une page ou que tu changes de session, les données sont re-fetchées du backend. Si deux requêtes pour la même clé sont en vol simultanément, elles sont dédupliquées (grâce au queryKey).

### 2. **useSessionCache.ts** - Cache pour une session
- ✅ Utilise maintenant les defaults du QueryProvider
- ✅ Refetch automatique quand `sessionId` change
- ✅ Refetch automatique au montage d'une page

### 3. **useListCache.ts** - Caches pour listes
- ✅ `useAllChatSessions` : Refetch quand on monte une page
- ✅ `useAllDeepCourses` : Refetch quand on monte une page
- Toutes les deux utilisent les defaults du QueryProvider

### 4. **useSendChatWithRefresh.ts** - ✨ Nouveau Hook
Wrapper autour de `sendChatMessage` qui:
1. Envoie le message au backend
2. ✅ Invalide le cache `sessionCache[sessionId]` pour forcer un refetch
3. ✅ Invalide le cache `allChatSessions[userId]` (nouvelle session créée?)
4. Appelle un callback optionnel `onSuccess`

**Usage**:
```tsx
const { send: sendChatWithRefresh } = useSendChatWithRefresh()

const res = await sendChatWithRefresh({
  user_id: userId,
  message: "Hello",
  sessionId: "123",
  // ... other params
})

// Les messages sont automatiquement refetchés après!
```

### 5. **Fichiers Modifiés**
✅ `src/layouts/CopiloteContainer.tsx` - Utilise `useSendChatWithRefresh`
✅ `src/routes/_authed/chat/$id.tsx` - Utilise `useSendChatWithRefresh`
✅ `src/routes/_authed/chat/index.tsx` - Utilise `useSendChatWithRefresh`

---

## 🎯 Avantages de cette Approche

| Aspect | Avant | Après |
|--------|-------|-------|
| **Fraîcheur des données** | Cache 5min | ✅ Always fresh |
| **Doublons en vol** | ❌ Possible | ✅ Éliminés (queryKey) |
| **Refetch au changement de page** | ❌ Non | ✅ Oui |
| **Refetch au focus** | ❌ Non | ✅ Oui |
| **Refetch après mutation** | ❌ Manuel | ✅ Auto (useSendChatWithRefresh) |

---

## ⚠️ Pièges à Éviter

### 1. **Boucles infinies - useEffect dépendances**
Si tu vois des refetch infinis, cherche les useEffect avec des dépendances manquantes.

**Mauvais:**
```tsx
useEffect(() => {
  fetchData()
  // Pas de dépendances!
}, []) // ❌ Re-exécuté à chaque render
```

**Bon:**
```tsx
useEffect(() => {
  fetchData(sessionId)
}, [sessionId]) // ✅ Only refetch if sessionId changes
```

### 2. **useChatWithDocument (ancien hook)**
Ce hook EXISTE TOUJOURS mais n'est PAS recommandé car il fait du caching interne.
Préfère utiliser `useSessionCache` directement.

### 3. **Appels directs au backend**
Évite:
```tsx
const data = await getChat(...) // ❌ Pas de cache
```

Préfère:
```tsx
const { data } = useSessionCache(...) // ✅ Avec cache + refetch auto
```

---

## 🔍 Debugging

### Voir les requêtes en cours
```
📡 [useSessionCache] Fetching...
🚀 [useSendChatWithRefresh] Invalidating cache...
```

### Vérifier le cache React Query
```
// Dans la console du navigateur:
window.__TANSTACK_DEVTOOLS__?.open()
```

---

## 📊 Flux de Données

```
┌─────────────────────────────────────────┐
│  User navigates to /exercise/123        │
└────────────────┬────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ useSessionCache mounts    │
    │ staleTime: 0              │
    └────────────┬─────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ componentDidMount()       │
    │ refetchOnMount: true      │
    │ ✅ Fetch fresh data       │
    └────────────┬─────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ User types message        │
    └────────────┬─────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ useSendChatWithRefresh()  │
    │ • Send message to API     │
    │ • invalidateQueries()     │
    │ ✅ Auto refetch messages  │
    └────────────┬─────────────┘
                 │
                 ▼
    ┌──────────────────────────┐
    │ Messages updated!         │
    │ (via auto refetch)        │
    └──────────────────────────┘
```

---

## 🚀 Performance Notes

- **staleTime: 0** = Chaque composant qui monte fetch ses données
  - ✅ Toujours à jour
  - ⚠️ Peut être trop agressif si tu as 10 composants qui requête la même chose
  - 🛡️ MAIS: `queryKey` déduplique les requêtes en vol!

- **gcTime: 30s** = 30 secondes de cache pour éviter les doublons
  - Si deux composants font la même requête <30s d'intervalle = dédupliquée
  - Après 30s, la donnée est oubliée du cache

---

## ✅ Checklist

- [x] QueryProvider: `staleTime: 0`, `gcTime: 30s`, `refetch*: true`
- [x] useSessionCache: Utilise defaults
- [x] useListCache: Utilise defaults
- [x] useSendChatWithRefresh: Created ✨
- [x] CopiloteContainer: Updated
- [x] Chat routes: Updated
- [ ] Test avec la UI!

---

## 🎓 Ressources

- React Query Docs: https://tanstack.com/query/latest
- queryKey Best Practices: https://tanstack.com/query/latest/docs/guides/important-defaults
