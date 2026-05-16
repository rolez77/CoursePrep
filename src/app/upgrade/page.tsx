"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Brain, Bell, User, Menu, Check, Zap } from "lucide-react"
import Navbar from "../components/Navbar"

export default function Upgrade() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single()

      if (profile?.is_pro) setIsPro(true)
    }
    load()
  }, [])

  async function handleUpgrade() {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, email: user.email })
      })
      const data = await res.json()
      window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  if (!user) return null

  const freeFeatures = [
    "1 document upload",
    "20 AI questions per day",
    "5 quiz questions per quiz",
    "Public course search",
  ]

  const proFeatures = [
    "Unlimited uploads",
    "Unlimited AI questions",
    "Unlimited quiz questions",
    "Professor-style exam prep",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-600 mb-4">
            <Zap className="w-3.5 h-3.5" />
            Upgrade your plan
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-500 text-base">Unlock everything CoursePrep has to offer.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* Free */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Free</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-sm text-gray-400 ml-1">/ month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="w-4 h-4 shrink-0 text-gray-300">—</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="w-full py-2.5 text-center text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg">
              Current plan
            </div>
          </div>

          {/* Pro */}
          <div className="bg-gray-900 rounded-xl border border-gray-900 shadow-sm p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Most popular
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Pro</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$5</span>
              <span className="text-sm text-gray-400 ml-1">/ month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white">
                  <Check className="w-4 h-4 shrink-0 text-blue-400" />
                  {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="w-full py-2.5 text-center text-sm font-medium text-blue-400 bg-white/10 rounded-lg">
                ✓ You're on Pro
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Redirecting..." : "Upgrade to Pro →"}
              </button>
            )}
          </div>
        </div>

        {/* Trust line */}
        <p className="text-center text-xs text-gray-400">
          Secure payments via Stripe · Cancel anytime · No hidden fees
        </p>
      </main>
    </div>
  )
}
