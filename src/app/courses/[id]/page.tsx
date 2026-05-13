"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase"
import Link from "next/link"
import {
  Brain, Bell, User, Menu, ArrowLeft, FileText, Upload,
  Send, Globe, Lock, Loader2, X, BookOpen,
} from "lucide-react"

interface Document {
  filename: string
  created_at: string
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
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)

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
    const { data } = await supabase
      .from("documents")
      .select("filename, created_at")
      .eq("course_id", id)
      .order("created_at", { ascending: false })

    if (data) {
      const seen = new Set<string>()
      const unique = data.filter((d) => {
        if (seen.has(d.filename)) return false
        seen.add(d.filename)
        return true
      })
      setDocuments(unique)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("user_id", user.id)
    formData.append("course_id", String(id))

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
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

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (!course) return null

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
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
                )}
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                      uploading
                        ? "border-blue-300 bg-blue-50 cursor-wait"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
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
                        <span className="text-xs text-gray-500 mt-1">Lecture notes, textbooks, syllabi</span>
                      </>
                    )}
                  </label>

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
                  documents.map((doc, i) => (
                    <div key={i} className="px-6 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
                        <p className="text-xs text-gray-500">{timeAgo(doc.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
