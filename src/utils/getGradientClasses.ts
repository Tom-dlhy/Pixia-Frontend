export function getGradientClasses(isDark: boolean): string {
  return isDark
    ? "bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-900"
    : "bg-gradient-to-br from-gray-200 via-gray-200 to-gray-200"
}
