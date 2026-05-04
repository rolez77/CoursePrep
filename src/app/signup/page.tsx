// src/app/signup/page.tsx
"use client"

import { useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [university, setUniversity] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignUp() {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, university } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push("/dashboard")
  }

  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 48px", borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
        <Link href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#1A1612", textDecoration: "none" }}>
          Course<span style={{ color: "#C8441A" }}>Prep</span>
        </Link>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(26,22,18,0.12)", padding: "6px 12px", borderRadius: "100px" }}>Create account</span>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#C8441A" }}></span>
            Get started
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: 700, color: "#1A1612", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "32px" }}>
            Start acing<br /><em style={{ fontStyle: "italic", color: "#C8441A" }}>your exams</em>
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {[
              { placeholder: "Full name", value: fullName, setter: setFullName, type: "text" },
              { placeholder: "University", value: university, setter: setUniversity, type: "text" },
              { placeholder: "Email", value: email, setter: setEmail, type: "email" },
              { placeholder: "Password", value: password, setter: setPassword, type: "password" },
            ].map(({ placeholder, value, setter, type }) => (
              <input
                key={placeholder}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
                style={{ padding: "14px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "transparent", border: "1.5px solid #1A1612", borderRadius: "4px", outline: "none", color: "#1A1612" }}
              />
            ))}
          </div>

          {error && <p style={{ color: "#C8441A", fontSize: "13px", marginBottom: "16px", fontFamily: "'DM Mono', monospace" }}>{error}</p>}

          <button
            onClick={handleSignUp}
            disabled={loading}
            style={{ width: "100%", padding: "16px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 500, border: "none", borderRadius: "4px", cursor: "pointer", opacity: loading ? 0.6 : 1, letterSpacing: "0.04em" }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8C8070", textAlign: "center", marginTop: "24px" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#1A1612", fontWeight: 500 }}>Log in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}