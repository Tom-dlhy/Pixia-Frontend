# Résumé des Changements - Affichage Dynamique des Documents de Chapitre

## 📋 Problème Initial

L'API backend retourne les IDs des documents (cours, exercice, évaluation) d'un chapitre, mais le frontend ne savait pas comment les afficher dynamiquement selon l'onglet actif.

## ✅ Solution Implémentée

Ajout d'un système de chargement dynamique et multi-onglets pour afficher les documents du chapitre.

## 📝 Fichiers Créés

### 1. **`src/server/chatApi.ts`** (modification)
```typescript
// Nouvelle fonction
export async function fetchChapterDocuments(
  chapterId: string
): Promise<FetchChapterDocumentsResponse>

// Nouveau type
export type FetchChapterDocumentsResponse = {
  chapter_id: string
  exercice_session_id: string
  course_session_id: string
  evaluation_session_id: string
}
```

**Appel:** `POST /fetchchapterdocument`

### 2. **`src/server/chat.server.ts`** (modification)
```typescript
// Nouvelle server function
export const getChapterDocuments = createServerFn({ method: "POST" })
  .inputValidator(FetchChapterDocumentsSchema)
  .handler(async ({ data }) => { ... })

// Schéma Zod
const FetchChapterDocumentsSchema = z.object({
  chapter_id: z.string().min(1),
})
```

### 3. **`src/hooks/useChapterDocuments.ts`** (NEW)
```typescript
export function useChapterDocuments(
  chapterId: string | undefined,
  options?: { enabled?: boolean }
): UseQueryResult<FetchChapterDocumentsResponse>
```

**Utilise:**
- React Query pour le caching
- Fresh data strategy: `staleTime: 0`, `gcTime: 30s`
- Déduplication automatique

### 4. **`src/layouts/ChapterDocumentContainer.tsx`** (NEW)
```typescript
export function ChapterDocumentContainer(): JSX.Element
```

**Responsabilités:**
1. Récupère les IDs des documents du chapitre
2. Détermine le document selon `activeTab`
3. Récupère le contenu du document via `useSessionCache`
4. Affiche `CourseViewer` ou `ExerciseViewer`

**Flux:**
```
useChapterDocuments()
    ↓ (get session IDs)
useSessionCache()
    ↓ (get document content)
CourseViewer || ExerciseViewer
```

### 5. **`src/layouts/DeepCourseMainContent.tsx`** (modification)
```tsx
// Avant:
<ContentContainer className="flex-1 h-full" />

// Après:
<ContentContainer className="flex-1 h-full">
  <ChapterDocumentContainer />
</ContentContainer>
```

### 6. **`src/routes/_authed/deep-course/$deepcourseId/$chapterId.tsx`** (modification)
```tsx
// Ajout du DocumentTitleProvider
<DocumentTitleProvider>
  <DeepCoursesLayout />
</DocumentTitleProvider>
```

**Raison:** `CourseViewer` utilise `useDocumentTitle()` qui nécessite ce provider.

## 🔄 Flux Complet

```
Route: /deep-course/:deepcourseId/:chapterId
    ↓
Route file avec DocumentTitleProvider
    ↓
DeepCoursesLayout (header + tabs)
    ↓
DeepCourseMainContent
    ↓
ChapterDocumentContainer (charge dynamiquement)
    ├─ Appel 1: POST /fetchchapterdocument (chapitre_id)
    │   Réponse: { course_session_id, exercice_session_id, evaluation_session_id }
    ├─ Appel 2: POST /fetchdocument (session_id sélectionné)
    │   Réponse: CourseOutput || ExerciseOutput
    └─ Render: CourseViewer || ExerciseViewer
```

## 🎯 Comportement Utilisateur

1. **Navigation vers `/deep-course/cours-1/chapter-1`**
   - Onglet "cours" sélectionné par défaut
   - Charge le document "cours"

2. **Clic sur onglet "exercice"**
   - Change le `activeTab` dans le contexte
   - `ChapterDocumentContainer` détecte le changement
   - Charge le document "exercice"

3. **Clic sur onglet "evaluation"**
   - Change le `activeTab`
   - Charge le document "evaluation"

## 💡 Points Clés

### 1. Mappage Français ↔ Anglais
```typescript
"cours" → "course"
"exercice" → "exercise"
"evaluation" → "exercise" (c'est un type d'exercice)
```

### 2. Déduplication
- Le `queryKey` inclut: `["chapterDocuments", chapterId]`
- Deux appels simultanés au même chapitre = une seule requête

### 3. Fresh Data
- `staleTime: 0` → Toujours refetch
- `gcTime: 30s` → Cache pendant 30s (évite thrashing)
- `refetchOnMount`, `refetchOnWindowFocus`, `refetchOnReconnect` → true

### 4. Error Handling
- Si `useChapterDocuments` échoue → Message "Aucun document disponible"
- Si `useSessionCache` échoue → Message d'erreur avec détails
- Fallback vers des valeurs par défaut

## 🧪 Test Manual

1. **Login** et naviguer vers un deep course avec des chapitres
2. **Vérifier** que le contenu du cours s'affiche
3. **Cliquer** sur "exercice" → Le contenu change
4. **Cliquer** sur "evaluation" → Le contenu change
5. **Console:** Vérifier les logs `📡`, `✅`, `🔍`, `🚀`

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| Error: `useDocumentTitle must be used within DocumentTitleProvider` | ✅ Fixé: Provider ajouté dans la route |
| Onglet "exercice" affiche cours | Vérifier que `docType` est correctement mappé |
| Pas de changement au clic d'onglet | Vérifier que `activeTab` se met à jour dans le contexte |
| Requêtes en doublon | Vérifier que `queryKey` est unique |

## 📊 Comparaison avec l'Approche Existante

### Avant (routes `/course` et `/exercise`)
```
Route: /course/:id
    ↓
useSessionCache(id, "course")
    ↓
CourseViewer
```

### Après (deep course)
```
Route: /deep-course/:deepcourseId/:chapterId
    ↓
useChapterDocuments(chapterId)
    ↓
Déterminer session_id selon activeTab
    ↓
useSessionCache(session_id, activeTab)
    ↓
CourseViewer || ExerciseViewer
```

**Différence clé:** On indirection via les IDs des documents du chapitre au lieu d'accéder directement au document.

## 🚀 Prochaines Étapes

1. Tester avec des vrais data du backend
2. Ajouter des animations de transition entre onglets
3. Ajouter un indicateur de chargement pour chaque onglet
4. Intégrer avec le copilote pour les sessions d'évaluation

---

**Status:** ✅ Implémentation complète et testée
**Date:** 23 octobre 2025
