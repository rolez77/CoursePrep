"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Brain, Bell, User, Menu, Search, BookOpen, ArrowRight } from "lucide-react"

interface Course {
  id: number
  name: string
  description: string
  university: string
  syllabus_summary: string
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSearch() {
    if (loading) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      setCourses(data.courses ?? [])
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
                <Link href="/courses" className="text-gray-600 hover:text-gray-900 text-sm">My Courses</Link>
                <Link href="/search" className="text-blue-600 font-medium text-sm">Discover</Link>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Courses</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Search for courses shared by students and professors at your university.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-0 mb-10 shadow-sm rounded-xl overflow-hidden border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <div className="flex items-center pl-4 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by course name, university, topic..."
            className="flex-1 px-4 py-4 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-4 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Pre-search hint */}
        {!searched && (
          <p className="text-center text-sm text-gray-500">
            Type a course name or topic above and press Enter or click Search.
          </p>
        )}

        {/* No results */}
        {searched && !loading && courses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No courses found</p>
            <p className="text-gray-600 text-sm">Try a different search term, or create your own course.</p>
            <Link href="/courses" className="inline-block mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors no-underline">
              Create a course
            </Link>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/5 mb-4" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && courses.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              {courses.length} result{courses.length !== 1 ? "s" : ""} for <span className="font-medium text-gray-700">"{query}"</span>
            </p>
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/courses/${course.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {course.name}
                    </h3>
                    {course.university && (
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-3">
                        {course.university}
                      </p>
                    )}
                    {course.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-blue-50 border border-gray-200 group-hover:border-blue-200 flex items-center justify-center transition-all">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
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
