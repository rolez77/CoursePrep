// src/app/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/app/components/Navbar"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState("")
  const [uploading, setUploading] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [quizTopic, setQuizTopic] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setUploadStatus("🎉 Welcome to Pro! All features unlocked.")
    }
  }, [])

  async function handleUpload() {
    if (!file || !user) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("user_id", user.id)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, { method: "POST", body: formData })
      const data = await res.json()
      setUploadStatus(data.message)
    } catch {
      setUploadStatus("Upload failed — is the backend running?")
    } finally {
      setUploading(false)
    }
  }

  async function handleChat() {
    if (!question.trim() || !user) return
    const userMessage = question
    setQuestion("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat?question=${encodeURIComponent(userMessage)}&user_id=${user.id}`, { method: "POST" })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong." }])
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateQuiz() {
    if (!quizTopic.trim() || !user) return
    setQuizLoading(true)
    setQuestions([])
    setSelectedAnswers({})
    setSubmitted(false)

    try {
        const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz?topic=${encodeURIComponent(quizTopic)}&user_id=${user.id}&num_questions=5`,
        { method: "POST" }
        )
        const data = await res.json()
        console.log("Quiz response:", data)  // add this

        setQuestions(data.quiz)
    } catch {
        console.error("Quiz generation failed")
    } finally {
        setQuizLoading(false)
    }
}

function getScore() {
  return questions.filter((q, i) => selectedAnswers[i] === q.correct).length
}

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat() }
  }

  if (!user) return null

  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <Navbar />

      <div style={{ flex: 1, maxWidth: "860px", margin: "0 auto", width: "100%", padding: "48px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#C8441A" }}></span>
            Your study space
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: 700, color: "#1A1612", lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
            What are we <em style={{ fontStyle: "italic", color: "#C8441A" }}>studying today?</em>
          </h1>
        </div>

        {/* Upload */}
        <div style={{ background: "rgba(26,22,18,0.04)", border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", padding: "28px", marginBottom: "24px" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 400, color: "#1A1612", marginBottom: "16px" }}>Upload course material</p>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", border: "1.5px solid #1A1612", borderRadius: "4px", padding: "10px 16px", cursor: "pointer", fontSize: "13px", color: "#1A1612", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
              {file ? file.name : "Choose PDF"}
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
            </label>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              style={{ padding: "10px 20px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "4px", cursor: "pointer", opacity: (!file || uploading) ? 0.4 : 1 }}
            >
              {uploading ? "Processing..." : "Upload"}
            </button>
          </div>
          {uploadStatus && (
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#C8441A", marginTop: "12px", letterSpacing: "0.05em" }}>✓ {uploadStatus}</p>
          )}
        </div>

        {/* Chat */}
        <div style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#1A1612", margin: 0 }}>Ask your tutor</p>
          </div>

          {/* Messages */}
          <div style={{ padding: "24px 28px", minHeight: "280px", maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.length === 0 && (
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", letterSpacing: "0.05em" }}>Upload your syllabus and ask anything about your course...</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                padding: "12px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                lineHeight: 1.6,
                maxWidth: "80%",
                whiteSpace: "pre-wrap",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "#1A1612" : "rgba(26,22,18,0.06)",
                color: msg.role === "user" ? "#F5F0E8" : "#1A1612",
                fontFamily: msg.role === "assistant" ? "'DM Sans', sans-serif" : "'DM Mono', monospace",
              }}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{ padding: "12px 16px", borderRadius: "6px", fontSize: "13px", background: "rgba(26,22,18,0.06)", color: "#8C8070", alignSelf: "flex-start", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "0", borderTop: "1px solid rgba(26,22,18,0.12)" }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. What topics are on the exam?"
              style={{ flex: 1, padding: "16px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "transparent", border: "none", outline: "none", color: "#1A1612" }}
            />
            <button
              onClick={handleChat}
              disabled={!question.trim() || loading}
              style={{ padding: "16px 24px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: (!question.trim() || loading) ? 0.4 : 1 }}
            >
              Ask
            </button>
          </div>
        </div>
      </div>
      {/* Quiz section */}
<div style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", overflow: "hidden", marginTop: "24px" }}>
  <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#1A1612", margin: 0 }}>Generate a quiz</p>
  </div>

  <div style={{ padding: "24px 28px" }}>
    {/* Topic input */}
    <div style={{ display: "flex", gap: "0", border: "1.5px solid #1A1612", borderRadius: "4px", overflow: "hidden", marginBottom: "28px" }}>
      <input
        type="text"
        value={quizTopic}
        onChange={(e) => setQuizTopic(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleGenerateQuiz()}
        placeholder="e.g. recursion, thermodynamics, the civil war..."
        style={{ flex: 1, padding: "14px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "transparent", border: "none", outline: "none", color: "#1A1612" }}
      />
      <button
        onClick={handleGenerateQuiz}
        disabled={!quizTopic.trim() || quizLoading}
        style={{ padding: "14px 24px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: (!quizTopic.trim() || quizLoading) ? 0.4 : 1 }}
      >
        {quizLoading ? "Generating..." : "Generate"}
      </button>
    </div>

    {/* Questions */}
    {questions.length > 0 && (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {questions.map((q, i) => (
          <div key={i} style={{ borderBottom: "1px solid rgba(26,22,18,0.08)", paddingBottom: "24px" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#1A1612", marginBottom: "14px", lineHeight: 1.5 }}>
              {i + 1}. {q.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {q.options.map((option: string) => {
                const isSelected = selectedAnswers[i] === option
                const isCorrect = option === q.correct
                let bg = "transparent"
                let border = "1px solid rgba(26,22,18,0.2)"
                let color = "#1A1612"

                if (submitted) {
                  if (isCorrect) { bg = "rgba(15,110,86,0.08)"; border = "1px solid #0F6E56"; color = "#0F6E56" }
                  else if (isSelected && !isCorrect) { bg = "rgba(200,68,26,0.08)"; border = "1px solid #C8441A"; color = "#C8441A" }
                } else if (isSelected) {
                  bg = "rgba(26,22,18,0.06)"; border = "1px solid #1A1612"
                }

                return (
                  <button
                    key={option}
                    onClick={() => !submitted && setSelectedAnswers((prev) => ({ ...prev, [i]: option }))}
                    style={{ textAlign: "left", padding: "12px 16px", background: bg, border, borderRadius: "4px", cursor: submitted ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color, transition: "all 0.15s" }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {submitted && (
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", marginTop: "10px", letterSpacing: "0.04em", lineHeight: 1.6 }}>
                {q.explanation}
              </p>
            )}
          </div>
        ))}

        {/* Submit / Score */}
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            style={{ alignSelf: "flex-start", padding: "12px 24px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "4px", cursor: "pointer", opacity: Object.keys(selectedAnswers).length < questions.length ? 0.4 : 1 }}
          >
            Submit answers
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#1A1612" }}>
              You scored <em style={{ color: "#C8441A" }}>{getScore()} / {questions.length}</em>
            </p>
            <button
              onClick={() => { setQuestions([]); setSelectedAnswers({}); setSubmitted(false); setQuizTopic("") }}
              style={{ padding: "10px 20px", background: "transparent", color: "#1A1612", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(26,22,18,0.3)", borderRadius: "4px", cursor: "pointer" }}
            >
              New quiz
            </button>
          </div>
        )}
      </div>
    )}
  </div>
</div>

      <footer style={{ padding: "20px 48px", borderTop: "1px solid rgba(26,22,18,0.12)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>© 2026 CoursePrep</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>courseprep.xyz</span>
      </footer>
    </main>
  )
}