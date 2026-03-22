import fs from 'node:fs/promises'
import path from 'node:path'

const targetDir = process.argv[2] || 'dist'
const root = path.resolve(process.cwd(), targetDir)

const isSrc = path.basename(root).toLowerCase() === 'src'

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(fullPath)))
    else files.push(fullPath)
  }
  return files
}

function toPosix(p) {
  return p.replaceAll('\\\\', '/')
}

function ensureDotSlash(rel) {
  if (rel.startsWith('.')) return rel
  return `./${rel}`
}

function rewriteSpec(spec, fromDir) {
  const cleaned = spec.replaceAll('\\', '/')
  if (cleaned.startsWith('@/')) {
    const specPath = cleaned.slice(2)
    const targetAbs = path.join(root, specPath)
    const rel = toPosix(ensureDotSlash(path.relative(fromDir, targetAbs)))
    return rel.replace(/\.(ts|tsx)$/i, '.js')
  }

  if (cleaned.startsWith('./') || cleaned.startsWith('../')) {
    // NodeNext best practice: author source imports as '*.js' so emitted JS runs in Node ESM.
    // When targeting src/, rewrite '*.ts'/'*.tsx' specifiers to '*.js'.
    // When targeting dist/, keep specifiers as-is unless they still end with '*.ts' (safety net).
    return cleaned.replace(/\.(ts|tsx)$/i, '.js')
  }

  return cleaned
}

function rewriteCode(code, fromDir) {
  let updated = code
  let changed = 0

  updated = updated.replace(/\b(from\s+)(['"])([^'\"]+)\2/g, (_m, p1, q, spec) => {
    const next = rewriteSpec(spec, fromDir)
    if (next !== spec) changed += 1
    return `${p1}${q}${next}${q}`
  })

  updated = updated.replace(/\b(import\s*\(\s*)(['"])([^'\"]+)\2(\s*\))/g, (_m, p1, q, spec, p4) => {
    const next = rewriteSpec(spec, fromDir)
    if (next !== spec) changed += 1
    return `${p1}${q}${next}${q}${p4}`
  })

  return { updated, changed }
}

const files = (await walk(root)).filter((f) => {
  if (isSrc) return f.endsWith('.ts') || f.endsWith('.tsx')
  return f.endsWith('.js') || f.endsWith('.mjs')
})
let touchedFiles = 0
let totalRewrites = 0

for (const filePath of files) {
  const code = await fs.readFile(filePath, 'utf8')
  // Always process files to normalize @ aliases and backslashes.

  const fromDir = path.dirname(filePath)
  const { updated, changed } = rewriteCode(code, fromDir)

  if (changed > 0 && updated !== code) {
    await fs.writeFile(filePath, updated, 'utf8')
    touchedFiles += 1
    totalRewrites += changed
  }
}

console.log(`Rewrote ${totalRewrites} import specifier(s) across ${touchedFiles} file(s) in '${targetDir}'.`)
