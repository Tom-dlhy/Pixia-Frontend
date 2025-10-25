import type { CourseType } from "~/context/CourseTypeContext"

export type CourseAccent = {
	gradient: string
	glow: string
	accent: string
	accentMuted: string
}

const DEFAULT_ACCENT: CourseAccent = {
	gradient:
		"linear-gradient(135deg, rgba(148,163,184,0.85) 0%, rgba(71,85,105,0.95) 45%, rgba(30,41,59,0.92) 100%)",
	glow: "0 0 46px rgba(148,163,184,0.25)",
	accent: "#94a3b8",
	accentMuted: "rgba(148,163,184,0.16)",
}

const ACCENTS: Record<CourseType, CourseAccent> = {
	none: DEFAULT_ACCENT,
	exercice: {
		gradient:
			"linear-gradient(130deg, rgba(59,130,246,0.95) 0%, rgba(14,116,144,0.9) 40%, rgba(59,130,246,0.92) 100%)",
		glow: "0 0 48px rgba(37, 100, 235, 0.1)",
		accent: "#3b82f6",
		accentMuted: "rgba(59,130,246,0.15)",
	},
	cours: {
		gradient:
		"linear-gradient(130deg, #5ef1c2 0%, #34e7a6 25%, #1de9b6 60%, #00c4b4 100%)",
		glow: "0 0 48px rgba(0,196,180,0.25)",
		accent: "#1de9b6",
		accentMuted: "rgba(0,196,180,0.15)",
	},
	deep: {
		gradient:
		"linear-gradient(130deg, rgba(139,92,246,0.95) 0%, rgba(167,139,250,0.9) 40%, rgba(196,181,253,0.9) 100%)",
		glow: "0 0 48px rgba(139,92,246,0.25)",
		accent: "#8b5cf6",
		accentMuted: "rgba(139,92,246,0.18)",
	},
}

export function getCourseAccent(type: CourseType | undefined): CourseAccent {
	if (!type) return DEFAULT_ACCENT
	return ACCENTS[type] ?? DEFAULT_ACCENT
}
