"use client"

import { useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Brain } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleForgotPassword() {
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) { setError(error.message); setLoading(false); return }
    router.push("/login")
  }


  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleForgotPassword()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CoursePrep</span>
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Already have an account? <span className="font-medium text-blue-600">Sign in</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
                    <p className="text-gray-600 text-sm">Enter your email to reset your password</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="you@university.edu"
                                className="w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                    <button
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:bg-gray-400"
                    >
                        {loading ? "Sending reset email..." : "Send reset email"}
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}
