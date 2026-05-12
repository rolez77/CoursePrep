// src/app/courses/page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"
import Navbar from "@/app/components/Navbar"

interface Course {
  id: number
  name: string
  description: string
  created_at: string
  is_public: boolean
}

export default function Courses() {
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [university, setUniversity] = useState("")
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)
      fetchCourses(user.id)
    }
    load()
  }, [])

  async function fetchCourses(userId: string) {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (data) setCourses(data)
  }

  async function handleCreateCourse() {
    if (!name.trim() || !user) return
    setCreating(true)

    const { error } = await supabase
      .from("courses")
      .insert({ name, description, university: university || null, user_id: user.id })

    if (!error) {
      setName("")
      setDescription("")
      setUniversity("")
      setShowForm(false)
      fetchCourses(user.id)
    }
    setCreating(false)
  }

  async function handleDeleteCourse(id: number) {
    await supabase.from("courses").delete().eq("id", id)
    fetchCourses(user.id)
  }

  if (!user) return null

  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1, maxWidth: "860px", margin: "0 auto", width: "100%", padding: "48px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#C8441A" }}></span>
              Your courses
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: 700, color: "#1A1612", lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
              Manage your <em style={{ fontStyle: "italic", color: "#C8441A" }}>courses</em>
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: "12px 24px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            {showForm ? "Cancel" : "+ New course"}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", overflow: "hidden", marginBottom: "32px" }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#1A1612", margin: 0 }}>New course</p>
            </div>
            <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Course name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  style={{ width: "100%", padding: "14px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "transparent", border: "1.5px solid rgba(26,22,18,0.3)", borderRadius: "4px", outline: "none", color: "#1A1612", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. COP 3530 — Fall 2026"
                  style={{ width: "100%", padding: "14px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "transparent", border: "1.5px solid rgba(26,22,18,0.3)", borderRadius: "4px", outline: "none", color: "#1A1612", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>University (optional)</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. University of Florida"
                  style={{ width: "100%", padding: "14px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "transparent", border: "1.5px solid rgba(26,22,18,0.3)", borderRadius: "4px", outline: "none", color: "#1A1612", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div style={{ padding: "20px 28px", borderTop: "1px solid rgba(26,22,18,0.12)", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleCreateCourse}
                disabled={!name.trim() || creating}
                style={{ padding: "12px 24px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "4px", cursor: "pointer", opacity: (!name.trim() || creating) ? 0.4 : 1 }}
              >
                {creating ? "Creating..." : "Create course"}
              </button>
            </div>
          </div>
        )}

        {toggleError && (
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#C8441A", marginBottom: "16px", letterSpacing: "0.04em" }}>
            Error: {toggleError}
          </p>
        )}

        {/* Course list */}
        {courses.length === 0 && !showForm && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#1A1612", marginBottom: "12px" }}>No courses yet</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", letterSpacing: "0.05em" }}>Create your first course to get started</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(26,22,18,0.02)" }}
            >
              <div style={{ cursor: "pointer" }} onClick={() => router.push(`/courses/${course.id}`)}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#1A1612", margin: "0 0 4px" }}>{course.name}</p>
                {course.description && (
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", margin: 0, letterSpacing: "0.04em" }}>{course.description}</p>
                )}
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", margin: "8px 0 0", letterSpacing: "0.04em" }}>
                  Created {new Date(course.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={() => router.push(`/courses/${course.id}`)}
                  style={{ padding: "10px 18px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Open
                </button>
                <button
                    onClick={async () => {
                        setToggleError(null)
                        const { error } = await supabase.from("courses").update({ is_public: !course.is_public }).eq("id", course.id)
                        if (error) { setToggleError(error.message); return }
                        fetchCourses(user.id)
                    }}
                    style={{ padding: "10px 18px", background: "transparent", color: course.is_public ? "#0F6E56" : "#8C8070", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: `1px solid ${course.is_public ? "rgba(15,110,86,0.3)" : "rgba(26,22,18,0.2)"}`, borderRadius: "4px", cursor: "pointer" }}
                    >
                    {course.is_public ? "✓ Public" : "Make public"}
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  style={{ padding: "10px 18px", background: "transparent", color: "#C8441A", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(200,68,26,0.3)", borderRadius: "4px", cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>
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