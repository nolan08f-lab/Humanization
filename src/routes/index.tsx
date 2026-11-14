import { createFileRoute } from "@tanstack/react-router"
import { ToolProvider } from "@/components/tool/tool-context"
import { ToolCard } from "@/components/tool/tool-card"
import { Navbar } from "@/components/site/navbar"
import { PdfStory } from "@/components/site/pdf-story"
import { Cta, Faq, Features, Footer, Hero, Marquee, useReveal } from "@/components/site/sections"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  useReveal()
  return (
    <ToolProvider>
      <div id="top" className="relative min-h-screen">
        {/* quadrillage + halos de fond */}
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none fixed top-0 left-1/2 h-[300px] w-[95vw] max-w-xs -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-400 to-indigo-600 opacity-20 blur-3xl sm:left-1/2 sm:ml-[-38%] sm:h-[800px] sm:w-[600px] sm:max-w-none" />
        <div className="pointer-events-none fixed bottom-1/4 left-1/2 h-[200px] w-[95vw] max-w-xs -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-400 opacity-20 blur-3xl sm:left-1/2 sm:ml-[-17%] sm:h-[600px] sm:w-[400px] sm:max-w-none" />

        <Navbar />
        <main className="relative z-10 min-h-[calc(100vh-300px)] pt-16">
          <Hero />
          <ToolCard />
          <Marquee />
          <PdfStory />
          <Features />
          <Faq />
          <Cta />
        </main>
        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    </ToolProvider>
  )
}
