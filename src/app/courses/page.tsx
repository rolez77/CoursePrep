"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Brain, Bell, User, Menu, Plus, X, FileText, Globe, Lock, Trash2,
} from "lucide-react"

interface Course {
  id: number
  name: string
  description: string
  university: string | null
  created_at: string
  is_public: boolean
  doc_count: number
}

const COURSE_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500",
  "bg-orange-500", "bg-pink-500", "bg-teal-500",
]

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
    if (!data) return

    const courseIds = data.map((c) => c.id)
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

    setCourses(data.map((course) => ({
      ...course,
      doc_count: docCountMap[course.id]?.size ?? 0,
    })))
  }

  async function handleCreateCourse() {
    if (!name.trim() || !description.trim() || !university.trim() || !user) return
    setCreating(true)
    const { error } = await supabase
      .from("courses")
      .insert({ name, description, university, user_id: user.id })
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
    await supabase.from("documents").delete().eq("course_id", id)
    await supabase.from("courses").delete().eq("id", id)
    fetchCourses(user.id)
  }

  async function handleTogglePublic(course: Course) {
    setToggleError(null)
    const { error } = await supabase
      .from("courses")
      .update({ is_public: !course.is_public })
      .eq("id", course.id)
    if (error) { setToggleError(error.message); return }
    fetchCourses(user.id)
  }

  if (!user) return (
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 h-44" />
          ))}
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
        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Courses</h1>
            <p className="text-gray-600 text-sm">
              {courses.length === 0 ? "No courses yet." : `${courses.length} course${courses.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showForm
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New Course"}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">New Course</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. COP 3530 — Fall 2026"
                  className="w-full px-4 py-3 border text-gray-900! border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. University of Florida"
                  className="w-full px-4 py-3 border text-gray-900! border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleCreateCourse}
                disabled={!name.trim() || !description.trim() || !university.trim() || creating}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Course"}
              </button>
            </div>
          </div>
        )}

        {toggleError && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {toggleError}
          </div>
        )}

        {/* Empty state */}
        {courses.length === 0 && !showForm && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center">
            <p className="text-xl font-semibold text-gray-900 mb-2">No courses yet</p>
            <p className="text-gray-600 mb-6 text-sm">Create your first course and start uploading study materials.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Create your first course
            </button>
          </div>
        )}

        {/* Course grid */}
        {courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className={`h-2 ${COURSE_COLORS[index % COURSE_COLORS.length]}`} />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1 mb-4">
                    {course.university && (
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{course.university}</div>
                    )}
                    <h3 className="font-bold text-gray-900 mb-1 leading-snug">{course.name}</h3>
                    {course.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <FileText className="w-4 h-4" />
                    <span>{course.doc_count} material{course.doc_count !== 1 ? "s" : ""}</span>
                    <span className="mx-2 text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {new Date(course.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="flex-1 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Open →
                    </button>
                    <button
                      onClick={() => handleTogglePublic(course)}
                      title={course.is_public ? "Make private" : "Make public"}
                      className={`p-2 rounded-lg border transition-colors ${
                        course.is_public
                          ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                          : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {course.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      title="Delete course"
                      className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
