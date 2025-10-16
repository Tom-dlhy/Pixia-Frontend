export function getGradientClasses(isDark: boolean): string {
  return isDark
    ? "bg-gradient-to-br from-slate-800 via-black to-slate-800"
    : "bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200"
}
