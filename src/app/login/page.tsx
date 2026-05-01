"use client"
import { useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"


export default function Login(){


    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const supabase = createClient()

    async function handleLogin(){
        setLoading(true)
        setError("")

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if(error){
            setError(error.message)
            setLoading(false)
        } else {
            router.push("/dashboard")
        }
    }

    function handleKeyDown(e: React.KeyboardEvent){
        if(e.key === "Enter"){
            handleLogin()
        }
    }
    return(
        <main className="flex min-h-screen items-center justify-center p-8">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold">Welcome back</h1>
                    <p className="text-gray-500 text-sm mt-1">Log in to CoursePrep</p>
                </div>

                <div className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                onClick={handleLogin}
                disabled={loading}
                className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-40"
                >
                {loading ? "Logging in..." : "Log in"}
                </button>

                <p className="text-sm text-gray-500 text-center">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-white font-medium underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    )
}