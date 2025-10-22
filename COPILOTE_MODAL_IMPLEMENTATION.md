# 🎯 Copilote Modal - Implémentation

## ✨ Fonctionnalité

Quand l'utilisateur clique sur :
- **"+"** dans `/deep-courses` 
- **"Ajouter un chapitre"** dans `/deep-courses/$courseId`

Un **modal Copilote** s'affiche au centre de l'écran avec :
- ✅ Arrière-plan floutée (`blur-md brightness-75`)
- ✅ Modal centré avec largeur max `max-w-2xl` et hauteur `600px`
- ✅ Bouton fermeture [X] en haut à droite
- ✅ ChatInput en mode "deep" (couleurs grises neutres)
- ✅ Logo et titre "Copilote" avec gradient adapté

---

## 📝 Fichiers Modifiés

### 1. **`CopiloteContainer.tsx`**
```tsx
interface CopiloteContainerProps {
  className?: string
  sessionId?: string
  isCopiloteModal?: boolean      // Nouveau
  forceDeepMode?: boolean         // Nouveau - force le mode "deep"
}

// Logique de forçage
const accentKey = forceDeepMode ? "none" : (courseType === "deep" ? "none" : courseType)
const accent = useMemo(() => getCourseAccent(accentKey), [accentKey])

// Affichage
className={cn(
  "flex flex-col h-full ...",
  !isCopiloteModal && "hidden md:flex",  // Masqué sur mobile sauf si modal
  className
)}
```

### 2. **`DeepCoursesLayout.tsx`**
```tsx
// Nouvel état
const [isCopiloteModalOpen, setIsCopiloteModalOpen] = useState(false)

// Callbacks
const handleOpenCopiloteModal = () => setIsCopiloteModalOpen(true)
const handleCloseCopiloteModal = () => setIsCopiloteModalOpen(false)

// Enrichissement du config de l'ActionButton
const enrichedActionConfig = useMemo(() => {
  if (!rightActionConfig) return null
  return {
    ...rightActionConfig,
    onCreateCourse: handleOpenCopiloteModal,
    onAddChapter: handleOpenCopiloteModal,
  }
}, [rightActionConfig])

// Blur conditionnel
className={cn(
  "...",
  (drawerOpen || isCopiloteModalOpen) && "blur-md brightness-75 pointer-events-none"
)}

// Modal
<CopiloteModal
  isOpen={isCopiloteModalOpen}
  onClose={handleCloseCopiloteModal}
  sessionId={chapterId}
/>
```

### 3. **`CopiloteModal.tsx`** ✨ NOUVEAU
```tsx
// Backdrop floutée + Modal centré
<div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="relative w-full max-w-2xl h-[600px] rounded-[28px]">
    {/* Bouton X */}
    {/* CopiloteContainer avec forceDeepMode={true} */}
  </div>
</div>
```

---

## 🎨 Styling

### Modal Backdrop
- `fixed inset-0 z-40` : Couche au-dessus du contenu
- `bg-black/40` : Semi-transparent noir
- `backdrop-blur-sm` : Flou léger

### Modal Container
- `fixed inset-0 z-50` : Au-dessus du backdrop
- `flex items-center justify-center` : Centré
- `w-full max-w-2xl` : Largeur max 672px
- `h-[600px]` : Hauteur fixe

### Bouton Fermeture
- Positionné en haut à droite avec `absolute top-4 right-4 z-10`
- Blanc/gris semi-transparent : `text-white/70 hover:text-white`

### Contenu Intérieur
- `rounded-[28px]` : Coins arrondis
- Glassmorphism appliqué
- ChatInput force mode "deep" → couleurs grises

---

## 🔄 Flux d'Utilisation

```
1. Utilisateur clique sur "+" ou "Ajouter un chapitre"
   ↓
2. ActionButton appelle onCreateCourse() ou onAddChapter()
   ↓
3. handleOpenCopiloteModal() active l'état
   ↓
4. Main div s'affiche avec blur-md brightness-75
   ↓
5. CopiloteModal apparaît centré avec backdrop floutée
   ↓
6. Utilisateur voit le Copilote en mode "deep"
   ↓
7. Clique [X] ou sur le backdrop
   ↓
8. handleCloseCopiloteModal() ferme le modal
   ↓
9. Retour à la normale
```

---

## 🎯 Points Importants

✅ **Mode "deep" forcé**
- `forceDeepMode={true}` dans le CopiloteModal
- Assure une coloration neutre (grise)

✅ **Backdrop cliquable**
- `onClick={onClose}` sur le backdrop noir
- Ferme le modal facilement

✅ **Bouton X**
- Bouton Ghost blanc/gris
- Positionné en haut à droite
- Z-index plus haut que le contenu

✅ **Aria labels**
- `aria-hidden="true"` sur le backdrop
- `aria-label="Fermer le copilote"` sur le bouton

✅ **Animations**
- `transition-all duration-500` sur le blur/brightness
- `transition-opacity duration-300` sur le backdrop

---

## 📱 Responsive

Le modal fonctionne sur tous les écrans :
- **Desktop** : Affichage normal, largeur max `max-w-2xl`
- **Tablet** : Ajusté au padding `p-4`
- **Mobile** : Fullscreen avec padding léger

La classe `p-4` sur le conteneur externe gère le padding responsive.

---

## ✨ Amélioration Future

- [ ] Animation d'ouverture (scale-up, fade-in)
- [ ] Bouton "Créer" au lieu de juste chat
- [ ] Gestion du scroll body-lock
- [ ] Clavier ESC pour fermer

