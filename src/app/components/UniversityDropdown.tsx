"use client"

import { universities } from "@/app/lib/universities"
import { useEffect, useState, useRef } from "react"
interface Props{
    value: string
    onChange: (value: string) => void
    style?: React.CSSProperties
}

export default function UniversityDropdown({ value, onChange, style }: Props) {
    const[open, setOpen] = useState(false)
    const[query, setQuery] = useState(value)
    const containerRef = useRef<HTMLDivElement>(null)

    const filtered = universities.filter(u => u.toLowerCase().includes(query.toLowerCase())).slice(0, 8)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if(containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return(
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search your university..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange("")
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        style={style}
      />

      {open && query.length > 0 && filtered.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#ffffff",
          border: "1px solid #D1D5DB",
          borderTop: "none",
          borderRadius: "0 0 0.5rem 0.5rem",
          zIndex: 50,
          maxHeight: "240px",
          overflowY: "auto",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)"
        }}>
          {filtered.map((uni) => (
            <div
              key={uni}
              onMouseDown={() => {
                setQuery(uni)
                onChange(uni)
                setOpen(false)
              }}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
                color: "#111827",
                cursor: "pointer",
                borderBottom: "1px solid #F3F4F6",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#EFF6FF")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {uni}
            </div>
          ))}
        </div>
      )}

      {open && query.length > 0 && filtered.length === 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#ffffff",
          border: "1px solid #D1D5DB",
          borderTop: "none",
          borderRadius: "0 0 0.5rem 0.5rem",
          zIndex: 50,
          padding: "10px 16px",
          fontSize: "12px",
          color: "#9CA3AF"
        }}>
          No university found
        </div>
      )}
    </div>
    )
}