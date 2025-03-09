import { TextReader } from "@/components/text-reader"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Text-to-Speech Reader</h1>
          <p className="text-slate-600">
            Upload your textbook or paste text to have it read aloud with line highlighting
          </p>
        </header>
        <TextReader />
      </div>
    </main>
  )
}

