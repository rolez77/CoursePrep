"use client"
import Link from "next/link"
import { useEffect, useState} from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"

export default function Profile() {

    const[user, setUser] = useState<any>(null);
    const[fullName, setFullName] = useState("")
    const[university, setUniversity] = useState("")
    const[loading, setLoading] = useState(false)
    const[saved, setSaved] = useState(false)
    const supabase = createClient()
    const router = useRouter()


    useEffect(() => {
        async function fetchProfile() {
            const{data:{user}} = await supabase.auth.getUser()
            if(!user){
                router.push("/login")
            }
            setUser(user);


            const{data:{profile}} = await supabase.from("profiles").select("*").eq("id", user?.id).single()
            if(profile){
                setFullName(profile.full_name || "")
                setUniversity(profile.university || "")
            }
        }
        fetchProfile()
    }, [])

    async function handleSave(){
        if (!user) return
        setLoading(true)
        setSaved(false)

        await supabase
        .from("profiles")
        .upsert({
            id: user.id,
            full_name: fullName,
            university: university,
        })

        setLoading(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }
    


    async function handleSignOut(){
        await supabase.auth.signOut()
        router.push("/login")
    }

    if(!user) return null;

    const initials = fullName ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase() : "U"


    return (
        <main style={{ background: "#F5F0E8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Nav */}
            <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
                <Link href="/dashboard" style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#1A1612", textDecoration: "none" }}>
                    Course<span style={{ color: "#C8441A" }}>Prep</span>
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button
                        onClick={handleSignOut}
                        style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(26,22,18,0.12)", padding: "6px 14px", borderRadius: "100px", background: "transparent", cursor: "pointer" }}
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            <div style={{ flex: 1, maxWidth: "600px", margin: "0 auto", width: "100%", padding: "48px" }}>

                {/* Header */}
                <div style={{ marginBottom: "40px" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#C8441A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#C8441A" }}></span>
                        Your account
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: 700, color: "#1A1612", lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
                        Your <em style={{ fontStyle: "italic", color: "#C8441A" }}>profile</em>
                    </h1>
                </div>

                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#1A1612", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#F5F0E8", fontWeight: 700 }}>
                        {initials}
                    </div>
                    <div>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#1A1612", margin: "0 0 4px" }}>{fullName || "Add your name"}</p>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#8C8070", margin: 0 }}>{user.email}</p>
                    </div>
                </div>

                {/* Form */}
                <div style={{ border: "1px solid rgba(26,22,18,0.12)", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
                    <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(26,22,18,0.12)" }}>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#1A1612", margin: 0 }}>Personal information</p>
                    </div>
                    <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Full name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                style={{ width: "100%", padding: "14px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "transparent", border: "1.5px solid rgba(26,22,18,0.3)", borderRadius: "4px", outline: "none", color: "#1A1612", boxSizing: "border-box" }}
                            />
                        </div>
                        <div>
                            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>University</label>
                            <input
                                type="text"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                placeholder="Your university"
                                style={{ width: "100%", padding: "14px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "transparent", border: "1.5px solid rgba(26,22,18,0.3)", borderRadius: "4px", outline: "none", color: "#1A1612", boxSizing: "border-box" }}
                            />
                        </div>
                        <div>
                            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Email</label>
                            <input
                                type="text"
                                value={user.email}
                                disabled
                                style={{ width: "100%", padding: "14px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", background: "rgba(26,22,18,0.04)", border: "1.5px solid rgba(26,22,18,0.1)", borderRadius: "4px", outline: "none", color: "#8C8070", boxSizing: "border-box" }}
                            />
                        </div>
                    </div>
                    <div style={{ padding: "20px 28px", borderTop: "1px solid rgba(26,22,18,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {saved && (
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#0F6E56", letterSpacing: "0.05em" }}>✓ Saved successfully</p>
                        )}
                        {!saved && <span />}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            style={{ padding: "12px 24px", background: "#1A1612", color: "#F5F0E8", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "4px", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
                        >
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </div>

                {/* Danger zone */}
                <div style={{ border: "1px solid rgba(200,68,26,0.2)", borderRadius: "8px", padding: "24px 28px" }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#C8441A", margin: "0 0 8px" }}>Sign out</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#8C8070", margin: "0 0 16px" }}>You'll need to log back in to access your courses.</p>
                    <button
                        onClick={handleSignOut}
                        style={{ padding: "10px 20px", background: "transparent", color: "#C8441A", fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(200,68,26,0.3)", borderRadius: "4px", cursor: "pointer" }}
                    >
                        Sign out
                    </button>
                </div>
            </div>

            <footer style={{ padding: "20px 48px", borderTop: "1px solid rgba(26,22,18,0.12)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>© 2026 CoursePrep</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8C8070" }}>courseprep.xyz</span>
            </footer>
        </main>
    )
}