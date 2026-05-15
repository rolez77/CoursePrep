"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase"
import Link from "next/link"
import {
  Brain, Bell, User, Menu, ArrowLeft, FileText, Upload,
  Send, Globe, Lock, Loader2, X, BookOpen, Download,
  HelpCircle, CheckCircle2, XCircle,
} from "lucide-react"

interface Document {
  filename: string
  created_at: string
  file_url?: string
  document_type?: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: string
  explanation: string
}

export default function CoursePage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [summary, setSummary] = useState("")
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [docType, setDocType] = useState<"syllabus" | "other">("other")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizTopic, setQuizTopic] = useState("")
  const [quizNumQuestions, setQuizNumQuestions] = useState(5)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, chatLoading])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single()

      if (!courseData) { router.push("/search"); return }
      if (!courseData.is_public && courseData.user_id !== user?.id) { router.push("/search"); return }
      setCourse(courseData)
      setIsOwner(user?.id === courseData.user_id)

      fetchDocuments()

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${id}/summary`)
        const data = await res.json()
        setSummary(data.summary)
      } catch {
        setSummary("Summary unavailable.")
      } finally {
        setSummaryLoading(false)
      }
    }
    load()
  }, [id])

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from("documents")
      .select("metadata, created_at")
      .eq("course_id", id)
      .order("created_at", { ascending: false })

    if (error) { console.error("fetchDocuments:", error); return }
    if (data) {
      const seen = new Set<string>()
      const unique: Document[] = []
      for (const d of data) {
        const filename = d.metadata?.filename
        if (!filename || seen.has(filename)) continue
        seen.add(filename)
        unique.push({ filename, created_at: d.created_at, file_url: d.metadata?.file_url, document_type: d.metadata?.document_type || "other" })
      }
      setDocuments(unique)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const hasSyllabus = documents.some(d => d.document_type === "syllabus")
    if (docType === "syllabus" && hasSyllabus) {
      setUploadError("A syllabus has already been uploaded for this course.")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("user_id", user.id)
    formData.append("course_id", String(id))
    formData.append("document_type", docType)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.status === 403) { setShowUpgradeModal(true); return }
      if (res.status === 409) { setUploadError(data.detail || "A syllabus already exists for this course."); return }
      if (!res.ok) throw new Error(data.detail || "Upload failed")
      setUploadSuccess(`"${file.name}" uploaded successfully.`)
      fetchDocuments()
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleChat() {
    if (!question.trim() || chatLoading) return
    const userMessage = question
    setQuestion("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setChatLoading(true)

    try {
      const userId = user?.id || "anonymous"
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat?question=${encodeURIComponent(userMessage)}&user_id=${userId}&course_id=${id}`,
        { method: "POST" }
      )
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }])
    } finally {
      setChatLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat() }
  }

  async function handleCreateQuiz() {
    if (!quizTopic.trim() || quizLoading) return
    setQuizLoading(true)
    setQuiz(null)
    setQuizAnswers({})
    setQuizSubmitted(false)
    setQuizError(null)
    try {
      const userId = user?.id || "anonymous"
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz?topic=${encodeURIComponent(quizTopic)}&user_id=${userId}&num_questions=${quizNumQuestions}&course_id=${id}`,
        { method: "POST" }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to generate quiz")
      setQuiz(data.quiz)
    } catch (err: any) {
      setQuizError(err.message)
    } finally {
      setQuizLoading(false)
    }
  }

  function getScore() {
    if (!quiz) return 0
    return quiz.filter((q, i) => quizAnswers[i] === q.correct).length
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (!course) return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg" />
            <div className="h-5 w-28 bg-gray-200 rounded" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="h-6 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-7 w-64 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-48" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-80" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-40" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-32" />
          </div>
        </div>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">CoursePrep</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">Dashboard</Link>
                <Link href="/courses" className="text-blue-600 font-medium text-sm">My Courses</Link>
                <Link href="/search" className="text-gray-600 hover:text-gray-900 text-sm">Discover</Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <Link href="/profile" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <User className="w-5 h-5" />
              </Link>
              <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back + course header */}
        <div className="mb-8">
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            My Courses
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {course.university && (
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">{course.university}</p>
                )}
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{course.name}</h1>
                {course.description && (
                  <p className="text-sm text-gray-600">{course.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  course.is_public
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                }`}>
                  {course.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {course.is_public ? "Public" : "Private"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Course summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Course Summary</h2>
              </div>
              <div className="p-6">
                {summaryLoading ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating summary from your materials...</span>
                  </div>
                ) : (() => {
                  let parsed: any = null
                  try { parsed = JSON.parse(summary) } catch {}
                  if (parsed) {
                    const rows: { label: string; value: string | null }[] = [
                      { label: "Course", value: course.name },
                      { label: "Professor", value: parsed.professor },
                      { label: "Lecture Days", value: parsed.days },
                      { label: "Topics", value: Array.isArray(parsed.topics) && parsed.topics.length ? parsed.topics.join(", ") : null },
                      { label: "Homeworks", value: parsed.homeworks },
                      { label: "Exams", value: parsed.exams },
                    ]
                    return (
                      <dl className="space-y-3">
                        {rows.filter(r => r.value).map(r => (
                          <div key={r.label} className="flex gap-3 text-sm">
                            <dt className="w-28 flex-shrink-0 text-xs font-semibold text-gray-500 uppercase tracking-wide pt-0.5">{r.label}</dt>
                            <dd className="text-gray-800">{r.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )
                  }
                  return <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
                })()}
              </div>
            </div>

            {/* AI Chat */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <h2 className="font-semibold text-gray-900">Ask AI Tutor</h2>
                </div>
                {!user && (
                  <Link href="/signup" className="text-xs text-blue-600 hover:underline no-underline">
                    Sign up to save history →
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div className="p-6 min-h-64 max-h-96 overflow-y-auto flex flex-col gap-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Brain className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">Ask anything about this course</p>
                    <p className="text-xs text-gray-400 mt-1">Powered by your uploaded materials</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 flex items-end gap-0">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this course... (Enter to send)"
                  rows={1}
                  className="flex-1 px-4 py-4 text-sm bg-transparent outline-none resize-none text-gray-900 placeholder-gray-400 max-h-32"
                  style={{ fieldSizing: "content" } as any}
                />
                <button
                  onClick={handleChat}
                  disabled={!question.trim() || chatLoading}
                  className="p-4 text-blue-600 hover:text-blue-700 disabled:text-gray-300 transition-colors flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Upload (owner only) */}
            {isOwner && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">Upload Materials</h2>
                </div>
                <div className="p-6">
                  {/* Document type selector */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Document type</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="docType"
                          value="other"
                          checked={docType === "other"}
                          onChange={() => setDocType("other")}
                          className="accent-blue-600"
                        />
                        <span className="text-xs text-gray-700">Lecture notes / Other</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="docType"
                          value="syllabus"
                          checked={docType === "syllabus"}
                          onChange={() => setDocType("syllabus")}
                          className="accent-blue-600"
                        />
                        <span className="text-xs text-gray-700">Syllabus</span>
                      </label>
                    </div>
                  </div>

                  {(() => {
                    const hasSyllabus = documents.some(d => d.document_type === "syllabus")
                    const syllabusBlocked = docType === "syllabus" && hasSyllabus
                    return (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleUpload}
                          className="hidden"
                          id="file-upload"
                          disabled={syllabusBlocked || uploading}
                        />
                        <label
                          htmlFor="file-upload"
                          className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors ${
                            uploading
                              ? "border-blue-300 bg-blue-50 cursor-wait"
                              : syllabusBlocked
                              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                              : "cursor-pointer border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                              <span className="text-sm text-blue-600 font-medium">Uploading & processing...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm font-medium text-gray-700">Click to upload PDF</span>
                              <span className="text-xs text-gray-500 mt-1">
                                {docType === "syllabus" ? "Syllabus PDF" : "Lecture notes, textbooks, etc."}
                              </span>
                            </>
                          )}
                        </label>
                        {syllabusBlocked && (
                          <div className="mt-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                            <span className="text-amber-700 text-xs">A syllabus has already been uploaded for this course.</span>
                          </div>
                        )}
                      </>
                    )
                  })()}

                  {uploadSuccess && (
                    <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-600 text-xs flex-1">{uploadSuccess}</span>
                      <button onClick={() => setUploadSuccess(null)} className="text-green-500 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {uploadError && (
                    <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-red-600 text-xs flex-1">{uploadError}</span>
                      <button onClick={() => setUploadError(null)} className="text-red-500 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Study Tools */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Study Tools</h2>
              </div>
              <div className="p-4">
                <button
                  onClick={() => setShowQuizModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-purple-900">Create Quiz</p>
                    <p className="text-xs text-purple-600">Test your knowledge</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">Materials</h2>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {documents.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {documents.length === 0 ? (
                  <div className="p-6 text-center">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No materials yet</p>
                    {isOwner && (
                      <p className="text-xs text-gray-400 mt-1">Upload a PDF to get started</p>
                    )}
                  </div>
                ) : (
                  documents.map((doc, i) => {
                    const fileUrl = doc.file_url
                    return (
                      <div key={i} className="px-6 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
                            {doc.document_type === "syllabus" && (
                              <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Syllabus</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{timeAgo(doc.created_at)}</p>
                        </div>
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download"
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Quiz modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900">Quiz Generator</h2>
              </div>
              <button onClick={() => setShowQuizModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              {!quiz ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <input
                      type="text"
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateQuiz()}
                      placeholder="e.g. Photosynthesis, World War II, Calculus..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                    <div className="flex gap-2">
                      {[5, 10, 15].map((n) => (
                        <button
                          key={n}
                          onClick={() => setQuizNumQuestions(n)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            quizNumQuestions === n
                              ? "bg-purple-600 text-white border-purple-600"
                              : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  {quizError && <p className="text-sm text-red-600">{quizError}</p>}
                  <button
                    onClick={handleCreateQuiz}
                    disabled={!quizTopic.trim() || quizLoading}
                    className="w-full py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    {quizLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating quiz...</>
                    ) : "Generate Quiz"}
                  </button>
                </div>
              ) : quizSubmitted ? (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-gray-900">{getScore()}/{quiz.length}</div>
                    <p className="text-gray-500 mt-1">
                      {getScore() === quiz.length ? "Perfect score!" : getScore() >= quiz.length * 0.7 ? "Great job!" : "Keep studying!"}
                    </p>
                  </div>
                  {quiz.map((q, i) => {
                    const isCorrect = quizAnswers[i] === q.correct
                    return (
                      <div key={i} className={`rounded-lg border p-4 ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                        <div className="flex items-start gap-2 mb-3">
                          {isCorrect
                            ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                          <p className="text-sm font-medium text-gray-900">{q.question}</p>
                        </div>
                        {!isCorrect && (
                          <p className="text-xs text-gray-600 ml-7 mb-1">Your answer: <span className="text-red-600">{quizAnswers[i] || "Not answered"}</span></p>
                        )}
                        <p className="text-xs text-gray-600 ml-7 mb-1">Correct: <span className="text-green-700 font-medium">{q.correct}</span></p>
                        <p className="text-xs text-gray-500 ml-7">{q.explanation}</p>
                      </div>
                    )
                  })}
                  <button
                    onClick={() => { setQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); setQuizTopic("") }}
                    className="w-full py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    New Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {quiz.map((q, i) => (
                    <div key={i} className="space-y-3">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="text-purple-600 font-bold mr-1">{i + 1}.</span>
                        {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [i]: opt }))}
                            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                              quizAnswers[i] === opt
                                ? "border-purple-500 bg-purple-50 text-purple-900"
                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length < quiz.length}
                    className="w-full py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                  >
                    Submit ({Object.keys(quizAnswers).length}/{quiz.length} answered)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Free plan limit reached</h2>
            <p className="text-sm text-gray-500 mb-6">
              Free accounts can upload 1 document per course. Upgrade to Pro for unlimited uploads across all courses.
            </p>
            <Link
              href="/upgrade"
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Upgrade to Pro
            </Link>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
