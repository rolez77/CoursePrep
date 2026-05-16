"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User, Mail, School, Calendar, Award, BookOpen, TrendingUp,
  Bell, Shield, Palette, Globe, ChevronRight, Brain, FileText,
  Clock, Target, ArrowLeft, Edit,
} from "lucide-react"
import UniversityInput from "@/app/components/UniversityDropdown"
import { useTheme } from "@/app/components/ThemeProvider"

type Profile = {
  full_name: string | null
  university: string | null
  is_pro: boolean
  upload_count: number
  stripe_customer_id: string | null
}

type Document = {
  id: string
  filename: string
  course_id: number
  course_name: string
  created_at: string
}

type Tab = "overview" | "stats" | "materials" | "settings"

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courseCount, setCourseCount] = useState(0)
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [loading, setLoading] = useState(true)
  // settings form state
  const [fullName, setFullName] = useState("")
  const [university, setUniversity] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)

      const [profileRes, coursesRes] = await Promise.all([
        supabase.from("profiles").select("full_name, university, is_pro, upload_count, stripe_customer_id").eq("id", user.id).single(),
        supabase.from("courses").select("id, name").eq("user_id", user.id),
      ])

      if (profileRes.data) {
        setProfile(profileRes.data)
        setFullName(profileRes.data.full_name || "")
        setUniversity(profileRes.data.university || "")
      }

      const fetchedCourses = coursesRes.data ?? []
      setCourseCount(fetchedCourses.length)

      if (fetchedCourses.length > 0) {
        const courseIds = fetchedCourses.map((c: any) => c.id)
        const courseMap = Object.fromEntries(fetchedCourses.map((c: any) => [c.id, c.name]))
        const { data: docs } = await supabase
          .from("documents")
          .select("id, filename, course_id, created_at")
          .in("course_id", courseIds)
          .order("created_at", { ascending: false })
          .limit(20)

        if (docs) {
          setDocuments(docs.map((d: any) => ({ ...d, course_name: courseMap[d.course_id] || "Unknown" })))
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, university })
      .eq("id", user.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setProfile((p) => p ? { ...p, full_name: fullName, university } : p)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  async function handleCancelSubscription() {
    if (!profile?.stripe_customer_id) return
    setCancelLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-portal-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: profile.stripe_customer_id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error("Failed to open billing portal:", e)
    }
    setCancelLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading || !user) return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <div className="w-9 h-9 bg-gray-200 rounded-lg" />
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg" />
            <div className="h-5 w-28 bg-gray-200 rounded" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-64 bg-gray-200 rounded" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 flex gap-2 px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 w-24 bg-gray-100 rounded my-2" />
            ))}
          </div>
          <div className="p-8">
            <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6 h-32" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "U"

  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const overviewStats = [
    { label: "Total Study Time", value: "—", icon: Clock, color: "text-blue-600" },
    { label: "Quizzes Completed", value: "—", icon: Award, color: "text-purple-600" },
    { label: "Active Courses", value: String(courseCount), icon: BookOpen, color: "text-green-600" },
    { label: "Materials Uploaded", value: String(profile?.upload_count ?? 0), icon: FileText, color: "text-orange-600" },
  ]

  const achievements = [
    { title: "Early Adopter", description: "One of the first users of CoursePrep", icon: Target, color: "bg-blue-100 text-blue-600" },
    { title: "Material Contributor", description: `Uploaded ${profile?.upload_count ?? 0} study material${(profile?.upload_count ?? 0) !== 1 ? "s" : ""}`, icon: FileText, color: "bg-purple-100 text-purple-600" },
    ...(profile?.is_pro ? [{ title: "Pro Member", description: "Subscribed to CoursePrep Pro", icon: Award, color: "bg-yellow-100 text-yellow-600" }] : []),
  ]

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "stats", label: "Statistics" },
    { id: "materials", label: "Materials" },
    { id: "settings", label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">CoursePrep</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {initials}
              </div>
              <button
                onClick={() => setActiveTab("settings")}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile?.full_name || user.email?.split("@")[0]}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{user.email}</span>
                </div>
                {profile?.university && (
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 flex-shrink-0" />
                    <span>{profile.university}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Joined {joinDate}</span>
                </div>
                {profile?.is_pro && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                    <span className="text-yellow-600 font-medium">Pro Member</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Stats</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {overviewStats.map((stat, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className={`flex-shrink-0 w-12 h-12 ${achievement.color} rounded-lg flex items-center justify-center`}>
                          <achievement.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                    {achievements.length === 0 && (
                      <p className="text-sm text-gray-500 col-span-2">Upload materials to earn your first achievement.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Statistics</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700 font-medium">Active Courses</span>
                        <span className="text-2xl font-bold text-gray-900">{courseCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(courseCount * 10, 100)}%` }} />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700 font-medium">Materials Uploaded</span>
                        <span className="text-2xl font-bold text-gray-900">{profile?.upload_count ?? 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((profile?.upload_count ?? 0) * 5, 100)}%` }} />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700 font-medium">Quizzes Taken</span>
                        <span className="text-2xl font-bold text-gray-900">—</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Quiz tracking coming soon</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700 font-medium">AI Questions Asked</span>
                        <span className="text-2xl font-bold text-gray-900">—</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Interaction tracking coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === "materials" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Uploaded Materials</h2>
                  <Link href="/courses" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium no-underline">
                    Upload New
                  </Link>
                </div>
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No materials uploaded yet.</p>
                    <Link href="/courses" className="inline-block mt-4 text-blue-600 hover:underline text-sm no-underline">
                      Go to My Courses →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{doc.filename}</h3>
                            <p className="text-sm text-gray-600">{doc.course_name}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 flex-shrink-0 ml-4">{timeAgo(doc.created_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                {/* Edit Profile */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h2>
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                        <UniversityInput
                            value={university}
                            onChange={setUniversity}
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                border: "1px solid #D1D5DB",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                outline: "none",
                            }}
                            />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="text"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 border text-gray-500 border-gray-200 rounded-lg text-sm bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      {saved && <span className="text-sm text-green-600 font-medium">✓ Saved successfully</span>}
                    </div>
                  </div>
                </div>

                {/* Subscription */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription</h2>
                  <div className="border border-gray-200 rounded-lg p-6 max-w-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Plan</p>
                        <p className="text-lg font-bold text-gray-900">
                          {profile?.is_pro ? (
                            <span className="text-yellow-600">Pro</span>
                          ) : "Free"}
                        </p>
                      </div>
                      {profile?.is_pro && profile.stripe_customer_id ? (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancelLoading}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                        >
                          {cancelLoading ? "Loading..." : "Manage Subscription"}
                        </button>
                      ) : !profile?.is_pro ? (
                        <Link href="/upgrade" className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors no-underline">
                          Upgrade to Pro
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Preferences (UI placeholders) */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Preferences</h2>
                  <div className="space-y-2 max-w-lg">
                    {[
                      { label: "Notifications", icon: Bell },
                      { label: "Language", icon: Globe },
                    ].map((item, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Palette className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900 text-sm">Appearance</span>
                      </div>
                      <span className="text-sm text-gray-500 capitalize">{theme}</span>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
