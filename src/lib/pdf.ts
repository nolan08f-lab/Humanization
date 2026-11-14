export type ExtractedPdf = {
  name: string
  size: number
  pages: number
  text: string
}

/** Extrait le texte d'un PDF entièrement dans le navigateur (aucun envoi du fichier). */
export async function extractPdfText(file: File): Promise<ExtractedPdf> {
  const pdfjs = await import("pdfjs-dist")
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const data = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data })
  const doc = await task.promise
  const pages: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    let line = ""
    const lines: string[] = []
    for (const item of content.items) {
      if (!("str" in item)) continue
      line += item.str
      if (item.hasEOL) {
        lines.push(line)
        line = ""
      }
    }
    if (line) lines.push(line)
    pages.push(
      lines
        .join("\n")
        // recolle les lignes coupées à l'intérieur d'un paragraphe
        .replace(/([^\n.!?:;])\n(?=[a-zà-ÿ0-9(])/g, "$1 ")
        .replace(/[ \t]+/g, " ")
        .trim(),
    )
  }
  await task.destroy()

  return {
    name: file.name,
    size: file.size,
    pages: pages.length,
    text: pages.filter(Boolean).join("\n\n").trim(),
  }
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}
