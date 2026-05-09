// src/app/courses/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase"
import Link from "next/link"
import Navbar from "@/app/components/Navbar"

export default function PublicCourse() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [course, setCourse] = useState<any>(null)
  const [summary, setSummary] = useState("")
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function load() {
      // Check if logged in
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch course
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .single()

      if (!courseData) { router.push("/search"); return }
      setCourse(courseData)

      // Fetch or generate summary
      try {
        const res = await fetch(`http://localhost:8000/courses/${id}/summary`)
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

  async function handleChat() {
    if (!question.trim()) return
    const userMessage = question
    setQuestion("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setChatLoading(true)

    try {
      const userId = user?.id || "anonymous"
      const res = await fetch(
        `http://localhost:8000/chat?question=${encodeURIComponent(userMessage)}&user_id=${userId}&course_id=${id}`,
        { method: "POST" }
      )
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong." }])
    } finally {
      setChatLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat() }
  }

  if (!course) return null

  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1, maxWidth: "860px", margin: "0 auto", width: "100%", padding: "48px" }}>

        {/* Course header */}
        <div style={{ marginBottom: "40px" }}>
          {course.university && (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#C8441A" }}></span>
              {course.university}
            </div>
          )}
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: 700, color: "#1A1612", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
            {course.name}
          </h1>
          {course.description && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#8C8070", margin: 0 }}>{course.description}</p>
          )}
        </div>

        {/* Syllabus summary */}
        <div style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#1A1612", margin: 0 }}>Course summary</p>
          </div>
          <div style={{ padding: "28px" }}>
            {summaryLoading ? (
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", letterSpacing: "0.05em" }}>Generating summary...</p>
            ) : (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#1A1612", lineHeight: 1.8, margin: 0 }}>{summary}</p>
            )}
          </div>
        </div>

        {/* Chat */}
        <div style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(26,22,18,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#1A1612", margin: 0 }}>Ask about this course</p>
            {!user && (
              <Link href="/signup" style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.08em", textDecoration: "none" }}>
                Sign up to save your history →
              </Link>
            )}
          </div>

          <div style={{ padding: "24px 28px", minHeight: "240px", maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.length === 0 && (
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", letterSpacing: "0.05em" }}>Ask anything about this course...</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                padding: "12px 16px", borderRadius: "6px", fontSize: "14px", lineHeight: 1.6, maxWidth: "80%", whiteSpace: "pre-wrap",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "#1A1612" : "rgba(26,22,18,0.06)",
                color: msg.role === "user" ? "#F5F0E8" : "#1A1612",
                fontFamily: msg.role === "assistant" ? "'DM Sans', sans-serif" : "'DM Mono', monospace",
              }}>
                {msg.content}
              </div>
            ))}
            {chatLoading && (
              <div style={{ padding: "12px 16px", borderRadius: "6px", fontSize: "13px", background: "rgba(26,22,18,0.06)", color: "#8C8070", alignSelf: "flex-start", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
                Thinking...
              </div>
            )}
          </div>

          <div style={{ display: "flex", borderTop: "1px solid rgba(26,22,18,0.12)" }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. What are the main topics covered?"
              style={{ flex: 1, padding: "16px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "transparent", border: "none", outline: "none", color: "#1A1612" }}
            />
            <button
              onClick={handleChat}
              disabled={!question.trim() || chatLoading}
              style={{ padding: "16px 24px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: (!question.trim() || chatLoading) ? 0.4 : 1 }}
            >
              Ask
            </button>
          </div>
        </div>
      </div>

      <footer style={{ padding: "20px 48px", borderTop: "1px solid rgba(26,22,18,0.12)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>© 2026 CoursePrep</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>courseprep.xyz</span>
      </footer>
    </main>
  )
}