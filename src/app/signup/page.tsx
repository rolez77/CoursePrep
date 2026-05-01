"use client"
import { useState } from "react"
import { createClient } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Signup(){


    const [email, setEmail] = useState("")
    const [university, setUniversity] = useState("")
    const [fullName, setFullName] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const supabase = createClient()

    async function handleSignup(){
        setLoading(true)
        setError("")

        const {error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    university: university
                }
            }
        })

        if(error){
            setError(error.message)
            setLoading(false)
        } else {
            router.push("/dashboard")
        }

    }

    return (
        <main className="flex min-h-screen items-center justify-center p-8">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold">Create your account</h1>
                    <p className="text-gray-500 text-sm mt-1">Start acing your courses</p>
                </div>

                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                        type="text"
                        placeholder="University"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-40"
                >
                {loading ? "Creating account..." : "Sign up"}
                </button>

                <p className="text-sm text-gray-500 text-center">
                    Already have an account?{" "}
                    <Link href="/login" className="text-white font-medium underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    )
}