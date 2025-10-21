# 📝 Support Markdown dans l'Export PDF

## 🎯 Vue d'ensemble

Le système d'export PDF supporte maintenant le **Markdown** avec toute sa mise en forme:

- ✅ **Titres** (`#`, `##`, `###`, etc.)
- ✅ **Gras** (`**texte**`)
- ✅ **Italique** (`*texte*`)
- ✅ **Code inline et blocs** (`` ` `` et ` ``` `)
- ✅ **Listes** (`-`, `*`, `+`, ou numérotées)
- ✅ **Citations** (`>`)
- ✅ **Sauts de ligne** (`\n`)

## 🔄 Comment ça fonctionne

### 1. Détection automatique
La fonction `isMarkdown()` détecte si le contenu est du Markdown ou du texte brut:

```typescript
isMarkdown(content) → true/false
```

### 2. Parsing
Si c'est du Markdown, `parseMarkdown()` l'analyse et crée une structure:

```typescript
const elements = parseMarkdown(markdown)
// Retourne: [{ type: 'heading', level: 2, content: 'Titre' }, ...]
```

### 3. Rendu en PDF
`applyMarkdownFormatting()` rend chaque élément avec sa mise en forme:

```typescript
yPos = applyMarkdownFormatting(pdf, content, margin, yPos, contentWidth)
```

## 📊 Exemples de rendu

### Markdown
```markdown
# Titre Principal

Ceci est un **paragraphe en gras** et voici du *texte en italique*.

## Sous-titre

### Code example
```python
def hello():
    print("Hello, World!")
```

## Listes

- Premier item
- Deuxième item
  - Sous-item

### Citation
> Ceci est une citation avec une bordure gauche
```

### PDF Rendu
```
┌─────────────────────────────────┐
│  Titre Principal                │  (grand, gras)
│                                 │
│ Ceci est un paragraphe en gras  │  (normal avec gras)
│ et voici du texte en italique.  │  (et italique)
│                                 │
│  Sous-titre                     │  (moyen, gras)
│                                 │
│  ### Code example               │  (petit, gras)
│ ┌─────────────────────────────┐ │
│ │ def hello():                │ │  (fond gris)
│ │     print("Hello...")       │ │  (police monospace)
│ └─────────────────────────────┘ │
│                                 │
│  Listes                         │
│  • Premier item                 │  (puce)
│  • Deuxième item                │
│    • Sous-item                  │  (indentation)
│                                 │
│  Citation                       │
│ │ Ceci est une citation ...    │  (bordure gauche grise)
└─────────────────────────────────┘
```

## 🎨 Styles appliqués

| Élément | Style | Couleur |
|---------|-------|---------|
| Heading 1 | 18px, gras | Noir |
| Heading 2 | 16px, gras | Noir |
| Heading 3+ | 14px, gras | Noir |
| Paragraph | 11px, normal | Noir |
| Code | 9px, monospace | Noir sur gris clair |
| Blockquote | 10px, italique | Gris + bordure gauche |
| List items | 11px, normal | Noir avec puces |

## 🔧 Fonctions disponibles

### `isMarkdown(text: string): boolean`
Détecte si le texte contient de la syntaxe Markdown.

```typescript
isMarkdown("# Hello\nCeci est du **gras**") // true
isMarkdown("Texte simple") // false
```

### `parseMarkdown(markdown: string): Array<...>`
Parse le Markdown et retourne une structure d'éléments.

```typescript
parseMarkdown("# Titre\nParagraphe")
// Retourne:
// [
//   { type: 'heading', level: 1, content: 'Titre' },
//   { type: 'paragraph', content: 'Paragraphe' }
// ]
```

### `applyMarkdownFormatting(pdf, text, xPos, yPos, maxWidth): number`
Rend le Markdown formaté dans le PDF et retourne la nouvelle position Y.

```typescript
let yPos = margin
yPos = applyMarkdownFormatting(pdf, courseContent, margin, yPos, contentWidth)
```

## 📋 Format Markdown supporté

### Titres
```markdown
# H1 (niveau 1)
## H2 (niveau 2)
### H3 (niveau 3)
#### H4 (niveau 4)
##### H5 (niveau 5)
###### H6 (niveau 6)
```

### Mise en forme du texte
```markdown
**gras** ou __gras__
*italique* ou _italique_
`code inline`
```

### Blocs de code
````markdown
```python
def example():
    pass
```
````

### Listes non-ordonnées
```markdown
- Item 1
* Item 2
+ Item 3
```

### Listes ordonnées
```markdown
1. Premier
2. Deuxième
3. Troisième
```

### Citations
```markdown
> Citation sur une ligne
> Continuation de la citation
```

### Sauts de ligne
```markdown
Ligne 1

Ligne 2 (après une ligne vide)
```

## ⚠️ Limitations actuelles

- ❌ Pas de support pour les tables Markdown
- ❌ Pas d'images dans le PDF (juste du texte)
- ❌ Pas de support des listes imbriquées complexes
- ❌ Pas de support HTML mixte avec Markdown

## 🚀 Comment améliorer

Si vous voulez ajouter du support pour des éléments supplémentaires:

1. **Ajouter un cas dans `parseMarkdown()`** pour détecter le pattern
2. **Créer un rendu dans `applyMarkdownFormatting()`** avec le style approprié
3. **Tester avec des exemples** dans votre PDF

Exemple:

```typescript
// Dans parseMarkdown()
if (line.startsWith('---')) {
  elements.push({ type: 'separator', content: '', raw: line })
  i++
  continue
}

// Dans applyMarkdownFormatting()
case 'separator':
  pdf.setDrawColor(200, 200, 200)
  pdf.line(xPos, currentY, xPos + maxWidth, currentY)
  currentY += 8
  break
```

## 🧪 Test

Pour tester le support Markdown, créez un cours avec du contenu Markdown:

```markdown
# Introduction au Machine Learning

Le **machine learning** est une branche de l'IA...

## Concepts clés

- *Dataset* : données d'entraînement
- *Modèle* : fonction d'apprentissage
- *Loss* : fonction de coût

### Code exemple

```python
from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X, y)
```

Cet exemple montre comment...

> **Note**: C'est important!
```

Puis exportez en PDF pour voir le rendu formaté! 📄
