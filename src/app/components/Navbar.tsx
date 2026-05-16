"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/app/lib/supabase"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Brain, Bell, User, Menu,
} from "lucide-react"


export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isPro, setIsPro] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("is_pro") === "true"
    return false
  })
  const supabase = createClient()
  const pathname = usePathname()

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
        const pro = data?.is_pro ?? false
        setIsPro(pro)
        localStorage.setItem("is_pro", String(pro))
      }
    }
    loadUser()
  }, [])

  return (
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">CoursePrep</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/courses", label: "My Courses" },
                  { href: "/search", label: "Discover" },
                  ...(!isPro ? [{ href: "/upgrade", label: "Upgrade to Pro" }] : []),
                ].map(({ href, label }) => {
                  const active = pathname === href || pathname.startsWith(href + "/")
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`text-sm ${active ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}`}
                    >
                      {label}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <Link href="/profile" className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <User className="w-5 h-5" />
              </Link>
              <button className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
  )
}
