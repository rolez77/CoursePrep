// src/app/search/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

interface Course {
  id: number
  name: string
  description: string
  university: string
  syllabus_summary: string
}

export default function Search() {
  const [query, setQuery] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSearch() {
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      setCourses(data.courses)
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1, maxWidth: "860px", margin: "0 auto", width: "100%", padding: "48px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#C8441A" }}></span>
            Course search
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: 700, color: "#1A1612", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Find your <em style={{ fontStyle: "italic", color: "#C8441A" }}>course</em>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#8C8070", margin: 0 }}>
            Search for courses shared by students and professors at your university.
          </p>
        </div>

        {/* Search bar */}
        <div style={{ display: "flex", gap: "0", border: "1.5px solid #1A1612", borderRadius: "4px", overflow: "hidden", marginBottom: "40px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by course name, university, topic..."
            style={{ flex: 1, padding: "16px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: "15px", background: "transparent", border: "none", outline: "none", color: "#1A1612" }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{ padding: "16px 28px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results */}
        {!searched && (
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", letterSpacing: "0.05em" }}>
            Search for a course above to get started
          </p>
        )}

        {searched && courses.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#1A1612", marginBottom: "12px" }}>No courses found</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", letterSpacing: "0.05em" }}>Try a different search term or sign up to create your own</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/courses/${course.id}`)}
              style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", padding: "28px", cursor: "pointer", background: "rgba(26,22,18,0.02)", transition: "border-color 0.15s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#1A1612", margin: "0 0 6px" }}>{course.name}</p>
                  {course.university && (
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.08em", margin: 0 }}>{course.university}</p>
                  )}
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(26,22,18,0.12)", padding: "4px 10px", borderRadius: "100px", whiteSpace: "nowrap" }}>
                  View course →
                </span>
              </div>
              {course.description && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#8C8070", margin: "0 0 12px", lineHeight: 1.6 }}>{course.description}</p>
              )}
              {course.syllabus_summary && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8C8070", margin: 0, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {course.syllabus_summary}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer style={{ padding: "20px 48px", borderTop: "1px solid rgba(26,22,18,0.12)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>© 2026 CoursePrep</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>courseprep.xyz</span>
      </footer>
    </main>
  )
}