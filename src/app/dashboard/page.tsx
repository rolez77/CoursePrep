"use client"

import { useEffect, useState, Suspense } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  BookOpen, Brain, FileText, Upload, Award, Clock,
  Users, Plus, Bell, User, Menu, X,
} from "lucide-react"

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

type RecentDoc = {
  id: string
  filename: string
  course_id: number
  course_name: string
  created_at: string
}

const COURSE_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
            <div className="h-5 w-28 bg-gray-200 rounded" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="h-32 bg-gray-200 rounded-xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 h-40" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-6 w-36 bg-gray-200 rounded mb-6" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-48" />
          </div>
        </div>
      </main>
    </div>
  )
}

function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [publicCourses, setPublicCourses] = useState<PublicCourse[]>([])
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([])
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

      let coursesWithCounts: Course[] = []
      if (coursesRes.data) {
        const courseIds = coursesRes.data.map((c) => c.id)
        const { data: allDocs } = await supabase
          .from("documents")
          .select("course_id, metadata")
          .in("course_id", courseIds)

        const docCountMap: Record<number, Set<string>> = {}
        for (const doc of allDocs ?? []) {
          const filename = doc.metadata?.filename
          if (!filename) continue
          if (!docCountMap[doc.course_id]) docCountMap[doc.course_id] = new Set()
          docCountMap[doc.course_id].add(filename)
        }

        coursesWithCounts = coursesRes.data.map((course) => ({
          ...course,
          doc_count: docCountMap[course.id]?.size ?? 0,
        }))
        setCourses(coursesWithCounts)

        if (coursesWithCounts.length > 0) {
          const courseIds = coursesWithCounts.map((c) => c.id)
          const { data: docs } = await supabase
            .from("documents")
            .select("id, filename, course_id, created_at")
            .in("course_id", courseIds)
            .order("created_at", { ascending: false })
            .limit(4)

          if (docs) {
            const courseMap = Object.fromEntries(coursesWithCounts.map((c) => [c.id, c.name]))
            setRecentDocs(docs.map((d) => ({ ...d, course_name: courseMap[d.course_id] || "Unknown" })))
          }
        }
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

  if (loading || !user) return <DashboardSkeleton />

  const displayName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there"

  const stats = [
    { label: "Total Courses", value: String(courses.length), icon: BookOpen, color: "text-blue-500", bgColor: "bg-blue-50" },
    { label: "Quizzes Taken", value: "—", icon: Brain, color: "text-purple-500", bgColor: "bg-purple-50" },
    { label: "Materials Uploaded", value: String(profile?.upload_count ?? 0), icon: FileText, color: "text-green-500", bgColor: "bg-green-50" },
    { label: "Study Hours", value: "—", icon: Clock, color: "text-orange-500", bgColor: "bg-orange-50" },
  ]

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
                <Link href="/dashboard" className="text-blue-600 font-medium text-sm">Dashboard</Link>
                <Link href="/courses" className="text-gray-600 hover:text-gray-900 text-sm">My Courses</Link>
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

      {upgraded && (
        <div className="bg-blue-600 px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <span className="text-sm text-white font-medium">Welcome to Pro — all features unlocked.</span>
          <button onClick={() => setUpgraded(false)} className="text-white hover:text-white/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {displayName}! 👋</h1>
          <p className="text-gray-600">
            {courses.length === 0
              ? "Create your first course to get started."
              : `You have ${courses.length} active course${courses.length !== 1 ? "s" : ""}. Let's get prepared!`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="mb-3">
                <div className={`inline-flex p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/courses" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg p-4 flex items-center gap-3 transition-all text-white no-underline">
              <Upload className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Upload Materials</span>
            </Link>
            <Link href="/courses" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg p-4 flex items-center gap-3 transition-all text-white no-underline">
              <Brain className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Ask AI Tutor</span>
            </Link>
            <Link href="/courses" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg p-4 flex items-center gap-3 transition-all text-white no-underline">
              <Award className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Generate Quiz</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <Link href="/courses" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium no-underline">
                <Plus className="w-4 h-4" />
                Add Course
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center">
                <p className="text-xl font-semibold text-gray-900 mb-2">No courses yet</p>
                <p className="text-gray-600 mb-6">Create your first course and start uploading study materials.</p>
                <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium no-underline">
                  <Plus className="w-4 h-4" />
                  Create your first course
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course, index) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`h-2 ${COURSE_COLORS[index % COURSE_COLORS.length]}`} />
                    <div className="p-6">
                      <div className="mb-4">
                        {course.university && (
                          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{course.university}</div>
                        )}
                        <h3 className="font-bold text-gray-900 mb-1 leading-snug">{course.name}</h3>
                        {course.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>{course.doc_count} material{course.doc_count !== 1 ? "s" : ""}</span>
                        </div>
                        <Link
                          href={`/courses/${course.id}`}
                          className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors no-underline"
                        >
                          Study →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              {recentDocs.length > 0 ? (
                <div className="space-y-6">
                  {recentDocs.map((doc) => (
                    <div key={doc.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-0.5 truncate">{doc.filename}</p>
                        <p className="text-sm text-gray-600">{doc.course_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo(doc.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No activity yet. Upload materials to get started.</p>
              )}
            </div>

            {publicCourses.length > 0 && (
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5" />
                  <h3 className="font-bold">Discover Courses</h3>
                </div>
                <p className="text-sm text-white/90 mb-4">
                  Explore materials shared by other students at your university
                </p>
                <Link href="/search" className="block w-full text-center bg-white text-green-600 font-medium py-2 px-4 rounded-lg hover:bg-white/90 transition-colors no-underline">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
