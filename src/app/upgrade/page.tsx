// src/app/upgrade/page.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
      const res = await fetch("http://localhost:8000/create-checkout-session", {
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

  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
        <Link href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#1A1612", textDecoration: "none" }}>
          Course<span style={{ color: "#C8441A" }}>Prep</span>
        </Link>
        <Link href="/dashboard" style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>← Dashboard</Link>
      </nav>

      <div style={{ flex: 1, maxWidth: "760px", margin: "0 auto", width: "100%", padding: "48px" }}>

        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#C8441A" }}></span>
            Pricing
            <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#C8441A" }}></span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "48px", fontWeight: 700, color: "#1A1612", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Upgrade to <em style={{ fontStyle: "italic", color: "#C8441A" }}>Pro</em>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "#8C8070", margin: 0 }}>
            Unlock everything CoursePrep has to offer
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "48px" }}>

          {/* Free */}
          <div style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", padding: "32px", background: "rgba(26,22,18,0.02)" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Free</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 700, color: "#1A1612", margin: "0 0 4px" }}>$0</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", margin: "0 0 32px" }}>forever</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "1 course",
                "5 uploads total",
                "20 questions per day",
                "5 quiz questions per quiz",
                "Public course search",
              ].map((feature) => (
                <div key={feature} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#8C8070", fontSize: "14px" }}>—</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#8C8070" }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div style={{ border: "2px solid #1A1612", borderRadius: "8px", padding: "32px", background: "#1A1612", position: "relative" }}>
            <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#C8441A", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 14px", borderRadius: "100px", whiteSpace: "nowrap" }}>
              Most popular
            </div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Pro</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 700, color: "#F5F0E8", margin: "0 0 4px" }}>$5</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", margin: "0 0 32px" }}>per month</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {[
                "Unlimited courses",
                "Unlimited uploads",
                "Unlimited questions",
                "Unlimited quiz questions",
                "Professor-style exam prep",
                "Spaced repetition",
              ].map((feature) => (
                <div key={feature} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#C8441A", fontSize: "14px" }}>✓</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#F5F0E8" }}>{feature}</span>
                </div>
              ))}
            </div>

            {isPro ? (
              <div style={{ textAlign: "center", padding: "14px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#F5F0E8", margin: 0, letterSpacing: "0.08em" }}>✓ You're on Pro</p>
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                style={{ width: "100%", padding: "16px", background: "#C8441A", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "4px", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Redirecting..." : "Upgrade to Pro →"}
              </button>
            )}
          </div>
        </div>

        {/* Trust line */}
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", textAlign: "center", letterSpacing: "0.05em" }}>
          Secure payments via Stripe · Cancel anytime · No hidden fees
        </p>
      </div>

      <footer style={{ padding: "20px 48px", borderTop: "1px solid rgba(26,22,18,0.12)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>© 2026 CoursePrep</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>courseprep.xyz</span>
      </footer>
    </main>
  )
}