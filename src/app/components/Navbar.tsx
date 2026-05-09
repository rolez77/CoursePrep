"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase"
import Link from "next/link"

const linkStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: "11px",
  color: "#8C8070",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  textDecoration: "none",
}

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isPro, setIsPro] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_pro")
          .eq("id", user.id)
          .single()
        if (data?.is_pro) setIsPro(true)
      }
    }
    loadUser()
  }, [])

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
      <Link href={user ? "/dashboard" : "/login"} style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#1A1612", textDecoration: "none" }}>
        Course<span style={{ color: "#C8441A" }}>Prep</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link href="/courses" style={linkStyle}>Courses</Link>
        <Link href="/search" style={linkStyle}>Search</Link>
        {!isPro && (
          <Link href="/upgrade" style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#F5F0E8", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", background: "#C8441A", padding: "6px 14px", borderRadius: "100px" }}>
            Upgrade
          </Link>
        )}
        {user ? (
          <Link href="/profile" style={{ ...linkStyle, border: "1px solid rgba(26,22,18,0.12)", padding: "6px 14px", borderRadius: "100px" }}>
            Profile
          </Link>
        ) : (
          <Link href="/login" style={{ ...linkStyle, color: "#F5F0E8", background: "#1A1612", padding: "8px 16px", borderRadius: "4px" }}>
            Log in
          </Link>
        )}
      </div>
    </nav>
  )
}
