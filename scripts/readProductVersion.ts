import { readFileSync } from 'node:fs'

/** Debe coincidir con `**Versión vigente del software:** \`vX.Y\`` en `backend/CHANGELOG.md`. */
const VIGENTE_RE =
  /\*\*Versión vigente del software:\*\*\s*`(v\d+\.\d+)`/m

export function readProductVersionFromChangelog(changelogPath: string): string {
  const text = readFileSync(changelogPath, 'utf-8')
  const m = text.match(VIGENTE_RE)
  if (!m) {
    throw new Error(
      `CHANGELOG: falta "**Versión vigente del software:** \`vX.Y\`" (formato sección 3) en ${changelogPath}`,
    )
  }
  return m[1]
}
