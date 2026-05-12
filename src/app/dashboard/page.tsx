"use client"

import { useEffect, useState, Suspense } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import Link from "next/link"

type Profile = {
  full_name: string | null
  university: string | null
  is_pro: boolean
  upload_count: number
}

type Course = {
  id: number
  name: string
  description: string | null
  university: string | null
  is_public: boolean
  doc_count: number
}

type PublicCourse = {
  id: number
  name: string
  description: string | null
  university: string | null
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [upgraded, setUpgraded] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") setUpgraded(true)
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.push("/login")
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) { await supabase.auth.signOut(); router.push("/login"); return }
      if (!user) { router.push("/login"); return }
      setUser(user)

      const [profileRes, coursesRes] = await Promise.all([
        supabase.from("profiles").select("full_name, university, is_pro, upload_count").eq("id", user.id).single(),
        supabase.from("courses").select("id, name, description, university, is_public").eq("user_id", user.id).order("created_at", { ascending: false }),
      ])

      setProfile(profileRes.data)

      if (coursesRes.data) {
        const withCounts = await Promise.all(
          coursesRes.data.map(async (course) => {
            const { count } = await supabase
              .from("documents")
              .select("id", { count: "exact", head: true })
              .eq("course_id", course.id)
            return { ...course, doc_count: count ?? 0 }
          })
        )
        setCourses(withCounts)
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?query=`)
        const data = await res.json()
        setPublicCourses(data.courses?.slice(0, 8) ?? [])
      } catch { /* silently fail */ }

      setLoading(false)
    }
    load()
  }, [])

  if (loading || !user) return null

  const displayName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there"
  const greeting = getGreeting()

  const stats = [
    { label: "Courses", value: courses.length },
    { label: "Uploads", value: profile?.upload_count ?? 0 },
    { label: "Quizzes Taken", value: "—" },
  ]

  const quickActions = [
    { label: "Upload PDF", desc: "Add study material to a course", href: "/courses", icon: "↑" },
    { label: "Ask a question", desc: "Chat with your AI tutor", href: "/courses", icon: "?" },
    { label: "Generate quiz", desc: "Test your knowledge", href: "/courses", icon: "✎" },
  ]

  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {upgraded && (
        <div style={{ background: "#C8441A", padding: "12px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#F5F0E8", letterSpacing: "0.06em" }}>
            Welcome to Pro — all features unlocked.
          </span>
          <button onClick={() => setUpgraded(false)} style={{ background: "transparent", border: "none", color: "#F5F0E8", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>×</button>
        </div>
      )}

      <div style={{ flex: 1, maxWidth: "1100px", margin: "0 auto", width: "100%", padding: "56px 48px" }}>

        {/* Welcome */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#C8441A" }} />
            {greeting}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "48px", fontWeight: 700, color: "#1A1612", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
            {greeting}, <em style={{ fontStyle: "italic", color: "#C8441A" }}>{displayName}.</em>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "17px", color: "#8C8070", margin: 0 }}>
            Ready to study?
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "56px" }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", padding: "24px 28px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 700, color: "#1A1612" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Your Courses */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#1A1612", margin: 0 }}>
              Your courses
            </h2>
            <Link href="/courses" style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textDecoration: "none" }}>
              Manage →
            </Link>
          </div>

          {courses.length === 0 ? (
            <div style={{ border: "1.5px dashed rgba(26,22,18,0.2)", borderRadius: "8px", padding: "64px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#1A1612", margin: "0 0 8px" }}>No courses yet</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#8C8070", margin: "0 0 28px" }}>
                Create your first course and start uploading study materials.
              </p>
              <Link
                href="/courses"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#F5F0E8", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", background: "#C8441A", padding: "12px 24px", borderRadius: "4px", display: "inline-block" }}
              >
                Create your first course →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {courses.map((course) => (
                <div key={course.id} style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {course.university && (
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#8C8070", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {course.university}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#1A1612", margin: "0 0 6px", lineHeight: 1.3 }}>
                      {course.name}
                    </h3>
                    {course.description && (
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8C8070", margin: 0, lineHeight: 1.5 }}>
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#8C8070", letterSpacing: "0.08em" }}>
                    {course.doc_count} document{course.doc_count !== 1 ? "s" : ""}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      href={`/courses/${course.id}`}
                      style={{ flex: 1, textAlign: "center", padding: "9px 0", background: "#1A1612", borderRadius: "4px", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#F5F0E8", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}
                    >
                      Study
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#1A1612", margin: "0 0 24px" }}>
            Quick actions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", padding: "24px", textDecoration: "none", display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "20px", color: "#C8441A", lineHeight: 1 }}>
                  {action.icon}
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#1A1612" }}>
                  {action.label}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8C8070" }}>
                  {action.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Discover */}
        {publicCourses.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#1A1612", margin: 0 }}>
                Discover courses
              </h2>
              <Link href="/search" style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
              {publicCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  style={{ minWidth: "220px", border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", padding: "20px", textDecoration: "none", flexShrink: 0, display: "flex", flexDirection: "column", gap: "6px" }}
                >
                  {course.university && (
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#C8441A", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {course.university}
                    </div>
                  )}
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: "#1A1612", margin: 0, lineHeight: 1.3 }}>
                    {course.name}
                  </h3>
                  {course.description && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#8C8070", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {course.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <footer style={{ padding: "20px 48px", borderTop: "1px solid rgba(26,22,18,0.12)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>© 2026 CoursePrep</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>courseprep.xyz</span>
      </footer>
    </main>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
