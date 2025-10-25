"use client"

import { useRef, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { Mail, FileText, Database, HardDrive, Menu } from "lucide-react"
import { useCourseType } from "~/context/CourseTypeContext"
import { usePdfExport } from "~/hooks/usePdfExport"
import { useDocumentTitle } from "~/context/DocumentTitleContext"
import { useCourseContent } from "~/context/CourseContentContext"
import { generatePdfFromCourseData } from "~/utils/generatePdfFromCourseData"
import { cn } from "~/lib/utils"

export interface ChatActionButtonProps {
  contentRef?: React.RefObject<HTMLDivElement | null>
}

export function ChatActionButton({ contentRef }: ChatActionButtonProps) {
  const { courseType } = useCourseType()
  const { title: documentTitle } = useDocumentTitle()
  const { course } = useCourseContent()
  const { exportToPdf } = usePdfExport()

  // Ne pas afficher le bouton si ce n'est pas un cours
  if (courseType === 'exercice' || courseType === 'deep') {
    return null
  }

  // Récupérer la référence au contenu depuis le DOM
  const handleExportPdf = async () => {
    // Vérifier si on a les données du cours
    if (!course) {
      console.error('❌ [ChatActionButton] Course data not available')
      return
    }

    console.log('✅ [ChatActionButton] Generating PDF from course data...')

    const filename = `${documentTitle || 'export'}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`
    
    // Utiliser la nouvelle fonction avec données structurées
    await generatePdfFromCourseData(course, filename)
  }

  // Palette d'accents cohérente avec ton style global
  const accentMap: Record<string, { light: string; dark: string }> = {
    none: { light: "rgba(209,213,219,0.3)", dark: "rgba(82,82,91,0.25)" },
    cours: { light: "rgba(167,243,208,0.25)", dark: "rgba(16,185,129,0.25)" },
    exercice: { light: "rgba(147,197,253,0.25)", dark: "rgba(56,189,248,0.25)" },
    deep: { light: "rgba(203,213,225,0.25)", dark: "rgba(71,85,105,0.25)" },
  }

  const accent = accentMap[courseType] ?? accentMap["none"]

  return (
    <DropdownMenu>
      {/* ——— MAIN BUTTON ——— */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "flex items-center gap-2 rounded-md cursor-pointer transition-all duration-300 text-foreground",
            "border border-white/30 dark:border-white/10 backdrop-blur-md backdrop-saturate-150",
            "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(24,24,27,0.35)]",
            "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.1)]",
            "hover:scale-[1.03]"
          )}
          style={{
            background: `linear-gradient(135deg, ${accent.light}, transparent 80%)`,
          }}
        >
          <Menu className="h-4 w-4 opacity-90" />
        </Button>
      </DropdownMenuTrigger>

      {/* ——— MENU CONTENT ——— */}
      <DropdownMenuContent
        className={cn(
          "min-w-56 rounded-xl border border-white/20 dark:border-white/10 p-2",
          "backdrop-blur-xl backdrop-saturate-150",
          "bg-[rgba(255,255,255,0.2)] dark:bg-[rgba(24,24,27,0.4)]",
          "shadow-[inset_0_1px_3px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.25)]"
        )}
        side="bottom"
        align="end"
        sideOffset={8}
      >
        {[
          {
            label: "Envoyer par mail",
            icon: Mail,
            action: () => console.log("Envoyer par mail"),
          },
          {
            label: "Enregistrer dans Notion",
            icon: Database,
            action: () => console.log("Enregistrer dans Notion"),
          },
          {
            label: "Enregistrer sur Drive",
            icon: HardDrive,
            action: () => console.log("Enregistrer sur Drive"),
          },
          {
            label: "Enregistrer en PDF",
            icon: FileText,
            action: handleExportPdf,
          },
        ].map(({ label, icon: Icon, action }, idx, arr) => (
          <div key={label}>
            {/* ——— ITEM BUTTON ——— */}
            <Button
              variant="ghost"
              onClick={action}
              className={cn(
                "w-full justify-start gap-2 text-foreground rounded-md transition-all duration-300",
                "border border-transparent",
                "hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.1)]"
              )}
              style={{
                // Hover glassmorphique dynamique selon le type
                background: `linear-gradient(135deg, transparent, transparent)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${accent.light}, ${accent.dark})`
                e.currentTarget.style.backdropFilter = "blur(16px) saturate(150%)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, transparent, transparent)`
                e.currentTarget.style.backdropFilter = "blur(10px) saturate(100%)"
              }}
            >
              <Icon className="h-4 w-4 opacity-80" />
              {label}
            </Button>

            {idx < arr.length - 1 && (
              <DropdownMenuSeparator className="my-1 opacity-20" />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
