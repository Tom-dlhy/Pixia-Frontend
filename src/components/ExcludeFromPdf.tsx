/**
 * Composant wrapper pour exclure certains éléments du PDF
 * Ajouter la classe "exclude-from-pdf" à un élément pour l'exclure de l'export
 */
export function ExcludeFromPdf({ children }: { children: React.ReactNode }) {
  return <div className="exclude-from-pdf">{children}</div>
}
