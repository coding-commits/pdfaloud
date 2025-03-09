"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Upload, Play, Pause, RotateCcw, FileText, FileUp } from "lucide-react"
import { cn } from "@/lib/utils"

// PDF.js imports and initialization
let pdfjsLib: typeof import('pdfjs-dist')

export function TextReader() {
  const [text, setText] = useState<string>("")
  const [lines, setLines] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentLine, setCurrentLine] = useState<number>(0)
  const [rate, setRate] = useState<number>(1)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [fileName, setFileName] = useState<string>("")
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfDocRef = useRef<any>(null)

  // Initialize PDF.js
  useEffect(() => {
    const initPdfJs = async () => {
      try {
        const PDFJS = await import('pdfjs-dist')
        PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
        pdfjsLib = PDFJS
      } catch (error) {
        console.error('Error initializing PDF.js:', error)
      }
    }
    initPdfJs()
  }, [])

  // Render PDF page
  const renderPage = async (pageNum: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return

    try {
      const page = await pdfDocRef.current.getPage(pageNum)
      const canvas = canvasRef.current
      const viewport = page.getViewport({ scale: 1.5 })

      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      }

      await page.render(renderContext).promise
    } catch (error) {
      console.error('Error rendering PDF page:', error)
    }
  }

  // Handle page navigation
  const changePage = (offset: number) => {
    const newPage = currentPage + offset
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage)
    }
  }

  // Effect to render page when current page changes
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage)
    }
  }, [currentPage])

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      speechSynthesisRef.current = window.speechSynthesis
    }

    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel()
      }
    }
  }, [])

  // Split text into lines when text changes
  useEffect(() => {
    if (text) {
      const textLines = text.split(/\n/).filter((line) => line.trim() !== "")
      setLines(textLines)
    } else {
      setLines([])
    }
    setCurrentLine(0)
  }, [text])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setFileName("")
    if (isPlaying) {
      stopSpeech()
    }
  }

  const extractTextFromPDF = async (pdfData: ArrayBuffer): Promise<string> => {
    try {
      if (!pdfjsLib) {
        throw new Error("PDF.js not initialized")
      }
      const loadingTask = pdfjsLib.getDocument({ data: pdfData })
      const pdf = await loadingTask.promise

      let extractedText = ""

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")
        extractedText += pageText + "\n\n"
      }

      return extractedText
    } catch (error) {
      console.error("Error extracting text from PDF:", error)
      throw new Error("Failed to extract text from PDF")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setFileName(file.name)

    try {
      if (isPlaying) {
        stopSpeech()
      }

      if (file.type === "application/pdf") {
        // Create URL for PDF rendering
        const fileUrl = URL.createObjectURL(file)
        setPdfUrl(fileUrl)

        // Load PDF for rendering
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        pdfDocRef.current = pdf
        setNumPages(pdf.numPages)
        setCurrentPage(1)

        // Extract text
        const extractedText = await extractTextFromPDF(arrayBuffer)
        setText(extractedText)
      } else {
        // Handle text file
        setPdfUrl("")
        setNumPages(0)
        pdfDocRef.current = null
        
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          setText(content)
        }
        reader.readAsText(file)
      }
    } catch (error) {
      console.error("Error processing file:", error)
      alert("Error processing file. Please try again with a different file.")
    } finally {
      setIsLoading(false)
    }
  }

  const startSpeech = () => {
    if (!speechSynthesisRef.current || lines.length === 0) return

    speechSynthesisRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(lines[currentLine])
    utterance.rate = rate

    utterance.onend = () => {
      if (currentLine < lines.length - 1) {
        setCurrentLine((prev) => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }

    utteranceRef.current = utterance
    speechSynthesisRef.current.speak(utterance)
    setIsPlaying(true)
    setIsPaused(false)
  }

  const pauseSpeech = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.pause()
      setIsPaused(true)
    }
  }

  const resumeSpeech = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.resume()
      setIsPaused(false)
    }
  }

  const stopSpeech = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel()
      setIsPlaying(false)
      setIsPaused(false)
    }
  }

  const resetReader = () => {
    stopSpeech()
    setCurrentLine(0)
  }

  // Continue to next line when current line finishes
  useEffect(() => {
    if (isPlaying && !isPaused && utteranceRef.current?.text !== lines[currentLine]) {
      startSpeech()
    }
  }, [currentLine, isPlaying, isPaused, lines])

  // Handle rate change
  const handleRateChange = (value: number[]) => {
    const newRate = value[0]
    setRate(newRate)

    if (utteranceRef.current && isPlaying) {
      // Need to restart with new rate
      const wasPlaying = isPlaying
      const currentLineIndex = currentLine

      stopSpeech()
      setCurrentLine(currentLineIndex)

      if (wasPlaying) {
        setTimeout(() => {
          startSpeech()
        }, 100)
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Text Input
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={triggerFileInput}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.doc,.docx,.pdf"
              className="hidden"
            />
          </div>
        </div>

        {fileName && (
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 p-2 rounded">
            <FileUp className="h-4 w-4" />
            <span>Loaded: {fileName}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Viewer */}
        {pdfUrl && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-700">PDF View</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => changePage(-1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {numPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => changePage(1)}
                  disabled={currentPage >= numPages}
                >
                  Next
                </Button>
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-white overflow-auto">
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
          </div>
        )}

        {/* Text Content and Controls */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-4">
            <Textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Paste your text here or upload a file (TXT, PDF, DOC, DOCX)..."
              className="min-h-[150px] text-base"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-700">Reader Controls</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Speed: {rate.toFixed(1)}x</span>
                <div className="w-32">
                  <Slider value={[rate]} min={0.5} max={2} step={0.1} onValueChange={handleRateChange} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <Button onClick={startSpeech} disabled={lines.length === 0 || isLoading}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Reading
                </Button>
              ) : isPaused ? (
                <Button onClick={resumeSpeech}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button onClick={pauseSpeech}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button variant="outline" onClick={resetReader} disabled={lines.length === 0 || isLoading}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Text Display with Highlighting */}
      {lines.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Text Display</h2>
          <div className="space-y-2 text-lg leading-relaxed">
            {lines.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "py-1 px-2 rounded transition-colors",
                  currentLine === index
                    ? "bg-yellow-100 font-medium border-l-4 border-yellow-400"
                    : "hover:bg-slate-50",
                )}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

